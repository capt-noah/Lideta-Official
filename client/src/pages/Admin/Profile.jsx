import { useState, useContext, useEffect } from 'react'
import { adminContext } from '../../components/utils/AdminContext'
import EditIcon from '../../assets/icons/edit_icon.svg?react'
import CopyIcon from '../../assets/icons/copy_icon.svg?react'
import EyeShowIcon from '../../assets/icons/eye_show_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon.svg?react'

import ProfileSkeletons from '../../components/ui/ProfileSkeletons'
import Notification from '../../components/ui/Notification'
import LoadingButton from '../../components/ui/LoadingButton'

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

  // Superadmin: new admin creation form
  const [newAdmin, setNewAdmin] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone_number: '',
    residency: '',
    gender: '',
    role: 'admin'
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
      // Use localStorage directly to avoid context timing issues
      const currentToken = localStorage.getItem('token')

      if (!currentToken || currentToken === 'null' || currentToken === 'undefined') return

      try {
        const response = await fetch('/api/admin/settings', {
          headers: {
            authorization: `Bearer ${currentToken}`
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
      const response = await fetch('/api/admin/update/profile', {
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
      const response = await fetch('/api/admin/update/admin-info', {
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
      const response = await fetch('/api/admin/update/password', {
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
      const response = await fetch('/api/admin/update/settings', {
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

  const isSuperAdmin = admin?.role === 'superadmin'

  const handleCreateAdmin = async () => {
    if (!isSuperAdmin) return

    if (!newAdmin.username || !newAdmin.password || !newAdmin.email || !newAdmin.phone_number) {
      setNotification({ isOpen: true, message: 'Please fill all required fields for new admin.', type: 'error' })
      return
    }

    if (newAdmin.password !== newAdmin.confirmPassword) {
      setNotification({ isOpen: true, message: 'New admin passwords do not match!', type: 'error' })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/superadmin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: newAdmin.first_name,
          last_name: newAdmin.last_name,
          username: newAdmin.username,
          password: newAdmin.password,
          email: newAdmin.email,
          phone_number: newAdmin.phone_number,
          residency: newAdmin.residency,
          gender: newAdmin.gender,
          role: newAdmin.role || 'admin'
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to create admin account')
      }

      setNewAdmin({
        first_name: '',
        last_name: '',
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone_number: '',
        residency: '',
        gender: '',
        role: 'admin'
      })

      setNotification({ isOpen: true, message: 'New admin account created successfully!', type: 'success' })
    } catch (error) {
      console.error('Error creating admin:', error)
      setNotification({ isOpen: true, message: error.message || 'Failed to create admin account', type: 'error' })
      setIsSaving(false)
    }
  }

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview optimization optional, but let's upload directly for profile pics usually
    const formData = new FormData()
    formData.append('profile_picture', file)

    // Optimistic update (optional) or loading state
    // For now, let's use a simple loading indicator via notification or just wait
    // Actually, setting a local state for preview while uploading is good UX
    
    // Create temporary URL for immediate feedback
    const tempUrl = URL.createObjectURL(file)
    setAdmin(prev => ({ ...prev, photo: tempUrl }))

    try {
        const response = await fetch('/api/admin/update/profile-picture', {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`
            },
            body: formData
        })

        if (!response.ok) {
            throw new Error('Failed to update profile picture')
        }

        const updatedAdmin = await response.json()
        setAdmin(updatedAdmin)
        setNotification({ isOpen: true, message: 'Profile picture updated successfully!', type: 'success' })
    } catch (error) {
        console.error('Error updating profile picture:', error)
        setNotification({ isOpen: true, message: 'Failed to update profile picture', type: 'error' })
        // Revert on failure (reload admin data or just reset photo if we had previous one)
        // Simplest: The admin context refresh or manual revert. 
        // We'll leave it for now, user can refresh if failed.
    }
  }

  const handleDeleteProfilePicture = async () => {
    if (!admin.photo) return
    
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/delete/profile-picture', {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete profile picture')
      }

      const updatedAdmin = await response.json()
      setAdmin(updatedAdmin)
      setNotification({ isOpen: true, message: 'Profile picture deleted successfully!', type: 'success' })
    } catch (error) {
      console.error('Error deleting profile picture:', error)
      setNotification({ isOpen: true, message: 'Failed to delete profile picture', type: 'error' })
    }
  }

  return (
    <div>
      {admin ? (
        <div className='grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6'>
          {/* Profile Card */}
          <div className='bg-gray-100 h-fit border rounded-xl p-10 flex flex-col items-center relative'>
            <div className='relative mb-4 group'>
              <div className='w-60 h-60 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#3A3A3A] flex items-center justify-center text-7xl font-bold text-white'>
                {admin.photo ? (
                  <img
                    src={admin.photo}
                    alt='Profile'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <span>{admin.first_name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label 
                htmlFor='profile-upload'
                className='absolute bottom-0 right-0 w-10 h-10 bg-[#3A3A3A] rounded-full flex items-center justify-center shadow-lg hover:bg-[#4e4e4e] transition-colors cursor-pointer active:scale-95'
              >
                <EditIcon className='w-5 h-5 text-white' />
              </label>
              {admin.photo && (
                <button
                  onClick={handleDeleteProfilePicture}
                  className='absolute bottom-0 right-12 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 transition-colors cursor-pointer active:scale-95'
                >
                  <TrashIcon className='w-5 h-5 text-white' />
                </button>
              )}
              <input 
                id='profile-upload'
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleProfilePictureChange}
              />
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
                    <LoadingButton
                      onClick={handleSavePersonalInfo}
                      isLoading={isSaving}
                      className='px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#2A2A2A] font-medium active:scale-98 disabled:opacity-50'
                    >
                      Save
                    </LoadingButton>
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
                    <LoadingButton
                      onClick={() => {
                        if (isEditingPassword) {
                          handleSavePassword()
                        } else {
                          handleSaveAdminInfo()
                        }
                      }}
                      isLoading={isSaving}
                      className='px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#2A2A2A] font-medium active:scale-98 disabled:opacity-50'
                    >
                      Save
                    </LoadingButton>
                  </div>
                )}
              </div>
            </div>

            {/* Superadmin: Create Admin Account */}
            {isSuperAdmin && (
              <div className='bg-white border-2 border-gray-300 rounded-xl'>
                <div className='flex h-15 rounded-tr-lg rounded-tl-lg bg-gray-300 px-5 justify-between items-center'>
                  <h3 className='text-xl font-semibold text-[#3A3A3A]'>Create Admin Account</h3>
                </div>
                <div className='p-5 space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm text-gray-600 mb-1'>First name</label>
                      <input
                        type='text'
                        value={newAdmin.first_name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, first_name: e.target.value })}
                        className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                      />
                    </div>
                    <div>
                      <label className='block text-sm text-gray-600 mb-1'>Last name</label>
                      <input
                        type='text'
                        value={newAdmin.last_name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, last_name: e.target.value })}
                        className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm text-gray-600 mb-1'>Username</label>
                      <input
                        type='text'
                        value={newAdmin.username}
                        onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                        className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                      />
                    </div>
                    <div>
                      <label className='block text-sm text-gray-600 mb-1'>Role</label>
                      <select
                        value={newAdmin.role}
                        onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                        className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                      >
                        <option value='admin'>Admin</option>
                        <option value='superadmin'>Superadmin</option>
                      </select>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm text-gray-600 mb-1'>Email</label>
                      <input
                        type='email'
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                      />
                    </div>
                    <div>
                      <label className='block text-sm text-gray-600 mb-1'>Phone number</label>
                      <input
                        type='tel'
                        value={newAdmin.phone_number}
                        onChange={(e) => setNewAdmin({ ...newAdmin, phone_number: e.target.value })}
                        className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm text-gray-600 mb-1'>Residency</label>
                      <input
                        type='text'
                        value={newAdmin.residency}
                        onChange={(e) => setNewAdmin({ ...newAdmin, residency: e.target.value })}
                        className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                      />
                    </div>
                    <div>
                      <label className='block text-sm text-gray-600 mb-1'>Gender</label>
                      <select
                        value={newAdmin.gender}
                        onChange={(e) => setNewAdmin({ ...newAdmin, gender: e.target.value })}
                        className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                      >
                        <option value=''>Select</option>
                        <option value='Male'>Male</option>
                        <option value='Female'>Female</option>
                        <option value='Other'>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm text-gray-600 mb-1'>Password</label>
                      <input
                        type='password'
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                      />
                    </div>
                    <div>
                      <label className='block text-sm text-gray-600 mb-1'>Confirm password</label>
                      <input
                        type='password'
                        value={newAdmin.confirmPassword}
                        onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
                        className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                      />
                    </div>
                  </div>

                  <div className='flex justify-end pt-4 border-t'>
                    <LoadingButton
                      onClick={handleCreateAdmin}
                      isLoading={isSaving}
                      className='px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#2A2A2A] font-medium active:scale-98 disabled:opacity-50'
                    >
                      Create Admin
                    </LoadingButton>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {/* <div className='bg-white border-2 border-gray-300 rounded-xl'>

              <div className='flex h-15 rounded-tr-lg rounded-tl-lg bg-gray-300 px-5 justify-between items-center'>
                <h3 className='text-xl font-semibold text-[#3A3A3A]'>Preferences</h3>
              </div>

              <div className='p-5 space-y-6'>
                
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

              </div>
            </div> */}

            <div className='flex justify-end pt-4'>
              <LoadingButton
                onClick={handleSaveSettings}
                isLoading={isSaving}
                className='px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#2A2A2A] font-medium active:scale-98 disabled:opacity-50'
              >
                Save Preferences
              </LoadingButton>
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
