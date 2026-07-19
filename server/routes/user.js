import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool   from '../con/db.js'
import { authenticateUser } from '../middleware/auth.js'

const router = Router()

// GET /api/user/me
router.get('/me', authenticateUser, (req, res) => {
  res.json(req.user)
})

// GET /api/user/dashboard
router.get('/dashboard', authenticateUser, async (req, res) => {
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
  } catch (err) {
    console.error('[user] Dashboard error:', err)
    res.status(500).json({ error: 'Failed to load dashboard' })
  }
})

// PATCH /api/user/profile
router.patch('/profile', authenticateUser, async (req, res) => {
  try {
    const { first_name, last_name, phone, currentPassword, newPassword } = req.body
    const userId = req.user.id

    if (newPassword) {
      const full  = await pool`SELECT password_hash FROM users WHERE id = ${userId}`
      const valid = await bcrypt.compare(currentPassword || '', full[0].password_hash)
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const newHash = newPassword ? await bcrypt.hash(newPassword, 10) : null

    const result = await pool`
      UPDATE users SET
        first_name    = COALESCE(${first_name  || null}, first_name),
        last_name     = COALESCE(${last_name   || null}, last_name),
        phone         = COALESCE(${phone       || null}, phone),
        password_hash = COALESCE(${newHash},             password_hash)
      WHERE id = ${userId}
      RETURNING id, first_name, last_name, email, phone, created_at`

    res.json(result[0])
  } catch (err) {
    console.error('[user] Profile update error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router
