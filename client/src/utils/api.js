// Base URL for all API calls.
// In development, Vite's proxy forwards /api → localhost:3000 so we use ''.
// In production, set VITE_API_URL in your Vercel env vars to the backend URL
// e.g. https://your-backend.onrender.com
const BASE_URL = import.meta.env.VITE_API_URL || ''

export default BASE_URL
