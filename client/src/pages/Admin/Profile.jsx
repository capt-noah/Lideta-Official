import { useState, useContext, useEffect } from 'react'
import { adminContext } from '../../components/utils/AdminContext'
import EditIcon from '../../assets/icons/edit_icon.svg?react'
import CopyIcon from '../../assets/icons/copy_icon.svg?react'
import EyeShowIcon from '../../assets/icons/eye_show_icon.svg?react'
import EyeHideIcon from '../../assets/icons/eye_hide_icon.svg?react'
import ProfilePic from '../../assets/profile.jpeg'
import ProfileSkeletons from '../../components/ui/ProfileSkeletons'
import Notification from '../../components/ui/Notification'

function Profile() {
  const [showPassword, setShowPassword] = useState(false)
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [isEditingAdmin, setIsEditingAdmin] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState({ isOpen: false, message: '', type: 'success' })
  
  const { admin, setAdmin, token } = useContext(adminContext)

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    residency: '',
    phone_number: '',
    email: ''
  })

  const [adminInfo, setAdminInfo] = useState({
    username: '',
    role: ''
  })

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [settings, setSettings] = useState({
    theme: 'light',
    font_size: 'medium',
    language: 'english'
  })

  // Load admin data and settings
  useEffect(() => {
    if (admin) {
      setPersonalInfo({
        first_name: admin.first_name || '',
        last_name: admin.last_name || '',
        gender: admin.gender || '',
        residency: admin.residency || '',
        phone_number: admin.phone_number || '',
        email: admin.email || ''
      })
      setAdminInfo({
        username: admin.username || '',
        role: admin.role || 'admin'
      })
    }
  }, [admin])

  // Load settings
  useEffect(() => {
    async function fetchSettings() {
      if (!token) return
      try {
        const response = await fetch('http://localhost:3000/admin/settings', {
          headers: {
            authorization: `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setSettings({
            theme: data.theme || 'light',
            font_size: data.font_size || 'medium',
            language: data.language || 'english'
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [token])

  const handleCopyAdminId = () => {
    if (admin?.admin_id) {
      navigator.clipboard.writeText(admin.admin_id)
      setNotification({ isOpen: true, message: 'Admin ID copied to clipboard!', type: 'success' })
    }
  }

  const handleSavePersonalInfo = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('http://localhost:3000/admin/update/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify(personalInfo)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      const updatedAdmin = await response.json()
      setAdmin(updatedAdmin)
      setIsEditingPersonal(false)
      setNotification({ isOpen: true, message: 'Personal information updated successfully!', type: 'success' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setNotification({ isOpen: true, message: error.message || 'Failed to update personal information', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAdminInfo = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('http://localhost:3000/admin/update/admin-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adminInfo)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update admin information')
      }

      const updatedAdmin = await response.json()
      setAdmin(updatedAdmin)
      setIsEditingAdmin(false)
      setNotification({ isOpen: true, message: 'Admin information updated successfully!', type: 'success' })
    } catch (error) {
      console.error('Error updating admin info:', error)
      setNotification({ isOpen: true, message: error.message || 'Failed to update admin information', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePassword = async () => {
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      setNotification({ isOpen: true, message: 'New passwords do not match!', type: 'error' })
      return
    }

    if (passwordInfo.newPassword.length < 6) {
      setNotification({ isOpen: true, message: 'Password must be at least 6 characters long!', type: 'error' })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('http://localhost:3000/admin/update/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordInfo.currentPassword,
          newPassword: passwordInfo.newPassword
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update password')
      }

      setPasswordInfo({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setIsEditingPassword(false)
      setNotification({ isOpen: true, message: 'Password updated successfully!', type: 'success' })
    } catch (error) {
      console.error('Error updating password:', error)
      setNotification({ isOpen: true, message: error.message || 'Failed to update password', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('http://localhost:3000/admin/update/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      setNotification({ isOpen: true, message: 'Preferences updated successfully!', type: 'success' })
    } catch (error) {
      console.error('Error updating settings:', error)
      setNotification({ isOpen: true, message: 'Failed to update preferences', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelPersonal = () => {
    if (admin) {
      setPersonalInfo({
        first_name: admin.first_name || '',
        last_name: admin.last_name || '',
        gender: admin.gender || '',
        residency: admin.residency || '',
        phone_number: admin.phone_number || '',
        email: admin.email || ''
      })
    }
    setIsEditingPersonal(false)
  }

  const handleCancelAdmin = () => {
    if (admin) {
      setAdminInfo({
        username: admin.username || '',
        role: admin.role || 'admin'
      })
    }
    setIsEditingAdmin(false)
    setIsEditingPassword(false)
    setPasswordInfo({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  return (
    <div>
      {admin ? (
        <div className='grid grid-cols-[400px_1fr] gap-15 py-6 px-15'>
          {/* Profile Card */}
          <div className='bg-gray-100 h-fit border rounded-xl p-10 flex flex-col items-center relative'>
            <div className='relative mb-4'>
              <img
                src={ProfilePic}
                alt='Profile'
                className='w-60 h-60 rounded-full object-cover border-4 border-white shadow-lg'
              />
              <button className='absolute bottom-0 right-0 w-10 h-10 bg-[#3A3A3A] rounded-full flex items-center justify-center shadow-lg hover:bg-[#4e4e4e] transition-colors'>
                <EditIcon className='w-5 h-5 text-white' />
              </button>
            </div>
            <h2 className='text-2xl font-bold text-[#3A3A3A] mb-1'>
              {admin.first_name} {admin.last_name}
            </h2>
            <p className='text-gray-600 text-sm'>{admin.username}</p>
          </div>

          {/* Information Sections */}
          <div className='space-y-6 w-180'>
            {/* Personal Information */}
            <div className='bg-white border-2 border-gray-300 rounded-xl'>
              <div className='flex h-15 rounded-tr-lg rounded-tl-lg bg-gray-300 px-8 justify-between items-center'>
                <h3 className='text-xl font-semibold text-[#3A3A3A]'>Personal Information</h3>
                <button
                  onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                  className='p-2 active:scale-97 rounded-full transition-colors cursor-pointer'
                >
                  <EditIcon className='w-5 h-5 text-black' />
                </button>
              </div>
              <div className='py-5 px-8 space-y-0'>
                <div className='flex justify-between items-center py-4 border-b border-gray-200'>
                  <label className='text-sm text-gray-600'>First name</label>
                  {isEditingPersonal ? (
                    <input
                      type='text'
                      value={personalInfo.first_name}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, first_name: e.target.value })
                      }
                      className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                    />
                  ) : (
                    <p className='text-[#3A3A3A] font-medium'>{admin.first_name}</p>
                  )}
                </div>
                <div className='flex justify-between items-center py-4 border-b border-gray-200'>
                  <label className='text-sm text-gray-600'>Last name</label>
                  {isEditingPersonal ? (
                    <input
                      type='text'
                      value={personalInfo.last_name}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, last_name: e.target.value })
                      }
                      className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                    />
                  ) : (
                    <p className='text-[#3A3A3A] font-medium'>{admin.last_name}</p>
                  )}
                </div>
                <div className='flex justify-between items-center py-4 border-b border-gray-200'>
                  <label className='text-sm text-gray-600'>Gender</label>
                  {isEditingPersonal ? (
                    <select
                      value={personalInfo.gender}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, gender: e.target.value })
                      }
                      className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                    >
                      <option value='Male'>Male</option>
                      <option value='Female'>Female</option>
                      <option value='Other'>Other</option>
                    </select>
                  ) : (
                    <p className='text-[#3A3A3A] font-medium'>{admin.gender}</p>
                  )}
                </div>
                <div className='flex justify-between items-center py-4 border-b border-gray-200'>
                  <label className='text-sm text-gray-600'>Residency</label>
                  {isEditingPersonal ? (
                    <input
                      type='text'
                      value={personalInfo.residency}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, residency: e.target.value })
                      }
                      className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                    />
                  ) : (
                    <p className='text-[#3A3A3A] font-medium'>{admin.residency}</p>
                  )}
                </div>
                <div className='flex justify-between items-center py-4 border-b border-gray-200'>
                  <label className='text-sm text-gray-600'>Phone number</label>
                  {isEditingPersonal ? (
                    <input
                      type='tel'
                      value={personalInfo.phone_number}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, phone_number: e.target.value })
                      }
                      className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                    />
                  ) : (
                    <p className='text-[#3A3A3A] font-medium'>{admin.phone_number}</p>
                  )}
                </div>
                <div className='flex justify-between items-center py-4'>
                  <label className='text-sm text-gray-600'>Email</label>
                  {isEditingPersonal ? (
                    <input
                      type='email'
                      value={personalInfo.email}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, email: e.target.value })
                      }
                      className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                    />
                  ) : (
                    <p className='text-[#3A3A3A] font-medium'>{admin.email}</p>
                  )}
                </div>
                {isEditingPersonal && (
                  <div className='flex gap-3 justify-end mt-4 pt-4 border-t'>
                    <button
                      onClick={handleCancelPersonal}
                      disabled={isSaving}
                      className='px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-100 font-medium cursor-pointer disabled:opacity-50'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePersonalInfo}
                      disabled={isSaving}
                      className='px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#2A2A2A] font-medium cursor-pointer disabled:opacity-50'
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Information */}
            <div className='bg-white border-2 border-gray-300 rounded-xl'>
              <div className='flex h-15 rounded-tr-lg rounded-tl-lg bg-gray-300 px-5 justify-between items-center'>
                <h3 className='text-xl font-semibold text-[#3A3A3A]'>Admin Information</h3>
                <button
                  onClick={() => setIsEditingAdmin(!isEditingAdmin)}
                  className='p-2 active:scale-97 rounded-full transition-colors cursor-pointer'
                >
                  <EditIcon className='w-5 h-5 text-black' />
                </button>
              </div>
              <div className='p-5 space-y-0'>
                <div className='flex justify-between items-center py-4 border-b border-gray-200'>
                  <label className='text-sm text-gray-600'>Admin id</label>
                  <div className='flex items-center gap-2'>
                    <p className='text-[#3A3A3A] font-medium'>{admin.admin_id}</p>
                    <button
                      onClick={handleCopyAdminId}
                      className='p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer'
                    >
                      <CopyIcon className='w-5 h-5 text-gray-600' />
                    </button>
                  </div>
                </div>
                <div className='flex justify-between items-center py-4 border-b border-gray-200'>
                  <label className='text-sm text-gray-600'>Username</label>
                  {isEditingAdmin ? (
                    <input
                      type='text'
                      value={adminInfo.username}
                      onChange={(e) =>
                        setAdminInfo({ ...adminInfo, username: e.target.value })
                      }
                      className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                    />
                  ) : (
                    <p className='text-[#3A3A3A] font-medium'>{admin.username}</p>
                  )}
                </div>
                <div className='flex justify-between items-center py-4 border-b border-gray-200'>
                  <label className='text-sm text-gray-600'>Role</label>
                  {isEditingAdmin ? (
                    <input
                      type='text'
                      value={adminInfo.role}
                      onChange={(e) =>
                        setAdminInfo({ ...adminInfo, role: e.target.value })
                      }
                      className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                    />
                  ) : (
                    <p className='text-[#3A3A3A] font-medium'>{admin.role}</p>
                  )}
                </div>
                <div className='flex justify-between items-center py-4'>
                  <label className='text-sm text-gray-600'>Password</label>
                  <div className='flex items-center gap-2'>
                    {isEditingPassword ? (
                      <div className='space-y-2'>
                        <input
                          type='password'
                          placeholder='Current password'
                          value={passwordInfo.currentPassword}
                          onChange={(e) =>
                            setPasswordInfo({
                              ...passwordInfo,
                              currentPassword: e.target.value
                            })
                          }
                          className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                        />
                        <input
                          type='password'
                          placeholder='New password'
                          value={passwordInfo.newPassword}
                          onChange={(e) =>
                            setPasswordInfo({
                              ...passwordInfo,
                              newPassword: e.target.value
                            })
                          }
                          className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                        />
                        <input
                          type='password'
                          placeholder='Confirm new password'
                          value={passwordInfo.confirmPassword}
                          onChange={(e) =>
                            setPasswordInfo({
                              ...passwordInfo,
                              confirmPassword: e.target.value
                            })
                          }
                          className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                        />
                      </div>
                    ) : (
                      <>
                        <p className='text-[#3A3A3A] font-medium'>********</p>
                        {isEditingAdmin && (
                          <button
                            onClick={() => setIsEditingPassword(true)}
                            className='px-3 py-1 text-sm border rounded-md hover:bg-gray-100 cursor-pointer'
                          >
                            Change Password
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {isEditingAdmin && (
                  <div className='flex gap-3 justify-end mt-4 pt-4 border-t'>
                    <button
                      onClick={handleCancelAdmin}
                      disabled={isSaving}
                      className='px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-100 font-medium cursor-pointer disabled:opacity-50'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (isEditingPassword) {
                          handleSavePassword()
                        } else {
                          handleSaveAdminInfo()
                        }
                      }}
                      disabled={isSaving}
                      className='px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#2A2A2A] font-medium cursor-pointer disabled:opacity-50'
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div className='bg-white border-2 border-gray-300 rounded-xl'>
              <div className='flex h-15 rounded-tr-lg rounded-tl-lg bg-gray-300 px-5 justify-between items-center'>
                <h3 className='text-xl font-semibold text-[#3A3A3A]'>Preferences</h3>
              </div>
              <div className='p-5 space-y-6'>
                {/* Theme Options */}
                <div>
                  <label className='block text-sm text-gray-600 mb-3'>Theme</label>
                  <div className='flex px-10 gap-6'>
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'light' })}
                      className={`flex gap-4 border-2 rounded-2xl p-4 transition-all cursor-pointer ${
                        settings.theme === 'light'
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className='bg-gray-300 w-10 h-10 rounded'></div>
                      <div className='w-25 space-y-2'>
                        <div className='bg-gray-200 h-9 rounded'></div>
                        <div className='bg-gray-200 h-9 rounded'></div>
                        <div className='bg-gray-200 h-5 rounded'></div>
                      </div>
                    </button>

                    <button
                      onClick={() => setSettings({ ...settings, theme: 'dark' })}
                      className={`bg-[#3A3A3A] flex gap-2 border-2 p-4 rounded-2xl transition-all cursor-pointer ${
                        settings.theme === 'dark'
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className='bg-[#7F7F7F] w-10 h-10 rounded'></div>
                      <div className='w-25 space-y-2'>
                        <div className='bg-[#555555] h-9 rounded'></div>
                        <div className='bg-[#555555] h-9 rounded'></div>
                        <div className='bg-[#555555] h-5 rounded'></div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Font Size Options */}
                <div>
                  <label className='block text-sm text-gray-600 mb-3'>Font</label>
                  <div className='flex gap-3'>
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSettings({ ...settings, font_size: size })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                          settings.font_size === size
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='flex justify-end pt-4 border-t'>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className='px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#2A2A2A] font-medium cursor-pointer disabled:opacity-50'
                  >
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ProfileSkeletons />
      )}

      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        message={notification.message}
        type={notification.type}
      />
    </div>
  )
}

export default Profile
