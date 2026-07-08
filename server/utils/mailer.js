import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = process.env.SUPABASE_URL || `https://phmrqghudmszhszjryix.supabase.co`
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY

let _supabase = null
export function getSupabase() {
  if (!_supabase) {
    if (!SUPABASE_ANON) return null
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  }
  return _supabase
}

// ── Request OTP — Supabase generates and emails the code ──────────────────────
export async function sendOTPEmail({ to, purpose = '2fa_login' }) {
  const sb = getSupabase()
  if (!sb) {
    console.warn(`[mailer] No SUPABASE_ANON_KEY — set it in .env to enable email OTP`)
    return { success: false, devMode: true }
  }

  const { error } = await sb.auth.signInWithOtp({
    email: to,
    options: { shouldCreateUser: true }
  })

  if (error) {
    console.error('[mailer] Supabase signInWithOtp error:', error.message)
    return { success: false, error: error.message }
  }

  console.log(`[mailer] ✓ Supabase OTP sent to ${to} (${purpose})`)
  return { success: true }
}

// ── Verify OTP — Supabase checks the code the user typed ─────────────────────
export async function verifyOTPEmail({ email, token }) {
  const sb = getSupabase()
  if (!sb) return { success: false, error: 'Supabase not configured' }

  const { data, error } = await sb.auth.verifyOtp({
    email,
    token,
    type: 'email'
  })

  if (error) {
    console.error('[mailer] Supabase verifyOtp error:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
