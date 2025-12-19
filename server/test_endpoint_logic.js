
import pool from './con/db.js'

async function testEndpointLogic() {
    try {
        console.log('Testing endpoint logic...');
        
        const activities = await pool`
            SELECT 
                al.*, 
                a.first_name, 
                a.last_name
            FROM activity_logs al
            JOIN admins a ON al.admin_id = a.admin_id
            ORDER BY al.created_at DESC
            LIMIT 5
        `
        
        const formattedActivities = activities.map(activity => ({
            id: activity.id, // Using the corrected column name
            admin_id: activity.admin_id,
            first_name: activity.first_name,
            last_name: activity.last_name,
            action: activity.action,
            entity_type: activity.entity_type,
            entity_title: activity.entity_title,
            created_at: activity.created_at,
        }))

        console.log('Formatted Activities:', formattedActivities);
        if (formattedActivities.length > 0 && formattedActivities[0].id !== undefined) {
             console.log('SUCCESS: Activities fetched and formatted correctly.');
        } else {
             console.log('FAILURE: Activities fetched but ID is undefined or list is empty.');
        }

    } catch (error) {
        console.error('Error testing endpoint:', error);
    } finally {
        process.exit();
    }
}

testEndpointLogic();
