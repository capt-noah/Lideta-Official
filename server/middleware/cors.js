import cors from 'cors'

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://lideta-official.vercel.app',
  'https://lidetasubcity.gov.et',
  'https://www.lidetasubcity.gov.et',
  process.env.CLIENT_ORIGIN,
].filter(Boolean)

export default cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    console.warn(`[cors] Blocked origin: ${origin}`)
    callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
})
