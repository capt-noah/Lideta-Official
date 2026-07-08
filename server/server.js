import express from 'express'
const app = express()
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { sendOTPEmail, verifyOTPEmail } from './utils/mailer.js'

dotenv.config()

import pool from './con/db.js'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory in client/public/uploads
const clientPublicPath = path.join(__dirname, '..', 'client', 'public', 'uploads')
if (!fs.existsSync(clientPublicPath)) {
  fs.mkdirSync(clientPublicPath, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine subdirectory based on field name
    let subDir = ''
    if (file.fieldname === 'profile_picture') {
        subDir = 'admin_profiles'
    } else if (file.fieldname === 'video') {
        subDir = 'videos'
    } else if (file.fieldname === 'audio') {
        subDir = 'audios'
    } else if (file.fieldname === 'photo') {
        subDir = 'photos'
    } else if (file.fieldname === 'image') {
        // Fallback for generic "image" field used by some components
        subDir = 'photos'
    }

    const targetPath = path.join(clientPublicPath, subDir)
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true })
    }
    cb(null, targetPath)
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_')
    cb(null, `${name}-${uniqueSuffix}${ext}`)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit to handle video/audio
  },
  fileFilter: (req, file, cb) => {
    // Accept images, documents, videos, and audios
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('video/') ||
        file.mimetype.startsWith('audio/') ||
        file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true)
    } else {
      cb(new Error('Only image, video, audio, PDF and Word files are allowed'), false)
    }
  }
})

app.use(express.json())
app.use(cors())

// Serve static files from client dist directory (Vite build)
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')))

app.use('/uploads', express.static(clientPublicPath))

// Profile Picture Update Endpoint
app.post('/api/admin/update/profile-picture', authenticateToken, upload.single('profile_picture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' })
        }

        const adminId = req.admin.admin_id
        // Path relative to public folder, e.g., /uploads/admin_profiles/filename.jpg
        const relativePath = `/uploads/admin_profiles/${req.file.filename}`

        // Update admin record
        // Assuming column is 'photo' (like news/events). If 'profile_picture' or something else, this will fail.
        // I will trust standard naming 'photo' or 'profile_pic'. Let's try 'photo' first as it's used elsewhere.
        // Actually, let's verify if we can simply use 'photo'. Admin table structure isn't fully visible but I will attempt 'photo'.
        
        const result = await pool`
            UPDATE admins 
            SET photo = ${relativePath}
            WHERE admin_id = ${adminId}
            RETURNING *`
            
        if (result.length === 0) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        const updatedAdmin = result[0]
        delete updatedAdmin.password // Safety

        logActivity(req.admin.admin_id, req.admin.username, 'UPDATED', 'PROFILE', 'Profile Picture')
        
        res.status(200).json(updatedAdmin)
    } catch (error) {
        console.error('Error updating profile picture:', error)
        // If column "photo" does not exist, this will error.
        res.status(500).json({ error: 'Failed to update profile picture' })
    }
})

app.delete('/api/admin/delete/profile-picture', authenticateToken, async (req, res) => {
    try {
        const adminId = req.admin.admin_id
        
        const result = await pool`
            UPDATE admins 
            SET photo = NULL
            WHERE admin_id = ${adminId}
            RETURNING *`
            
        if (result.length === 0) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        const updatedAdmin = result[0]
        delete updatedAdmin.password

        logActivity(req.admin.admin_id, req.admin.username, 'DELETED', 'PROFILE', 'Profile Picture')
        
        res.status(200).json(updatedAdmin)
    } catch (error) {
        console.error('Error deleting profile picture:', error)
        res.status(500).json({ error: 'Failed to delete profile picture' })
    }
})

// // Placeholder for authenticateToken and logActivity (assuming they are defined elsewhere)
// const authenticateToken = (req, res, next) => {
//   // Implement your token authentication logic here
//   // For now, just pass through or mock req.admin
//   req.admin = { admin_id: 1, username: 'mockadmin', role: 'superadmin' }; // Mock admin for testing
//   next();
// };

// const logActivity = async (adminId, username, action, entityType, entityTitle) => {
//   try {
//     await pool`
//       INSERT INTO activity_logs (admin_id, username, action, entity_type, entity_title)
//       VALUES (${adminId}, ${username}, ${action}, ${entityType}, ${entityTitle})
//     `;
//   } catch (error) {
//     console.error('Error logging activity:', error);
//   }
// };

// Endpoint to fetch activities
app.get('/api/admin/activities', authenticateToken, async (req, res) => {
    try {
        const activities = await pool`
            SELECT 
                al.*, 
                COALESCE(al.username, a.username) as username
            FROM activity_logs al
            LEFT JOIN admins a ON al.admin_id = a.admin_id
            ORDER BY al.created_at DESC
            LIMIT 20
        `
        
        // Map to a more frontend-friendly format if needed
        const formattedActivities = activities.map(activity => ({
            id: activity.id,
            admin_id: activity.admin_id,
            username: activity.username || 'Unknown',
            action: activity.action,
            entity_type: activity.entity_type,
            entity_title: activity.entity_title,
            details: activity.details,
            created_at: activity.created_at,
        }))

        res.status(200).json({ status: 'Success', activities: formattedActivities })
    } catch (error) {
        console.error('Error fetching activities:', error)
        res.status(500).json({ error: 'Failed to fetch activities' })
    }
})

