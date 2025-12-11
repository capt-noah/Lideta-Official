import express from 'express'
const app = express()
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

dotenv.config()

import pool from './con/db.js'

app.use(express.json())
app.use(cors())


app.get('/', async (req, res) => {
    const response = await pool.query('SELECT * FROM admins')
    const data = response.rows[0]

    res.json(data)
})

app.get('/auth/admin/register', async (req, res) => {
    try {
        // const { first_name, last_name, username, password, email, phone_number, residency, gender } = req.body
        const first_name = 'Abebe'
        const last_name = 'Kebede'
        const username = 'abe_kebe'
        const password = 'abe_pass'
        const email = 'abekebe@gmail.com'
        const phone_number = '0912345678'
        const residency = 'Addis Ababa'
        const gender = 'Male'

        const existingUser = await pool.query('SELECT * FROM admins WHERE username = $1 OR phone_number = $2 OR email = $3', [username, phone_number, email])

        if (existingUser.rows.length > 0) return res.status(400).json({ error: 'User Already Exisits', data: existingUser.rows[0] })
        
        const saltround = 10

        const hashed_password = await bcrypt.hash(password, saltround)

        const response = await pool.query(`INSERT INTO admins (first_name, last_name, username, password_hash, email, phone_number, gender, residency) 
                                        VALUES($1, $2, $3, $4, $5, $6, $7, $8)
                                        RETURNING username, admin_id  `,
            [first_name, last_name, username, hashed_password, email, phone_number, gender, residency])
        const data = response.rows[0]

        res.json(data)
    }
    catch (error) {
        res.status(500).json({error: 'Internal Server Error'})
    }
    
})

app.post('/auth/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body

        // const username = 'abe_kebe'
        // const password = 'abe_pass'

        if(!username || !password) return res.status(400).json({error: 'Username and Password are Required'})
        
        const response = await pool.query('SELECT * FROM admins WHERE username = $1', [username])
        const data = response.rows[0]

        if(!data) return res.status(404).json({error: 'User Not Found'})

        const isPasswordValid = await bcrypt.compare(password, data.password_hash)

        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid Password' })
        
        const token = jwt.sign({ id: data.admin_id }, process.env.JWT_SECRET, { expiresIn: 5 })
        
        res.status(200).json({
            message: 'login successful',
            token,
            admin: {
                id: data.admin_id,
                username: data.username,
                first_name: data.first_name,
                last_name: data.last_name,
                emial: data.email,
            }

        })
    }
    catch (error) {
        res.status(500).json({error: 'Internal Server Error'})
    }
})

app.post('/auth/admin/me', authenticateToken, async (req, res) => {
    const adminData = req.admin

    res.status(200).json(adminData)
})

async function authenticateToken(req, res, next) {
    const header = req.headers['authorization']
    const token = header && header.split(' ')[1]

    if (!token) return res.status(404).json({ error: 'No Token Found' })
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const response = await pool.query('SELECT * FROM admins WHERE admin_id = $1', [decoded.id])

        req.admin = response.rows[0]
        next()
    }
    catch (error) {
        return res.status(500).json({error: 'Internal Server Error'})
    }

}


app.listen(process.env.PORT, () => console.log('listening...'))