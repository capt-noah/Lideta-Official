
import pool from './con/db.js'

async function simulateCreateEvent() {
    try {
        console.log('Simulating Create Event...');
        
        // 1. Get an existing admin (username 'abe_kebe' or first available)
        const admins = await pool`SELECT * FROM admins LIMIT 1`;
        if(admins.length === 0) { console.error('No admins found'); process.exit(1); }
        
        const admin = admins[0];
        console.log(`Using admin: ${admin.username} (${admin.admin_id})`);

        // 2. Perform Insert (mimic server.js logic)
        const eventTitle = `Test Event ${Date.now()}`;
        console.log(`Creating event: ${eventTitle}`);
        
        // Note: I'm skipping actual event insert to avoid polluting events table, 
        // but I will perform the log insert which is what we care about.
        // In server.js: logActivity(req.admin.id, 'CREATED', 'EVENT', formData.title)
        
        // Mimic logActivity function
        const logResult = await pool`INSERT INTO activity_logs (admin_id, action, entity_type, entity_title) 
                 VALUES (${admin.admin_id}, 'CREATED', 'EVENT', ${eventTitle}) RETURNING *`;
        
        console.log('Log inserted:', logResult[0]);

        // 3. Fetch from endpoint logic
        const latestLogs = await pool`
            SELECT 
                al.*, 
                a.username
            FROM activity_logs al
            JOIN admins a ON al.admin_id = a.admin_id
            ORDER BY al.created_at DESC
            LIMIT 5
        `;
        
        console.log('Latest Logs from DB:', latestLogs);
        
        const found = latestLogs.find(l => l.entity_title === eventTitle && l.username === admin.username);
        
        if (found) {
            console.log('SUCCESS: The new log entry was found and joined correctly with username.');
        } else {
            console.error('FAILURE: Could not find the new log entry in the joined query.');
        }

    } catch (error) {
        console.error('Error simulating event creation:', error);
    } finally {
        process.exit();
    }
}

simulateCreateEvent();
