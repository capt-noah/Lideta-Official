import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool   from '../con/db.js'
import { authenticateToken } from '../middleware/auth.js'
import { upload }            from '../middleware/upload.js'
import { logActivity }       from '../utils/logActivity.js'

const router = Router()

const VALID_ROLES = ['admin','complaint_admin','event_admin','news_admin','vacancy_admin','superadmin']

// ── Profile picture ───────────────────────────────────────────────────────────

router.post('/update/profile-picture', authenticateToken, upload.single('profile_picture'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' })

    const relativePath = `/uploads/admin_profiles/${req.file.filename}`
    const result = await pool`UPDATE admins SET photo = ${relativePath} WHERE admin_id = ${req.admin.admin_id} RETURNING *`
    if (result.length === 0) return res.status(404).json({ error: 'Admin not found' })

    const { password_hash, ...safe } = result[0]
    logActivity(req.admin.admin_id, req.admin.username, 'UPDATED', 'PROFILE', 'Profile Picture')
    res.json(safe)
  } catch (err) {
    console.error('[admin] Profile picture update error:', err)
    res.status(500).json({ error: 'Failed to update profile picture' })
  }
})

router.delete('/delete/profile-picture', authenticateToken, async (req, res) => {
  try {
    const result = await pool`UPDATE admins SET photo = NULL WHERE admin_id = ${req.admin.admin_id} RETURNING *`
    if (result.length === 0) return res.status(404).json({ error: 'Admin not found' })

    const { password_hash, ...safe } = result[0]
    logActivity(req.admin.admin_id, req.admin.username, 'DELETED', 'PROFILE', 'Profile Picture')
    res.json(safe)
  } catch (err) {
    console.error('[admin] Delete profile picture error:', err)
    res.status(500).json({ error: 'Failed to delete profile picture' })
  }
})

// ── Activities ────────────────────────────────────────────────────────────────

router.get('/activities', authenticateToken, async (req, res) => {
  try {
    const rows = await pool`
      SELECT al.*, COALESCE(al.username, a.username) AS username
      FROM activity_logs al
      LEFT JOIN admins a ON al.admin_id = a.admin_id
      ORDER BY al.created_at DESC LIMIT 20`

    res.json({
      status: 'Success',
      activities: rows.map(r => ({
        id: r.id, admin_id: r.admin_id, username: r.username || 'Unknown',
        action: r.action, entity_type: r.entity_type, entity_title: r.entity_title,
        details: r.details, created_at: r.created_at,
      }))
    })
  } catch (err) {
    console.error('[admin] Activities error:', err)
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})

// ── Profile / account / password / settings ───────────────────────────────────

router.post('/update/profile', authenticateToken, async (req, res) => {
  try {
    const f = req.body
    const result = await pool`
      UPDATE admins SET
        first_name   = ${f.first_name}, last_name  = ${f.last_name},
        gender       = ${f.gender},     residency  = ${f.residency},
        phone_number = ${f.phone_number}, email    = ${f.email}
      WHERE admin_id = ${req.admin.admin_id} RETURNING *`
    if (result.count === 0) return res.status(404).json({ error: 'Admin not found' })
    res.json(result[0])
  } catch (err) {
    console.error('[admin] Update profile error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

router.post('/update/admin-info', authenticateToken, async (req, res) => {
  try {
    const f       = req.body
    const adminId = req.admin.admin_id

    if (f.username && f.username !== req.admin.username) {
      const dupe = await pool`SELECT 1 FROM admins WHERE username = ${f.username} AND admin_id != ${adminId}`
      if (dupe.length > 0) return res.status(400).json({ error: 'Username already exists' })
    }

    if (f.role && !VALID_ROLES.includes(f.role))
      return res.status(400).json({ error: `Invalid role` })

    const newRole = req.admin.role === 'superadmin' ? (f.role || req.admin.role) : req.admin.role

    const result = await pool`
      UPDATE admins SET username = ${f.username || req.admin.username}, role = ${newRole}
      WHERE admin_id = ${adminId} RETURNING *`

    if (result.count === 0) return res.status(404).json({ error: 'Admin not found' })
    res.json(result[0])
  } catch (err) {
    console.error('[admin] Update admin-info error:', err)
    res.status(500).json({ error: 'Failed to update admin information' })
  }
})

router.post('/update/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Current and new password required' })

    const admin = await pool`SELECT * FROM admins WHERE admin_id = ${req.admin.admin_id}`
    if (admin.length === 0) return res.status(404).json({ error: 'Admin not found' })

    const valid = await bcrypt.compare(currentPassword, admin[0].password_hash)
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })

    const hashed = await bcrypt.hash(newPassword, 10)
    await pool`UPDATE admins SET password_hash = ${hashed} WHERE admin_id = ${req.admin.admin_id}`
    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error('[admin] Update password error:', err)
    res.status(500).json({ error: 'Failed to update password' })
  }
})

router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const adminId = req.admin.admin_id
    let rows = await pool`SELECT * FROM admin_settings WHERE admin_id = ${adminId}`
    if (rows.length === 0) {
      await pool`INSERT INTO admin_settings (admin_id) VALUES (${adminId})`
      rows = await pool`SELECT * FROM admin_settings WHERE admin_id = ${adminId}`
    }
    res.json(rows[0])
  } catch (err) {
    console.error('[admin] Settings fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

router.post('/update/settings', authenticateToken, async (req, res) => {
  try {
    const { theme, font_size, language } = req.body
    const adminId = req.admin.admin_id
    const existing = await pool`SELECT * FROM admin_settings WHERE admin_id = ${adminId}`

    let result
    if (existing.length === 0) {
      result = await pool`
        INSERT INTO admin_settings (admin_id, theme, font_size, language)
        VALUES (${adminId}, ${theme||'light'}, ${font_size||'medium'}, ${language||'english'}) RETURNING *`
    } else {
      result = await pool`
        UPDATE admin_settings
        SET theme = ${theme||existing[0].theme}, font_size = ${font_size||existing[0].font_size}, language = ${language||existing[0].language}
        WHERE admin_id = ${adminId} RETURNING *`
    }
    res.json(result[0])
  } catch (err) {
    console.error('[admin] Settings update error:', err)
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

// ── File upload (generic) ─────────────────────────────────────────────────────

router.post('/upload', upload.any(), (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'No file uploaded' })
    const file = req.files[0]
    const dirMap = { profile_picture:'admin_profiles/', video:'videos/', audio:'audios/', photo:'photos/', image:'photos/' }
    const dir  = dirMap[file.fieldname] || ''
    res.json({ name: file.originalname, path: `/uploads/${dir}${file.filename}`, size: file.size, mimetype: file.mimetype })
  } catch (err) {
    console.error('[admin] Upload error:', err)
    res.status(500).json({ error: 'Failed to upload file' })
  }
})

export default router
