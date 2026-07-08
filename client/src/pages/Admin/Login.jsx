import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import EyeShowIcon from '../../assets/icons/eye_show_icon.svg?react'
import EyeHideIcon from '../../assets/icons/eye_hide_icon.svg?react'

function Login() {
  const navigate = useNavigate()

  // Step 1 — credentials
  const [username,     setUsername]     = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Step 2 — OTP
  const [step,         setStep]         = useState('credentials') // 'credentials' | 'otp' | 'forgot' | 'reset'
  const [otp,          setOtp]          = useState(['', '', '', '', '', ''])
  const [maskedEmail,  setMaskedEmail]  = useState('')
  const [pendingEmail, setPendingEmail] = useState('')

  // Forgot password
  const [fpEmail,      setFpEmail]      = useState('')
  const [fpOtp,        setFpOtp]        = useState(['', '', '', '', '', ''])
  const [fpNewPass,    setFpNewPass]    = useState('')
  const [fpConfirm,    setFpConfirm]    = useState('')
  const [fpStep,       setFpStep]       = useState('email') // 'email' | 'otp' | 'newpass'

  const [status,       setStatus]       = useState('')
  const [loading,      setLoading]      = useState(false)
  const [resendTimer,  setResendTimer]  = useState(0)

  const otpRefs = useRef([])

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  // ── Step 1: Credentials ───────────────────────────────────────────────────
  const handleCredentials = async (e) => {
    e.preventDefault()
    setLoading(true); setStatus('')
    try {
      const res  = await fetch('/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) { setStatus(data.error); return }

      setMaskedEmail(data.maskedEmail)
      setPendingEmail(data.maskedEmail)
      setResendTimer(60)
      setStep('otp')
    } catch { setStatus('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  // ── Step 2: OTP ───────────────────────────────────────────────────────────
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      otpRefs.current[5]?.focus()
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setStatus('Enter all 6 digits'); return }
    setLoading(true); setStatus('')
    try {
      // We need the real email — the server stored OTP by email, we need to find it
      // The admin login doesn't return the real email, so we look it up by username
      const lookupRes = await fetch('/auth/admin/email-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      const { email } = await lookupRes.json()

      const res  = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code, entityType: 'admin' })
      })
      const data = await res.json()
      if (!res.ok) { setStatus(data.error); return }

      localStorage.setItem('token', data.token)
      const role = data.admin?.role || data.role
      if (role === 'superadmin')     navigate('/superadmin/home')
      else if (role === 'news_admin')      navigate('/admin/news')
      else if (role === 'event_admin')     navigate('/admin/events')
      else if (role === 'complaint_admin') navigate('/admin/compliants')
      else if (role === 'vacancy_admin')   navigate('/admin/vacancy')
      else navigate('/admin')
    } catch { setStatus('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setStatus('')
    try {
      const lookupRes = await fetch('/auth/admin/email-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      const { email } = await lookupRes.json()
      await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, entityType: 'admin', purpose: '2fa_login' })
      })
      setOtp(['', '', '', '', '', ''])
      setResendTimer(60)
      setStatus('New code sent!')
    } catch { setStatus('Failed to resend. Try again.') }
  }

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgotSend = async (e) => {
    e.preventDefault(); setLoading(true); setStatus('')
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, entityType: 'admin' })
      })
      setFpStep('otp'); setResendTimer(60)
    } catch { setStatus('Failed to send. Try again.') }
    finally { setLoading(false) }
  }

  const handleFpOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...fpOtp]; next[i] = val; setFpOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleFpOtpNext = (e) => {
    e.preventDefault()
    const code = fpOtp.join('')
    if (code.length < 6) { setStatus('Enter all 6 digits'); return }
    setFpStep('newpass'); setStatus('')
  }

  const handleFpReset = async (e) => {
    e.preventDefault()
    if (fpNewPass !== fpConfirm) { setStatus('Passwords do not match'); return }
    if (fpNewPass.length < 8) { setStatus('Password must be at least 8 characters'); return }
    setLoading(true); setStatus('')
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, otp: fpOtp.join(''), newPassword: fpNewPass, entityType: 'admin' })
      })
      const data = await res.json()
      if (!res.ok) { setStatus(data.error); return }
      setStep('credentials'); setFpStep('email')
      setStatus('Password reset successfully! You can now sign in.')
    } catch { setStatus('Reset failed. Try again.') }
    finally { setLoading(false) }
  }

  const inputCls = 'w-full rounded-lg border border-[#3A3A3A]/30 px-3 py-2 font-roboto text-sm text-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]/60 bg-white'

  return (
    <div className='min-h-screen w-full bg-white flex items-center justify-center px-4'>
      <div className='w-full max-w-md bg-white border border-[#3A3A3A]/20 rounded-2xl shadow-md p-8 flex flex-col gap-6'>

        {/* ── Credentials step ── */}
        {step === 'credentials' && (
          <>
            <div className='flex flex-col gap-2 text-center'>
              <Link to='/' className='flex items-center gap-2 text-xs text-[#3A3A3A]/50 hover:text-[#3A3A3A] transition-colors mb-2 w-fit'>
                <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' /></svg>
                Back to website
              </Link>
              <h1 className='font-goldman text-3xl text-[#3A3A3A]'>Welcome</h1>
              <p className='font-roboto text-sm text-[#3A3A3A]/80'>Sign in to your admin account</p>
            </div>
            <form onSubmit={handleCredentials} className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                <label className='font-roboto text-sm text-[#3A3A3A]'>Username</label>
                <input type='text' value={username} onChange={e => setUsername(e.target.value)}
                  className={inputCls} placeholder='Enter username' required />
              </div>
              <div className='flex flex-col gap-2 relative'>
                <label className='font-roboto text-sm text-[#3A3A3A]'>Password</label>
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} className={inputCls}
                  placeholder='Enter password' required />
                <button type='button' className='absolute w-5 h-5 top-9 right-4 cursor-pointer'
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeHideIcon fill='#A9A9A9' /> : <EyeShowIcon fill='#A9A9A9' />}
                </button>
              </div>
              <button type='button' onClick={() => { setStep('forgot'); setStatus('') }}
                className='text-xs text-[#3A3A3A]/60 hover:text-[#3A3A3A] text-right cursor-pointer transition-colors'>
                Forgot password?
              </button>
              {status && <p className='text-sm text-center text-red-500'>{status}</p>}
              <button type='submit' disabled={loading}
                className='w-full h-10 bg-[#3A3A3A] flex justify-center items-center text-white font-roboto font-semibold rounded-lg hover:bg-[#2d2d2d] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70'>
                {loading ? <Dots /> : 'Continue'}
              </button>
            </form>
          </>
        )}

        {/* ── OTP step ── */}
        {step === 'otp' && (
          <>
            <div className='flex flex-col gap-2 text-center'>
              <div className='w-14 h-14 bg-[#3A3A3A] rounded-full flex items-center justify-center mx-auto'>
                <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                </svg>
              </div>
              <div><h2 className='font-goldman text-2xl text-[#3A3A3A]'>Verification</h2><p className='font-roboto text-sm text-[#3A3A3A]/70'>
                Enter the 6-digit code sent to <span className='font-semibold'>{maskedEmail}</span>
              </p>
            </div>
            </div>
            <form onSubmit={handleVerifyOtp} className='flex flex-col gap-5'>
              <div className='flex gap-2 justify-center' onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el}
                    type='text' inputMode='numeric' maxLength={1} value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className='w-11 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-[#3A3A3A] transition-colors' />
                ))}
              </div>
              {status && <p className='text-sm text-center text-red-500'>{status}</p>}
              <button type='submit' disabled={loading}
                className='w-full h-10 bg-[#3A3A3A] flex justify-center items-center text-white font-roboto font-semibold rounded-lg hover:bg-[#2d2d2d] transition-all cursor-pointer disabled:opacity-70'>
                {loading ? <Dots /> : 'Verify'}
              </button>
              <div className='flex items-center justify-between text-xs text-[#3A3A3A]/60'>
                <button type='button' onClick={() => { setStep('credentials'); setStatus('') }}
                  className='hover:text-[#3A3A3A] cursor-pointer transition-colors'>← Back</button>
                <button type='button' onClick={handleResend} disabled={resendTimer > 0}
                  className={`cursor-pointer transition-colors ${resendTimer > 0 ? 'opacity-40' : 'hover:text-[#3A3A3A]'}`}>
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── Forgot password ── */}
        {step === 'forgot' && (
          <>
            <div className='flex flex-col gap-2 text-center'>
              <h1 className='font-goldman text-2xl text-[#3A3A3A]'>Reset Password</h1>
            </div>

            {fpStep === 'email' && (
              <form onSubmit={handleForgotSend} className='flex flex-col gap-4'>
                <p className='text-sm text-[#3A3A3A]/70 text-center'>Enter your account email to receive a reset code.</p>
                <input type='email' value={fpEmail} onChange={e => setFpEmail(e.target.value)}
                  className={inputCls} placeholder='your@email.com' required />
                {status && <p className='text-sm text-center text-red-500'>{status}</p>}
                <button type='submit' disabled={loading}
                  className='w-full h-10 bg-[#3A3A3A] flex justify-center items-center text-white font-roboto font-semibold rounded-lg hover:bg-[#2d2d2d] transition-all cursor-pointer'>
                  {loading ? <Dots /> : 'Send Code'}
                </button>
                <button type='button' onClick={() => { setStep('credentials'); setStatus('') }}
                  className='text-xs text-center text-[#3A3A3A]/60 hover:text-[#3A3A3A] cursor-pointer'>← Back to sign in</button>
              </form>
            )}

            {fpStep === 'otp' && (
              <form onSubmit={handleFpOtpNext} className='flex flex-col gap-4'>
                <p className='text-sm text-[#3A3A3A]/70 text-center'>Enter the code sent to <span className='font-semibold'>{fpEmail}</span></p>
                <div className='flex gap-2 justify-center'>
                  {fpOtp.map((d, i) => (
                    <input key={i} ref={el => otpRefs.current[i] = el}
                      type='text' inputMode='numeric' maxLength={1} value={d}
                      onChange={e => handleFpOtpChange(i, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Backspace' && !fpOtp[i] && i > 0) otpRefs.current[i-1]?.focus() }}
                      className='w-11 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-[#3A3A3A] transition-colors' />
                  ))}
                </div>
                {status && <p className='text-sm text-center text-red-500'>{status}</p>}
                <button type='submit'
                  className='w-full h-10 bg-[#3A3A3A] flex justify-center items-center text-white font-roboto font-semibold rounded-lg hover:bg-[#2d2d2d] transition-all cursor-pointer'>
                  Continue
                </button>
              </form>
            )}

            {fpStep === 'newpass' && (
              <form onSubmit={handleFpReset} className='flex flex-col gap-4'>
                <p className='text-sm text-[#3A3A3A]/70 text-center'>Enter your new password.</p>
                <input type='password' value={fpNewPass} onChange={e => setFpNewPass(e.target.value)}
                  className={inputCls} placeholder='New password (min 8 chars)' required />
                <input type='password' value={fpConfirm} onChange={e => setFpConfirm(e.target.value)}
                  className={inputCls} placeholder='Confirm new password' required />
                {status && <p className='text-sm text-center text-red-500'>{status}</p>}
                <button type='submit' disabled={loading}
                  className='w-full h-10 bg-[#3A3A3A] flex justify-center items-center text-white font-roboto font-semibold rounded-lg hover:bg-[#2d2d2d] transition-all cursor-pointer'>
                  {loading ? <Dots /> : 'Reset Password'}
                </button>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  )
}

function Dots() {
  return (
    <div className='flex gap-1'>
      <div className='bg-white w-3 h-3 rounded-full animate-bounce' />
      <div className='bg-white w-3 h-3 rounded-full animate-bounce [animation-delay:100ms]' />
      <div className='bg-white w-3 h-3 rounded-full animate-bounce [animation-delay:200ms]' />
    </div>
  )
}

export default Login
