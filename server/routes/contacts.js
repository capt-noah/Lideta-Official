import { Router } from 'express'
import pool   from '../con/db.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// ── Public: submit contact form ───────────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const d         = req.body
    const photoData = Array.isArray(d.photos) ? d.photos : (d.photos ? [d.photos] : [])

    await pool`
      INSERT INTO contacts (first_name, last_name, email, message, photos)
      VALUES (${d.first_name}, ${d.last_name}, ${d.email}, ${d.description}, ${JSON.stringify(photoData)}::JSONB)`

    res.status(201).json({ message: 'Message sent successfully' })
  } catch (err) {
    console.error('[contacts] Submit error:', err)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// ── Public: submit satisfaction survey ───────────────────────────────────────

router.post('/satisfaction', async (req, res) => {
  try {
    const d = req.body
    if (!d.gender || !d.age || !d.district || !d.q1)
      return res.status(400).json({ error: 'Missing required satisfaction fields' })

    const visits           = d.visits ? parseInt(d.visits, 10) : null
    const serviceRequested = Array.isArray(d.service_requested) ? d.service_requested : (d.service_requested ? [d.service_requested] : [])

    await pool`
      INSERT INTO service_satisfaction (
        gender, age, marital_status, education_level, employment_status,
        district, visits, service_requested,
        q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, additional_comments
      ) VALUES (
        ${d.gender}, ${d.age}, ${d.marital_status || null}, ${d.education_level || null}, ${d.employment_status || null},
        ${d.district}, ${visits}, ${serviceRequested},
        ${d.q1||null}, ${d.q2||null}, ${d.q3||null}, ${d.q4||null}, ${d.q5||null}, ${d.q6||null},
        ${d.q7||null}, ${d.q8||null}, ${d.q9||null}, ${d.q10||null}, ${d.q11||null},
        ${d.additional_comments || null}
      )`

    res.status(201).json({ message: 'Satisfaction submitted successfully' })
  } catch (err) {
    console.error('[contacts] Satisfaction error:', err)
    res.status(500).json({ error: 'Failed to submit satisfaction survey' })
  }
})

// ── Admin ─────────────────────────────────────────────────────────────────────

router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const rows = await pool`SELECT * FROM contacts WHERE status = 'pending' ORDER BY created_at DESC`
    res.json(rows)
  } catch (err) {
    console.error('[contacts] Admin fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch contacts' })
  }
})

router.put('/admin/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const result = await pool`
      UPDATE contacts SET status = 'resolved' WHERE id = ${req.params.id} RETURNING *`
    if (result.length === 0) return res.status(404).json({ error: 'Contact not found' })
    res.json(result[0])
  } catch (err) {
    console.error('[contacts] Resolve error:', err)
    res.status(500).json({ error: 'Failed to resolve contact' })
  }
})

// ── Admin: satisfaction stats ─────────────────────────────────────────────────

router.get('/satisfaction/stats', authenticateToken, async (req, res) => {
  try {
    const rows = await pool`
      SELECT id, created_at, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11
      FROM service_satisfaction
      WHERE created_at >= NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC`

    const toScore = v => ({ very_high:5, high:4, medium:3, low:2, very_low:1 }[v] ?? null)
    const keys    = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10','q11']
    const agg     = Object.fromEntries(keys.map(k => [k, { total: 0, count: 0 }]))
    const daily   = {}

    rows.forEach(row => {
      const day = (row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)).slice(0, 10)
      if (!daily[day]) daily[day] = { total: 0, count: 0 }

      keys.forEach(k => {
        const s = toScore(row[k])
        if (s != null) {
          agg[k].total += s; agg[k].count += 1
          daily[day].total += s; daily[day].count += 1
        }
      })
    })

    const averages = keys.map((k, i) => ({
      questionKey: k, questionLabel: `Q${i + 1}`,
      averageScore: agg[k].count ? Number((agg[k].total / agg[k].count).toFixed(2)) : 0,
      responses: agg[k].count,
    }))

    const dailyArr = Object.entries(daily).sort(([a],[b]) => a < b ? -1 : 1).map(([date, v]) => ({
      date,
      averageScore: v.count ? Number((v.total / v.count).toFixed(2)) : 0,
      responses: v.count,
    }))

    res.set('Cache-Control', 'no-store').json({ totalResponses: rows.length, averages, daily: dailyArr })
  } catch (err) {
    console.error('[contacts] Satisfaction stats error:', err)
    res.status(500).json({ error: 'Failed to fetch satisfaction stats' })
  }
})

export default router
