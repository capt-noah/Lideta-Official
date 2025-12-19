
import pool from './con/db.js'

async function addUsernameColumn() {
  try {
    console.log('Checking if username column exists in activity_logs...')
    
    // Check if column exists
    const checkColumn = await pool`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'activity_logs' AND column_name = 'username'
    `

    if (checkColumn.length === 0) {
      console.log('Adding username column...')
      await pool`ALTER TABLE activity_logs ADD COLUMN username VARCHAR(255)`
      console.log('Username column added successfully.')
    } else {
      console.log('Username column already exists.')
    }

  } catch (err) {
    console.error('Error updating schema:', err)
  } finally {
      process.exit()
  }
}

addUsernameColumn()
