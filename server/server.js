import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import path    from 'path'
import { fileURLToPath } from 'url'

import corsMiddleware from './middleware/cors.js'
import logger         from './middleware/logger.js'

import authRouter       from './routes/auth.js'
import userRouter       from './routes/user.js'
import adminRouter      from './routes/admin.js'
import superadminRouter from './routes/superadmin.js'
import newsRouter       from './routes/news.js'
import eventsRouter     from './routes/events.js'
import vacanciesRouter  from './routes/vacancies.js'
import complaintsRouter from './routes/complaints.js'
import contactsRouter   from './routes/contacts.js'
import { uploadBasePath } from './middleware/upload.js'

const app        = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const distPath   = path.join(__dirname, '..', 'client', 'dist')

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(express.json())
app.use(corsMiddleware)
app.use(logger)

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static(distPath))
app.use('/uploads', express.static(uploadBasePath))

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/auth',              authRouter)         // /auth/admin/login, /auth/user/login, etc.
app.use('/api/auth',          authRouter)         // /api/auth/verify-otp, /api/auth/resend-otp, etc.
app.use('/api/user',          userRouter)         // /api/user/me, /api/user/dashboard, etc.
app.use('/api/admin',         adminRouter)        // /api/admin/activities, settings, profile, etc.
app.use('/api/superadmin',    superadminRouter)   // /api/superadmin/admins, overview, etc.
app.use('/api/news',          newsRouter)         // /api/news (public) + /api/news/admin (protected)
app.use('/api/events',        eventsRouter)       // /api/events (public) + /api/events/admin (protected)
app.use('/api/vacancies',     vacanciesRouter)    // /api/vacancies (public) + /api/vacancies/admin, etc.
app.use('/api/complaints',    complaintsRouter)   // /api/complaints (public) + /api/complaints/admin, etc.
app.use('/api/complaint-types', complaintsRouter) // /api/complaint-types → complaints/types
app.use('/api/contacts',      contactsRouter)     // /api/contacts (public) + /api/contacts/admin, etc.
app.use('/api/service-satisfaction', contactsRouter) // /api/service-satisfaction

// ── SPA fallback — React Router handles all non-API routes ───────────────────
app.get('/{*path}', (req, res, next) => {
  if (
    req.path.startsWith('/api/') ||
    req.path.startsWith('/auth/') ||
    req.path.startsWith('/uploads/')
  ) return next()
  res.sendFile(path.join(distPath, 'index.html'))
})

// ── Start ─────────────────────────────────────────────────────────────────────
const port = process.env.APP_PORT || process.env.PORT || process.env.SERVER_PORT || 3000

console.log(`[server] NODE_ENV     : ${process.env.NODE_ENV || 'development'}`)
console.log(`[server] DATABASE_URL : ${process.env.DATABASE_URL ? '✓' : '✗ MISSING'}`)
console.log(`[server] JWT_SECRET   : ${process.env.JWT_SECRET  ? '✓' : '✗ MISSING'}`)
console.log(`[server] SUPABASE_KEY : ${process.env.SUPABASE_ANON_KEY ? '✓' : '✗ MISSING'}`)

app.listen(port, '0.0.0.0', () => {
  console.log(`[server] ✓ Listening on 0.0.0.0:${port}`)
})
