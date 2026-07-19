import pool from '../con/db.js'

export async function logActivity(adminId, username, action, entityType, entityTitle, details = null) {
  try {
    await pool`
      INSERT INTO activity_logs (admin_id, username, action, entity_type, entity_title, details)
      VALUES (
        ${adminId}, ${username}, ${action}, ${entityType}, ${entityTitle},
        ${details ? pool.json(details) : null}
      )`
  } catch (err) {
    console.error('[logActivity] Failed to log:', err.message)
  }
}
