
import pool from './con/db.js'

async function initDb() {
    try {
        console.log('Checking for activity_logs table...');
        
        // Create activity_logs table if it doesn't exist
        await pool`
            CREATE TABLE IF NOT EXISTS activity_logs (
                log_id SERIAL PRIMARY KEY,
                admin_id TEXT REFERENCES admins(admin_id),
                action VARCHAR(50) NOT NULL,
                entity_type VARCHAR(50) NOT NULL,
                entity_title VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `;
        console.log('activity_logs table checked/created successfully.');
        
        // Verify it exists
        const result = await pool`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'activity_logs'
        `;
        
        if (result.length > 0) {
            console.log('Verification: activity_logs table exists.');
        } else {
            console.error('Verification FAILED: activity_logs table does not exist.');
        }

    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        process.exit();
    }
}

initDb();
