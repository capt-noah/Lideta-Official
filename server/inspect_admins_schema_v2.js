
import pool from './con/db.js'

async function inspectAdmins() {
  try {
    const columns = await pool`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admins'
    `
    console.log('Columns in admins table:', columns.map(c => c.column_name))
  } catch (err) {
    console.error(err)
  } finally {
    process.exit()
  }
}

inspectAdmins()
