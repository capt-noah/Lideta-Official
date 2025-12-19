
import pool from './con/db.js'

async function inspectSchema() {
    try {
        const columns = await pool`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'activity_logs'
        `;
        console.log('Columns in activity_logs:', columns);
    } catch (error) {
        console.error('Error inspecting schema:', error);
    } finally {
        process.exit();
    }
}

inspectSchema();
