import BASE_URL from '../utils/api'
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useUser } from '../components/utils/UserContext'
import { useLanguage } from '../components/utils/LanguageContext'
import LidetaLogo from '../assets/LidetaLogo.svg?react'
import LoadingButton from '../components/ui/LoadingButton'
import Notification from '../components/ui/Notification'
import { validatePasswordStrength, generateStrongPassword } from '../utils/passwordHelper'

const T = {
  login:        { en: 'Sign In',         am: 'ግባ',              or: 'Seeni' },
  register:     { en: 'Create Account',  am: 'መለያ ፍጠር',        or: 'Herrega Uumi' },
  email:        { en: 'Email',           am: 'ኢሜይል',            or: 'Imeelii' },
  password:     { en: 'Password',        am: 'የይለፍ ቃል',        or: 'Jecha Icciitii' },
  first_name:   { en: 'First Name',      am: 'ስም',              or: 'Maqaa' },
  last_name:    { en: 'Last Name',       am: 'የቤተሰብ ስም',       or: 'Maqaa Abaa' },
  phone:        { en: 'Phone (optional)',am: 'ስልክ (አማራጭ)',      or: 'Bilbila (Filannoo)' },
  confirm_pass: { en: 'Confirm Password',am: 'የይለፍ ቃል ያረጋግጡ',  or: 'Jecha Mirkaneessi' },
  no_account:   { en: "Don't have an account?", am:'መለያ የለዎትም?', or:'Herrega hin qabduu?' },
  have_account: { en: 'Already have an account?', am:'መለያ አለዎ?', or:'Herrega qabdaa?' },
  suggest:      { en: 'Suggest password', am: 'የይለፍ ቃል ሀሳብ',  or: 'Jecha Gorfama' },
  track_desc:   { en: 'Track your complaints and job applications in one place.',
                  am: 'ቅሬታዎ እና የስራ ማመልከቻዎን በአንድ ቦታ ይከታተሉ።',
                  or: 'Iyyata fi gaaffii hojii keessan bakka tokkotti hordofaa.' },
  otp_title:    { en: 'Verification Code', am: 'የማረጋገጫ ኮድ',   or: 'Koodii Mirkaneessa' },
  otp_sent:     { en: 'A 6-digit code was sent to', am: '6 አሃዝ ኮድ ተልኳል ወደ', or: 'Koodii lakkoofsa 6 erga' },
  verify:       { en: 'Verify',           am: 'አረጋግጥ',          or: 'Mirkaneessi' },
  resend:       { en: 'Resend code',      am: 'ኮድ እንደገና ላክ',   or: 'Koodii ergii' },
  resend_in:    { en: 'Resend in',        am: 'እንደገና ላክ',       or: 'Ergii' },
  forgot_pass:  { en: 'Forgot password?', am: 'የይለፍ ቃል ረሱ?',   or: 'Jecha irraanfatte?' },
  reset_pass:   { en: 'Reset Password',   am: 'የይለፍ ቃል ቀይሩ',   or: 'Jecha haaromsaa' },
  new_pass:     { en: 'New Password',     am: 'አዲስ የይለፍ ቃል',   or: 'Jecha Haaraa' },
}

const StrengthBar = ({ password }) => {
  if (!password) return null
  const { score } = validatePasswordStrength(password)
  const colors = ['bg-red-400','bg-orange-400','bg-yellow-400','bg-lime-400','bg-green-500']
  const labels = ['Very Weak','Weak','Fair','Strong','Very Strong']
  const idx = Math.min(score ?? 0, 4)
  return (
    <div className='mt-1.5'>
      <div className='flex gap-1'>{[0,1,2,3,4].map(i=><div key={i} className={`h-1 flex-1 rounded-full ${i<=idx?colors[idx]:'bg-gray-200'} transition-all`}/>)}</div>
      <p className={`text-xs mt-0.5 ${idx<2?'text-red-500':idx<4?'text-yellow-600':'text-green-600'}`}>{labels[idx]}</p>
    </div>
  )
}

