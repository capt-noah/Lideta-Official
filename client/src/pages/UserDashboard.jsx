import BASE_URL from '../utils/api'
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../components/utils/UserContext'
import { useLanguage } from '../components/utils/LanguageContext'
import Status from '../components/ui/Status.jsx'
import Notification from '../components/ui/Notification'
import LoadingButton from '../components/ui/LoadingButton'
import LidetaLogo from '../assets/LidetaLogo.svg?react'
import EditIcon from '../assets/icons/edit_icon.svg?react'
import FileIcon from '../assets/icons/file_icon.svg?react'
import ComplaintIcon from '../assets/icons/compliant_icon2.svg?react'
import { validatePasswordStrength, generateStrongPassword } from '../utils/passwordHelper'

const T = {
  dashboard:   { en: 'My Account',          am: 'መለያዬ',                  or: 'Herrega Koo' },
  complaints:  { en: 'My Complaints',        am: 'ቅሬታዎቼ',                 or: 'Iyyata Koo' },
  applications:{ en: 'My Applications',      am: 'ማመልከቻዎቼ',              or: 'Gaaffii Koo' },
  profile:     { en: 'Profile',              am: 'መገለጫ',                  or: 'Ibsa' },
  logout:      { en: 'Sign Out',             am: 'ውጣ',                     or: 'Ba\'i' },
  no_complaints:{ en: 'No complaints yet',   am: 'ቅሬታ የለም',              or: 'Iyyata hin jiru' },
  no_apps:     { en: 'No applications yet',  am: 'ማመልከቻ የለም',            or: 'Gaaffii hin jiru' },
  submit_one:  { en: 'Submit a complaint',   am: 'ቅሬታ ያቅርቡ',             or: 'Iyyata galchi' },
  apply_now:   { en: 'Browse vacancies',     am: 'ክፍት ቦታዎችን ፈልጉ',       or: 'Bakka Duwwaa Barbaadi' },
  type:        { en: 'Sector',               am: 'ዘርፍ',                   or: 'Damee' },
  date:        { en: 'Submitted',            am: 'የቀረበ',                  or: 'Galii' },
  status:      { en: 'Status',               am: 'ሁኔታ',                   or: 'Haala' },
  position:    { en: 'Position',             am: 'ቦታ',                    or: 'Sadarkaa' },
  location:    { en: 'Location',             am: 'አካባቢ',                  or: 'Bakka' },
  applied:     { en: 'Applied',              am: 'ተልኳል',                  or: 'Ergame' },
  save:        { en: 'Save Changes',         am: 'ለውጦችን አስቀምጥ',          or: 'Jijjiirama Kuusi' },
  cancel:      { en: 'Cancel',               am: 'ሰርዝ',                   or: 'Haqi' },
  current_pass:{ en: 'Current Password',     am: 'አሁን ያለ የይለፍ ቃል',      or: 'Jecha Amma Jiru' },
  new_pass:    { en: 'New Password',         am: 'አዲስ የይለፍ ቃል',          or: 'Jecha Haaraa' },
  confirm_pass:{ en: 'Confirm Password',     am: 'የይለፍ ቃልን አረጋግጥ',     or: 'Jecha Mirkaneessi' },
  suggest:     { en: 'Suggest password',     am: 'የይለፍ ቃል ሀሳብ',         or: 'Gorfama' },
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

// ── Status step tracker ────────────────────────────────────────────────────────
const COMPLAINT_STEPS = ['assigning','in progress','resolved']
const APP_STEPS       = ['submitted','reviewing','accepted']

function StepTracker({ steps, current }) {
  const norm = (s) => (s||'').toLowerCase().replace('cancelled','canceled')
  const rejected = norm(current) === 'rejected' || norm(current) === 'canceled'
  const curIdx = rejected ? -1 : steps.findIndex(s => norm(s) === norm(current))

  return (
    <div className='flex items-center gap-1 mt-3'>
      {steps.map((step, i) => {
        const done    = !rejected && i <= curIdx
        const active  = !rejected && i === curIdx
        return (
          <div key={step} className='flex items-center flex-1'>
            <div className='flex flex-col items-center w-full'>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-[#3A3A3A] text-white' : 'bg-gray-200 text-gray-400'} ${active ? 'ring-2 ring-offset-1 ring-[#3A3A3A]' : ''}`}>
                {done && !active ? '✓' : i+1}
              </div>
              <span className={`text-xs mt-1 capitalize text-center leading-tight ${done ? 'text-[#3A3A3A] font-semibold' : 'text-gray-400'}`}>{step}</span>
            </div>
            {i < steps.length-1 && <div className={`h-0.5 flex-1 mb-5 ${i < curIdx && !rejected ? 'bg-[#3A3A3A]' : 'bg-gray-200'} transition-all`} />}
          </div>
        )
      })}
      {rejected && <span className='ml-2 text-xs font-bold text-red-500 capitalize'>{current}</span>}
    </div>
  )
}

function UserDashboard() {
  const { user, userToken, logout, login } = useUser()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const t = (k) => T[k][language] || T[k].en

  const [activeTab,    setActiveTab]    = useState('complaints')
  const [complaints,   setComplaints]   = useState([])
  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [notification, setNotif]        = useState({ isOpen:false, message:'', type:'success' })
  const notify = (msg, type='success') => setNotif({ isOpen:true, message:msg, type })
  const [verifyOtp,    setVerifyOtp]    = useState(['','','','','',''])
  const [showVerify,   setShowVerify]   = useState(false)
  const [verifying,    setVerifying]    = useState(false)
  const verifyRefs = useRef([])

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingPass,    setEditingPass]    = useState(false)
  const [isSaving,       setIsSaving]       = useState(false)
  const [profileForm, setProfileForm] = useState({ first_name:'', last_name:'', phone:'' })
  const [passForm,    setPassForm]    = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [showNewPass, setShowNewPass] = useState(false)

  useEffect(() => {
    if (user) setProfileForm({ first_name: user.first_name||'', last_name: user.last_name||'', phone: user.phone||'' })
  }, [user])

  useEffect(() => {
    if (!userToken) { navigate('/account/auth'); return }
    fetch(`${BASE_URL}/api/user/dashboard`, { headers: { authorization: `Bearer ${userToken}` } })
      .then(r => r.json())
      .then(data => { setComplaints(data.complaints||[]); setApplications(data.applications||[]) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userToken])

  const handleSendVerification = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/send-verification`, { method:'POST', headers:{ authorization:`Bearer ${userToken}` } })
      if (!res.ok) throw new Error()
      setShowVerify(true); notify('Verification code sent to your email!')
    } catch { notify('Failed to send code', 'error') }
  }

  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    const code = verifyOtp.join('')
    if (code.length < 6) { notify('Enter all 6 digits', 'error'); return }
    setVerifying(true)
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/verify-email`, { method:'POST', headers:{'Content-Type':'application/json', authorization:`Bearer ${userToken}`}, body: JSON.stringify({ otp: code }) })
      const data = await res.json()
      if (!res.ok) { notify(data.error, 'error'); return }
      login(data, userToken); setShowVerify(false); notify('Email verified!')
    } catch { notify('Verification failed', 'error') }
    finally { setVerifying(false) }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`${BASE_URL}/api/user/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json', authorization: `Bearer ${userToken}` },
        body: JSON.stringify(profileForm)
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      const updated = await res.json()
      login(updated, userToken)
      setEditingProfile(false)
      notify('Profile updated!')
    } catch (e) { notify(e.message, 'error') }
    finally { setIsSaving(false) }
  }

  const handleSavePassword = async () => {
    if (passForm.newPassword !== passForm.confirmPassword) { notify('Passwords do not match', 'error'); return }
    const { isValid, feedback } = validatePasswordStrength(passForm.newPassword)
    if (!isValid) { notify(`Weak password: ${feedback}`, 'error'); return }
    setIsSaving(true)
    try {
      const res = await fetch(`${BASE_URL}/api/user/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json', authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      setPassForm({ currentPassword:'', newPassword:'', confirmPassword:'' })
      setEditingPass(false)
      notify('Password updated!')
    } catch (e) { notify(e.message, 'error') }
    finally { setIsSaving(false) }
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'
  const tabCls   = (t) => `px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all cursor-pointer ${activeTab===t ? 'bg-white text-[#3A3A3A] border border-b-white border-gray-200 shadow-sm -mb-px' : 'text-gray-500 hover:text-gray-700'}`

  if (loading) return (
    <div className='min-h-screen bg-[#F6F6F6] flex items-center justify-center'>
      <div className='flex gap-1'>
        {[0,1,2].map(i=><div key={i} className='w-3 h-3 bg-[#3A3A3A] rounded-full animate-bounce' style={{animationDelay:`${i*100}ms`}}/>)}
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-[#F6F6F6] font-jost'>
      <Notification isOpen={notification.isOpen} message={notification.message} type={notification.type} onClose={() => setNotif(n=>({...n,isOpen:false}))} />

      {/* Top bar */}
      <div className='bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30'>
        <Link to='/'><LidetaLogo className='w-28' /></Link>
        <div className='flex items-center gap-4'>
          <span className='text-sm text-gray-600 hidden sm:block'>{user?.first_name} {user?.last_name}</span>
          <button onClick={() => { logout(); navigate('/') }}
            className='text-sm px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors text-gray-600'>
            {t('logout')}
          </button>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold text-[#3A3A3A] mb-6'>{t('dashboard')}</h1>

        {/* Email verification banner */}
        {user && !user.email_verified && (
          <div className='mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4'>
            {!showVerify ? (
              <div className='flex items-center gap-3'>
                <span className='text-amber-500 text-xl'>✉️</span>
                <div className='flex-1'>
                  <p className='font-semibold text-sm text-amber-800'>Verify your email address</p>
                  <p className='text-xs text-amber-600 mt-0.5'>Your email <strong>{user.email}</strong> is not verified yet.</p>
                </div>
                <button onClick={handleSendVerification}
                  className='px-4 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-full hover:bg-amber-600 transition-colors cursor-pointer'>
                  Verify Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyEmail} className='space-y-3'>
                <p className='text-sm font-semibold text-amber-800'>Enter the 6-digit code sent to {user.email}</p>
                <div className='flex gap-2'>
                  {verifyOtp.map((d, i) => (
                    <input key={i} ref={el => verifyRefs.current[i] = el}
                      type='text' inputMode='numeric' maxLength={1} value={d}
                      onChange={e => {
                        if (!/^\d?$/.test(e.target.value)) return
                        const next = [...verifyOtp]; next[i] = e.target.value; setVerifyOtp(next)
                        if (e.target.value && i < 5) verifyRefs.current[i+1]?.focus()
                      }}
                      onKeyDown={e => { if (e.key==='Backspace' && !verifyOtp[i] && i>0) verifyRefs.current[i-1]?.focus() }}
                      className='w-10 h-10 text-center text-lg font-bold border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-500' />
                  ))}
                  <button type='submit' disabled={verifying}
                    className='ml-2 px-4 py-1.5 bg-[#3A3A3A] text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors cursor-pointer'>
                    {verifying ? '…' : 'Confirm'}
                  </button>
                  <button type='button' onClick={() => setShowVerify(false)}
                    className='px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer'>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className='flex gap-1 border-b border-gray-200 mb-6'>
          {['complaints','applications','profile'].map(tab => (
            <button key={tab} className={tabCls(tab)} onClick={() => setActiveTab(tab)}>
              {t(tab)}
            </button>
          ))}
        </div>

        {/* ── COMPLAINTS ── */}
        {activeTab === 'complaints' && (
          <div className='space-y-4'>
            {complaints.length === 0 ? (
              <div className='bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center text-gray-400'>
                <ComplaintIcon className='w-14 h-14 mb-4 opacity-30' />
                <p className='font-medium text-lg'>{t('no_complaints')}</p>
                <Link to='/compliants' className='mt-4 px-5 py-2 bg-[#3A3A3A] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors'>
                  {t('submit_one')}
                </Link>
              </div>
            ) : complaints.map(c => (
              <div key={c.id} className='bg-white border border-gray-200 rounded-2xl p-5 shadow-sm'>
                <div className='flex items-start justify-between mb-2'>
                  <div>
                    <p className='font-bold text-[#3A3A3A]'>{c.type || '—'}</p>
                    <p className='text-xs text-gray-400 mt-0.5'>{t('date')}: {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <Status status={c.status} />
                </div>
                <p className='text-sm text-gray-600 line-clamp-2 mb-3'>{c.description}</p>
                <StepTracker steps={COMPLAINT_STEPS} current={c.status} />
              </div>
            ))}
          </div>
        )}

        {/* ── APPLICATIONS ── */}
        {activeTab === 'applications' && (
          <div className='space-y-4'>
            {applications.length === 0 ? (
              <div className='bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center text-gray-400'>
                <FileIcon className='w-14 h-14 mb-4 opacity-30' />
                <p className='font-medium text-lg'>{t('no_apps')}</p>
                <Link to='/vaccancy' className='mt-4 px-5 py-2 bg-[#3A3A3A] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors'>
                  {t('apply_now')}
                </Link>
              </div>
            ) : applications.map(a => (
              <div key={a.id} className='bg-white border border-gray-200 rounded-2xl p-5 shadow-sm'>
                <div className='flex items-start justify-between mb-2'>
                  <div>
                    <p className='font-bold text-[#3A3A3A]'>{a.vacancy_title || '—'}</p>
                    <p className='text-xs text-gray-500 mt-0.5'>{a.location} · {a.job_type} · {a.category}</p>
                    <p className='text-xs text-gray-400 mt-0.5'>{t('applied')}: {new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                  <Status status={a.status} />
                </div>
                <StepTracker steps={APP_STEPS} current={a.status} />
                {a.cv_path && (
                  <a href={a.cv_path} target='_blank' rel='noreferrer'
                    className='inline-flex items-center gap-1.5 mt-3 text-xs text-blue-600 hover:underline'>
                    <FileIcon className='w-3.5 h-3.5' /> View submitted CV
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeTab === 'profile' && (
          <div className='space-y-4 max-w-lg'>
            {/* Personal info */}
            <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
              <div className='flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100'>
                <h3 className='font-bold text-[#3A3A3A]'>Personal Information</h3>
                <button onClick={() => setEditingProfile(!editingProfile)} className='p-1.5 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors'>
                  <EditIcon className='w-4 h-4 text-gray-500' />
                </button>
              </div>
              <div className='divide-y divide-gray-50 px-6'>
                {[['First Name','first_name'],['Last Name','last_name'],['Phone','phone']].map(([label,key]) => (
                  <div key={key} className='flex justify-between items-center py-3.5'>
                    <span className='text-sm text-gray-500'>{label}</span>
                    {editingProfile
                      ? <input type='text' value={profileForm[key]} onChange={e=>setProfileForm(p=>({...p,[key]:e.target.value}))}
                          className='w-52 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]' />
                      : <span className='font-semibold text-sm text-[#3A3A3A]'>{user?.[key] || '—'}</span>
                    }
                  </div>
                ))}
                <div className='flex justify-between items-center py-3.5'>
                  <span className='text-sm text-gray-500'>Email</span>
                  <span className='font-semibold text-sm text-[#3A3A3A]'>{user?.email}</span>
                </div>
              </div>
              {editingProfile && (
                <div className='px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2'>
                  <button onClick={() => { setEditingProfile(false); setProfileForm({ first_name: user?.first_name||'', last_name: user?.last_name||'', phone: user?.phone||'' }) }}
                    className='px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer'>{t('cancel')}</button>
                  <LoadingButton isLoading={isSaving} onClick={handleSaveProfile}
                    className='px-5 py-2 bg-[#3A3A3A] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors'>
                    {t('save')}
                  </LoadingButton>
                </div>
              )}
            </div>

            {/* Password */}
            <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
              <div className='flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100'>
                <h3 className='font-bold text-[#3A3A3A]'>Password</h3>
                <button onClick={() => setEditingPass(!editingPass)} className='p-1.5 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors'>
                  <EditIcon className='w-4 h-4 text-gray-500' />
                </button>
              </div>
              {editingPass ? (
                <div className='px-6 py-5 space-y-4'>
                  <div>
                    <label className={labelCls}>{t('current_pass')}</label>
                    <input type='password' value={passForm.currentPassword} onChange={e=>setPassForm(p=>({...p,currentPassword:e.target.value}))} className={inputCls} />
                  </div>
                  <div>
                    <div className='flex justify-between items-center mb-1'>
                      <label className={labelCls.replace('mb-1','')}>{t('new_pass')}</label>
                      <button type='button' onClick={() => { const p=generateStrongPassword(); setPassForm(prev=>({...prev,newPassword:p,confirmPassword:p})) }}
                        className='text-xs text-blue-600 hover:underline cursor-pointer'>{t('suggest')}</button>
                    </div>
                    <div className='relative'>
                      <input type={showNewPass?'text':'password'} value={passForm.newPassword} onChange={e=>setPassForm(p=>({...p,newPassword:e.target.value}))} className={inputCls+' pr-14'} />
                      <button type='button' onClick={()=>setShowNewPass(!showNewPass)} className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 cursor-pointer'>{showNewPass?'Hide':'Show'}</button>
                    </div>
                    <StrengthBar password={passForm.newPassword} />
                  </div>
                  <div>
                    <label className={labelCls}>{t('confirm_pass')}</label>
                    <input type='password' value={passForm.confirmPassword} onChange={e=>setPassForm(p=>({...p,confirmPassword:e.target.value}))} className={inputCls} />
                    {passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword && <p className='text-xs text-red-500 mt-1'>Passwords do not match</p>}
                  </div>
                  <div className='flex justify-end gap-2 pt-1'>
                    <button onClick={() => { setEditingPass(false); setPassForm({currentPassword:'',newPassword:'',confirmPassword:''}) }}
                      className='px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer'>{t('cancel')}</button>
                    <LoadingButton isLoading={isSaving} onClick={handleSavePassword}
                      className='px-5 py-2 bg-[#3A3A3A] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors'>
                      {t('save')}
                    </LoadingButton>
                  </div>
                </div>
              ) : (
                <div className='px-6 py-4'><p className='text-sm text-gray-400 italic'>Password is hidden for security</p></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDashboard
