
import pool from './con/db.js'

async function checkRecentLogs() {
  try {
    const logs = await pool`
      SELECT id, username, action, entity_title, created_at 
      FROM activity_logs 
      ORDER BY created_at DESC 
      LIMIT 5
    `
    console.log('Recent Logs:', logs)
  } catch (err) {
    console.error(err)
  } finally {
    process.exit()
  }
}

checkRecentLogs()
