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
    // Check if it's an admin profile upload based on field name or URL (req.url isn't easily available here in standard multer setup without some tweaks, but we can check fieldname if valid, or just simple logic)
    // Actually, simple path approach:
    // If fieldname is 'profile_picture', go to admin_profiles
    if (file.fieldname === 'profile_picture') {
        const adminProfilesPath = path.join(clientPublicPath, 'admin_profiles')
        if (!fs.existsSync(adminProfilesPath)) {
            fs.mkdirSync(adminProfilesPath, { recursive: true })
        }
        cb(null, adminProfilesPath)
    } else {
        cb(null, clientPublicPath)
    }
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and documents
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true)
    } else {
      cb(new Error('Only image, PDF and Word files are allowed'), false)
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
            created_at: activity.created_at,
        }))

        res.status(200).json({ status: 'Success', activities: formattedActivities })
    } catch (error) {
        console.error('Error fetching activities:', error)
        res.status(500).json({ error: 'Failed to fetch activities' })
    }
})

// File upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Return JSON with name and relative path (accessible from client public folder)
    const fileData = {
      name: req.file.originalname,
      path: `/uploads/${req.file.filename}`
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

app.post('/auth/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body

        if(!username || !password) return res.status(400).json({error: 'Username and Password are Required'})
        
        const response = await pool`SELECT * FROM admins WHERE username = ${username}`
        const data = response[0]

        if(!data) return res.status(404).json({error: 'User Not Found'})

        const isPasswordValid = await bcrypt.compare(password, data.password_hash)

        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid Password' })
        
        const token = jwt.sign({ id: data.admin_id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        
        res.status(200).json({
            message: 'login successful',
            token,
            admin: {
                id: data.admin_id,
                username: data.username,
                first_name: data.first_name,
                last_name: data.last_name,
                emial: data.email,
                role: data.role
            }

        })
    }
    catch (error) {
        res.status(500).json({error: 'Internal Server Error'})
    }
})

app.post('/auth/admin/me', authenticateToken, async (req, res) => {
    const adminData = req.admin

    res.status(200).json(adminData)
})

// Superadmin: create new admin account
app.post('/superadmin/create-admin', authenticateToken, async (req, res) => {
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

// Superadmin: get vacancy applications (applicants joined with vacancies)
app.get('/superadmin/vacancy-applications', authenticateToken, async (req, res) => {
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
app.get('/superadmin/overview', authenticateToken, async (req, res) => {
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
app.post('/admin/update/profile', authenticateToken, async (req, res) => {
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
app.post('/admin/update/admin-info', authenticateToken, async (req, res) => {
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

        const response = await pool`
            UPDATE admins
             SET username = ${formData.username},
                 role = ${formData.role}
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
app.post('/admin/update/password', authenticateToken, async (req, res) => {
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
app.get('/admin/settings', authenticateToken, async (req, res) => {
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
app.post('/admin/update/settings', authenticateToken, async (req, res) => {
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

app.get('/admin/complaints', authenticateToken, async (req, res) => {
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

app.post('/admin/update/complaints', authenticateToken, async (req, res) => {
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
                photos = ${JSON.stringify(photoData)}::JSONB,
                concerned_staff_member = ${data.concerned_staff_member || null}
            WHERE complaint_id = ${data.id}`
        
        res.status(200).json('Complaint Updated Successfully')
    } catch (error) {
        console.error('Error updating complaint:', error)
        res.status(500).json({ error: 'Failed to update complaint' })
    }
})

app.post('/admin/create/complaints', async (req, res) => {
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
        
        const response = await pool`
            INSERT INTO complaints (
                first_name, last_name, email, phone, 
                complainer_city, complainer_subcity, complainer_woreda, complainer_house_number,
                complaint_subcity, complaint_woreda,
                type, status, description, photos, concerned_staff_member
            ) 
            VALUES (
                ${data.first_name}, ${data.last_name}, ${data.email}, ${data.phone}, 
                ${data.address_city || null}, ${data.address_subcity || null}, ${data.address_woreda || null}, ${data.address_house_number || null},
                ${data.complaint_subcity || null}, ${data.complaint_woreda || null},
                ${data.type}, ${data.status}, ${data.description}, ${JSON.stringify(photoData)}::JSONB, ${data.concerned_staff_member || null}
            )`
        
        res.status(201).json('Complaint Created Successfully')
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
        
        // Default values for public submission
        const type = data.type || 'customer service'
        const status = data.status || 'assigning'
        const phone = data.phone || ''

        await pool`
            INSERT INTO complaints (
                first_name, last_name, email, phone, 
                complainer_city, complainer_subcity, complainer_woreda, complainer_house_number,
                complaint_subcity, complaint_woreda,
                type, status, description, photos, concerned_staff_member
            ) 
            VALUES (
                ${data.first_name}, ${data.last_name}, ${data.email}, ${phone}, 
                ${data.address_city || null}, ${data.address_subcity || null}, ${data.address_woreda || null}, ${data.address_house_number || null},
                ${data.complaint_subcity || null}, ${data.complaint_woreda || null},
                ${type}, ${status}, ${data.description}, ${JSON.stringify(photoData)}::JSONB, ${null}
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
app.get('/admin/vacancies', authenticateToken, async (req, res) => {
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

app.post('/admin/create/events', authenticateToken, async (req, res) => {
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

app.post('/admin/update/events', authenticateToken, async (req, res) => {
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
        
        logActivity(req.admin.admin_id, req.admin.username, 'UPDATED', 'EVENT', formData.title)
        res.status(200).json(response[0])
    } catch (error) {
        console.error('Error updating event:', error)
        res.status(500).json({ error: 'Failed to update event' })
    }
})

app.delete('/admin/events/:id', authenticateToken, async (req, res) => {
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
        const { vacancy_id, full_name, email, phone, cv_path } = req.body;

        if (!vacancy_id || vacancy_id === 'undefined' || !full_name || !email || !phone) {
            return res.status(400).json({ error: 'vacancy_id, full_name, email and phone are required' });
        }

        // Split name
        const nameParts = String(full_name).trim().split(/\s+/);
        const first_name = nameParts.shift();
        const last_name = nameParts.length > 0 ? nameParts.join(' ') : '';

        // Insert
        const result = await pool`
            INSERT INTO applicants (vacancy_id, first_name, last_name, email, phone)
             VALUES (${vacancy_id}, ${first_name}, ${last_name}, ${email}, ${phone})
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

        res.status(201).json(newApplicant);
    } catch (error) {
        console.error('Error adding applicant:', error);
        res.status(500).json({ error: 'Failed to add applicant', details: error.message });
    }
});

// Admin news endpoints
app.get('/admin/news', authenticateToken, async (req, res) => {
    try {
        const response = await pool`
            SELECT *,
                   TO_CHAR(created_at, 'Mon DD, YYYY') AS formatted_date
            FROM news
            ORDER BY created_at DESC
        `
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

app.post('/admin/create/news', authenticateToken, async (req, res) => {
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

app.post('/admin/update/news', authenticateToken, async (req, res) => {
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
        
        logActivity(req.admin.admin_id, req.admin.username, 'UPDATED', 'NEWS', formData.title)
        res.status(200).json(response[0]);
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ error: 'Failed to update news' });
    }
});

app.delete('/admin/news/:id', authenticateToken, async (req, res) => {
    try {
        console.log('deleting...')
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
app.post('/admin/create/vacancy', authenticateToken, async (req, res) => {
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
app.post('/admin/update/vacancy', authenticateToken, async (req, res) => {
  try {
    const formData = req.body;
    
    if (!formData.id) {
      return res.status(400).json({ error: 'Vacancy ID is required for update' })
    }
    
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
           end_date = ${formData.endDate},
           updated_at = NOW()
       WHERE id = ${formData.id}
       RETURNING *`
    
    if (response.count === 0) {
      return res.status(404).json({ error: 'Vacancy not found' })
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
    
    logActivity(req.admin.admin_id, req.admin.username, 'UPDATED', 'VACANCY', formData.title)
    res.json(response[0])
  } catch (error) {
    console.error('Error updating vacancy:', error)
    res.status(500).json({ error: 'Failed to update vacancy' })
  }
})

// Delete vacancy
app.delete('/admin/vacancy/:id', authenticateToken, async (req, res) => {
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
app.get('/admin/applicants', authenticateToken, async (req, res) => {
    try {
        // Only allow admin or superadmin roles
        if (!req.admin || (req.admin.role !== 'admin' && req.admin.role !== 'superadmin')) {
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
app.get('/admin/applicants/:id', authenticateToken, async (req, res) => {
    try {
        if (!req.admin || (req.admin.role !== 'admin' && req.admin.role !== 'superadmin')) {
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
app.put('/admin/applicants/:id', authenticateToken, upload.single('cv'), async (req, res) => {
    try {
        if (!req.admin || (req.admin.role !== 'admin' && req.admin.role !== 'superadmin')) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { id } = req.params;
        const { first_name, last_name, email, phone } = req.body;
        let cvPath = null;

        if (req.file) {
            cvPath = `/uploads/${req.file.filename}`;
        }

        const result = await pool`
            UPDATE applicants 
               SET first_name = COALESCE(${first_name || null}, first_name),
                   last_name = COALESCE(${last_name || null}, last_name),
                   email = COALESCE(${email || null}, email),
                   phone = COALESCE(${phone || null}, phone),
                   status = COALESCE(${req.body.status || 'submitted'}, status),
                   vacancy_id = COALESCE(${req.body.vacancy_id || null}, vacancy_id),
                   cv_path = COALESCE(${cvPath || null}, cv_path),
                   updated_at = NOW()
               WHERE id = ${id}
               RETURNING *`

        if (result.length === 0) {
            return res.status(404).json({ error: 'Applicant not found' });
        }

        res.json(result[0]);
    } catch (error) {
        console.error('Error updating applicant:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get recent activities
app.get('/admin/activities', authenticateToken, async (req, res) => {
  try {
    const results = await pool`
      SELECT al.*, a.first_name, a.last_name 
      FROM activity_logs al 
      JOIN admins a ON al.admin_id = a.admin_id 
      ORDER BY al.created_at DESC 
      LIMIT 20
    `
    return res.json({ status: 'Success', activities: results })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'Error', message: 'Internal Server Error' })
  }
})

// Create activity_logs table if not exists


// Create activity_logs table if not exists
// Create activity_logs table if not exists
const createActivityLogsTable = async () => {
    try {
        await pool`
          CREATE TABLE IF NOT EXISTS activity_logs (
            id SERIAL PRIMARY KEY,
            admin_id TEXT NOT NULL,
            username VARCHAR(50),
            action VARCHAR(50) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_title VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
          )
        `
        console.log('activity_logs table checked/created')

        // Migration: Check if 'photo' column exists in 'admins' table
        try {
            await pool`ALTER TABLE admins ADD COLUMN IF NOT EXISTS photo TEXT`
            console.log('admins table photo column checked/added')
        } catch (alterError) {
            console.error('Error adding photo column to admins table:', alterError)
        }

    } catch (err) {
        console.error('Error creating activity_logs table:', err)
    }
}
createActivityLogsTable()

// Helper function to log activities
const logActivity = async (adminId, username, action, entityType, entityTitle) => {
  try {
      const result = await pool`INSERT INTO activity_logs (admin_id, username, action, entity_type, entity_title) 
                 VALUES (${adminId}, ${username}, ${action}, ${entityType}, ${entityTitle}) RETURNING *`
  } catch(err) {
      console.error('[logActivity] Error logging activity:', err)
  }
}


// Prepare SPA fallback - Catch all requests usually
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'))
})


app.listen(process.env.SERVER_PORT, () => console.log('listening...'))