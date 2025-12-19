
import fetch from 'node-fetch'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import pool from './con/db.js'

dotenv.config()

async function simulateActivity() {
    try {
        console.log('Simulating activity...')

        // 1. Get a valid admin
        const admins = await pool`SELECT * FROM admins LIMIT 1`
        if (admins.length === 0) {
            console.log('No admins found.')
            process.exit(1)
        }
        const admin = admins[0]
        console.log('Using admin for simulation:', { 
            id: admin.admin_id, 
            username: admin.username 
        })

        // 2. Generate a valid token
        const token = jwt.sign(
            { id: admin.admin_id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        // 3. Make a request that triggers logging (e.g., Create News)
        const newsData = {
            title: 'Simulation News ' + Date.now(),
            description: 'This is a simulated news item for debugging purposes.',
            category: 'Updates',
            shortDescription: 'Simulated news.',
            photo: null 
        }

        console.log('Sending request to /admin/create/news...')
        const response = await fetch(`http://localhost:${process.env.SERVER_PORT || 3000}/admin/create/news`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newsData)
        })

        if (response.ok) {
            console.log('Request successful:', await response.json())
        } else {
            console.error('Request failed:', response.status, await response.text())
        }

    } catch (err) {
        console.error('Simulation error:', err)
    } finally {
        // We don't exit process here immediately to allow async operations if any
        // But for this script, we can exit after a short delay
        setTimeout(() => process.exit(), 2000)
    }
}

simulateActivity()