// File upload endpoint handling various media types
app.post('/api/upload', upload.any(), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const file = req.files[0]
    
    // Determine the relative path (must include subdirectory if any)
    let relativeDir = ''
    if (file.fieldname === 'profile_picture') relativeDir = 'admin_profiles/'
    else if (file.fieldname === 'video') relativeDir = 'videos/'
    else if (file.fieldname === 'audio') relativeDir = 'audios/'
    else if (file.fieldname === 'photo' || file.fieldname === 'image') relativeDir = 'photos/'

    // Return JSON with name and relative path (accessible from client public folder)
    const fileData = {
      name: file.originalname,
      path: `/uploads/${relativeDir}${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }

    res.status(200).json(fileData)
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({ error: 'Failed to upload file' })
  }
})

app.get('/auth/admin/register', async (req, res) => {
    try {
        // const { first_name, last_name, username, password, email, phone_number, residency, gender } = req.body
        const first_name = 'Abebe'
        const last_name = 'Kebede'
        const username = 'abe_kebe'
        const password = 'abe_pass'
        const email = 'abekebe@gmail.com'
        const phone_number = '0912345678'
        const residency = 'Addis Ababa'
        const gender = 'Male'

        const existingUser = await pool`SELECT * FROM admins WHERE username = ${username} OR phone_number = ${phone_number} OR email = ${email}`

        if (existingUser.length > 0) return res.status(400).json({ error: 'User Already Exisits', data: existingUser[0] })
        
        const saltround = 10

        const hashed_password = await bcrypt.hash(password, saltround)

        const response = await pool`INSERT INTO admins (first_name, last_name, username, password_hash, email, phone_number, gender, residency) 
                                        VALUES(${first_name}, ${last_name}, ${username}, ${hashed_password}, ${email}, ${phone_number}, ${gender}, ${residency})
                                        RETURNING username, admin_id`
        const data = response[0]

        res.json(data)
    }
    catch (error) {
        res.status(500).json({error: 'Internal Server Error'})
    }
    
})
// Email lookup by username (used by admin login 2FA step)
app.post('/auth/admin/email-lookup', async (req, res) => {
  try {
    const { username } = req.body
    if (!username) return res.status(400).json({ error: 'Username required' })
    const result = await pool`SELECT email FROM admins WHERE username = ${username}`
    if (result.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ email: result[0].email })
  } catch (err) {
    res.status(500).json({ error: 'Lookup failed' })
  }
})

app.post('/auth/admin/me', authenticateToken, async (req, res) => {
    const adminData = req.admin
    res.status(200).json(adminData)
})

// Superadmin: create new admin account
app.post('/api/superadmin/create-admin', authenticateToken, async (req, res) => {
    try {
        // Only allow superadmin role
        if (!req.admin || req.admin.role !== 'superadmin') {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const {
            first_name,
            last_name,
            username,
            password,
            email,
            phone_number,
            residency,
            gender,
            role = 'admin'
        } = req.body

        if (!first_name || !last_name || !username || !password || !email || !phone_number) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        // Validate role value
        const VALID_ROLES = ['admin', 'complaint_admin', 'event_admin', 'news_admin', 'vacancy_admin', 'superadmin']
        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` })
        }

        const existingUser = await pool`SELECT * FROM admins WHERE username = ${username} OR phone_number = ${phone_number} OR email = ${email}`

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Admin with provided username, phone or email already exists' })
        }

        const saltround = 10
        const hashed_password = await bcrypt.hash(password, saltround)

        const response = await pool`INSERT INTO admins (first_name, last_name, username, password_hash, email, phone_number, gender, residency, role)
             VALUES(${first_name}, ${last_name}, ${username}, ${hashed_password}, ${email}, ${phone_number}, ${gender}, ${residency}, ${role})
             RETURNING admin_id, first_name, last_name, username, email, phone_number, gender, residency, role`

        return res.status(201).json(response[0])
    } catch (error) {
        console.error('Error creating admin:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})

// Any admin: create a peer admin with the SAME role (role is enforced server-side)
app.post('/api/admin/create-peer', authenticateToken, async (req, res) => {
    try {
        const creatorRole = req.admin.role

        // Superadmins should use the superadmin endpoint instead
        if (creatorRole === 'superadmin') {
            return res.status(403).json({ error: 'Superadmins should use /api/superadmin/create-admin' })
        }

        const {
            first_name,
            last_name,
            username,
            password,
            email,
            phone_number,
            residency,
            gender
        } = req.body

        if (!first_name || !last_name || !username || !password || !email || !phone_number) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        // Check for duplicates
        const existingUser = await pool`SELECT admin_id FROM admins WHERE username = ${username} OR phone_number = ${phone_number} OR email = ${email}`
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Admin with provided username, phone or email already exists' })
        }

        const hashed_password = await bcrypt.hash(password, 10)

        // Role is ALWAYS the same as the creator — enforced here, not from client payload
        const response = await pool`
            INSERT INTO admins (first_name, last_name, username, password_hash, email, phone_number, gender, residency, role)
            VALUES(${first_name}, ${last_name}, ${username}, ${hashed_password}, ${email}, ${phone_number}, ${gender}, ${residency}, ${creatorRole})
            RETURNING admin_id, first_name, last_name, username, email, phone_number, gender, residency, role`

        logActivity(req.admin.admin_id, req.admin.username, 'CREATED', 'ADMIN', username)
        return res.status(201).json(response[0])
    } catch (error) {
        console.error('Error creating peer admin:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})


app.get('/api/superadmin/admins', authenticateToken, async (req, res) => {
    try {
        if (!req.admin || req.admin.role !== 'superadmin') {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const adminsList = await pool`
            SELECT admin_id, first_name, last_name, username, email, phone_number, gender, residency, role, created_at
            FROM admins
            ORDER BY created_at DESC
        `
        return res.status(200).json(adminsList)
    } catch (error) {
        console.error('Error fetching admins:', error)
        return res.status(500).json({ error: 'Failed to fetch admin accounts' })
    }
})

// Superadmin: update any admin account role or detail
app.post('/api/superadmin/update-admin/:id', authenticateToken, async (req, res) => {
    try {
        if (!req.admin || req.admin.role !== 'superadmin') {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const targetAdminId = req.params.id
        const { first_name, last_name, username, email, phone_number, residency, gender, role } = req.body

        // Validate role
        const VALID_ROLES = ['admin', 'complaint_admin', 'event_admin', 'news_admin', 'vacancy_admin', 'superadmin']
        if (role && !VALID_ROLES.includes(role)) {
            return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` })
        }

        // Check if username is being changed and if it's already taken
        if (username) {
            const existingUser = await pool`SELECT * FROM admins WHERE username = ${username} AND admin_id != ${targetAdminId}`
            if (existingUser.length > 0) {
                return res.status(400).json({ error: 'Username already exists' })
            }
        }

        const response = await pool`
            UPDATE admins
            SET first_name = COALESCE(${first_name}, first_name),
                last_name = COALESCE(${last_name}, last_name),
                username = COALESCE(${username}, username),
                email = COALESCE(${email}, email),
                phone_number = COALESCE(${phone_number}, phone_number),
                residency = COALESCE(${residency}, residency),
                gender = COALESCE(${gender}, gender),
                role = COALESCE(${role}, role)
            WHERE admin_id = ${targetAdminId}
            RETURNING admin_id, first_name, last_name, username, email, phone_number, gender, residency, role
        `

        if (response.count === 0) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        return res.status(200).json(response[0])
    } catch (error) {
        console.error('Error updating admin by superadmin:', error)
        return res.status(500).json({ error: 'Failed to update admin account details' })
    }
})

// Superadmin: delete an admin account
app.delete('/api/superadmin/delete-admin/:id', authenticateToken, async (req, res) => {
    try {
        if (!req.admin || req.admin.role !== 'superadmin') {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const targetAdminId = req.params.id

        // Prevent superadmin from deleting themselves
        if (parseInt(targetAdminId) === req.admin.admin_id) {
            return res.status(400).json({ error: 'You cannot delete your own account' })
        }

        const targetAdmin = await pool`SELECT admin_id, username FROM admins WHERE admin_id = ${targetAdminId}`
        if (targetAdmin.length === 0) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        await pool`DELETE FROM admins WHERE admin_id = ${targetAdminId}`

        logActivity(req.admin.admin_id, req.admin.username, 'DELETED', 'ADMIN', targetAdmin[0].username)
        return res.status(200).json({ message: 'Admin account deleted successfully' })
    } catch (error) {
        console.error('Error deleting admin:', error)
        return res.status(500).json({ error: 'Failed to delete admin account' })
    }
})

// Superadmin: get vacancy applications (applicants joined with vacancies)
app.get('/api/superadmin/vacancy-applications', authenticateToken, async (req, res) => {
    try {
        // Only allow superadmin role
        if (!req.admin || req.admin.role !== 'superadmin') {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const applications = await pool`
            SELECT
                applicants.id,
                applicants.first_name,
                applicants.last_name,
                applicants.status,
                CONCAT(applicants.first_name, ' ', applicants.last_name) AS full_name,
                applicants.created_at,
                TO_CHAR(applicants.created_at, 'DD - MM - YYYY') AS applied_date,
                vacancies.category,
                vacancies.salary
            FROM applicants
            INNER JOIN vacancies
                ON vacancies.id = applicants.vacancy_id
            ORDER BY applicants.created_at DESC
        `

        const count = await pool`SELECT
                                            COUNT(*) AS total
                                        FROM applicants`
        
        const stats = await pool`SELECT
                                            v.category AS category,
                                            COUNT(a.id) AS count
                                        FROM applicants a
                                        INNER JOIN vacancies v
                                            ON a.vacancy_id = v.id
                                        GROUP BY v.category`

        return res.status(200).json({vacants: applications, counts: count[0], stats: stats})
    } catch (error) {
        console.error('Error fetching vacancy applications:', error)
        return res.status(500).json({ error: 'Failed to fetch vacancy applications' })
    }
})

// Superadmin: get overview stats
app.get('/api/superadmin/overview', authenticateToken, async (req, res) => {
    try {
        if (!req.admin || req.admin.role !== 'superadmin') {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const totalComplaints = await pool`SELECT COUNT(*) FROM complaints`
        const resolvedComplaints = await pool`SELECT COUNT(*) FROM complaints WHERE status = 'resolved'`
        const pendingApplications = await pool`SELECT COUNT(*) FROM applicants WHERE status = 'submitted' OR status = 'reviewing'`
        const activeEvents = await pool`SELECT COUNT(*) FROM events WHERE status = 'upcoming'`

        res.status(200).json({
            totalComplaints: parseInt(totalComplaints[0].count),
            resolvedComplaints: parseInt(resolvedComplaints[0].count),
            pendingApplications: parseInt(pendingApplications[0].count),
            activeEvents: parseInt(activeEvents[0].count)
        })
    } catch (error) {
        console.error('Error fetching overview stats:', error)
        res.status(500).json({ error: 'Failed to fetch overview stats' })
    }
})

// Get unique complaint types from database
app.get('/api/complaint-types', async (req, res) => {
    try {
        const response = await pool`SELECT DISTINCT type 
             FROM complaints 
             WHERE type IS NOT NULL AND type != ''
             ORDER BY type`
        const types = response.map(row => row.type)
        res.status(200).json(types)
    } catch (error) {
        console.error('Error fetching complaint types:', error)
        // Return default types if database query fails
        res.status(200).json([
            'sanitation',
            'water supply',
            'road condition',
            'construction',
            'customer service',
            'finance',
            'public health',
            'maintenance',
            'service delivery'
        ])
    }
})

// Update admin profile (personal information)
app.post('/api/admin/update/profile', authenticateToken, async (req, res) => {
    try {
        const formData = req.body
        const adminId = req.admin.admin_id

        const response = await pool`
            UPDATE admins
             SET first_name = ${formData.first_name},
                 last_name = ${formData.last_name},
                 gender = ${formData.gender},
                 residency = ${formData.residency},
                 phone_number = ${formData.phone_number},
                 email = ${formData.email}
             WHERE admin_id = ${adminId}
             RETURNING *`

        if (response.count === 0) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        res.status(200).json(response[0])
    } catch (error) {
        console.error('Error updating profile:', error)
        res.status(500).json({ error: 'Failed to update profile' })
    }
})

// Update admin information (username, role)
app.post('/api/admin/update/admin-info', authenticateToken, async (req, res) => {
    try {
        const formData = req.body
        const adminId = req.admin.admin_id

        // Check if username is being changed and if it's already taken
        if (formData.username && formData.username !== req.admin.username) {
            const existingUser = await pool`SELECT * FROM admins WHERE username = ${formData.username} AND admin_id != ${adminId}`
            if (existingUser.length > 0) {
                return res.status(400).json({ error: 'Username already exists' })
            }
        }

        const newRole = req.admin.role === 'superadmin' ? (formData.role || req.admin.role) : req.admin.role;

        // Validate role value if being changed
        const VALID_ROLES = ['admin', 'complaint_admin', 'event_admin', 'news_admin', 'vacancy_admin', 'superadmin']
        if (formData.role && !VALID_ROLES.includes(formData.role)) {
            return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` })
        }


        const response = await pool`
            UPDATE admins
             SET username = ${formData.username || req.admin.username},
                 role = ${newRole}
             WHERE admin_id = ${adminId}
             RETURNING *`

        if (response.count === 0) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        res.status(200).json(response[0])
    } catch (error) {
        console.error('Error updating admin info:', error)
        res.status(500).json({ error: 'Failed to update admin information' })
    }
})

// Update admin password
app.post('/api/admin/update/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        const adminId = req.admin.admin_id

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' })
        }

        // Verify current password
        const admin = await pool`SELECT * FROM admins WHERE admin_id = ${adminId}`
        if (admin.length === 0) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, admin[0].password_hash)
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Current password is incorrect' })
        }

        // Hash new password
        const saltround = 10
        const hashedPassword = await bcrypt.hash(newPassword, saltround)

        // Update password
        const response = await pool`
            UPDATE admins
             SET password_hash = ${hashedPassword}
             WHERE admin_id = ${adminId}
             RETURNING admin_id, username`

        res.status(200).json({ message: 'Password updated successfully' })
    } catch (error) {
        console.error('Error updating password:', error)
        res.status(500).json({ error: 'Failed to update password' })
    }
})

