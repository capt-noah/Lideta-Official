import pool from './con/db.js';

async function migrate() {
    try {
        console.log("Adding videos column to complaints...");
        await pool`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb`;
        
        console.log("Adding audios column to complaints...");
        await pool`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS audios JSONB DEFAULT '[]'::jsonb`;
        
        console.log("Migration completed successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        process.exit();
    }
}

migrate();
