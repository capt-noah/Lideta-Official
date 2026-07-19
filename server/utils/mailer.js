import { createClient } from '@supabase/supabase-js'

// ── Lazy Supabase client ──────────────────────────────────────────────────────
let _supabase = null
function getSupabase() {
  if (!_supabase) {
    const url  = process.env.SUPABASE_URL || 'https://phmrqghudmszhszjryix.supabase.co'
    const anon = process.env.SUPABASE_ANON_KEY
    if (!anon) return null
    _supabase = createClient(url, anon, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  }
  return _supabase
}

// ── Send OTP — Supabase generates and emails the 6-digit code ────────────────
// Works for: 2FA login, email verification, and password reset.
// IMPORTANT: In Supabase Dashboard → Authentication → Providers → Email,
// make sure "Enable email OTP" is ON and "Magic link" is OFF.
export async function sendOTPEmail({ to, purpose = '2fa_login' }) {
  const sb = getSupabase()
  if (!sb) {
    console.warn('[mailer] No SUPABASE_ANON_KEY — set it in .env to enable email OTP')
    return { success: false, devMode: true }
  }

  const trySend = async () => sb.auth.signInWithOtp({
    email: to,
    options: { shouldCreateUser: true },
  })

  let { error } = await trySend()

  // Supabase enforces a 3-second cooldown between OTP requests for the same email.
  // If we hit it (e.g. password reset followed immediately by login), wait and retry once.
  if (error?.message?.includes('3 seconds')) {
    await new Promise(r => setTimeout(r, 3500))
    ;({ error } = await trySend())
  }

  if (error) {
    console.error('[mailer] Supabase signInWithOtp error:', error.message)
    return { success: false, error: error.message }
  }

  console.log(`[mailer] ✓ OTP sent to ${to} (${purpose})`)
  return { success: true }
}

// ── Verify OTP — Supabase checks the 6-digit code ────────────────────────────
export async function verifyOTPEmail({ email, token }) {
  const sb = getSupabase()
  if (!sb) return { success: false, error: 'Supabase not configured' }

  const { data, error } = await sb.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    console.error('[mailer] Supabase verifyOtp error:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
