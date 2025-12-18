import pkg from 'pg'
const { Pool } = pkg

import postgres from 'postgres'

import dotenv from 'dotenv'
dotenv.config()



// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DATABASE,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT,

// })

// const pool = postgres({
//     user: 'postgres',
//     host: 'db.phmrqghudmszhszjryix.supabase.co',
//     database: 'lideta_db',
//     password: 'lideta_pass',
//     port: process.env.DB_PORT,
// })

// const pool = postgres('postgresql://postgres:orA2MnvUWApaco5k@db.phmrqghudmszhszjryix.supabase.co:5432/postgres', {
//   ssl: 'require'
// })



const pool = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  prepare: false
})



export default pool