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
        
        const token = jwt.sign({ id: data.admin_id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        
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

// Update admin profile (personal information)
app.post('/admin/update/profile', authenticateToken, async (req, res) => {
    try {
        const formData = req.body
        const adminId = req.admin.admin_id

        const response = await pool.query(
            `UPDATE admins
             SET first_name = $1,
                 last_name = $2,
                 gender = $3,
                 residency = $4,
                 phone_number = $5,
                 email = $6
             WHERE admin_id = $7
             RETURNING *`,
            [
                formData.first_name,
                formData.last_name,
                formData.gender,
                formData.residency,
                formData.phone_number,
                formData.email,
                adminId
            ]
        )

        if (response.rowCount === 0) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        res.status(200).json(response.rows[0])
    } catch (error) {
        console.error('Error updating profile:', error)
        res.status(500).json({ error: 'Failed to update profile' })
    }
})

// Update admin information (username, role)
app.post('/admin/update/admin-info', authenticateToken, async (req, res) => {
    try {
        const formData = req.body
        const adminId = req.admin.admin_id

        // Check if username is being changed and if it's already taken
        if (formData.username && formData.username !== req.admin.username) {
            const existingUser = await pool.query(
                'SELECT * FROM admins WHERE username = $1 AND admin_id != $2',
                [formData.username, adminId]
            )
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'Username already exists' })
            }
        }

        const response = await pool.query(
            `UPDATE admins
             SET username = $1,
                 role = $2
             WHERE admin_id = $3
             RETURNING *`,
            [
                formData.username,
                formData.role,
                adminId
            ]
        )

        if (response.rowCount === 0) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        res.status(200).json(response.rows[0])
    } catch (error) {
        console.error('Error updating admin info:', error)
        res.status(500).json({ error: 'Failed to update admin information' })
    }
})

// Update admin password
app.post('/admin/update/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        const adminId = req.admin.admin_id

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' })
        }

        // Verify current password
        const admin = await pool.query('SELECT * FROM admins WHERE admin_id = $1', [adminId])
        if (admin.rows.length === 0) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, admin.rows[0].password_hash)
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Current password is incorrect' })
        }

        // Hash new password
        const saltround = 10
        const hashedPassword = await bcrypt.hash(newPassword, saltround)

        // Update password
        const response = await pool.query(
            `UPDATE admins
             SET password_hash = $1
             WHERE admin_id = $2
             RETURNING admin_id, username`,
            [hashedPassword, adminId]
        )

        res.status(200).json({ message: 'Password updated successfully' })
    } catch (error) {
        console.error('Error updating password:', error)
        res.status(500).json({ error: 'Failed to update password' })
    }
})

// Get admin settings
app.get('/admin/settings', authenticateToken, async (req, res) => {
    try {
        const adminId = req.admin.admin_id
        const response = await pool.query(
            'SELECT * FROM admin_settings WHERE admin_id = $1',
            [adminId]
        )

        if (response.rows.length === 0) {
            // Create default settings if they don't exist
            await pool.query(
                'INSERT INTO admin_settings (admin_id) VALUES ($1)',
                [adminId]
            )
            const newSettings = await pool.query(
                'SELECT * FROM admin_settings WHERE admin_id = $1',
                [adminId]
            )
            return res.status(200).json(newSettings.rows[0])
        }

        res.status(200).json(response.rows[0])
    } catch (error) {
        console.error('Error fetching settings:', error)
        res.status(500).json({ error: 'Failed to fetch settings' })
    }
})

