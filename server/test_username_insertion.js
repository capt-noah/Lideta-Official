
import pool from './con/db.js'

async function testInsertion() {
  try {
    const admins = await pool`SELECT admin_id, username FROM admins LIMIT 1`
    if (admins.length === 0) {
        console.log('No admins found to test with.')
        return
    }
    const admin = admins[0]
    console.log('Using admin:', admin)
    
    const adminId = admin.admin_id
    const username = admin.username || 'fallback_test_user'
    const action = 'TEST_INSERT'
    const entityType = 'DEBUG'
    const entityTitle = 'Manual Test ' + Date.now()

    console.log('Inserting test log...')
    const result = await pool`
      INSERT INTO activity_logs (admin_id, username, action, entity_type, entity_title) 
      VALUES (${adminId}, ${username}, ${action}, ${entityType}, ${entityTitle}) 
      RETURNING *
    `
    console.log('Inserted:', result[0])

    console.log('Fetching back...')
    const fetched = await pool`SELECT * FROM activity_logs WHERE id = ${result[0].id}`
    console.log('Fetched:', fetched[0])

  } catch (err) {
    console.error('Error:', err)
  } finally {
    process.exit()
  }
}

testInsertion()
