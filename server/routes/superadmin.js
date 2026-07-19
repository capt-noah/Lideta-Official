import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool   from '../con/db.js'
import { authenticateToken } from '../middleware/auth.js'
import { logActivity }       from '../utils/logActivity.js'

const router = Router()

const VALID_ROLES = ['admin','complaint_admin','event_admin','news_admin','vacancy_admin','superadmin']

function isSuperadmin(req, res) {
  if (!req.admin || req.admin.role !== 'superadmin') {
    res.status(403).json({ error: 'Forbidden' })
    return false
  }
  return true
}

// ── Admin accounts ────────────────────────────────────────────────────────────

router.get('/admins', authenticateToken, async (req, res) => {
  if (!isSuperadmin(req, res)) return
  try {
    const rows = await pool`
      SELECT admin_id, first_name, last_name, username, email, phone_number, gender, residency, role, created_at
      FROM admins ORDER BY created_at DESC`
    res.json(rows)
  } catch (err) {
    console.error('[superadmin] Fetch admins error:', err)
    res.status(500).json({ error: 'Failed to fetch admin accounts' })
  }
})

router.post('/create-admin', authenticateToken, async (req, res) => {
  if (!isSuperadmin(req, res)) return
  try {
    const { first_name, last_name, username, password, email, phone_number, residency, gender, role = 'admin' } = req.body

    if (!first_name || !last_name || !username || !password || !email || !phone_number)
      return res.status(400).json({ error: 'Missing required fields' })

    if (!VALID_ROLES.includes(role))
      return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` })

    const dupe = await pool`SELECT 1 FROM admins WHERE username = ${username} OR phone_number = ${phone_number} OR email = ${email}`
    if (dupe.length > 0) return res.status(400).json({ error: 'Username, phone or email already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const result = await pool`
      INSERT INTO admins (first_name, last_name, username, password_hash, email, phone_number, gender, residency, role)
      VALUES (${first_name}, ${last_name}, ${username}, ${hashed}, ${email}, ${phone_number}, ${gender}, ${residency}, ${role})
      RETURNING admin_id, first_name, last_name, username, email, phone_number, gender, residency, role`

    res.status(201).json(result[0])
  } catch (err) {
    console.error('[superadmin] Create admin error:', err)
    res.status(500).json({ error: 'Failed to create admin' })
  }
})

router.post('/update-admin/:id', authenticateToken, async (req, res) => {
  if (!isSuperadmin(req, res)) return
  try {
    const { id } = req.params
    const { first_name, last_name, username, email, phone_number, residency, gender, role } = req.body

    if (role && !VALID_ROLES.includes(role))
      return res.status(400).json({ error: `Invalid role` })

    if (username) {
      const dupe = await pool`SELECT 1 FROM admins WHERE username = ${username} AND admin_id != ${id}`
      if (dupe.length > 0) return res.status(400).json({ error: 'Username already exists' })
    }

    const result = await pool`
      UPDATE admins SET
        first_name   = COALESCE(${first_name   || null}, first_name),
        last_name    = COALESCE(${last_name    || null}, last_name),
        username     = COALESCE(${username     || null}, username),
        email        = COALESCE(${email        || null}, email),
        phone_number = COALESCE(${phone_number || null}, phone_number),
        residency    = COALESCE(${residency    || null}, residency),
        gender       = COALESCE(${gender       || null}, gender),
        role         = COALESCE(${role         || null}, role)
      WHERE admin_id = ${id}
      RETURNING admin_id, first_name, last_name, username, email, phone_number, gender, residency, role`

    if (result.count === 0) return res.status(404).json({ error: 'Admin not found' })
    res.json(result[0])
  } catch (err) {
    console.error('[superadmin] Update admin error:', err)
    res.status(500).json({ error: 'Failed to update admin' })
  }
})

router.delete('/delete-admin/:id', authenticateToken, async (req, res) => {
  if (!isSuperadmin(req, res)) return
  try {
    const { id } = req.params
    if (parseInt(id) === req.admin.admin_id)
      return res.status(400).json({ error: 'You cannot delete your own account' })

    const found = await pool`SELECT username FROM admins WHERE admin_id = ${id}`
    if (found.length === 0) return res.status(404).json({ error: 'Admin not found' })

    await pool`DELETE FROM admins WHERE admin_id = ${id}`
    logActivity(req.admin.admin_id, req.admin.username, 'DELETED', 'ADMIN', found[0].username)
    res.json({ message: 'Admin deleted successfully' })
  } catch (err) {
    console.error('[superadmin] Delete admin error:', err)
    res.status(500).json({ error: 'Failed to delete admin' })
  }
})

// ── Stats ─────────────────────────────────────────────────────────────────────

router.get('/overview', authenticateToken, async (req, res) => {
  if (!isSuperadmin(req, res)) return
  try {
    const [total, resolved, pending, active] = await Promise.all([
      pool`SELECT COUNT(*) FROM complaints`,
      pool`SELECT COUNT(*) FROM complaints WHERE status = 'resolved'`,
      pool`SELECT COUNT(*) FROM applicants WHERE status IN ('submitted','reviewing')`,
      pool`SELECT COUNT(*) FROM events WHERE status = 'upcoming'`,
    ])
    res.json({
      totalComplaints:     parseInt(total[0].count),
      resolvedComplaints:  parseInt(resolved[0].count),
      pendingApplications: parseInt(pending[0].count),
      activeEvents:        parseInt(active[0].count),
    })
  } catch (err) {
    console.error('[superadmin] Overview error:', err)
    res.status(500).json({ error: 'Failed to fetch overview stats' })
  }
})

router.get('/vacancy-applications', authenticateToken, async (req, res) => {
  if (!isSuperadmin(req, res)) return
  try {
    const [applications, count, stats] = await Promise.all([
      pool`
        SELECT a.id, a.first_name, a.last_name, a.status,
               CONCAT(a.first_name,' ',a.last_name) AS full_name,
               a.created_at, TO_CHAR(a.created_at,'DD - MM - YYYY') AS applied_date,
               v.category, v.salary
        FROM applicants a INNER JOIN vacancies v ON v.id = a.vacancy_id
        ORDER BY a.created_at DESC`,
      pool`SELECT COUNT(*) AS total FROM applicants`,
      pool`SELECT v.category, COUNT(a.id) AS count FROM applicants a INNER JOIN vacancies v ON a.vacancy_id = v.id GROUP BY v.category`,
    ])
    res.json({ vacants: applications, counts: count[0], stats })
  } catch (err) {
    console.error('[superadmin] Vacancy applications error:', err)
    res.status(500).json({ error: 'Failed to fetch vacancy applications' })
  }
})

export default router