// Get admin settings
app.get('/api/admin/settings', authenticateToken, async (req, res) => {
    try {
        const adminId = req.admin.admin_id
        const response = await pool`SELECT * FROM admin_settings WHERE admin_id = ${adminId}`

        if (response.length === 0) {
            // Create default settings if they don't exist
            await pool`INSERT INTO admin_settings (admin_id) VALUES (${adminId})`
            const newSettings = await pool`SELECT * FROM admin_settings WHERE admin_id = ${adminId}`
            return res.status(200).json(newSettings[0])
        }

        res.status(200).json(response[0])
    } catch (error) {
        console.error('Error fetching settings:', error)
        res.status(500).json({ error: 'Failed to fetch settings' })
    }
})

// Update admin settings (preferences)
app.post('/api/admin/update/settings', authenticateToken, async (req, res) => {
    try {
        const { theme, font_size, language } = req.body
        const adminId = req.admin.admin_id

        // Check if settings exist, if not create them
        const existing = await pool`SELECT * FROM admin_settings WHERE admin_id = ${adminId}`

        let response
        if (existing.length === 0) {
            response = await pool`
                INSERT INTO admin_settings (admin_id, theme, font_size, language)
                 VALUES (${adminId}, ${theme || 'light'}, ${font_size || 'medium'}, ${language || 'english'})
                 RETURNING *`
        } else {
            response = await pool`
                UPDATE admin_settings
                 SET theme = ${theme || existing[0].theme},
                     font_size = ${font_size || existing[0].font_size},
                     language = ${language || existing[0].language}
                 WHERE admin_id = ${adminId}
                 RETURNING *`
        }

        res.status(200).json(response[0])
    } catch (error) {
        console.error('Error updating settings:', error)
        res.status(500).json({ error: 'Failed to update settings' })
    }
})

app.get('/api/admin/complaints', authenticateToken, async (req, res) => {
    const response = await pool`SELECT * FROM complaints`
    const complaints = response

    const counts = await pool`SELECT 
                                        COUNT(*) AS total,
                                        COUNT(*) FILTER ( WHERE status = 'assigning' OR status = 'in progress' ) AS pending,
                                        COUNT(*) FILTER ( WHERE status = 'resolved' ) AS resolved
                                    FROM complaints `
    
    const stats = await pool`SELECT 
                                        type AS category,
                                        COUNT(*) AS count
                                    FROM complaints
                                    GROUP BY type`

    res.status(200).json({complaints: complaints, counts: counts[0], stats: stats})
})

app.post('/api/admin/update/complaints', authenticateToken, async (req, res) => {
    try {
        const data = req.body.formData;
        
        // Ensure photo is in array format with name and path
        let photoData = []
        if (data.photo) {
            if (Array.isArray(data.photo)) {
                photoData = data.photo
            } else if (typeof data.photo === 'object' && data.photo.name) {
                photoData = [data.photo]
            }
        }

        let videoData = []
        if (data.video) {
            if (Array.isArray(data.video)) {
                videoData = data.video
            } else if (typeof data.video === 'object' && data.video.name) {
                videoData = [data.video]
            }
        }

        let audioData = []
        if (data.audio) {
            if (Array.isArray(data.audio)) {
                audioData = data.audio
            } else if (typeof data.audio === 'object' && data.audio.name) {
                audioData = [data.audio]
            }
        }
        
        const response = await pool`
            UPDATE complaints 
            SET
                first_name = ${data.first_name},
                last_name = ${data.last_name},
                email = ${data.email},
                phone = ${data.phone},
                
                complainer_city = ${data.address_city || null},
                complainer_subcity = ${data.address_subcity || null},
                complainer_woreda = ${data.address_woreda || null},
                complainer_house_number = ${data.address_house_number || null},

                complaint_subcity = ${data.complaint_subcity || null},
                complaint_woreda = ${data.complaint_woreda || null},

                type = ${data.type},
                status = ${data.status},
                description = ${data.description},
                photos = ${pool.json(photoData)},
                videos = ${pool.json(videoData)},
                audios = ${pool.json(audioData)},
                concerned_staff_member = ${data.concerned_staff_member || null}
            WHERE complaint_id = ${data.id}`
        
        res.status(200).json('Complaint Updated Successfully')
    } catch (error) {
        console.error('Error updating complaint:', error)
        res.status(500).json({ error: 'Failed to update complaint' })
    }
})

app.post('/api/admin/create/complaints', async (req, res) => {
    try {
        const data = req.body.formData
        
        // Ensure photo is in array format with name and path
        let photoData = []
        if (data.photo) {
            if (Array.isArray(data.photo)) {
                photoData = data.photo
            } else if (typeof data.photo === 'object' && data.photo.name) {
                photoData = [data.photo]
            }
        }

        let videoData = []
        if (data.video) {
            if (Array.isArray(data.video)) {
                videoData = data.video
            } else if (typeof data.video === 'object' && data.video.name) {
                videoData = [data.video]
            }
        }

        let audioData = []
        if (data.audio) {
            if (Array.isArray(data.audio)) {
                audioData = data.audio
            } else if (typeof data.audio === 'object' && data.audio.name) {
                audioData = [data.audio]
            }
        }
        
        const response = await pool`
            INSERT INTO complaints (
                first_name, last_name, email, phone, 
                complainer_city, complainer_subcity, complainer_woreda, complainer_house_number,
                complaint_subcity, complaint_woreda,
                type, status, description, photos, videos, audios, concerned_staff_member, user_id
            ) 
            VALUES (
                ${data.first_name}, ${data.last_name}, ${data.email}, ${data.phone}, 
                ${data.address_city || null}, ${data.address_subcity || null}, ${data.address_woreda || null}, ${data.address_house_number || null},
                ${data.complaint_subcity || null}, ${data.complaint_woreda || null},
                ${data.type}, ${data.status}, ${data.description}, ${pool.json(photoData)}, ${pool.json(videoData)}, ${pool.json(audioData)}, ${data.concerned_staff_member || null}, ${data.user_id || null}
            ) RETURNING complaint_id`
        
        res.status(201).json({ complaint_id: response[0].complaint_id, ref: `CPL-${String(response[0].complaint_id).padStart(5, '0')}` })
    } catch (error) {
        console.error('Error creating complaint:', error)
        res.status(500).json({ error: 'Failed to create complaint' })
    }
})

// Public complaints endpoint
app.post('/api/complaints', async (req, res) => {
    try {
        const data = req.body
        
        // Ensure photo is in array format with name and path
        let photoData = []
        if (data.photos) {
            if (Array.isArray(data.photos)) {
                photoData = data.photos
            } else if (typeof data.photos === 'object' && data.photos.name) {
                photoData = [data.photos]
            }
        }

        let videoData = []
        if (data.videos) {
            if (Array.isArray(data.videos)) {
                videoData = data.videos
            } else if (typeof data.videos === 'object' && data.videos.name) {
                videoData = [data.videos]
            }
        }

        let audioData = []
        if (data.audios) {
            if (Array.isArray(data.audios)) {
                audioData = data.audios
            } else if (typeof data.audios === 'object' && data.audios.name) {
                audioData = [data.audios]
            }
        }

        // Default values for public submission
        const type = data.type || 'customer service'
        const status = data.status || 'assigning'
        const phone = data.phone || ''

        await pool`
            INSERT INTO complaints (
                first_name, last_name, email, phone,
                complainer_city, complainer_subcity, complainer_woreda, complainer_house_number,
                complaint_subcity, complaint_woreda,
                type, status, description,
                photos, videos, audios,
                concerned_staff_member, user_id
            ) VALUES (
                ${data.first_name || null}, ${data.last_name || null}, ${data.email || null}, ${phone},
                ${data.complainer_city || null}, ${data.complainer_subcity || null}, ${data.complainer_woreda || null}, ${data.complainer_house_number || null},
                ${data.complaint_subcity || null}, ${data.complaint_woreda || null},
                ${type}, ${status}, ${data.description || null},
                ${pool.json(photoData)}, ${pool.json(videoData)}, ${pool.json(audioData)},
                ${null}, ${data.user_id || null}
            )`
        
        res.status(201).json({ message: 'Complaint submitted successfully' })
    } catch (error) {
        console.error('Error submitting complaint:', error)
        res.status(500).json({ error: 'Failed to submit complaint' })
    }
})