function OtpInput({ otp, setOtp, refs, onPaste }) {
  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) refs.current[i+1]?.focus()
  }
  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i-1]?.focus()
  }
  return (
    <div className='flex gap-2 justify-center' onPaste={onPaste}>
      {otp.map((d, i) => (
        <input key={i} ref={el => refs.current[i] = el}
          type='text' inputMode='numeric' maxLength={1} value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className='w-11 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#3A3A3A] transition-colors' />
      ))}
    </div>
  )
}

function UserAuth() {
  const { login } = useUser()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const nextPath = new URLSearchParams(location.search).get('next') || '/account'
  const t = (k) => T[k][language] || T[k].en

  // main step: 'login' | 'register' | 'otp' | 'verify_email' | 'forgot' | 'reset_otp' | 'reset_new'
  const [step,         setStep]         = useState('login')
  const [isLoading,    setIsLoading]    = useState(false)
  const [notification, setNotif]        = useState({ isOpen:false, message:'', type:'success' })
  const notify = (message, type='success') => setNotif({ isOpen:true, message, type })

  const [form,    setForm]    = useState({ first_name:'', last_name:'', email:'', phone:'', password:'', confirmPassword:'' })
  const [showPass,setShowPass]= useState(false)

  // OTP state
  const [otp,          setOtp]          = useState(['','','','','',''])
  const [pendingEmail, setPendingEmail] = useState('')
  const [pendingType,  setPendingType]  = useState('') // '2fa' | 'verify_email'
  const [resendTimer,  setResendTimer]  = useState(0)
  const otpRefs = useRef([])

  // Forgot password
  const [fpEmail,   setFpEmail]   = useState('')
  const [fpOtp,     setFpOtp]     = useState(['','','','','',''])
  const [fpNewPass, setFpNewPass] = useState('')
  const [fpConfirm, setFpConfirm] = useState('')
  const fpRefs = useRef([])

  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const pasteHandler = (setFn) => (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    if (pasted.length === 6) { setFn(pasted.split('')); otpRefs.current[5]?.focus() }
  }

  const set = k => e => setForm(p => ({...p, [k]: e.target.value}))

  const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault(); setIsLoading(true)
    try {
      const res  = await fetch(`${BASE_URL}/api/user/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: form.email, password: form.password }) })
      const data = await res.json()
      if (!res.ok) { notify(data.error, 'error'); return }
      setPendingEmail(form.email); setPendingType('2fa'); setOtp(['','','','','','']); setResendTimer(60); setStep('otp')
    } catch { notify('Network error', 'error') }
    finally { setIsLoading(false) }
  }

  // ── Register ──────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { notify('Passwords do not match', 'error'); return }
    const { isValid, feedback } = validatePasswordStrength(form.password)
    if (!isValid) { notify(`Weak password: ${feedback}`, 'error'); return }
    setIsLoading(true)
    try {
      const res  = await fetch(`${BASE_URL}/api/user/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ first_name:form.first_name, last_name:form.last_name, email:form.email, phone:form.phone, password:form.password }) })
      const data = await res.json()
      if (!res.ok) { notify(data.error, 'error'); return }
      login(data.user, data.token)
      // Redirect to email verification OTP step
      setPendingEmail(form.email); setPendingType('verify_email'); setOtp(['','','','','','']); setResendTimer(60); setStep('verify_email')
    } catch { notify('Network error', 'error') }
    finally { setIsLoading(false) }
  }

  // ── Verify OTP (2FA login) ────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { notify('Enter all 6 digits', 'error'); return }
    setIsLoading(true)
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/verify-otp`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: pendingEmail, otp: code, entityType: 'user' }) })
      const data = await res.json()
      if (!res.ok) { notify(data.error, 'error'); return }
      login(data.user, data.token)
      navigate(nextPath)
    } catch { notify('Network error', 'error') }
    finally { setIsLoading(false) }
  }

  // ── Verify email OTP (post-register) ─────────────────────────────────────
  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { notify('Enter all 6 digits', 'error'); return }
    setIsLoading(true)
    try {
      const token = localStorage.getItem('userToken')
      const res   = await fetch(`${BASE_URL}/api/auth/verify-email`, { method:'POST', headers:{'Content-Type':'application/json', authorization:`Bearer ${token}`}, body: JSON.stringify({ otp: code }) })
      const data  = await res.json()
      if (!res.ok) { notify(data.error, 'error'); return }
      navigate(nextPath)
    } catch { notify('Network error', 'error') }
    finally { setIsLoading(false) }
  }

  const handleResend = async (purpose, email) => {
    if (resendTimer > 0) return
    try {
      await fetch(`${BASE_URL}/api/auth/resend-otp`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, entityType:'user', purpose }) })
      setOtp(['','','','','','']); setResendTimer(60); notify('New code sent!')
    } catch { notify('Failed to resend', 'error') }
  }

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgotSend = async (e) => {
    e.preventDefault(); setIsLoading(true)
    try {
      await fetch(`${BASE_URL}/api/auth/forgot-password`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: fpEmail, entityType:'user' }) })
      setFpOtp(['','','','','','']); setResendTimer(60); setStep('reset_otp')
    } catch { notify('Failed', 'error') }
    finally { setIsLoading(false) }
  }

  const handleResetOtp = (e) => {
    e.preventDefault()
    if (fpOtp.join('').length < 6) { notify('Enter all 6 digits', 'error'); return }
    setStep('reset_new')
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (fpNewPass !== fpConfirm) { notify('Passwords do not match', 'error'); return }
    if (fpNewPass.length < 8) { notify('Password must be at least 8 characters', 'error'); return }
    setIsLoading(true)
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/reset-password`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: fpEmail, otp: fpOtp.join(''), newPassword: fpNewPass, entityType:'user' }) })
      const data = await res.json()
      if (!res.ok) { notify(data.error, 'error'); return }
      notify('Password reset! Please sign in.'); setStep('login')
    } catch { notify('Reset failed', 'error') }
    finally { setIsLoading(false) }
  }

  const ResendRow = ({ purpose, email }) => (
    <div className='flex items-center justify-between text-xs text-gray-400'>
      <button onClick={() => setStep('login')} className='hover:text-gray-700 cursor-pointer'>← Back</button>
      <button onClick={() => handleResend(purpose, email)} disabled={resendTimer > 0}
        className={`cursor-pointer ${resendTimer > 0 ? 'opacity-40' : 'hover:text-gray-700'}`}>
        {resendTimer > 0 ? `${t('resend_in')} ${resendTimer}s` : t('resend')}
      </button>
    </div>
  )

  return (
    <div className='min-h-screen bg-[#F6F6F6] flex flex-col items-center justify-center px-4 py-12 font-jost'>
      <Notification isOpen={notification.isOpen} message={notification.message} type={notification.type} onClose={() => setNotif(n=>({...n,isOpen:false}))} />
      <Link to='/' className='mb-8'><LidetaLogo className='w-36' /></Link>

      <div className='w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8'>

        {/* ── Login / Register ── */}
        {(step === 'login' || step === 'register') && (
          <>
            <div className='flex bg-gray-100 p-1 rounded-xl mb-4'>
              {['login','register'].map(m => (
                <button key={m} onClick={() => setStep(m)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${step===m?'bg-white shadow-sm text-[#3A3A3A]':'text-gray-500 hover:text-gray-700'}`}>
                  {m==='login' ? t('login') : t('register')}
                </button>
              ))}
            </div>
            <p className='text-sm text-gray-500 mb-5'>{t('track_desc')}</p>
            <form onSubmit={step==='login' ? handleLogin : handleRegister} className='space-y-4'>
              {step === 'register' && (
                <>
                  <div className='grid grid-cols-2 gap-3'>
                    <div><label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>{t('first_name')} <span className='text-red-400'>*</span></label><input type='text' value={form.first_name} onChange={set('first_name')} required className={inputCls} /></div>
                    <div><label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>{t('last_name')} <span className='text-red-400'>*</span></label><input type='text' value={form.last_name} onChange={set('last_name')} required className={inputCls} /></div>
                  </div>
                  <div><label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>{t('phone')}</label><input type='tel' value={form.phone} onChange={set('phone')} className={inputCls} /></div>
                </>
              )}
              <div><label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>{t('email')} <span className='text-red-400'>*</span></label><input type='email' value={form.email} onChange={set('email')} required className={inputCls} /></div>
              <div>
                <div className='flex justify-between items-center mb-1'>
                  <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>{t('password')} <span className='text-red-400'>*</span></label>
                  {step==='register' && <button type='button' onClick={() => { const p=generateStrongPassword(); setForm(f=>({...f,password:p,confirmPassword:p})) }} className='text-xs text-blue-600 hover:underline cursor-pointer'>{t('suggest')}</button>}
                </div>
                <div className='relative'>
                  <input type={showPass?'text':'password'} value={form.password} onChange={set('password')} required className={inputCls+' pr-14'} />
                  <button type='button' onClick={()=>setShowPass(!showPass)} className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 cursor-pointer'>{showPass?'Hide':'Show'}</button>
                </div>
                {step==='register' && <StrengthBar password={form.password} />}
              </div>
              {step==='register' && (
                <div><label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>{t('confirm_pass')} <span className='text-red-400'>*</span></label><input type='password' value={form.confirmPassword} onChange={set('confirmPassword')} required className={inputCls} />{form.confirmPassword && form.password !== form.confirmPassword && <p className='text-xs text-red-500 mt-1'>Passwords do not match</p>}</div>
              )}
              {step==='login' && <button type='button' onClick={() => setStep('forgot')} className='text-xs text-gray-400 hover:text-gray-700 cursor-pointer w-full text-right'>{t('forgot_pass')}</button>}
              <LoadingButton isLoading={isLoading} className='w-full py-3 bg-[#3A3A3A] text-white font-bold rounded-xl hover:bg-black transition-colors mt-2'>
                {step==='login' ? t('login') : t('register')}
              </LoadingButton>
            </form>
          </>
        )}

        {/* ── 2FA OTP (post-login) ── */}
        {step === 'otp' && (
          <div className='space-y-5 text-center'>
            <div className='w-14 h-14 bg-[#3A3A3A] rounded-full flex items-center justify-center mx-auto'>
              <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' /></svg>
            </div>
            <div><h2 className='text-xl font-bold text-[#3A3A3A]'>{t('otp_title')}</h2><p className='text-sm text-gray-500 mt-1'>{t('otp_sent')} <strong>{pendingEmail}</strong></p></div>
            <form onSubmit={handleVerifyOtp} className='space-y-4'>
              <OtpInput otp={otp} setOtp={setOtp} refs={otpRefs} onPaste={pasteHandler(setOtp)} />
              <LoadingButton isLoading={isLoading} className='w-full py-3 bg-[#3A3A3A] text-white font-bold rounded-xl hover:bg-black transition-colors'>{t('verify')}</LoadingButton>
              <ResendRow purpose='2fa_login' email={pendingEmail} />
            </form>
          </div>
        )}

        {/* ── Email verification OTP (post-register) ── */}
        {step === 'verify_email' && (
          <div className='space-y-5 text-center'>
            <div className='w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mx-auto'>
              <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' /></svg>
            </div>
            <div><h2 className='text-xl font-bold text-[#3A3A3A]'>Verify your email</h2><p className='text-sm text-gray-500 mt-1'>We sent a code to <strong>{pendingEmail}</strong></p></div>
            <form onSubmit={handleVerifyEmail} className='space-y-4'>
              <OtpInput otp={otp} setOtp={setOtp} refs={otpRefs} onPaste={pasteHandler(setOtp)} />
              <LoadingButton isLoading={isLoading} className='w-full py-3 bg-[#3A3A3A] text-white font-bold rounded-xl hover:bg-black transition-colors'>{t('verify')}</LoadingButton>
              <ResendRow purpose='verify_email' email={pendingEmail} />
            </form>
            <button onClick={() => navigate(nextPath)} className='text-xs text-gray-400 hover:text-gray-600 cursor-pointer'>Skip for now →</button>
          </div>
        )}

        {/* ── Forgot password ── */}
        {step === 'forgot' && (
          <div className='space-y-5'>
            <div className='text-center'><h2 className='text-xl font-bold text-[#3A3A3A]'>{t('reset_pass')}</h2><p className='text-sm text-gray-500 mt-1'>Enter your email to receive a reset code.</p></div>
            <form onSubmit={handleForgotSend} className='space-y-4'>
              <input type='email' value={fpEmail} onChange={e=>setFpEmail(e.target.value)} required className={inputCls} placeholder='your@email.com' />
              <LoadingButton isLoading={isLoading} className='w-full py-3 bg-[#3A3A3A] text-white font-bold rounded-xl hover:bg-black transition-colors'>Send Code</LoadingButton>
              <button type='button' onClick={()=>setStep('login')} className='w-full text-center text-xs text-gray-400 hover:text-gray-700 cursor-pointer'>← Back to sign in</button>
            </form>
          </div>
        )}

        {/* ── Reset OTP ── */}
        {step === 'reset_otp' && (
          <div className='space-y-5 text-center'>
            <div><h2 className='text-xl font-bold text-[#3A3A3A]'>Enter Reset Code</h2><p className='text-sm text-gray-500 mt-1'>Sent to <strong>{fpEmail}</strong></p></div>
            <form onSubmit={handleResetOtp} className='space-y-4'>
              <OtpInput otp={fpOtp} setOtp={setFpOtp} refs={fpRefs} onPaste={pasteHandler(setFpOtp)} />
              <button type='submit' className='w-full py-3 bg-[#3A3A3A] text-white font-bold rounded-xl hover:bg-black transition-colors'>Continue</button>
              <div className='flex justify-between text-xs text-gray-400'>
                <button onClick={()=>setStep('forgot')} className='hover:text-gray-700 cursor-pointer'>← Back</button>
                <button onClick={()=>handleResend('reset_password', fpEmail)} disabled={resendTimer>0} className={`cursor-pointer ${resendTimer>0?'opacity-40':'hover:text-gray-700'}`}>{resendTimer>0?`Resend in ${resendTimer}s`:'Resend'}</button>
              </div>
            </form>
          </div>
        )}

        {/* ── New password ── */}
        {step === 'reset_new' && (
          <div className='space-y-5'>
            <div className='text-center'><h2 className='text-xl font-bold text-[#3A3A3A]'>New Password</h2></div>
            <form onSubmit={handleResetPassword} className='space-y-4'>
              <div><label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>{t('new_pass')}</label><input type='password' value={fpNewPass} onChange={e=>setFpNewPass(e.target.value)} required className={inputCls} /></div>
              <div><label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>Confirm</label><input type='password' value={fpConfirm} onChange={e=>setFpConfirm(e.target.value)} required className={inputCls} />{fpConfirm && fpNewPass!==fpConfirm && <p className='text-xs text-red-500 mt-1'>Passwords do not match</p>}</div>
              <LoadingButton isLoading={isLoading} className='w-full py-3 bg-[#3A3A3A] text-white font-bold rounded-xl hover:bg-black transition-colors'>Reset Password</LoadingButton>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

export default UserAuth
