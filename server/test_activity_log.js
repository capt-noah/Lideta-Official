
import pool from './con/db.js'

async function testInsert() {
    try {
        console.log('Attempting to insert test activity log...');
        
        // Get an admin ID first
        const admins = await pool`SELECT admin_id FROM admins LIMIT 1`;
        if (admins.length === 0) {
            console.error('No admins found to link log to.');
            process.exit(1);
        }
        const adminId = admins[0].admin_id;
        console.log('Using admin_id:', adminId);

        // Insert test log
        const result = await pool`
            INSERT INTO activity_logs (admin_id, action, entity_type, entity_title)
            VALUES (${adminId}, 'TEST_CREATE', 'TEST_ENTITY', 'Test Title')
            RETURNING *
        `;
        
        console.log('Insert successful:', result);

        // Fetch back
        const fetched = await pool`SELECT * FROM activity_logs WHERE log_id = ${result[0].log_id}`;
        console.log('Fetched back:', fetched);

    } catch (error) {
        console.error('Error inserting test log:', error);
    } finally {
        process.exit();
    }
}

testInsert();