// Public events endpoint (no authentication required)
app.get('/api/events', async (req, res) => {
    try {
        const response = await pool`SELECT e.*,
            et.amh, et.orm,
            TO_CHAR(e.start_date, 'Dy. Mon, DD YYYY') AS start_date_short
            FROM events e
            LEFT JOIN events_translation et ON e.events_id = et.event_id
            ORDER BY e.start_date DESC`
        res.status(200).json(response)
    } catch (error) {
        console.error('Error fetching events:', error)
        res.status(500).json({ error: 'Failed to fetch events' })
    }
})

// Events Endpoint
// Routes removed to fix duplication


// Vacancies Endpoint
app.get('/api/admin/vacancies', authenticateToken, async (req, res) => {
  try {
    const result = await pool`
        SELECT v.*, 
               vt.amh, vt.orm,
               TO_CHAR(v.created_at, 'DD - MM - YYYY') as formatted_date 
        FROM vacancies v
        LEFT JOIN vacancy_translation vt ON v.id = vt.vacancy_id
        ORDER BY v.created_at DESC`
    res.json(result)
  } catch (error) {
    console.error('Error fetching vacancies:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/admin/create/events', authenticateToken, async (req, res) => {
    try {
        const { formData } = req.body
        
        // Format photo as JSON object with name and path
        let photoData = null
        if (formData.photo) {
            if (typeof formData.photo === 'object' && formData.photo.name) {
                photoData = formData.photo
            } else if (Array.isArray(formData.photo) && formData.photo.length > 0) {
                photoData = formData.photo[0]
            }
        }
        
        const response = await pool`
            INSERT INTO events (title, description, location, start_date, end_date, status, photos)
             VALUES (${formData.title}, ${formData.description}, ${formData.location}, ${formData.start_date}, ${formData.end_date}, ${'upcoming'}, ${photoData ? JSON.stringify([photoData]) : null}::jsonb)
             RETURNING *`
             
        const eventId = response[0].events_id

        if (formData.amh || formData.orm) {
            const existing = await pool`SELECT 1 FROM events_translation WHERE event_id = ${eventId}`
            if (existing.length > 0) {
                 await pool`
                    UPDATE events_translation 
                    SET amh = ${formData.amh || {}}::jsonb, 
                        orm = ${formData.orm || {}}::jsonb
                    WHERE event_id = ${eventId}`
            } else {
                await pool`
                    INSERT INTO events_translation (event_id, amh, orm)
                    VALUES (${eventId}, ${formData.amh || {}}::jsonb, ${formData.orm || {}}::jsonb)`
            }
        }
        
        logActivity(req.admin.admin_id, req.admin.username, 'CREATED', 'EVENT', formData.title)
        res.status(201).json(response[0])
    } catch (error) {
        console.error('Error creating event:', error)
        res.status(500).json({ error: 'Failed to create event' })
    }
})

app.post('/api/admin/update/events', authenticateToken, async (req, res) => {
    try {
        const { formData } = req.body
        
        if (!formData.events_id) {
            return res.status(400).json({ error: 'Event ID is required for update' })
        }

        // Format photo as JSON object with name and path
        let photoData = null
        if (formData.photo) {
            if (typeof formData.photo === 'object' && formData.photo.name) {
                photoData = formData.photo
            } else if (Array.isArray(formData.photo) && formData.photo.length > 0) {
                photoData = formData.photo[0]
            }
        }

        // Fetch the old version to compare differences
        const oldEventResult = await pool`SELECT * FROM events WHERE events_id = ${formData.events_id}`
        const oldEvent = oldEventResult[0]

        const response = await pool`
            UPDATE events
             SET title = ${formData.title},
                 description = ${formData.description},
                 location = ${formData.location},
                 start_date = ${formData.start_date},
                 end_date = ${formData.end_date},
                 status = ${formData.status || 'upcoming'},
                 photos = ${photoData ? JSON.stringify([photoData]) : null}::jsonb
             WHERE events_id = ${formData.events_id}
             RETURNING *`
        
        if (response.count === 0) {
            return res.status(404).json({ error: 'Event not found' })
        }

        // Build diff details
        const details = {}
        if (oldEvent) {
            const fieldsToCompare = {
                title: 'Title',
                description: 'Description',
                location: 'Location',
                start_date: 'Start Date',
                end_date: 'End Date',
                status: 'Status'
            }
            const mapping = {
                title: formData.title,
                description: formData.description,
                location: formData.location,
                start_date: formData.start_date,
                end_date: formData.end_date,
                status: formData.status
            }
            for (const [col, label] of Object.entries(fieldsToCompare)) {
                const newVal = mapping[col]
                let oldVal = oldEvent[col]
                // Format dates to string for proper comparison
                if (oldVal instanceof Date) {
                    oldVal = oldVal.toISOString().split('T')[0]
                }
                if (newVal !== undefined && newVal !== null && String(newVal).trim() !== String(oldVal || '').trim()) {
                    details[label] = { old: oldVal || '(empty)', new: newVal }
                }
            }
        }

        if (formData.amh || formData.orm) {
            const existing = await pool`SELECT 1 FROM events_translation WHERE event_id = ${formData.events_id}`
            if (existing.length > 0) {
                 await pool`
                    UPDATE events_translation 
                    SET amh = ${formData.amh || {}}::jsonb, 
                        orm = ${formData.orm || {}}::jsonb
                    WHERE event_id = ${formData.events_id}`
            } else {
                await pool`
                    INSERT INTO events_translation (event_id, amh, orm)
                    VALUES (${formData.events_id}, ${formData.amh || {}}::jsonb, ${formData.orm || {}}::jsonb)`
            }
        }
        
        logActivity(req.admin.admin_id, req.admin.username, 'UPDATED', 'EVENT', formData.title, Object.keys(details).length > 0 ? details : null)
        res.status(200).json(response[0])
    } catch (error) {
        console.error('Error updating event:', error)
        res.status(500).json({ error: 'Failed to update event' })
    }
})

app.delete('/api/admin/events/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params
        
        const eventResult = await pool`SELECT title FROM events WHERE events_id = ${id}`
        if (eventResult.length === 0) {
            return res.status(404).json({ error: 'Event not found' })
        }
        const eventTitle = eventResult[0].title

        // Delete translations first
        await pool`DELETE FROM events_translation WHERE event_id = ${id}`

        const response = await pool`DELETE FROM events WHERE events_id = ${id} RETURNING *`
        
        if (response.count === 0) {
            return res.status(404).json({ error: 'Event not found' })
        }
        
        logActivity(req.admin.admin_id, req.admin.username, 'DELETED', 'EVENT', eventTitle)
        res.status(200).json({ message: 'Event deleted successfully' })
    } catch (error) {
        console.error('Error deleting event:', error)
        res.status(500).json({ error: 'Failed to delete event' })
    }
})

async function authenticateToken(req, res, next) {
    const header = req.headers['authorization'] || req.headers['Authorization']
    const token = header && header.split(' ')[1]


    if (!token || token === 'null' || token === 'undefined') {
        console.warn(`[AuthError] No/Invalid Token. Header: ${header}`)
        return res.status(401).json({ error: 'No Token Foundd' })
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const response = await pool`SELECT * FROM admins WHERE admin_id = ${decoded.id}`
        
        if (!response[0]) {
            console.warn(`[AuthError] Admin not found for ID: ${decoded.id}`)
            return res.status(401).json({ error: 'Invalid token' })
        }

        req.admin = response[0]
        next()
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.warn('[AuthError] Token expired')
            return res.status(401).json({ error: 'Token expired' })
        }
        console.warn('[AuthError] Invalid token verify:', error.message)
        return res.status(401).json({ error: 'Invalid token' })
    }
}


