
import pool from './con/db.js'

async function inspectAdminsData() {
  try {
    const admins = await pool`SELECT admin_id, username, first_name, email FROM admins LIMIT 5`
    console.log('Admins:', admins)
  } catch (err) {
    console.error(err)
  } finally {
    process.exit()
  }
}

inspectAdminsData()
