import jwt  from 'jsonwebtoken'
import pool from '../con/db.js'

// ── Admin JWT middleware ──────────────────────────────────────────────────────
export async function authenticateToken(req, res, next) {
  const header = req.headers['authorization'] || req.headers['Authorization']
  const token  = header && header.split(' ')[1]

  if (!token || token === 'null' || token === 'undefined') {
    console.warn(`[auth] No/invalid token — ${req.method} ${req.originalUrl}`)
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded  = jwt.verify(token, process.env.JWT_SECRET)
    const response = await pool`SELECT * FROM admins WHERE admin_id = ${decoded.id}`

    if (!response[0]) {
      console.warn(`[auth] Admin not found for id: ${decoded.id}`)
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.admin = response[0]
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.warn('[auth] Admin token expired')
      return res.status(401).json({ error: 'Token expired' })
    }
    console.warn('[auth] Admin token invalid:', err.message)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// ── User JWT middleware ───────────────────────────────────────────────────────
export async function authenticateUser(req, res, next) {
  const header = req.headers['authorization'] || req.headers['Authorization']
  const token  = header && header.split(' ')[1]

  if (!token) return res.status(401).json({ error: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const result  = await pool`
      SELECT id, first_name, last_name, email, phone
      FROM users WHERE id = ${decoded.userId}`

    if (result.length === 0) return res.status(401).json({ error: 'User not found' })

    req.user = result[0]
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