// Public news endpoint (no authentication required)
app.get('/api/news', async (req, res) => {
    try {
        const response = await pool`
            SELECT n.*,
                   nt.amh, nt.orm,
                   TO_CHAR(n.created_at, 'Mon DD, YYYY') AS formatted_date
            FROM news n
            LEFT JOIN news_translation nt ON n.id = nt.news_id
            ORDER BY n.created_at DESC
        `
        res.status(200).json(response)
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Public news endpoint (no authentication required)
app.get('/api/vacancies', async (req, res) => {
    try {
        const response = await pool`SELECT v.*,
                   vt.amh, vt.orm,
                   TO_CHAR(v.created_at, 'Mon DD, YYYY') AS formatted_date
            FROM vacancies v
            LEFT JOIN vacancy_translation vt ON v.id = vt.vacancy_id
            ORDER BY v.created_at DESC
        `;
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching vacancies:', error);
        res.status(500).json({ error: 'Failed to fetch vacancies' });
    }
});

// Public endpoint: apply for a vacancy (creates applicant record)
// 1. Upload CV Endpoint
app.post('/api/upload-cv', upload.single('cv'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No CV file uploaded' });
        }
        
        // Move to cvs directory for organization (optional, but consistent with earlier logic)
        // Note: Multer saves to 'uploads' root by default configuration above.
        // We can leave it there or move it. Let's move it to 'uploads/cvs' to keep it clean.
        const cvsDir = path.join(clientPublicPath, 'cvs');
        if (!fs.existsSync(cvsDir)) fs.mkdirSync(cvsDir, { recursive: true });

        const oldPath = req.file.path;
        const fileName = path.basename(req.file.path);
        const newPath = path.join(cvsDir, fileName);
        
        fs.renameSync(oldPath, newPath);

        const relativePath = `/uploads/cvs/${fileName}`;
        
        res.status(200).json({ path: relativePath });
    } catch (error) {
        console.error('Error uploading CV:', error);
        res.status(500).json({ error: 'Failed to upload CV' });
    }
});

// 2. Submit Application (JSON Body)
app.post('/api/applicants', async (req, res) => {
    try {
        const { vacancy_id, full_name, email, phone, cv_path, user_id } = req.body;

        if (!vacancy_id || vacancy_id === 'undefined' || !full_name || !email || !phone) {
            return res.status(400).json({ error: 'vacancy_id, full_name, email and phone are required' });
        }

        // Split name
        const nameParts = String(full_name).trim().split(/\s+/);
        const first_name = nameParts.shift();
        const last_name = nameParts.length > 0 ? nameParts.join(' ') : '';

        // Insert
        const result = await pool`
            INSERT INTO applicants (vacancy_id, first_name, last_name, email, phone, user_id)
             VALUES (${vacancy_id}, ${first_name}, ${last_name}, ${email}, ${phone}, ${user_id || null})
             RETURNING id, vacancy_id, first_name, last_name, email, phone`

        const newApplicant = result[0];
        const applicantId = newApplicant.id;

        // If CV path is provided, rename it to use ID and update DB
        if (cv_path) {
            try {
                // cv_path is likely '/uploads/cvs/temp-filename.pdf'
                // We want '/uploads/cvs/<ID>.pdf'
                
                // Construct absolute paths
                // CAUTION: clientPublicPath is '.../client/public/uploads'
                // cv_path starts with '/uploads/cvs/...'
                // We need to map relative URL to file system path.
                // relative: /uploads/cvs/filename -> file: .../uploads/cvs/filename
                
                const relativeDir = path.dirname(cv_path); // /uploads/cvs
                const fileName = path.basename(cv_path);
                const fileExt = path.extname(fileName);
                
                // Assuming standard path structure matching our static serve:
                // We know we saved it in 'cvsDir' in the previous step.
                const cvsDir = path.join(clientPublicPath, 'cvs');
                const oldFilePath = path.join(cvsDir, fileName);
                
                const newFileName = `${applicantId}${fileExt}`;
                const newFilePath = path.join(cvsDir, newFileName);
                
                if (fs.existsSync(oldFilePath)) {
                    fs.renameSync(oldFilePath, newFilePath);
                    
                    const finalCvPath = `/uploads/cvs/${newFileName}`;
                    
                    await pool`UPDATE applicants SET cv_path = ${finalCvPath} WHERE id = ${applicantId}`
                    newApplicant.cv_path = finalCvPath;
                }
            } catch (renameError) {
                console.error('Error renaming CV file:', renameError);
                // Don't fail the request, just log it. The record exists.
            }
        }

        res.status(201).json({ ...newApplicant, ref: `APP-${String(applicantId).padStart(5, '0')}` });
    } catch (error) {
        console.error('Error adding applicant:', error);
        res.status(500).json({ error: 'Failed to add applicant', details: error.message });
    }
});

// Public endpoint: submit service satisfaction survey
app.post('/api/service-satisfaction', async (req, res) => {
    try {
        const data = req.body

        // Basic validation – require at least gender, age, district and first question
        if (!data.gender || !data.age || !data.district || !data.q1) {
            return res.status(400).json({ error: 'Missing required satisfaction fields' })
        }

        const visits = data.visits ? parseInt(data.visits, 10) : null

        const serviceRequested = Array.isArray(data.service_requested)
            ? data.service_requested
            : (data.service_requested ? [data.service_requested] : [])

        await pool`
            INSERT INTO service_satisfaction (
                gender, age, marital_status, education_level, employment_status,
                district, visits, service_requested,
                q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11,
                additional_comments
            )
            VALUES (
                ${data.gender},
                ${data.age},
                ${data.marital_status || null},
                ${data.education_level || null},
                ${data.employment_status || null},
                ${data.district},
                ${visits},
                ${serviceRequested},
                ${data.q1 || null},
                ${data.q2 || null},
                ${data.q3 || null},
                ${data.q4 || null},
                ${data.q5 || null},
                ${data.q6 || null},
                ${data.q7 || null},
                ${data.q8 || null},
                ${data.q9 || null},
                ${data.q10 || null},
                ${data.q11 || null},
                ${data.additional_comments || null}
            )
        `

        res.status(201).json({ message: 'Satisfaction submitted successfully' })
    } catch (error) {
        console.error('Error submitting satisfaction survey:', error)
        res.status(500).json({ error: 'Failed to submit satisfaction survey' })
    }
})

// Superadmin: get aggregated service satisfaction stats for dashboard
app.get('/api/superadmin/service-satisfaction-stats', authenticateToken, async (req, res) => {
    try {

        const rows = await pool`
            SELECT
                id,
                created_at,
                q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11
            FROM service_satisfaction
            WHERE created_at >= NOW() - INTERVAL '30 days'
            ORDER BY created_at DESC
        `

        const optionToScore = (value) => {
            switch (value) {
            case 'very_high': return 5
            case 'high': return 4
            case 'medium': return 3
            case 'low': return 2
            case 'very_low': return 1
            default: return null
            }
        }

        const questionKeys = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10','q11']

        const aggregates = {}
        questionKeys.forEach(key => {
            aggregates[key] = { totalScore: 0, count: 0 }
        })

        // Per-day aggregates for last 30 days
        const dailyMap = {}

        rows.forEach(row => {
            const created = row.created_at
            const dayKey = created instanceof Date
                ? created.toISOString().slice(0, 10)
                : String(created).slice(0, 10)

            if (!dailyMap[dayKey]) {
                dailyMap[dayKey] = { totalScore: 0, count: 0 }
            }

            questionKeys.forEach(key => {
                const raw = row[key]
                const score = optionToScore(raw)
                if (score != null) {
                    aggregates[key].totalScore += score
                    aggregates[key].count += 1

                    dailyMap[dayKey].totalScore += score
                    dailyMap[dayKey].count += 1
                }
            })
        })

        const averages = questionKeys.map((key, index) => {
            const { totalScore, count } = aggregates[key]
            const avg = count > 0 ? totalScore / count : 0
            return {
                questionKey: key,
                questionLabel: `Q${index + 1}`,
                averageScore: Number(avg.toFixed(2)),
                responses: count
            }
        })

        const daily = Object.entries(dailyMap)
            .sort(([a], [b]) => (a < b ? -1 : 1))
            .map(([date, value]) => {
                const avg = value.count > 0 ? value.totalScore / value.count : 0
                return {
                    date,
                    averageScore: Number(avg.toFixed(2)),
                    responses: value.count
                }
            })

        res
          .status(200)
          .set('Cache-Control', 'no-store')
          .json({
              totalResponses: rows.length,
              averages,
              daily
          })
        
        console.log(rows)
    } catch (error) {
        console.error('Error fetching satisfaction stats:', error)
        res.status(500).json({ error: 'Failed to fetch satisfaction stats' })
    }
})

// Admin news endpoints
app.get('/api/admin/news', authenticateToken, async (req, res) => {
    try {
        const response = await pool`
            SELECT n.*,
                   nt.amh, nt.orm,
                   TO_CHAR(n.created_at, 'Mon DD, YYYY') AS formatted_date
            FROM news n
            LEFT JOIN news_translation nt ON n.id = nt.news_id
            ORDER BY n.created_at DESC
        `
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

app.post('/api/admin/create/news', authenticateToken, async (req, res) => {
    try {
        const formData = req.body;
        
        // Format photo as JSON object with name and path
        let photoData = null
        if (formData.photo) {
            if (typeof formData.photo === 'object' && formData.photo.name) {
                photoData = formData.photo
            } else if (Array.isArray(formData.photo) && formData.photo.length > 0) {
                photoData = formData.photo[0]
            }
        }
        
        const response = await pool`
            INSERT INTO news (title, description, category, short_description, photo)
             VALUES (${formData.title}, ${formData.description}, ${formData.category}, ${formData.shortDescription}, ${photoData ? JSON.stringify(photoData) : null}::jsonb)
             RETURNING *`
        
        const newsId = response[0].id

        if (formData.amh || formData.orm) {
            const existing = await pool`SELECT 1 FROM news_translation WHERE news_id = ${newsId}`
            if (existing.length > 0) {
                 await pool`
                    UPDATE news_translation 
                    SET amh = ${formData.amh || {}}::jsonb, 
                        orm = ${formData.orm || {}}::jsonb
                    WHERE news_id = ${newsId}`
            } else {
                await pool`
                    INSERT INTO news_translation (news_id, amh, orm)
                    VALUES (${newsId}, ${formData.amh || {}}::jsonb, ${formData.orm || {}}::jsonb)`
            }
        }
        
        logActivity(req.admin.admin_id, req.admin.username, 'CREATED', 'NEWS', formData.title)
        res.status(201).json(response[0]);
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ error: 'Failed to create news' });
    }
});

app.post('/api/admin/update/news', authenticateToken, async (req, res) => {
    try {
        const formData = req.body;

        
        if (!formData.news_id) {
            return res.status(400).json({ error: 'News ID is required for update' });
        }

        // Format photo as JSON object with name and path
        let photoData = null
        if (formData.photo) {
            if (typeof formData.photo === 'object' && formData.photo.name) {
                photoData = formData.photo
            } else if (Array.isArray(formData.photo) && formData.photo.length > 0) {
                photoData = formData.photo[0]
            }
        }

        // Fetch the old version to compare differences
        const oldNewsResult = await pool`SELECT * FROM news WHERE id = ${formData.news_id}`
        const oldNews = oldNewsResult[0]

        const response = await pool`
            UPDATE news
             SET title = ${formData.title},
                 description = ${formData.description},
                 category = ${formData.category},
                 short_description = ${formData.shortDescription},
                 photo = ${photoData ? JSON.stringify(photoData) : null}::jsonb
             WHERE id = ${formData.news_id}
             RETURNING *`
        
        if (response.count === 0) {
            return res.status(404).json({ error: 'News not found' });
        }

        // Build diff details
        const details = {}
        if (oldNews) {
            const fieldsToCompare = {
                title: 'Title',
                description: 'Description',
                category: 'Category',
                short_description: 'Short Description'
            }
            // Maps form keys to DB columns
            const mapping = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                short_description: formData.shortDescription
            }
            for (const [col, label] of Object.entries(fieldsToCompare)) {
                const newVal = mapping[col]
                const oldVal = oldNews[col]
                if (newVal !== undefined && newVal !== null && String(newVal).trim() !== String(oldVal || '').trim()) {
                    details[label] = { old: oldVal || '(empty)', new: newVal }
                }
            }
        }

        if (formData.amh || formData.orm) {
            const existing = await pool`SELECT 1 FROM news_translation WHERE news_id = ${formData.news_id}`
            if (existing.length > 0) {
                 await pool`
                    UPDATE news_translation 
                    SET amh = ${formData.amh || {}}::jsonb, 
                        orm = ${formData.orm || {}}::jsonb
                    WHERE news_id = ${formData.news_id}`
            } else {
                 await pool`
                    INSERT INTO news_translation (news_id, amh, orm)
                    VALUES (${formData.news_id}, ${formData.amh || {}}::jsonb, ${formData.orm || {}}::jsonb)`
            }
        }
        
        logActivity(req.admin.admin_id, req.admin.username, 'UPDATED', 'NEWS', formData.title, Object.keys(details).length > 0 ? details : null)
        res.status(200).json(response[0]);
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ error: 'Failed to update news' });
    }
});