// Update admin settings (preferences)
app.post('/admin/update/settings', authenticateToken, async (req, res) => {
    try {
        const { theme, font_size, language } = req.body
        const adminId = req.admin.admin_id

        // Check if settings exist, if not create them
        const existing = await pool.query(
            'SELECT * FROM admin_settings WHERE admin_id = $1',
            [adminId]
        )

        let response
        if (existing.rows.length === 0) {
            response = await pool.query(
                `INSERT INTO admin_settings (admin_id, theme, font_size, language)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [adminId, theme || 'light', font_size || 'medium', language || 'english']
            )
        } else {
            response = await pool.query(
                `UPDATE admin_settings
                 SET theme = $1,
                     font_size = $2,
                     language = $3
                 WHERE admin_id = $4
                 RETURNING *`,
                [theme || existing.rows[0].theme, font_size || existing.rows[0].font_size, language || existing.rows[0].language, adminId]
            )
        }

        res.status(200).json(response.rows[0])
    } catch (error) {
        console.error('Error updating settings:', error)
        res.status(500).json({ error: 'Failed to update settings' })
    }
})

app.get('/admin/complaints', authenticateToken, async (req, res) => {
    const response = await pool.query('SELECT * FROM complaints')
    const complaints = response.rows

    const counts = await pool.query(`SELECT 
                                        COUNT(*) AS total,
                                        COUNT(*) FILTER ( WHERE status = 'assigning' OR status = 'in progress' ) AS pending,
                                        COUNT(*) FILTER ( WHERE status = 'resolved' ) AS resolved
                                    FROM complaints `)

    res.status(200).json({complaints: complaints, counts: counts.rows[0]})
})

app.post('/admin/update/complaints', authenticateToken, async (req, res) => {
    try {
        const data = req.body.formData
        
        // Ensure photo is in array format with name and path
        let photoData = []
        if (data.photo) {
            if (Array.isArray(data.photo)) {
                photoData = data.photo
            } else if (typeof data.photo === 'object' && data.photo.name) {
                photoData = [data.photo]
            }
        }
        
        const response = await pool.query(`UPDATE complaints
                                            SET first_name = $1, last_name = $2, email = $3, phone = $4, type = $5, status = $6, description = $7, photos = $8::jsonb
                                            WHERE complaint_id = $9`,
                                            [data.first_name, data.last_name, data.email, data.phone, data.type, data.status, data.description, JSON.stringify(photoData), data.id ] 
                                        )
        
        res.status(201).json('Complaint Updated Successfully')
    } catch (error) {
        console.error('Error updating complaint:', error)
        res.status(500).json({ error: 'Failed to update complaint' })
    }
})

app.post('/admin/create/complaints', async (req, res) => {
    try {
        const data = req.body.formData
        
        // Ensure photo is in array format with name and path
        let photoData = []
        if (data.photo) {
            if (Array.isArray(data.photo)) {
                photoData = data.photo
            } else if (typeof data.photo === 'object' && data.photo.name) {
                photoData = [data.photo]
            }
        }
        
        const response = await pool.query(`INSERT INTO complaints (first_name, last_name, email, phone, type, status, description, photos) 
                                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::JSONB)`,
                                        [data.first_name, data.last_name, data.email, data.phone, data.type, data.status, data.description, JSON.stringify(photoData)] 
        )
        
        res.status(201).json('Complaint Created Successfully')
    } catch (error) {
        console.error('Error creating complaint:', error)
        res.status(500).json({ error: 'Failed to create complaint' })
    }
})

app.get('/admin/events', authenticateToken, async (req, res) => {
    const response = await pool.query(`SELECT *,
                                            TO_CHAR(start_date, 'Dy. Mon, DD YYYY') AS start_date_short
                                        FROM events;`)
    const events = response.rows

    res.status(200).json(events)
})

app.post('/admin/create/events', authenticateToken, async (req, res) => {
    try {
        const { formData } = req.body
        
        // Format photo as JSON object with name and path
        let photoData = null
        if (formData.photo) {
            if (typeof formData.photo === 'object' && formData.photo.name) {
                photoData = formData.photo
            } else if (Array.isArray(formData.photo) && formData.photo.length > 0) {
                photoData = formData.photo[0]
            }
        }
        
        const response = await pool.query(
            `INSERT INTO events (title, description, location, start_date, end_date, status, photos)
             VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
             RETURNING *`,
            [
                formData.title,
                formData.description,
                formData.location,
                formData.start_date,
                formData.end_date,
                'upcoming',
                photoData ? JSON.stringify([photoData]) : null
            ]
        )
        
        res.status(201).json(response.rows[0])
    } catch (error) {
        console.error('Error creating event:', error)
        res.status(500).json({ error: 'Failed to create event' })
    }
})

app.post('/admin/update/events', authenticateToken, async (req, res) => {
    try {
        const { formData } = req.body
        
        if (!formData.events_id) {
            return res.status(400).json({ error: 'Event ID is required for update' })
        }

        // Format photo as JSON object with name and path
        let photoData = null
        if (formData.photo) {
            if (typeof formData.photo === 'object' && formData.photo.name) {
                photoData = formData.photo
            } else if (Array.isArray(formData.photo) && formData.photo.length > 0) {
                photoData = formData.photo[0]
            }
        }

        const response = await pool.query(
            `UPDATE events
             SET title = $1,
                 description = $2,
                 location = $3,
                 start_date = $4,
                 end_date = $5,
                 status = $6,
                 photos = $7::jsonb
             WHERE events_id = $8
             RETURNING *`,
            [
                formData.title,
                formData.description,
                formData.location,
                formData.start_date,
                formData.end_date,
                formData.status || 'upcoming',
                photoData ? JSON.stringify([photoData]) : null,
                formData.events_id
            ]
        )
        
        if (response.rowCount === 0) {
            return res.status(404).json({ error: 'Event not found' })
        }
        
        res.status(200).json(response.rows[0])
    } catch (error) {
        console.error('Error updating event:', error)
        res.status(500).json({ error: 'Failed to update event' })
    }
})

app.delete('/admin/events/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params
        const response = await pool.query('DELETE FROM events WHERE events_id = $1 RETURNING *', [id])
        
        if (response.rowCount === 0) {
            return res.status(404).json({ error: 'Event not found' })
        }
        
        res.status(200).json({ message: 'Event deleted successfully' })
    } catch (error) {
        console.error('Error deleting event:', error)
        res.status(500).json({ error: 'Failed to delete event' })
    }
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


// News endpoints
app.get('/admin/news', authenticateToken, async (req, res) => {
    try {
        const response = await pool.query(`
            SELECT *,
                   TO_CHAR(created_at, 'Mon DD, YYYY') AS formatted_date
            FROM news
            ORDER BY created_at DESC
        `);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

app.post('/admin/create/news', authenticateToken, async (req, res) => {
    try {
        const formData = req.body;
        
        // Format photo as JSON object with name and path
        let photoData = null
        if (formData.photo) {
            if (typeof formData.photo === 'object' && formData.photo.name) {
                photoData = formData.photo
            } else if (Array.isArray(formData.photo) && formData.photo.length > 0) {
                photoData = formData.photo[0]
            }
        }
        
        const response = await pool.query(
            `INSERT INTO news (title, description, category, short_description, photo)
             VALUES ($1, $2, $3, $4, $5::jsonb)
             RETURNING *`,
            [
                formData.title,
                formData.description,
                formData.category,
                formData.shortDescription,
                photoData ? JSON.stringify(photoData) : null
            ]
        );
        
        res.status(201).json(response.rows[0]);
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ error: 'Failed to create news' });
    }
});

app.post('/admin/update/news', authenticateToken, async (req, res) => {
    try {
        const formData = req.body;

        
        if (!formData.news_id) {
            return res.status(400).json({ error: 'News ID is required for update' });
        }

        // Format photo as JSON object with name and path
        let photoData = null
        if (formData.photo) {
            if (typeof formData.photo === 'object' && formData.photo.name) {
                photoData = formData.photo
            } else if (Array.isArray(formData.photo) && formData.photo.length > 0) {
                photoData = formData.photo[0]
            }
        }

        const response = await pool.query(
            `UPDATE news
             SET title = $1,
                 description = $2,
                 category = $3,
                 short_description = $4,
                 photo = $5::jsonb
             WHERE id = $6
             RETURNING *`,
            [
                formData.title,
                formData.description,
                formData.category,
                formData.shortDescription,
                photoData ? JSON.stringify(photoData) : null,
                formData.news_id
            ]
        );
        
        if (response.rowCount === 0) {
            return res.status(404).json({ error: 'News not found' });
        }
        
        res.status(200).json(response.rows[0]);
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ error: 'Failed to update news' });
    }
});

app.delete('/admin/news/:id', authenticateToken, async (req, res) => {
    try {
        console.log('deleting...')
        const { id } = req.params;
        const response = await pool.query('DELETE FROM news WHERE id = $1 RETURNING *', [id]);
        
        if (response.rowCount === 0) {
            return res.status(404).json({ error: 'News not found' });
        }
        
        res.status(200).json({ message: 'News deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news' });
    }
});

// Vacancy endpoints
app.get('/admin/vacancies', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT *, TO_CHAR(created_at, \'DD - MM - YYYY\') as formatted_date FROM vacancies ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching vacancies:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create new vacancy
app.post('/admin/create/vacancy', authenticateToken, async (req, res) => {
  try {
    const formData = req.body;
    
    const response = await pool.query(
      `INSERT INTO vacancies (title, short_description, description, location, salary, type, category, skills, responsibilities, qualifications, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        formData.title,
        formData.shortDescription,
        formData.description,
        formData.location,
        formData.salary,
        formData.type,
        formData.category,
        Array.isArray(formData.skills) ? formData.skills : [],
        formData.responsibilities,
        formData.qualifications,
        formData.startDate,
        formData.endDate
      ]
    )
    
    res.status(201).json(response.rows[0])
  } catch (error) {
    console.error('Error creating vacancy:', error)
    res.status(500).json({ error: 'Failed to create vacancy' })
  }
})

