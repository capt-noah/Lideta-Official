import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt    from 'jsonwebtoken'
import pool   from '../con/db.js'
import { sendOTPEmail, verifyOTPEmail } from '../utils/mailer.js'
import { authenticateUser }             from '../middleware/auth.js'
import { isRateLimited }                from '../utils/rateLimit.js'

const router = Router()

// ── Admin login step 1: verify credentials → send OTP ────────────────────────
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password required' })

    const result = await pool`SELECT * FROM admins WHERE username = ${username}`
    if (result.length === 0)
      return res.status(401).json({ error: 'Invalid username or password' })

    const admin = result[0]
    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid)
      return res.status(401).json({ error: 'Invalid username or password' })
    if (!admin.email)
      return res.status(400).json({ error: 'No email on this account. Contact superadmin.' })

    if (isRateLimited(`otp:${admin.email}`))
      return res.status(429).json({ error: 'Too many requests. Try again in 10 minutes.' })

    const { success, error } = await sendOTPEmail({ to: admin.email, purpose: '2fa_login' })
    if (!success)
      return res.status(500).json({ error: `Failed to send verification code: ${error}` })

    const maskedEmail = admin.email.replace(/(.{1}).+(@.+)/, '$1***$2')
    res.json({ requires2FA: true, maskedEmail, entityType: 'admin' })
  } catch (err) {
    console.error('[auth] Admin login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// ── Admin email lookup (used by 2FA OTP verify step) ─────────────────────────
router.post('/admin/email-lookup', async (req, res) => {
  try {
    const { username } = req.body
    if (!username) return res.status(400).json({ error: 'Username required' })

    const result = await pool`SELECT email FROM admins WHERE username = ${username}`
    if (result.length === 0) return res.status(404).json({ error: 'Not found' })

    res.json({ email: result[0].email })
  } catch {
    res.status(500).json({ error: 'Lookup failed' })
  }
})

// ── User login step 1: verify credentials → send OTP ─────────────────────────
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' })

    const result = await pool`SELECT * FROM users WHERE email = ${email}`
    if (result.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' })

    const user  = result[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' })

    if (isRateLimited(`otp:${email}`))
      return res.status(429).json({ error: 'Too many requests. Try again in 10 minutes.' })

    const { success, error } = await sendOTPEmail({ to: email, purpose: '2fa_login' })
    if (!success)
      return res.status(500).json({ error: `Failed to send verification code: ${error}` })

    const maskedEmail = email.replace(/(.{1}).+(@.+)/, '$1***$2')
    res.json({ requires2FA: true, maskedEmail, entityType: 'user' })
  } catch (err) {
    console.error('[auth] User login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// ── User register ─────────────────────────────────────────────────────────────
router.post('/user/register', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body
    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ error: 'First name, last name, email and password are required' })

    const existing = await pool`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0)
      return res.status(400).json({ error: 'An account with this email already exists' })

    const password_hash = await bcrypt.hash(password, 10)
    const result = await pool`
      INSERT INTO users (first_name, last_name, email, phone, password_hash, email_verified)
      VALUES (${first_name}, ${last_name}, ${email}, ${phone || null}, ${password_hash}, FALSE)
      RETURNING id, first_name, last_name, email, phone, email_verified, two_fa_enabled, created_at`

    const user  = result[0]
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' })

    await sendOTPEmail({ to: email, purpose: 'verify_email' })

    res.status(201).json({ user, token, requiresVerification: true })
  } catch (err) {
    console.error('[auth] Register error:', err)
    res.status(500).json({ error: 'Failed to create account' })
  }
})

// ── Step 2: verify OTP → issue JWT ───────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, entityType } = req.body
    if (!email || !otp || !entityType)
      return res.status(400).json({ error: 'Missing fields' })

    const { success, error } = await verifyOTPEmail({ email, token: otp })
    if (!success)
      return res.status(401).json({ error: error || 'Invalid or expired code' })

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
    console.error('[auth] OTP verify error:', err)
    res.status(500).json({ error: 'Verification failed' })
  }
})

// ── Resend OTP ────────────────────────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, purpose = '2fa_login' } = req.body
    if (!email) return res.status(400).json({ error: 'Missing email' })

    if (isRateLimited(`resend:${email}`))
      return res.status(429).json({ error: 'Too many requests. Try again in 10 minutes.' })

    const { success, error } = await sendOTPEmail({ to: email, purpose })
    if (!success)
      return res.status(500).json({ error: `Failed to resend: ${error}` })

    res.json({ success: true })
  } catch (err) {
    console.error('[auth] Resend OTP error:', err)
    res.status(500).json({ error: 'Failed to resend code' })
  }
})

// ── Send email verification OTP (post-register) ───────────────────────────────
router.post('/send-verification', authenticateUser, async (req, res) => {
  try {
    const { email } = req.user
    if (isRateLimited(`verify:${email}`))
      return res.status(429).json({ error: 'Too many requests. Try again in 10 minutes.' })

    const { success, error } = await sendOTPEmail({ to: email, purpose: 'verify_email' })
    if (!success)
      return res.status(500).json({ error: `Failed to send: ${error}` })

    res.json({ success: true })
  } catch (err) {
    console.error('[auth] Send verification error:', err)
    res.status(500).json({ error: 'Failed to send verification code' })
  }
})

// ── Verify email OTP ──────────────────────────────────────────────────────────
router.post('/verify-email', authenticateUser, async (req, res) => {
  try {
    const { otp }  = req.body
    const { email } = req.user

    const { success, error } = await verifyOTPEmail({ email, token: otp })
    if (!success)
      return res.status(401).json({ error: error || 'Invalid or expired code' })

    await pool`UPDATE users SET email_verified = TRUE WHERE id = ${req.user.id}`
    const updated = await pool`
      SELECT id, first_name, last_name, email, phone, email_verified, two_fa_enabled, created_at
      FROM users WHERE id = ${req.user.id}`

    res.json(updated[0])
  } catch (err) {
    console.error('[auth] Verify email error:', err)
    res.status(500).json({ error: 'Verification failed' })
  }
})

// ── Forgot password ───────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, entityType = 'user' } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })

    const table  = entityType === 'admin' ? 'admins' : 'users'
    const idCol  = entityType === 'admin' ? 'admin_id' : 'id'
    const exists = entityType === 'admin'
      ? (await pool`SELECT admin_id FROM admins WHERE email = ${email}`).length > 0
      : (await pool`SELECT id FROM users WHERE email = ${email}`).length > 0

    if (exists) {
      if (isRateLimited(`reset:${email}`))
        return res.status(429).json({ error: 'Too many requests. Try again in 10 minutes.' })
      await sendOTPEmail({ to: email, purpose: 'reset_password' })
    }

    res.json({ success: true }) // always 200 — prevents email enumeration
  } catch (err) {
    console.error('[auth] Forgot password error:', err)
    res.status(500).json({ error: 'Failed to send reset code' })
  }
})

// ── Reset password ────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword, entityType = 'user' } = req.body
    if (!email || !otp || !newPassword)
      return res.status(400).json({ error: 'Missing fields' })

    const { success, error } = await verifyOTPEmail({ email, token: otp })
    if (!success)
      return res.status(401).json({ error: error || 'Invalid or expired code' })

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
    console.error('[auth] Reset password error:', err)
    res.status(500).json({ error: 'Password reset failed' })
  }
})

export default router