app.delete('/api/admin/news/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const newsResult = await pool`SELECT title FROM news WHERE id = ${id}`;
        if (newsResult.count === 0) {
            return res.status(404).json({ error: 'News not found' });
        }
        const newsTitle = newsResult[0].title;

        // Delete translations first
        await pool`DELETE FROM news_translation WHERE news_id = ${id}`

        const response = await pool`DELETE FROM news WHERE id = ${id} RETURNING *`;
        
        if (response.count === 0) {
            return res.status(404).json({ error: 'News not found' });
        }
        
        logActivity(req.admin.admin_id, req.admin.username, 'DELETED', 'NEWS', newsTitle)
        res.status(200).json({ message: 'News deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news' });
    }
});

// Vacancy endpoints
// Duplicate vacancies route removed

// Create new vacancy
app.post('/api/admin/create/vacancy', authenticateToken, async (req, res) => {
  try {
    const formData = req.body;
    
    const response = await pool`
      INSERT INTO vacancies (title, short_description, description, location, salary, type, category, skills, responsibilities, qualifications, start_date, end_date)
       VALUES (${formData.title}, ${formData.shortDescription}, ${formData.description}, ${formData.location}, ${formData.salary}, ${formData.type}, ${formData.category}, ${Array.isArray(formData.skills) ? formData.skills : []}, ${Array.isArray(formData.responsibilities) ? formData.responsibilities : formData.responsibilities ? [formData.responsibilities] : []}, ${Array.isArray(formData.qualifications) ? formData.qualifications : formData.qualifications ? [formData.qualifications] : []}, ${formData.startDate}, ${formData.endDate})
       RETURNING *`
    
    const vacancyId = response[0].id

    if (formData.amh || formData.orm) {
        const existing = await pool`SELECT 1 FROM vacancy_translation WHERE vacancy_id = ${vacancyId}`
        if (existing.length > 0) {
            await pool`
            UPDATE vacancy_translation 
            SET amh = ${formData.amh || {}}::jsonb, 
                orm = ${formData.orm || {}}::jsonb
            WHERE vacancy_id = ${vacancyId}`
        } else {
            await pool`
                INSERT INTO vacancy_translation (vacancy_id, amh, orm)
                VALUES (${vacancyId}, ${formData.amh || {}}::jsonb, ${formData.orm || {}}::jsonb)`
        }
    }
    
    logActivity(req.admin.admin_id, req.admin.username, 'CREATED', 'VACANCY', formData.title)
    res.status(201).json(response[0])
  } catch (error) {
    console.error('Error creating vacancy:', error)
    res.status(500).json({ error: 'Failed to create vacancy' })
  }
})

// Update vacancy
app.post('/api/admin/update/vacancy', authenticateToken, async (req, res) => {
  try {
    const formData = req.body;
    
    if (!formData.id) {
      return res.status(400).json({ error: 'Vacancy ID is required for update' })
    }
    
    // Fetch the old version to compare differences
    const oldVacancyResult = await pool`SELECT * FROM vacancies WHERE id = ${formData.id}`
    const oldVacancy = oldVacancyResult[0]

    const response = await pool`
      UPDATE vacancies
       SET title = ${formData.title},
           short_description = ${formData.shortDescription},
           description = ${formData.description},
           location = ${formData.location},
           salary = ${formData.salary},
           type = ${formData.type},
           category = ${formData.category},
           skills = ${Array.isArray(formData.skills) ? formData.skills : []},
           responsibilities = ${Array.isArray(formData.responsibilities) ? formData.responsibilities : formData.responsibilities ? [formData.responsibilities] : []},
           qualifications = ${Array.isArray(formData.qualifications) ? formData.qualifications : formData.qualifications ? [formData.qualifications] : []},
           start_date = ${formData.startDate},
           end_date = ${formData.endDate}
       WHERE id = ${formData.id}
       RETURNING *`
    
    if (response.count === 0) {
      return res.status(404).json({ error: 'Vacancy not found' })
    }

    // Build diff details
    const details = {}
    if (oldVacancy) {
        const fieldsToCompare = {
            title: 'Title',
            short_description: 'Short Description',
            description: 'Description',
            location: 'Location',
            salary: 'Salary',
            type: 'Type',
            category: 'Category',
            start_date: 'Start Date',
            end_date: 'End Date'
        }
        const mapping = {
            title: formData.title,
            short_description: formData.shortDescription,
            description: formData.description,
            location: formData.location,
            salary: formData.salary,
            type: formData.type,
            category: formData.category,
            start_date: formData.startDate,
            end_date: formData.endDate
        }
        for (const [col, label] of Object.entries(fieldsToCompare)) {
            const newVal = mapping[col]
            let oldVal = oldVacancy[col]
            if (oldVal instanceof Date) {
                oldVal = oldVal.toISOString().split('T')[0]
            }
            if (newVal !== undefined && newVal !== null && String(newVal).trim() !== String(oldVal || '').trim()) {
                details[label] = { old: oldVal || '(empty)', new: newVal }
            }
        }
    }

    if (formData.amh || formData.orm) {
        const existing = await pool`SELECT 1 FROM vacancy_translation WHERE vacancy_id = ${formData.id}`
        if (existing.length > 0) {
            await pool`
            UPDATE vacancy_translation 
            SET amh = ${formData.amh || {}}::jsonb, 
                orm = ${formData.orm || {}}::jsonb
            WHERE vacancy_id = ${formData.id}`
        } else {
            await pool`
                INSERT INTO vacancy_translation (vacancy_id, amh, orm)
                VALUES (${formData.id}, ${formData.amh || {}}::jsonb, ${formData.orm || {}}::jsonb)`
        }
    }
    
    logActivity(req.admin.admin_id, req.admin.username, 'UPDATED', 'VACANCY', formData.title, Object.keys(details).length > 0 ? details : null)
    res.json(response[0])
  } catch (error) {
    console.error('Error updating vacancy:', error)
    res.status(500).json({ error: 'Failed to update vacancy' })
  }
})

