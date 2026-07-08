import { useState, useEffect, useCallback, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { adminContext } from '../../components/utils/AdminContext'
import EditIcon from '../../assets/icons/edit_icon.svg?react'
import CopyIcon from '../../assets/icons/copy_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon.svg?react'
import { getRoleLabel } from '../../utils/roleLabels'
import { validatePasswordStrength, generateStrongPassword } from '../../utils/passwordHelper'
import ProfileSkeletons from '../../components/ui/ProfileSkeletons'
import Notification from '../../components/ui/Notification'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import ArrowRight from '../../assets/icons/arrow_right.svg?react'

const ROLE_COLORS = {
  superadmin:      'bg-purple-100 text-purple-700',
  admin:           'bg-gray-100 text-gray-700',
  news_admin:      'bg-blue-100 text-blue-700',
  event_admin:     'bg-green-100 text-green-700',
  complaint_admin: 'bg-orange-100 text-orange-700',
  vacancy_admin:   'bg-teal-100 text-teal-700',
}

const VALID_ROLES = ['admin', 'complaint_admin', 'event_admin', 'news_admin', 'vacancy_admin', 'superadmin']

const RoleBadge = ({ role }) => (
  <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-600'}`}>
    {getRoleLabel(role)}
  </span>
)

const StrengthBar = ({ password }) => {
  if (!password) return null
  const { score } = validatePasswordStrength(password)
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-400', 'bg-green-500']
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const idx = Math.min(score ?? 0, 4)
  return (
    <div className='mt-1.5'>
      <div className='flex gap-1'>
        {[0,1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= idx ? colors[idx] : 'bg-gray-200'} transition-all`} />
        ))}
      </div>
      <p className={`text-xs mt-0.5 ${idx < 2 ? 'text-red-500' : idx < 4 ? 'text-yellow-600' : 'text-green-600'}`}>
        {labels[idx]}
      </p>
    </div>
  )
}

function SuperAdminProfile() {
  const { admin, setAdmin, token } = useContext(adminContext)
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTab,      setActiveTab]      = useState(location.state?.activeTab || 'profile')
  const [isSaving,       setIsSaving]       = useState(false)
  const [notification,   setNotification]   = useState({ isOpen: false, message: '', type: 'success' })
  const notify = (message, type = 'success') => setNotification({ isOpen: true, message, type })

  // ── My Profile ───────────────────────────────────────────────────────────────
  const [isEditingPersonal,  setIsEditingPersonal]  = useState(false)
  const [isEditingAdmin,     setIsEditingAdmin]      = useState(false)
  const [isEditingPassword,  setIsEditingPassword]   = useState(false)
  const [showPassword,       setShowPassword]        = useState(false)
  const [personalInfo, setPersonalInfo] = useState({ first_name:'', last_name:'', gender:'', residency:'', phone_number:'', email:'' })
  const [adminInfo,    setAdminInfo]    = useState({ username:'', role:'' })
  const [passwordInfo, setPasswordInfo] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })

  useEffect(() => {
    if (admin) {
      setPersonalInfo({ first_name: admin.first_name||'', last_name: admin.last_name||'', gender: admin.gender||'', residency: admin.residency||'', phone_number: admin.phone_number||'', email: admin.email||'' })
      setAdminInfo({ username: admin.username||'', role: admin.role||'superadmin' })
    }
  }, [admin])

  const handleSavePersonalInfo = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/update/profile', { method:'POST', headers:{ 'Content-Type':'application/json', authorization:`Bearer ${token}` }, body: JSON.stringify(personalInfo) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      setAdmin(await res.json()); setIsEditingPersonal(false); notify('Personal information updated!')
    } catch(e) { notify(e.message, 'error') } finally { setIsSaving(false) }
  }

  const handleSaveAdminInfo = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/update/admin-info', { method:'POST', headers:{ 'Content-Type':'application/json', authorization:`Bearer ${token}` }, body: JSON.stringify(adminInfo) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      setAdmin(await res.json()); setIsEditingAdmin(false); notify('Account info updated!')
    } catch(e) { notify(e.message, 'error') } finally { setIsSaving(false) }
  }

  const handleSavePassword = async () => {
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) { notify('Passwords do not match', 'error'); return }
    const { isValid, feedback } = validatePasswordStrength(passwordInfo.newPassword)
    if (!isValid) { notify(`Weak password: ${feedback}`, 'error'); return }
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/update/password', { method:'POST', headers:{ 'Content-Type':'application/json', authorization:`Bearer ${token}` }, body: JSON.stringify({ currentPassword: passwordInfo.currentPassword, newPassword: passwordInfo.newPassword }) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      setPasswordInfo({ currentPassword:'', newPassword:'', confirmPassword:'' }); setIsEditingPassword(false); notify('Password updated!')
    } catch(e) { notify(e.message, 'error') } finally { setIsSaving(false) }
  }

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0]; if (!file) return
    const fd = new FormData(); fd.append('profile_picture', file)
    setAdmin(prev => ({ ...prev, photo: URL.createObjectURL(file) }))
    try {
      const res = await fetch('/api/admin/update/profile-picture', { method:'POST', headers:{ authorization:`Bearer ${token}` }, body: fd })
      if (!res.ok) throw new Error('Failed to update photo')
      setAdmin(await res.json()); notify('Profile picture updated!')
    } catch(e) { notify(e.message, 'error') }
  }

  const handleDeleteProfilePicture = async () => {
    if (!admin?.photo) return
    try {
      const res = await fetch('/api/admin/delete/profile-picture', { method:'DELETE', headers:{ authorization:`Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to delete photo')
      setAdmin(await res.json()); notify('Profile picture removed')
    } catch(e) { notify(e.message, 'error') }
  }

  // ── Create Account ───────────────────────────────────────────────────────────
  const emptyNewAdmin = { first_name:'', last_name:'', username:'', password:'', confirmPassword:'', email:'', phone_number:'', residency:'', gender:'Male', role:'admin' }
  const [newAdmin,    setNewAdmin]    = useState(emptyNewAdmin)
  const [showNewPass, setShowNewPass] = useState(false)

  const handleCreateAdmin = async () => {
    const { first_name, last_name, username, password, confirmPassword, email, phone_number, role } = newAdmin
    if (!first_name || !last_name || !username || !password || !email || !phone_number) { notify('Please fill all required fields', 'error'); return }
    if (password !== confirmPassword) { notify('Passwords do not match', 'error'); return }
    const { isValid, feedback } = validatePasswordStrength(password)
    if (!isValid) { notify(`Weak password: ${feedback}`, 'error'); return }
    setIsSaving(true)
    try {
      const res = await fetch('/api/superadmin/create-admin', { method:'POST', headers:{ 'Content-Type':'application/json', authorization:`Bearer ${token}` }, body: JSON.stringify({ first_name, last_name, username, password, email, phone_number, residency: newAdmin.residency, gender: newAdmin.gender, role }) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create admin')
      setNewAdmin(emptyNewAdmin); notify(`${getRoleLabel(role)} account created!`); fetchAdminsList()
    } catch(e) { notify(e.message, 'error') } finally { setIsSaving(false) }
  }

  // ── Manage / All Admins ──────────────────────────────────────────────────────
  const [adminsList,       setAdminsList]       = useState([])
  const [adminsLoading,    setAdminsLoading]    = useState(false)
  const [adminsSearch,     setAdminsSearch]     = useState('')
  const [roleFilter,       setRoleFilter]       = useState('all')
  const [editingAdminId,   setEditingAdminId]   = useState(null)
  const [editingAdminData, setEditingAdminData] = useState({})
  const [deleteTarget,     setDeleteTarget]     = useState(null)

  const fetchAdminsList = useCallback(async () => {
    if (!token) return
    setAdminsLoading(true)
    try {
      const res = await fetch('/api/superadmin/admins', { headers: { authorization:`Bearer ${token}` } })
      if (res.ok) setAdminsList(await res.json())
    } catch(e) { console.error(e) } finally { setAdminsLoading(false) }
  }, [token])

  useEffect(() => {
    if (token && admin?.role === 'superadmin') fetchAdminsList()
  }, [token, admin, fetchAdminsList])

  const handleSaveAdminDetails = async (id) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/superadmin/update-admin/${id}`, { method:'POST', headers:{ 'Content-Type':'application/json', authorization:`Bearer ${token}` }, body: JSON.stringify(editingAdminData) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update')
      notify('Admin updated!'); setEditingAdminId(null); fetchAdminsList()
    } catch(e) { notify(e.message, 'error') } finally { setIsSaving(false) }
  }

  const handleDeleteAdmin = async () => {
    if (!deleteTarget) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/superadmin/delete-admin/${deleteTarget.admin_id}`, { method:'DELETE', headers:{ authorization:`Bearer ${token}` } })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete')
      notify(`@${deleteTarget.username} deleted`); setDeleteTarget(null); fetchAdminsList()
    } catch(e) { notify(e.message, 'error') } finally { setIsSaving(false) }
  }

  const filteredAdmins = adminsList.filter(a => {
    const q = adminsSearch.toLowerCase()
    const matchSearch = !q || `${a.first_name} ${a.last_name} ${a.username} ${a.email}`.toLowerCase().includes(q)
    const matchRole = roleFilter === 'all' || a.role === roleFilter
    return matchSearch && matchRole
  })

  const adminsByRole = VALID_ROLES.reduce((acc, r) => {
    const group = adminsList.filter(a => a.role === r)
    if (group.length > 0) acc[r] = group
    return acc
  }, {})

  const TABS = [
    { id: 'profile', label: 'My Profile' },
    { id: 'create',  label: 'Create Account' },
    { id: 'manage',  label: 'Manage Admins', count: adminsList.length },
    { id: 'all',     label: 'All Admins' },
  ]

  const Loader = () => (
    <div className='flex justify-center py-12'>
      <div className='flex gap-1'>
        {[0,1,2].map(i => <div key={i} className='bg-[#FACC14] w-3 h-3 rounded-full animate-bounce' style={{ animationDelay:`${i*100}ms` }} />)}
      </div>
    </div>
  )

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
  const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1'
  const btnPrimary = 'px-5 py-2 text-sm bg-[#3A3A3A] text-white rounded-lg font-semibold hover:bg-black transition-colors cursor-pointer disabled:opacity-60'
  const btnGhost   = 'px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors'

  if (!admin) return <ProfileSkeletons />

  return (
    <div className='min-h-screen bg-[#F6F6F6] font-jost'>
      <Notification isOpen={notification.isOpen} message={notification.message} type={notification.type} onClose={() => setNotification(n => ({...n, isOpen: false}))} />
      <ConfirmationDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteAdmin} title='Delete Admin Account' message={`Permanently delete @${deleteTarget?.username}? This cannot be undone.`} confirmText='Delete' />

      {/* Header with avatar + tabs */}
      <div className='px-10 pt-8'>
        {/* Back button */}
        <button
          onClick={() => navigate('/superadmin/home')}
          className='bg-[#3A3A3A] flex items-center gap-2 mb-6 font-roboto font-medium text-sm text-white py-2 px-4 rounded-full hover:bg-[#202020] active:scale-99 transition-colors cursor-pointer w-fit'
        >
          <ArrowRight className='w-4 h-4 rotate-180' />
          <span>Back to Dashboard</span>
        </button>
        <div className='flex items-center gap-4 mb-6'>
          <div className='relative group'>
            <div className='w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-[#3A3A3A] flex items-center justify-center text-2xl font-bold text-white'>
              {admin.photo ? <img src={admin.photo} alt='Profile' className='w-full h-full object-cover' /> : <span>{admin.first_name?.charAt(0).toUpperCase()}</span>}
            </div>
            <label htmlFor='hdr-photo-upload' className='absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity'>
              <EditIcon className='w-4 h-4 text-white' />
            </label>
            <input id='hdr-photo-upload' type='file' accept='image/*' className='hidden' onChange={handleProfilePictureChange} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-[#3A3A3A]'>{admin.first_name} {admin.last_name}</h1>
            <div className='flex items-center gap-2 mt-0.5'>
              <span className='text-gray-500 text-sm'>@{admin.username}</span>
              <RoleBadge role={admin.role} />
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className='flex gap-1 border-b border-gray-200'>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all cursor-pointer relative ${activeTab === tab.id ? 'bg-white text-[#3A3A3A] border border-b-white border-gray-200 shadow-sm -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
              {tab.count > 0 && <span className='ml-1.5 text-xs bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5'>{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className='px-10 py-6'>

        {/* ═══════════════ MY PROFILE ═══════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className='grid grid-cols-[300px_1fr] gap-8 max-w-5xl'>
            {/* Avatar card */}
            <div className='bg-white border border-gray-200 rounded-2xl p-7 flex flex-col items-center h-fit shadow-sm'>
              <div className='relative mb-4 group'>
                <div className='w-36 h-36 rounded-full border-4 border-gray-100 shadow-lg overflow-hidden bg-[#3A3A3A] flex items-center justify-center text-5xl font-bold text-white'>
                  {admin.photo ? <img src={admin.photo} alt='Profile' className='w-full h-full object-cover' /> : <span>{admin.first_name?.charAt(0).toUpperCase()}</span>}
                </div>
                <label htmlFor='card-photo-upload' className='absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity'>
                  <EditIcon className='w-6 h-6 text-white' />
                </label>
                <input id='card-photo-upload' type='file' accept='image/*' className='hidden' onChange={handleProfilePictureChange} />
                {admin.photo && (
                  <button onClick={handleDeleteProfilePicture} className='absolute bottom-1 right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow cursor-pointer hover:bg-red-600'>
                    <TrashIcon className='w-3.5 h-3.5 text-white' />
                  </button>
                )}
              </div>
              <h2 className='font-bold text-center'>{admin.first_name} {admin.last_name}</h2>
              <p className='text-gray-400 text-sm'>@{admin.username}</p>
              <div className='mt-2'><RoleBadge role={admin.role} /></div>
              <button onClick={() => { navigator.clipboard.writeText(admin.admin_id); notify('Admin ID copied!') }} className='mt-4 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'>
                <CopyIcon className='w-3 h-3' /> Copy Admin ID
              </button>
            </div>

            {/* Forms */}
            <div className='space-y-4'>
              {/* Personal Info */}
              <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
                <div className='flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100'>
                  <h3 className='font-bold text-[#3A3A3A]'>Personal Information</h3>
                  <button onClick={() => setIsEditingPersonal(!isEditingPersonal)} className='p-1.5 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors'><EditIcon className='w-4 h-4 text-gray-500' /></button>
                </div>
                <div className='divide-y divide-gray-50 px-6'>
                  {[
                    { label: 'First Name',  key: 'first_name',   type: 'text' },
                    { label: 'Last Name',   key: 'last_name',    type: 'text' },
                    { label: 'Residency',   key: 'residency',    type: 'text' },
                    { label: 'Phone',       key: 'phone_number', type: 'tel' },
                    { label: 'Email',       key: 'email',        type: 'email' },
                  ].map(({ label, key, type }) => (
                    <div key={key} className='flex justify-between items-center py-3.5'>
                      <span className='text-sm text-gray-500'>{label}</span>
                      {isEditingPersonal
                        ? <input type={type} value={personalInfo[key]} onChange={e => setPersonalInfo(p => ({...p, [key]: e.target.value}))} className='w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]' />
                        : <span className='font-semibold text-sm text-[#3A3A3A]'>{admin[key] || '—'}</span>}
                    </div>
                  ))}
                  <div className='flex justify-between items-center py-3.5'>
                    <span className='text-sm text-gray-500'>Gender</span>
                    {isEditingPersonal
                      ? <select value={personalInfo.gender} onChange={e => setPersonalInfo(p => ({...p, gender: e.target.value}))} className='w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'><option value='Male'>Male</option><option value='Female'>Female</option></select>
                      : <span className='font-semibold text-sm text-[#3A3A3A]'>{admin.gender || '—'}</span>}
                  </div>
                </div>
                {isEditingPersonal && (
                  <div className='px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2'>
                    <button onClick={() => { setIsEditingPersonal(false); setPersonalInfo({ first_name: admin.first_name||'', last_name: admin.last_name||'', gender: admin.gender||'', residency: admin.residency||'', phone_number: admin.phone_number||'', email: admin.email||'' }) }} className={btnGhost}>Cancel</button>
                    <button onClick={handleSavePersonalInfo} disabled={isSaving} className={btnPrimary}>{isSaving ? 'Saving…' : 'Save Changes'}</button>
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
                <div className='flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100'>
                  <h3 className='font-bold text-[#3A3A3A]'>Account Information</h3>
                  <button onClick={() => setIsEditingAdmin(!isEditingAdmin)} className='p-1.5 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors'><EditIcon className='w-4 h-4 text-gray-500' /></button>
                </div>
                <div className='divide-y divide-gray-50 px-6'>
                  <div className='flex justify-between items-center py-3.5'>
                    <span className='text-sm text-gray-500'>Username</span>
                    {isEditingAdmin
                      ? <input type='text' value={adminInfo.username} onChange={e => setAdminInfo(p => ({...p, username: e.target.value}))} className='w-60 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]' />
                      : <span className='font-semibold text-sm text-[#3A3A3A]'>@{admin.username}</span>}
                  </div>
                  <div className='flex justify-between items-center py-3.5'>
                    <span className='text-sm text-gray-500'>Role</span>
                    <RoleBadge role={admin.role} />
                  </div>
                </div>
                {isEditingAdmin && (
                  <div className='px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2'>
                    <button onClick={() => setIsEditingAdmin(false)} className={btnGhost}>Cancel</button>
                    <button onClick={handleSaveAdminInfo} disabled={isSaving} className={btnPrimary}>{isSaving ? 'Saving…' : 'Save Changes'}</button>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
                <div className='flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100'>
                  <h3 className='font-bold text-[#3A3A3A]'>Password</h3>
                  <button onClick={() => setIsEditingPassword(!isEditingPassword)} className='p-1.5 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors'><EditIcon className='w-4 h-4 text-gray-500' /></button>
                </div>
                {isEditingPassword ? (
                  <div className='px-6 py-5 space-y-4'>
                    <div>
                      <label className={labelCls}>Current Password</label>
                      <input type='password' value={passwordInfo.currentPassword} onChange={e => setPasswordInfo(p => ({...p, currentPassword: e.target.value}))} className={inputCls} />
                    </div>
                    <div>
                      <div className='flex justify-between items-center mb-1'>
                        <label className={labelCls.replace('block mb-1','')}>New Password</label>
                        <button type='button' onClick={() => { const p = generateStrongPassword(); setPasswordInfo(prev => ({...prev, newPassword: p, confirmPassword: p})) }} className='text-xs text-blue-600 hover:underline cursor-pointer'>Suggest password</button>
                      </div>
                      <div className='relative'>
                        <input type={showPassword ? 'text' : 'password'} value={passwordInfo.newPassword} onChange={e => setPasswordInfo(p => ({...p, newPassword: e.target.value}))} className={inputCls + ' pr-14'} />
                        <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 cursor-pointer'>{showPassword ? 'Hide' : 'Show'}</button>
                      </div>
                      <StrengthBar password={passwordInfo.newPassword} />
                    </div>
                    <div>
                      <label className={labelCls}>Confirm Password</label>
                      <input type='password' value={passwordInfo.confirmPassword} onChange={e => setPasswordInfo(p => ({...p, confirmPassword: e.target.value}))} className={inputCls} />
                      {passwordInfo.confirmPassword && passwordInfo.newPassword !== passwordInfo.confirmPassword && <p className='text-xs text-red-500 mt-1'>Passwords do not match</p>}
                    </div>
                    <div className='flex justify-end gap-2 pt-1'>
                      <button onClick={() => { setIsEditingPassword(false); setPasswordInfo({ currentPassword:'', newPassword:'', confirmPassword:'' }) }} className={btnGhost}>Cancel</button>
                      <button onClick={handleSavePassword} disabled={isSaving} className={btnPrimary}>{isSaving ? 'Saving…' : 'Update Password'}</button>
                    </div>
                  </div>
                ) : (
                  <div className='px-6 py-4'><p className='text-sm text-gray-400 italic'>Password is hidden for security</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ CREATE ACCOUNT ════════════════════════════════════ */}
        {activeTab === 'create' && (
          <div className='max-w-2xl'>
            <p className='text-gray-500 text-sm mb-5'>Create a new admin account. Superadmins can assign any role including creating other superadmins.</p>
            <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
              <div className='px-6 py-4 bg-gray-50 border-b border-gray-100'>
                <h3 className='font-bold text-[#3A3A3A]'>New Admin Account</h3>
              </div>
              <div className='p-6 space-y-5'>
                {/* Role selector */}
                <div>
                  <label className={labelCls}>Role</label>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {VALID_ROLES.map(r => (
                      <button key={r} type='button' onClick={() => setNewAdmin(p => ({...p, role: r}))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border-2 transition-all cursor-pointer ${newAdmin.role === r ? 'border-[#3A3A3A] bg-[#3A3A3A] text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                        {getRoleLabel(r)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div><label className={labelCls}>First Name <span className='text-red-400 normal-case'>*</span></label><input type='text' value={newAdmin.first_name} onChange={e => setNewAdmin(p => ({...p, first_name: e.target.value}))} className={inputCls} /></div>
                  <div><label className={labelCls}>Last Name <span className='text-red-400 normal-case'>*</span></label><input type='text' value={newAdmin.last_name} onChange={e => setNewAdmin(p => ({...p, last_name: e.target.value}))} className={inputCls} /></div>
                  <div><label className={labelCls}>Username <span className='text-red-400 normal-case'>*</span></label><input type='text' value={newAdmin.username} onChange={e => setNewAdmin(p => ({...p, username: e.target.value}))} className={inputCls} /></div>
                  <div><label className={labelCls}>Email <span className='text-red-400 normal-case'>*</span></label><input type='email' value={newAdmin.email} onChange={e => setNewAdmin(p => ({...p, email: e.target.value}))} className={inputCls} /></div>
                  <div><label className={labelCls}>Phone <span className='text-red-400 normal-case'>*</span></label><input type='tel' value={newAdmin.phone_number} onChange={e => setNewAdmin(p => ({...p, phone_number: e.target.value}))} className={inputCls} /></div>
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select value={newAdmin.gender} onChange={e => setNewAdmin(p => ({...p, gender: e.target.value}))} className={inputCls}>
                      <option value='Male'>Male</option><option value='Female'>Female</option>
                    </select>
                  </div>
                  <div className='col-span-2'><label className={labelCls}>Residency</label><input type='text' value={newAdmin.residency} onChange={e => setNewAdmin(p => ({...p, residency: e.target.value}))} className={inputCls} /></div>
                </div>

                {/* Password */}
                <div>
                  <div className='flex justify-between items-center mb-1'>
                    <label className={labelCls.replace('block mb-1','')}>Password <span className='text-red-400 normal-case'>*</span></label>
                    <button type='button' onClick={() => { const p = generateStrongPassword(); setNewAdmin(prev => ({...prev, password: p, confirmPassword: p})) }} className='text-xs text-blue-600 hover:underline cursor-pointer'>Suggest password</button>
                  </div>
                  <div className='relative'>
                    <input type={showNewPass ? 'text' : 'password'} value={newAdmin.password} onChange={e => setNewAdmin(p => ({...p, password: e.target.value}))} className={inputCls + ' pr-14'} />
                    <button type='button' onClick={() => setShowNewPass(!showNewPass)} className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 cursor-pointer'>{showNewPass ? 'Hide' : 'Show'}</button>
                  </div>
                  <StrengthBar password={newAdmin.password} />
                </div>
                <div>
                  <label className={labelCls}>Confirm Password <span className='text-red-400 normal-case'>*</span></label>
                  <input type='password' value={newAdmin.confirmPassword} onChange={e => setNewAdmin(p => ({...p, confirmPassword: e.target.value}))} className={inputCls} />
                  {newAdmin.confirmPassword && newAdmin.password !== newAdmin.confirmPassword && <p className='text-xs text-red-500 mt-1'>Passwords do not match</p>}
                </div>
              </div>
              <div className='px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end'>
                <button onClick={handleCreateAdmin} disabled={isSaving} className={btnPrimary + ' px-6'}>{isSaving ? 'Creating…' : `Create ${getRoleLabel(newAdmin.role)}`}</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ MANAGE ADMINS ══════════════════════════════════════ */}
        {activeTab === 'manage' && (
          <div className='max-w-5xl'>
            <div className='flex gap-3 mb-5'>
              <input type='text' placeholder='Search by name, username or email…' value={adminsSearch} onChange={e => setAdminsSearch(e.target.value)} className='flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]' />
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className='px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white'>
                <option value='all'>All Roles</option>
                {VALID_ROLES.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
              </select>
            </div>

            {adminsLoading ? <Loader /> : filteredAdmins.length === 0 ? (
              <p className='text-center text-gray-400 py-12'>No admins match your search.</p>
            ) : (
              <div className='space-y-3'>
                {filteredAdmins.map(a => (
                  <div key={a.admin_id} className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
                    {editingAdminId === a.admin_id ? (
                      <div className='p-6'>
                        <div className='flex justify-between items-center mb-4'>
                          <h4 className='font-bold text-[#3A3A3A]'>Editing @{a.username}</h4>
                          <button onClick={() => setEditingAdminId(null)} className='text-gray-400 hover:text-gray-700 text-2xl leading-none cursor-pointer'>&times;</button>
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                          {[['First Name','first_name'],['Last Name','last_name'],['Username','username'],['Email','email'],['Phone','phone_number'],['Residency','residency']].map(([lbl, fld]) => (
                            <div key={fld}>
                              <label className={labelCls}>{lbl}</label>
                              <input type='text' value={editingAdminData[fld]||''} onChange={e => setEditingAdminData(p => ({...p, [fld]: e.target.value}))} className={inputCls} />
                            </div>
                          ))}
                          <div>
                            <label className={labelCls}>Gender</label>
                            <select value={editingAdminData.gender||''} onChange={e => setEditingAdminData(p => ({...p, gender: e.target.value}))} className={inputCls}>
                              <option value='Male'>Male</option><option value='Female'>Female</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Role</label>
                            <select value={editingAdminData.role||''} onChange={e => setEditingAdminData(p => ({...p, role: e.target.value}))} className={inputCls}>
                              {VALID_ROLES.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className='flex justify-end gap-2 mt-4'>
                          <button onClick={() => setEditingAdminId(null)} className={btnGhost}>Cancel</button>
                          <button onClick={() => handleSaveAdminDetails(a.admin_id)} disabled={isSaving} className={btnPrimary}>{isSaving ? 'Saving…' : 'Save Changes'}</button>
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-center gap-4 px-5 py-4'>
                        <div className='w-10 h-10 rounded-full bg-[#3A3A3A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0'>
                          {a.first_name?.charAt(0).toUpperCase()}{a.last_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='font-semibold text-sm text-[#3A3A3A]'>{a.first_name} {a.last_name}</p>
                          <p className='text-xs text-gray-400'>@{a.username} · {a.email}</p>
                        </div>
                        <RoleBadge role={a.role} />
                        <p className='text-xs text-gray-300 hidden lg:block'>{new Date(a.created_at).toLocaleDateString()}</p>
                        <div className='flex items-center gap-1.5 ml-2'>
                          <button onClick={() => { setEditingAdminId(a.admin_id); setEditingAdminData({ first_name: a.first_name||'', last_name: a.last_name||'', username: a.username||'', email: a.email||'', phone_number: a.phone_number||'', residency: a.residency||'', gender: a.gender||'Male', role: a.role||'admin' }) }} className='p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer' title='Edit'>
                            <EditIcon className='w-4 h-4 text-gray-400' />
                          </button>
                          {a.admin_id !== admin.admin_id && (
                            <button onClick={() => setDeleteTarget(a)} className='p-1.5 rounded-lg hover:bg-red-50 cursor-pointer' title='Delete'>
                              <TrashIcon className='w-4 h-4 text-red-400' />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ ALL ADMINS ═════════════════════════════════════════ */}
        {activeTab === 'all' && (
          <div className='max-w-5xl space-y-5'>
            {adminsLoading ? <Loader /> : Object.keys(adminsByRole).length === 0 ? (
              <p className='text-center text-gray-400 py-12'>No admin accounts found.</p>
            ) : (
              Object.entries(adminsByRole).map(([role, members]) => (
                <div key={role} className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
                  <div className='px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3'>
                    <RoleBadge role={role} />
                    <span className='text-xs text-gray-400 font-medium'>{members.length} account{members.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className='divide-y divide-gray-50'>
                    {members.map(a => (
                      <div key={a.admin_id} className='flex items-center gap-4 px-6 py-3.5'>
                        <div className='w-8 h-8 rounded-full bg-[#3A3A3A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0'>
                          {a.first_name?.charAt(0)}{a.last_name?.charAt(0)}
                        </div>
                        <div className='flex-1'>
                          <p className='font-semibold text-sm text-[#3A3A3A]'>{a.first_name} {a.last_name}</p>
                          <p className='text-xs text-gray-400'>@{a.username}</p>
                        </div>
                        <p className='text-xs text-gray-400 hidden md:block'>{a.email}</p>
                        <p className='text-xs text-gray-300'>Joined {new Date(a.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SuperAdminProfile
