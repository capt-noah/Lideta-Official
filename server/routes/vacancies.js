import { Router } from 'express'
import path   from 'path'
import fs     from 'fs'
import pool   from '../con/db.js'
import { authenticateToken } from '../middleware/auth.js'
import { upload, uploadBasePath } from '../middleware/upload.js'
import { logActivity }       from '../utils/logActivity.js'

const router = Router()

// ── Public ────────────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const rows = await pool`
      SELECT v.*, vt.amh, vt.orm,
             TO_CHAR(v.created_at, 'Mon DD, YYYY') AS formatted_date
      FROM vacancies v
      LEFT JOIN vacancy_translation vt ON v.id = vt.vacancy_id
      ORDER BY v.created_at DESC`
    res.json(rows)
  } catch (err) {
    console.error('[vacancies] Fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch vacancies' })
  }
})

// Upload CV (temp, renamed after applicant insert)
router.post('/upload-cv', upload.single('cv'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No CV file uploaded' })

    const cvsDir = path.join(uploadBasePath, 'cvs')
    if (!fs.existsSync(cvsDir)) fs.mkdirSync(cvsDir, { recursive: true })

    const newPath = path.join(cvsDir, path.basename(req.file.path))
    fs.renameSync(req.file.path, newPath)

    res.json({ path: `/uploads/cvs/${path.basename(newPath)}` })
  } catch (err) {
    console.error('[vacancies] CV upload error:', err)
    res.status(500).json({ error: 'Failed to upload CV' })
  }
})

// Submit application
router.post('/applicants', async (req, res) => {
  try {
    const { vacancy_id, full_name, email, phone, cv_path, user_id } = req.body

    if (!vacancy_id || vacancy_id === 'undefined' || !full_name || !email || !phone)
      return res.status(400).json({ error: 'vacancy_id, full_name, email and phone are required' })

    const parts      = String(full_name).trim().split(/\s+/)
    const first_name = parts.shift()
    const last_name  = parts.join(' ') || ''

    const result = await pool`
      INSERT INTO applicants (vacancy_id, first_name, last_name, email, phone, user_id)
      VALUES (${vacancy_id}, ${first_name}, ${last_name}, ${email}, ${phone}, ${user_id || null})
      RETURNING id, vacancy_id, first_name, last_name, email, phone`

    const applicant   = result[0]
    const applicantId = applicant.id

    if (cv_path) {
      try {
        const cvsDir      = path.join(uploadBasePath, 'cvs')
        const fileName    = path.basename(cv_path)
        const ext         = path.extname(fileName)
        const oldFilePath = path.join(cvsDir, fileName)
        const newFileName = `${applicantId}${ext}`
        const newFilePath = path.join(cvsDir, newFileName)

        if (fs.existsSync(oldFilePath)) {
          fs.renameSync(oldFilePath, newFilePath)
          const finalCvPath = `/uploads/cvs/${newFileName}`
          await pool`UPDATE applicants SET cv_path = ${finalCvPath} WHERE id = ${applicantId}`
          applicant.cv_path = finalCvPath
        }
      } catch (renameErr) {
        console.error('[vacancies] CV rename error:', renameErr)
      }
    }

    res.status(201).json({ ...applicant, ref: `APP-${String(applicantId).padStart(5, '0')}` })
  } catch (err) {
    console.error('[vacancies] Apply error:', err)
    res.status(500).json({ error: 'Failed to submit application' })
  }
})

// ── Admin ─────────────────────────────────────────────────────────────────────

router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const rows = await pool`
      SELECT v.*, vt.amh, vt.orm,
             TO_CHAR(v.created_at, 'DD - MM - YYYY') AS formatted_date
      FROM vacancies v
      LEFT JOIN vacancy_translation vt ON v.id = vt.vacancy_id
      ORDER BY v.created_at DESC`
    res.json(rows)
  } catch (err) {
    console.error('[vacancies] Admin fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch vacancies' })
  }
})

router.post('/admin', authenticateToken, async (req, res) => {
  try {
    const f = req.body
    const toArr = v => Array.isArray(v) ? v : (v ? [v] : [])

    const result = await pool`
      INSERT INTO vacancies
        (title, short_description, description, location, salary, type, category,
         skills, responsibilities, qualifications, start_date, end_date)
      VALUES
        (${f.title}, ${f.shortDescription}, ${f.description}, ${f.location},
         ${f.salary}, ${f.type}, ${f.category},
         ${toArr(f.skills)}, ${toArr(f.responsibilities)}, ${toArr(f.qualifications)},
         ${f.startDate}, ${f.endDate})
      RETURNING *`

    const vacancyId = result[0].id

    if (f.amh || f.orm) {
      const existing = await pool`SELECT 1 FROM vacancy_translation WHERE vacancy_id = ${vacancyId}`
      if (existing.length > 0) {
        await pool`UPDATE vacancy_translation SET amh = ${f.amh || {}}::jsonb, orm = ${f.orm || {}}::jsonb WHERE vacancy_id = ${vacancyId}`
      } else {
        await pool`INSERT INTO vacancy_translation (vacancy_id, amh, orm) VALUES (${vacancyId}, ${f.amh || {}}::jsonb, ${f.orm || {}}::jsonb)`
      }
    }

    logActivity(req.admin.admin_id, req.admin.username, 'CREATED', 'VACANCY', f.title)
    res.status(201).json(result[0])
  } catch (err) {
    console.error('[vacancies] Create error:', err)
    res.status(500).json({ error: 'Failed to create vacancy' })
  }
})

router.put('/admin', authenticateToken, async (req, res) => {
  try {
    const f = req.body
    if (!f.id) return res.status(400).json({ error: 'Vacancy ID required' })

    const toArr = v => Array.isArray(v) ? v : (v ? [v] : [])
    const oldResult = await pool`SELECT * FROM vacancies WHERE id = ${f.id}`
    const old = oldResult[0]

    const result = await pool`
      UPDATE vacancies
      SET title             = ${f.title},
          short_description = ${f.shortDescription},
          description       = ${f.description},
          location          = ${f.location},
          salary            = ${f.salary},
          type              = ${f.type},
          category          = ${f.category},
          skills            = ${toArr(f.skills)},
          responsibilities  = ${toArr(f.responsibilities)},
          qualifications    = ${toArr(f.qualifications)},
          start_date        = ${f.startDate},
          end_date          = ${f.endDate}
      WHERE id = ${f.id}
      RETURNING *`

    if (result.count === 0) return res.status(404).json({ error: 'Vacancy not found' })

    const fields  = { title:'Title', location:'Location', salary:'Salary', type:'Type', category:'Category' }
    const details = {}
    for (const [col, label] of Object.entries(fields)) {
      const nv = f[col], ov = old?.[col] instanceof Date ? old[col].toISOString().split('T')[0] : old?.[col]
      if (nv !== undefined && String(nv).trim() !== String(ov || '').trim()) {
        details[label] = { old: ov || '(empty)', new: nv }
      }
    }

    if (f.amh || f.orm) {
      const existing = await pool`SELECT 1 FROM vacancy_translation WHERE vacancy_id = ${f.id}`
      if (existing.length > 0) {
        await pool`UPDATE vacancy_translation SET amh = ${f.amh || {}}::jsonb, orm = ${f.orm || {}}::jsonb WHERE vacancy_id = ${f.id}`
      } else {
        await pool`INSERT INTO vacancy_translation (vacancy_id, amh, orm) VALUES (${f.id}, ${f.amh || {}}::jsonb, ${f.orm || {}}::jsonb)`
      }
    }

    logActivity(req.admin.admin_id, req.admin.username, 'UPDATED', 'VACANCY', f.title, Object.keys(details).length ? details : null)
    res.json(result[0])
  } catch (err) {
    console.error('[vacancies] Update error:', err)
    res.status(500).json({ error: 'Failed to update vacancy' })
  }
})

router.delete('/admin/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const found = await pool`SELECT title FROM vacancies WHERE id = ${id}`
    if (found.length === 0) return res.status(404).json({ error: 'Vacancy not found' })

    await pool`DELETE FROM vacancy_translation WHERE vacancy_id = ${id}`
    await pool`DELETE FROM vacancies WHERE id = ${id}`

    logActivity(req.admin.admin_id, req.admin.username, 'DELETED', 'VACANCY', found[0].title)
    res.json({ message: 'Vacancy deleted successfully' })
  } catch (err) {
    console.error('[vacancies] Delete error:', err)
    res.status(500).json({ error: 'Failed to delete vacancy' })
  }
})

// Applicants (admin)
router.get('/applicants/admin', authenticateToken, async (req, res) => {
  try {
    const allowed = ['admin', 'superadmin', 'vacancy_admin']
    if (!allowed.includes(req.admin.role))
      return res.status(403).json({ error: 'Forbidden' })

    const rows = await pool`
      SELECT a.id, a.first_name, a.last_name,
             CONCAT(a.first_name, ' ', a.last_name) AS full_name,
             a.email, a.phone, a.status, a.cv_path, a.created_at,
             TO_CHAR(a.created_at, 'DD - MM - YYYY') AS applied_date,
             v.title AS vacancy_title, v.category, v.salary
      FROM applicants a
      LEFT JOIN vacancies v ON a.vacancy_id = v.id
      ORDER BY a.created_at DESC`

    res.json(rows)
  } catch (err) {
    console.error('[vacancies] Applicants fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch applicants' })
  }
})

router.get('/applicants/admin/:id', authenticateToken, async (req, res) => {
  try {
    const allowed = ['admin', 'superadmin', 'vacancy_admin']
    if (!allowed.includes(req.admin.role))
      return res.status(403).json({ error: 'Forbidden' })

    const row = await pool`
      SELECT a.*, v.title AS vacancy_title
      FROM applicants a
      LEFT JOIN vacancies v ON a.vacancy_id = v.id
      WHERE a.id = ${req.params.id}`

    if (row.length === 0) return res.status(404).json({ error: 'Applicant not found' })
    res.json(row[0])
  } catch (err) {
    console.error('[vacancies] Applicant fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch applicant' })
  }
})

router.put('/applicants/admin/:id', authenticateToken, upload.single('cv'), async (req, res) => {
  try {
    const allowed = ['admin', 'superadmin', 'vacancy_admin']
    if (!allowed.includes(req.admin.role))
      return res.status(403).json({ error: 'Forbidden' })

    const { id } = req.params
    const { first_name, last_name, email, phone } = req.body
    const cvPath = req.file ? `/uploads/${req.file.filename}` : null

    const vid = req.body.vacancy_id && req.body.vacancy_id !== 'null'
      ? (parseInt(req.body.vacancy_id) || null) : null

    const result = await pool`
      UPDATE applicants
      SET first_name  = ${first_name  || null},
          last_name   = ${last_name   || null},
          email       = ${email       || null},
          phone       = ${phone       || null},
          status      = ${req.body.status || 'submitted'},
          vacancy_id  = COALESCE(${vid}, vacancy_id),
          cv_path     = COALESCE(${cvPath}, cv_path)
      WHERE id = ${parseInt(id)}
      RETURNING *`

    if (result.length === 0) return res.status(404).json({ error: 'Applicant not found' })
    res.json(result[0])
  } catch (err) {
    console.error('[vacancies] Applicant update error:', err)
    res.status(500).json({ error: 'Failed to update applicant' })
  }
})

export default router