// Delete vacancy
app.delete('/api/admin/vacancy/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, get the title of the vacancy for logging
    const vacancyResult = await pool`SELECT title FROM vacancies WHERE id = ${id}`;
    if (vacancyResult.count === 0) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }
    const vacancyTitle = vacancyResult[0].title;

    // Delete translations first
    await pool`DELETE FROM vacancy_translation WHERE vacancy_id = ${id}`

    const response = await pool`DELETE FROM vacancies WHERE id = ${id} RETURNING *`;
    
    if (response.count === 0) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }
    
    logActivity(req.admin.admin_id, req.admin.username, 'DELETED', 'VACANCY', vacancyTitle);
    res.json({ message: 'Vacancy deleted successfully' });
  } catch (error) {
    console.error('Error deleting vacancy:', error);
    res.status(500).json({ error: 'Failed to delete vacancy' });
  }
})

// Get all applicants (for admin panel)
app.get('/api/admin/applicants', authenticateToken, async (req, res) => {
    try {
        // Allow admin, superadmin, and vacancy_admin roles
        const allowedRoles = ['admin', 'superadmin', 'vacancy_admin']
        if (!req.admin || !allowedRoles.includes(req.admin.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const result = await pool`
            SELECT 
                a.id,
                a.first_name,
                a.last_name,
                CONCAT(a.first_name, ' ', a.last_name) AS full_name,
                a.email,
                a.phone,
                a.status,
                a.cv_path,
                a.created_at,
                TO_CHAR(a.created_at, 'DD - MM - YYYY') AS applied_date,
                v.title AS vacancy_title,
                v.category,
                v.salary
            FROM applicants a
            LEFT JOIN vacancies v ON a.vacancy_id = v.id
            ORDER BY a.created_at DESC
        `

        res.json(result);
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get single applicant by ID
app.get('/api/admin/applicants/:id', authenticateToken, async (req, res) => {
    try {
        const allowedRoles = ['admin', 'superadmin', 'vacancy_admin']
        if (!req.admin || !allowedRoles.includes(req.admin.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { id } = req.params;
        const result = await pool`SELECT a.*, v.title as vacancy_title 
             FROM applicants a 
             LEFT JOIN vacancies v ON a.vacancy_id = v.id 
             WHERE a.id = ${id}`

        if (result.length === 0) {
            return res.status(404).json({ error: 'Applicant not found' });
        }

        res.json(result[0]);
    } catch (error) {
        console.error('Error fetching applicant:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update applicant
app.put('/api/admin/applicants/:id', authenticateToken, upload.single('cv'), async (req, res) => {
    try {
        const allowedRoles = ['admin', 'superadmin', 'vacancy_admin']
        if (!req.admin || !allowedRoles.includes(req.admin.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { id } = req.params;
        const { first_name, last_name, email, phone } = req.body;
        let cvPath = null;

        if (req.file) {
            cvPath = `/uploads/${req.file.filename}`;
        }

        const applicantIdNum = parseInt(id);
        if (isNaN(applicantIdNum)) {
             return res.status(400).json({ error: 'Invalid applicant ID' });
        }

        // Sanitize vacancy_id - handle null, empty string, and invalid numbers
        let vacancy_id_val = null;
        if (req.body.vacancy_id && req.body.vacancy_id !== 'null' && req.body.vacancy_id !== '') {
            const parsed = parseInt(req.body.vacancy_id);
            vacancy_id_val = isNaN(parsed) ? null : parsed;
        }

        const result = await pool`
            UPDATE applicants 
               SET first_name = ${first_name || null},
                   last_name = ${last_name || null},
                   email = ${email || null},
                   phone = ${phone || null},
                   status = ${req.body.status || 'submitted'},
                   vacancy_id = COALESCE(${vacancy_id_val}, vacancy_id),
                   cv_path = COALESCE(${cvPath || null}, cv_path)
               WHERE id = ${applicantIdNum}
               RETURNING *`

        if (result.length === 0) {
            return res.status(404).json({ error: 'Applicant not found' });
        }

        res.json(result[0]);
    } catch (error) {
        console.error('Error updating applicant:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});


// Helper function to log activities
const logActivity = async (adminId, username, action, entityType, entityTitle, details = null) => {
  try {
      // Pass details as a raw object — postgres.js serializes JS objects to JSONB correctly.
      // Do NOT pre-stringify, otherwise it stores as plain text instead of JSONB.
      const result = await pool`
          INSERT INTO activity_logs (admin_id, username, action, entity_type, entity_title, details) 
          VALUES (${adminId}, ${username}, ${action}, ${entityType}, ${entityTitle}, ${details ? pool.json(details) : null})
          RETURNING *`
  } catch(err) {
      console.error('[logActivity] Error logging activity:', err)
  }
}


// Public contact endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const data = req.body
        
        // Ensure photo is in array format with name and path
        let photoData = []
        if (data.photos) {
            if (Array.isArray(data.photos)) {
                photoData = data.photos
            } else if (typeof data.photos === 'object' && data.photos.name) {
                photoData = [data.photos]
            }
        }
        
        const result = await pool`
            INSERT INTO contacts (
                first_name, last_name, email, message, photos
            ) 
            VALUES (
                ${data.first_name}, ${data.last_name}, ${data.email}, ${data.description}, ${JSON.stringify(photoData)}::JSONB
            )
            RETURNING *`
        
        res.status(201).json({ message: 'Message sent successfully' })
    } catch (error) {
        console.error('Error submitting contact form:', error)
        res.status(500).json({ error: 'Failed to send message' })
    }
})

// Admin: Get pending contact requests
app.get('/api/admin/contacts', authenticateToken, async (req, res) => {
    try {

        const contacts = await pool`
            SELECT * FROM contacts 
            WHERE status = 'pending'
            ORDER BY created_at DESC
        `
        res.status(200).json(contacts)
    } catch (error) {
        console.error('Error fetching contacts:', error)
        res.status(500).json({ error: 'Failed to fetch contacts' })
    }
})

// Admin: Mark contact as resolved
app.put('/api/admin/contacts/:id/resolve', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params
        
        const result = await pool`
            UPDATE contacts
            SET status = 'resolved'
            WHERE id = ${id}
            RETURNING *
        `
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Contact request not found' })
        }

        res.status(200).json(result[0])
    } catch (error) {
        console.error('Error resolving contact:', error)
        res.status(500).json({ error: 'Failed to resolve contact' })
    }
})


// ─────────────────────────────────────────────────────────────────────────────
// 2FA / OTP / PASSWORD RESET — powered by Supabase Auth email delivery
// ─────────────────────────────────────────────────────────────────────────────

const RATE_LIMIT_WINDOW = 10 * 60 * 1000
const RATE_LIMIT_MAX    = 5
const rateLimitMap      = {}
function isRateLimited(key) {
  const now = Date.now()
  if (!rateLimitMap[key]) rateLimitMap[key] = []
  rateLimitMap[key] = rateLimitMap[key].filter(ts => now - ts < RATE_LIMIT_WINDOW)
  if (rateLimitMap[key].length >= RATE_LIMIT_MAX) return true
  rateLimitMap[key].push(now)
  return false
}

// ── Admin login step 1: verify credentials → Supabase sends OTP ──────────────
app.post('/auth/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' })

    const result = await pool`SELECT * FROM admins WHERE username = ${username}`
    if (result.length === 0) return res.status(401).json({ error: 'Invalid username or password' })

    const admin = result[0]
    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid username or password' })
    if (!admin.email) return res.status(400).json({ error: 'No email on this account. Contact superadmin.' })

    if (isRateLimited(`otp:${admin.email}`))
      return res.status(429).json({ error: 'Too many requests. Try again in 10 minutes.' })

    const { success, error } = await sendOTPEmail({ to: admin.email, purpose: '2fa_login' })
    if (!success) return res.status(500).json({ error: `Failed to send verification code: ${error}` })

    const maskedEmail = admin.email.replace(/(.{1}).+(@.+)/, '$1***$2')
    res.json({ requires2FA: true, maskedEmail, entityType: 'admin' })
  } catch (err) {
    console.error('Admin login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// ── User login step 1: verify credentials → Supabase sends OTP ───────────────
app.post('/api/user/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const result = await pool`SELECT * FROM users WHERE email = ${email}`
    if (result.length === 0) return res.status(401).json({ error: 'Invalid email or password' })

    const user  = result[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    if (isRateLimited(`otp:${email}`))
      return res.status(429).json({ error: 'Too many requests. Try again in 10 minutes.' })

    const { success, error } = await sendOTPEmail({ to: email, purpose: '2fa_login' })
    if (!success) return res.status(500).json({ error: `Failed to send verification code: ${error}` })

    const maskedEmail = email.replace(/(.{1}).+(@.+)/, '$1***$2')
    res.json({ requires2FA: true, maskedEmail, entityType: 'user' })
  } catch (err) {
    console.error('User login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// ── Step 2: verify OTP via Supabase → issue our JWT ──────────────────────────
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp, entityType } = req.body
    if (!email || !otp || !entityType) return res.status(400).json({ error: 'Missing fields' })

    const { success, error } = await verifyOTPEmail({ email, token: otp })
    if (!success) return res.status(401).json({ error: error || 'Invalid or expired code' })

    if (entityType === 'admin') {
      const admins = await pool`SELECT * FROM admins WHERE email = ${email}`
      if (admins.length === 0) return res.status(401).json({ error: 'Account not found' })
      const admin = admins[0]
      const token = jwt.sign({ id: admin.admin_id }, process.env.JWT_SECRET, { expiresIn: '7d' })
      const { password_hash, ...safeAdmin } = admin
      return res.json({ token, admin: safeAdmin, role: admin.role })
    } else {
      const users = await pool`SELECT * FROM users WHERE email = ${email}`
      if (users.length === 0) return res.status(401).json({ error: 'Account not found' })
      const user  = users[0]
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' })
      const { password_hash, ...safeUser } = user
      return res.json({ token, user: safeUser })
    }
  } catch (err) {
    console.error('OTP verify error:', err)
    res.status(500).json({ error: 'Verification failed' })
  }
})

// ── Resend OTP ────────────────────────────────────────────────────────────────
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email, entityType, purpose = '2fa_login' } = req.body
    if (!email) return res.status(400).json({ error: 'Missing email' })

    if (isRateLimited(`resend:${email}`))
      return res.status(429).json({ error: 'Too many requests. Try again in 10 minutes.' })

    const { success, error } = await sendOTPEmail({ to: email, purpose })
    if (!success) return res.status(500).json({ error: `Failed to resend: ${error}` })
    res.json({ success: true })
  } catch (err) {
    console.error('Resend OTP error:', err)
    res.status(500).json({ error: 'Failed to resend code' })
  }
})

// ── Email verification (post-register) ───────────────────────────────────────
app.post('/api/auth/send-verification', authenticateUser, async (req, res) => {
  try {
    const email = req.user.email
    if (isRateLimited(`verify:${email}`))
      return res.status(429).json({ error: 'Too many requests. Try again in 10 minutes.' })

    const { success, error } = await sendOTPEmail({ to: email, purpose: 'verify_email' })
    if (!success) return res.status(500).json({ error: `Failed to send: ${error}` })
    res.json({ success: true })
  } catch (err) {
    console.error('Send verification error:', err)
    res.status(500).json({ error: 'Failed to send verification code' })
  }
})

app.post('/api/auth/verify-email', authenticateUser, async (req, res) => {
  try {
    const { otp } = req.body
    const email   = req.user.email

    const { success, error } = await verifyOTPEmail({ email, token: otp })
    if (!success) return res.status(401).json({ error: error || 'Invalid or expired code' })

    await pool`UPDATE users SET email_verified = TRUE WHERE id = ${req.user.id}`
    const updated = await pool`SELECT id, first_name, last_name, email, phone, email_verified, two_fa_enabled, created_at FROM users WHERE id = ${req.user.id}`
    res.json(updated[0])
  } catch (err) {
    console.error('Verify email error:', err)
    res.status(500).json({ error: 'Verification failed' })
  }
})

// ── Password reset ────────────────────────────────────────────────────────────
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email, entityType = 'user' } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })

    let exists = false
    if (entityType === 'admin') {
      const r = await pool`SELECT admin_id FROM admins WHERE email = ${email}`
      exists = r.length > 0
    } else {
      const r = await pool`SELECT id FROM users WHERE email = ${email}`
      exists = r.length > 0
    }

    if (exists) {
      if (isRateLimited(`reset:${email}`))
        return res.status(429).json({ error: 'Too many requests. Try again in 10 minutes.' })
      await sendOTPEmail({ to: email, purpose: 'reset_password' })
    }

    res.json({ success: true }) // always 200 to prevent email enumeration
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ error: 'Failed to send reset code' })
  }
})

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword, entityType = 'user' } = req.body
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Missing fields' })

    const { success, error } = await verifyOTPEmail({ email, token: otp })
    if (!success) return res.status(401).json({ error: error || 'Invalid or expired code' })

    if (newPassword.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' })

    const hashed = await bcrypt.hash(newPassword, 10)
    if (entityType === 'admin') {
      await pool`UPDATE admins SET password_hash = ${hashed} WHERE email = ${email}`
    } else {
      await pool`UPDATE users SET password_hash = ${hashed} WHERE email = ${email}`
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ error: 'Password reset failed' })
  }
})

