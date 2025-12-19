
import pool from './con/db.js'

async function initDb() {
    try {
        console.log('Checking for activity_logs table...');
        
        // Create activity_logs table if it doesn't exist
        await pool`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id SERIAL PRIMARY KEY,
                admin_id TEXT REFERENCES admins(admin_id),
                username VARCHAR(255),
                action VARCHAR(50) NOT NULL,
                entity_type VARCHAR(50) NOT NULL,
                entity_title VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `;
        console.log('activity_logs table checked/created successfully.');

        // Check for username column explicitly and add if missing (migration)
        const checkColumn = await pool`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'activity_logs' AND column_name = 'username'
        `

        if (checkColumn.length === 0) {
            console.log('Adding username column to existing activity_logs table...');
            await pool`ALTER TABLE activity_logs ADD COLUMN username VARCHAR(255)`;
            console.log('username column added successfully.');
        } else {
             console.log('username column already exists.');
        }
        
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        process.exit();
    }
}

initDb();
