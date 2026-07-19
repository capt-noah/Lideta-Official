import { Router } from 'express'
import pool   from '../con/db.js'
import { authenticateToken } from '../middleware/auth.js'
import { logActivity }       from '../utils/logActivity.js'

const router = Router()

// ── Public ────────────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const rows = await pool`
      SELECT n.*, nt.amh, nt.orm,
             TO_CHAR(n.created_at, 'Mon DD, YYYY') AS formatted_date
      FROM news n
      LEFT JOIN news_translation nt ON n.id = nt.news_id
      ORDER BY n.created_at DESC`
    res.json(rows)
  } catch (err) {
    console.error('[news] Fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
})

// ── Admin ─────────────────────────────────────────────────────────────────────

router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const rows = await pool`
      SELECT n.*, nt.amh, nt.orm,
             TO_CHAR(n.created_at, 'Mon DD, YYYY') AS formatted_date
      FROM news n
      LEFT JOIN news_translation nt ON n.id = nt.news_id
      ORDER BY n.created_at DESC`
    res.json(rows)
  } catch (err) {
    console.error('[news] Admin fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
})

router.post('/admin', authenticateToken, async (req, res) => {
  try {
    const f = req.body
    let photoData = null
    if (f.photo) {
      photoData = Array.isArray(f.photo) ? f.photo[0] : f.photo
    }

    const result = await pool`
      INSERT INTO news (title, description, category, short_description, photo)
      VALUES (${f.title}, ${f.description}, ${f.category}, ${f.shortDescription},
              ${photoData ? JSON.stringify(photoData) : null}::jsonb)
      RETURNING *`

    const newsId = result[0].id

    if (f.amh || f.orm) {
      const existing = await pool`SELECT 1 FROM news_translation WHERE news_id = ${newsId}`
      if (existing.length > 0) {
        await pool`UPDATE news_translation SET amh = ${f.amh || {}}::jsonb, orm = ${f.orm || {}}::jsonb WHERE news_id = ${newsId}`
      } else {
        await pool`INSERT INTO news_translation (news_id, amh, orm) VALUES (${newsId}, ${f.amh || {}}::jsonb, ${f.orm || {}}::jsonb)`
      }
    }

    logActivity(req.admin.admin_id, req.admin.username, 'CREATED', 'NEWS', f.title)
    res.status(201).json(result[0])
  } catch (err) {
    console.error('[news] Create error:', err)
    res.status(500).json({ error: 'Failed to create news' })
  }
})

router.put('/admin', authenticateToken, async (req, res) => {
  try {
    const f = req.body
    if (!f.news_id) return res.status(400).json({ error: 'News ID required' })

    let photoData = null
    if (f.photo) {
      photoData = Array.isArray(f.photo) ? f.photo[0] : f.photo
    }

    const oldResult = await pool`SELECT * FROM news WHERE id = ${f.news_id}`
    const old = oldResult[0]

    const result = await pool`
      UPDATE news
      SET title             = ${f.title},
          description       = ${f.description},
          category          = ${f.category},
          short_description = ${f.shortDescription},
          photo             = ${photoData ? JSON.stringify(photoData) : null}::jsonb
      WHERE id = ${f.news_id}
      RETURNING *`

    if (result.count === 0) return res.status(404).json({ error: 'News not found' })

    // Build diff for activity log
    const fields = { title: 'Title', description: 'Description', category: 'Category' }
    const details = {}
    for (const [col, label] of Object.entries(fields)) {
      if (f[col] !== undefined && String(f[col]).trim() !== String(old?.[col] || '').trim()) {
        details[label] = { old: old?.[col] || '(empty)', new: f[col] }
      }
    }

    if (f.amh || f.orm) {
      const existing = await pool`SELECT 1 FROM news_translation WHERE news_id = ${f.news_id}`
      if (existing.length > 0) {
        await pool`UPDATE news_translation SET amh = ${f.amh || {}}::jsonb, orm = ${f.orm || {}}::jsonb WHERE news_id = ${f.news_id}`
      } else {
        await pool`INSERT INTO news_translation (news_id, amh, orm) VALUES (${f.news_id}, ${f.amh || {}}::jsonb, ${f.orm || {}}::jsonb)`
      }
    }

    logActivity(req.admin.admin_id, req.admin.username, 'UPDATED', 'NEWS', f.title, Object.keys(details).length ? details : null)
    res.json(result[0])
  } catch (err) {
    console.error('[news] Update error:', err)
    res.status(500).json({ error: 'Failed to update news' })
  }
})

router.delete('/admin/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const found = await pool`SELECT title FROM news WHERE id = ${id}`
    if (found.length === 0) return res.status(404).json({ error: 'News not found' })

    await pool`DELETE FROM news_translation WHERE news_id = ${id}`
    await pool`DELETE FROM news WHERE id = ${id}`

    logActivity(req.admin.admin_id, req.admin.username, 'DELETED', 'NEWS', found[0].title)
    res.json({ message: 'News deleted successfully' })
  } catch (err) {
    console.error('[news] Delete error:', err)
    res.status(500).json({ error: 'Failed to delete news' })
  }
})

export default router
