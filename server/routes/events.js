import { Router } from 'express'
import pool   from '../con/db.js'
import { authenticateToken } from '../middleware/auth.js'
import { logActivity }       from '../utils/logActivity.js'

const router = Router()

// ── Public ────────────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const rows = await pool`
      SELECT e.*, et.amh, et.orm,
             TO_CHAR(e.start_date, 'Dy. Mon, DD YYYY') AS start_date_short
      FROM events e
      LEFT JOIN events_translation et ON e.events_id = et.event_id
      ORDER BY e.start_date DESC`
    res.json(rows)
  } catch (err) {
    console.error('[events] Fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

// ── Admin ─────────────────────────────────────────────────────────────────────

router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const rows = await pool`
      SELECT e.*, et.amh, et.orm,
             TO_CHAR(e.start_date, 'Dy. Mon, DD YYYY') AS start_date_short
      FROM events e
      LEFT JOIN events_translation et ON e.events_id = et.event_id
      ORDER BY e.start_date DESC`
    res.json(rows)
  } catch (err) {
    console.error('[events] Admin fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

router.post('/admin', authenticateToken, async (req, res) => {
  try {
    const { formData: f } = req.body
    let photoData = null
    if (f.photo) {
      photoData = Array.isArray(f.photo) ? f.photo[0] : f.photo
    }

    const result = await pool`
      INSERT INTO events (title, description, location, start_date, end_date, status, photos)
      VALUES (${f.title}, ${f.description}, ${f.location}, ${f.start_date}, ${f.end_date},
              ${'upcoming'}, ${photoData ? JSON.stringify([photoData]) : null}::jsonb)
      RETURNING *`

    const eventId = result[0].events_id

    if (f.amh || f.orm) {
      const existing = await pool`SELECT 1 FROM events_translation WHERE event_id = ${eventId}`
      if (existing.length > 0) {
        await pool`UPDATE events_translation SET amh = ${f.amh || {}}::jsonb, orm = ${f.orm || {}}::jsonb WHERE event_id = ${eventId}`
      } else {
        await pool`INSERT INTO events_translation (event_id, amh, orm) VALUES (${eventId}, ${f.amh || {}}::jsonb, ${f.orm || {}}::jsonb)`
      }
    }

    logActivity(req.admin.admin_id, req.admin.username, 'CREATED', 'EVENT', f.title)
    res.status(201).json(result[0])
  } catch (err) {
    console.error('[events] Create error:', err)
    res.status(500).json({ error: 'Failed to create event' })
  }
})

router.put('/admin', authenticateToken, async (req, res) => {
  try {
    const { formData: f } = req.body
    if (!f.events_id) return res.status(400).json({ error: 'Event ID required' })

    let photoData = null
    if (f.photo) {
      photoData = Array.isArray(f.photo) ? f.photo[0] : f.photo
    }

    const oldResult = await pool`SELECT * FROM events WHERE events_id = ${f.events_id}`
    const old = oldResult[0]

    const result = await pool`
      UPDATE events
      SET title       = ${f.title},
          description = ${f.description},
          location    = ${f.location},
          start_date  = ${f.start_date},
          end_date    = ${f.end_date},
          status      = ${f.status || 'upcoming'},
          photos      = ${photoData ? JSON.stringify([photoData]) : null}::jsonb
      WHERE events_id = ${f.events_id}
      RETURNING *`

    if (result.count === 0) return res.status(404).json({ error: 'Event not found' })

    // Build diff
    const fields  = { title: 'Title', description: 'Description', location: 'Location', status: 'Status' }
    const details = {}
    for (const [col, label] of Object.entries(fields)) {
      const nv = f[col], ov = old?.[col] instanceof Date ? old[col].toISOString().split('T')[0] : old?.[col]
      if (nv !== undefined && String(nv).trim() !== String(ov || '').trim()) {
        details[label] = { old: ov || '(empty)', new: nv }
      }
    }

    if (f.amh || f.orm) {
      const existing = await pool`SELECT 1 FROM events_translation WHERE event_id = ${f.events_id}`
      if (existing.length > 0) {
        await pool`UPDATE events_translation SET amh = ${f.amh || {}}::jsonb, orm = ${f.orm || {}}::jsonb WHERE event_id = ${f.events_id}`
      } else {
        await pool`INSERT INTO events_translation (event_id, amh, orm) VALUES (${f.events_id}, ${f.amh || {}}::jsonb, ${f.orm || {}}::jsonb)`
      }
    }

    logActivity(req.admin.admin_id, req.admin.username, 'UPDATED', 'EVENT', f.title, Object.keys(details).length ? details : null)
    res.json(result[0])
  } catch (err) {
    console.error('[events] Update error:', err)
    res.status(500).json({ error: 'Failed to update event' })
  }
})

router.delete('/admin/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const found = await pool`SELECT title FROM events WHERE events_id = ${id}`
    if (found.length === 0) return res.status(404).json({ error: 'Event not found' })

    await pool`DELETE FROM events_translation WHERE event_id = ${id}`
    await pool`DELETE FROM events WHERE events_id = ${id}`

    logActivity(req.admin.admin_id, req.admin.username, 'DELETED', 'EVENT', found[0].title)
    res.json({ message: 'Event deleted successfully' })
  } catch (err) {
    console.error('[events] Delete error:', err)
    res.status(500).json({ error: 'Failed to delete event' })
  }
})

export default router
