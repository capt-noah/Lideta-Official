
import pool from './con/db.js'

async function inspectAdminsSchema() {
    try {
        const columns = await pool`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'admins'
        `;
        console.log('Columns in admins:', columns);
    } catch (error) {
        console.error('Error inspecting schema:', error);
    } finally {
        process.exit();
    }
}

inspectAdminsSchema();