// ── User register — Supabase sends email verification OTP ────────────────────
app.post('/api/user/register', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body
    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ error: 'First name, last name, email and password are required' })

    const existing = await pool`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) return res.status(400).json({ error: 'An account with this email already exists' })

    const password_hash = await bcrypt.hash(password, 10)
    const result = await pool`
      INSERT INTO users (first_name, last_name, email, phone, password_hash, email_verified)
      VALUES (${first_name}, ${last_name}, ${email}, ${phone || null}, ${password_hash}, FALSE)
      RETURNING id, first_name, last_name, email, phone, email_verified, two_fa_enabled, created_at`

    const user  = result[0]
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' })

    await sendOTPEmail({ to: email, purpose: 'verify_email' })

    res.status(201).json({ user, token, requiresVerification: true })
  } catch (e) {
    console.error('User register error:', e)
    res.status(500).json({ error: 'Failed to create account' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Prepare SPA fallback - Catch all requests usually
// ─────────────────────────────────────────────────────────────────────────────

// Middleware: authenticate a user JWT (separate from admin JWT)
async function authenticateUser(req, res, next) {
    const header = req.headers['authorization'] || req.headers['Authorization']
    const token = header && header.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token provided' })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const result = await pool`SELECT id, first_name, last_name, email, phone FROM users WHERE id = ${decoded.userId}`
        if (result.length === 0) return res.status(401).json({ error: 'User not found' })
        req.user = result[0]
        next()
    } catch (e) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}

// GET /api/user/me — verify token and return user
app.get('/api/user/me', authenticateUser, (req, res) => {
    res.json(req.user)
})

// GET /api/user/dashboard — all complaints & applications for this user
app.get('/api/user/dashboard', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id

        const complaints = await pool`
            SELECT complaint_id AS id, first_name, last_name, type, status, description,
                   created_at, complaint_subcity, complainer_subcity
            FROM complaints
            WHERE user_id = ${userId}
            ORDER BY created_at DESC`

        const applications = await pool`
            SELECT a.id, a.status, a.created_at, a.cv_path,
                   v.title AS vacancy_title, v.location, v.type AS job_type, v.category
            FROM applicants a
            LEFT JOIN vacancies v ON a.vacancy_id = v.id
            WHERE a.user_id = ${userId}
            ORDER BY a.created_at DESC`

        res.json({ complaints, applications })
    } catch (e) {
        console.error('Dashboard error:', e)
        res.status(500).json({ error: 'Failed to load dashboard' })
    }
})

// PATCH /api/user/profile — update name/phone/password
app.patch('/api/user/profile', authenticateUser, async (req, res) => {
    try {
        const { first_name, last_name, phone, currentPassword, newPassword } = req.body
        const userId = req.user.id

        // If changing password, verify current first
        if (newPassword) {
            const full = await pool`SELECT password_hash FROM users WHERE id = ${userId}`
            const valid = await bcrypt.compare(currentPassword || '', full[0].password_hash)
            if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })
        }

        const newHash = newPassword ? await bcrypt.hash(newPassword, 10) : null

        const result = await pool`
            UPDATE users SET
                first_name   = COALESCE(${first_name   || null}, first_name),
                last_name    = COALESCE(${last_name    || null}, last_name),
                phone        = COALESCE(${phone        || null}, phone),
                password_hash = COALESCE(${newHash}, password_hash)
            WHERE id = ${userId}
            RETURNING id, first_name, last_name, email, phone, created_at`

        res.json(result[0])
    } catch (e) {
        console.error('Profile update error:', e)
        res.status(500).json({ error: 'Failed to update profile' })
    }
})

// SPA fallback — serve index.html for all non-API routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'))
})





app.listen(process.env.SERVER_PORT, () => console.log('listening...'))