// Update vacancy
app.post('/admin/update/vacancy', authenticateToken, async (req, res) => {
  try {
    const formData = req.body;
    
    if (!formData.id) {
      return res.status(400).json({ error: 'Vacancy ID is required for update' })
    }
    
    const response = await pool.query(
      `UPDATE vacancies
       SET title = $1,
           short_description = $2,
           description = $3,
           location = $4,
           salary = $5,
           type = $6,
           category = $7,
           skills = $8,
           responsibilities = $9,
           qualifications = $10,
           start_date = $11,
           end_date = $12,
           updated_at = NOW()
       WHERE id = $13
       RETURNING *`,
      [
        formData.title,
        formData.shortDescription,
        formData.description,
        formData.location,
        formData.salary,
        formData.type,
        formData.category,
        Array.isArray(formData.skills) ? formData.skills : [],
        formData.responsibilities,
        formData.qualifications,
        formData.startDate,
        formData.endDate,
        formData.id
      ]
    )
    
    if (response.rowCount === 0) {
      return res.status(404).json({ error: 'Vacancy not found' })
    }
    
    res.json(response.rows[0])
  } catch (error) {
    console.error('Error updating vacancy:', error)
    res.status(500).json({ error: 'Failed to update vacancy' })
  }
})

// Delete vacancy
app.delete('/admin/vacancy/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await pool.query('DELETE FROM vacancies WHERE id = $1 RETURNING *', [id]);
    
    if (response.rowCount === 0) {
      return res.status(404).json({ error: 'Vacancy not found' });
    }
    
    res.json({ message: 'Vacancy deleted successfully' });
  } catch (error) {
    console.error('Error deleting vacancy:', error);
    res.status(500).json({ error: 'Failed to delete vacancy' });
  }
})

app.listen(process.env.PORT, () => console.log('listening...'))