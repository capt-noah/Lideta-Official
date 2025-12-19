
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import pool from './con/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function simulateApiRequest() {
    try {
        console.log('Simulating API Request to Create Event...');

        // 1. Get Admin to generate token
        const admins = await pool`SELECT * FROM admins LIMIT 1`;
        if (admins.length === 0) { console.error('No admins found'); process.exit(1); }
        const admin = admins[0];
        console.log(`Using admin: ${admin.username} (${admin.admin_id})`);

        // 2. Generate Token
        // Note: checking server.js to see secret used. inferred from authenticateToken usage
        const secret = process.env.JWT_SECRET;
        if (!secret) { console.error('JWT_SECRET not found in env'); process.exit(1); }
        
        const token = jwt.sign({ id: admin.admin_id, username: admin.username }, secret, { expiresIn: '1h' });
        console.log('Generated Token');

        // 3. Make Request
        const eventData = {
            title: `API Test Event ${Date.now()}`,
            description: 'This is a test event created via API simulation to check logging.',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000).toISOString(),
            location: 'Test Location',
            status: 'upcoming'
        };

        const response = await fetch('http://localhost:3000/admin/create/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });

        console.log(`Response Status: ${response.status}`);
        const data = await response.json();
        console.log('Response Body:', data);

        if (response.ok) {
            console.log('Event created via API. Now checking if log exists...');
            // Wait a sec for async log
            await new Promise(r => setTimeout(r, 1000));
            
            const logs = await pool`
                SELECT * FROM activity_logs 
                WHERE entity_title = ${eventData.title}
            `;
            console.log('Logs found for this event:', logs);
        } else {
            console.error('Failed to create event via API');
        }

    } catch (error) {
        console.error('Error simulating API request:', error);
    } finally {
        process.exit();
    }
}

simulateApiRequest();
