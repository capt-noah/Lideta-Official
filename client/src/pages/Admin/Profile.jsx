import { useState } from 'react'
import EditIcon from '../../assets/icons/edit_icon.svg?react'
import CopyIcon from '../../assets/icons/copy_icon.svg?react'
import EyeIcon from '../../assets/icons/eye_icon.svg?react'
import ProfilePic from '../../assets/profile.jpeg'

function Profile() {
  const [showPassword, setShowPassword] = useState(false)
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [isEditingAdmin, setIsEditingAdmin] = useState(false)
  const [isEditingPreferences, setIsEditingPreferences] = useState(false)
  const [selectedLayout, setSelectedLayout] = useState('layout1')
  const [selectedFontSize, setSelectedFontSize] = useState('medium')

  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'Abebe',
    lastName: 'Kebede',
    gender: 'Male',
    residency: 'Addis Ababa',
    phoneNumber: '0912345678',
    email: 'abekebede@gmail.com'
  })

  const [adminInfo, setAdminInfo] = useState({
    adminId: '834832983234',
    username: 'abe_kebe',
    role: 'Lideta Sub-City Website Administrator',
    password: '************'
  })

  const handleCopyAdminId = () => {
    navigator.clipboard.writeText(adminInfo.adminId)
    // You could add a toast notification here
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
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
        <h2 className='text-2xl font-bold text-[#3A3A3A] mb-1'>Abebe Kebede</h2>
        <p className='text-gray-600 text-sm'>abe_kebe</p>
      </div>

      {/* Information Sections */}
      <div className='space-y-6 w-180 '>
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
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                  className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                />
              ) : (
                <p className='text-[#3A3A3A] font-medium'>{personalInfo.firstName}</p>
              )}
            </div>
            <div className='flex justify-between items-center py-4 border-b border-gray-200'>
              <label className='text-sm text-gray-600'>Last name</label>
              {isEditingPersonal ? (
                <input
                  type='text'
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                  className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                />
              ) : (
                <p className='text-[#3A3A3A] font-medium'>{personalInfo.lastName}</p>
              )}
            </div>
            <div className='flex justify-between items-center py-4 border-b border-gray-200'>
              <label className='text-sm text-gray-600'>Gender</label>
              {isEditingPersonal ? (
                <select
                  value={personalInfo.gender}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                  className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              ) : (
                <p className='text-[#3A3A3A] font-medium'>{personalInfo.gender}</p>
              )}
            </div>
            <div className='flex justify-between items-center py-4 border-b border-gray-200'>
              <label className='text-sm text-gray-600'>Residency</label>
              {isEditingPersonal ? (
                <input
                  type='text'
                  value={personalInfo.residency}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, residency: e.target.value })}
                  className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                />
              ) : (
                <p className='text-[#3A3A3A] font-medium'>{personalInfo.residency}</p>
              )}
            </div>
            <div className='flex justify-between items-center py-4 border-b border-gray-200'>
              <label className='text-sm text-gray-600'>Phone number</label>
              {isEditingPersonal ? (
                <input
                  type='tel'
                  value={personalInfo.phoneNumber}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })}
                  className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                />
              ) : (
                <p className='text-[#3A3A3A] font-medium'>{personalInfo.phoneNumber}</p>
              )}
            </div>
            <div className='flex justify-between items-center py-4'>
              <label className='text-sm text-gray-600'>Email</label>
              {isEditingPersonal ? (
                <input
                  type='email'
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                />
              ) : (
                <p className='text-[#3A3A3A] font-medium'>{personalInfo.email}</p>
              )}
            </div>
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
                {isEditingAdmin ? (
                  <input
                    type='text'
                    value={adminInfo.adminId}
                    onChange={(e) => setAdminInfo({ ...adminInfo, adminId: e.target.value })}
                    className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                  />
                ) : (
                  <>
                    <p className='text-[#3A3A3A] font-medium'>{adminInfo.adminId}</p>
                    <button
                      onClick={handleCopyAdminId}
                      className='p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer'
                    >
                      <CopyIcon className='w-5 h-5 text-gray-600' />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className='flex justify-between items-center py-4 border-b border-gray-200'>
              <label className='text-sm text-gray-600'>Username</label>
              {isEditingAdmin ? (
                <input
                  type='text'
                  value={adminInfo.username}
                  onChange={(e) => setAdminInfo({ ...adminInfo, username: e.target.value })}
                  className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                />
              ) : (
                <p className='text-[#3A3A3A] font-medium'>{adminInfo.username}</p>
              )}
            </div>
            <div className='flex justify-between items-center py-4 border-b border-gray-200'>
              <label className='text-sm text-gray-600'>Role</label>
              {isEditingAdmin ? (
                <input
                  type='text'
                  value={adminInfo.role}
                  onChange={(e) => setAdminInfo({ ...adminInfo, role: e.target.value })}
                  className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                />
              ) : (
                <p className='text-[#3A3A3A] font-medium'>{adminInfo.role}</p>
              )}
            </div>
            <div className='flex justify-between items-center py-4'>
              <label className='text-sm text-gray-600'>Password</label>
              <div className='flex items-center gap-2'>
                {isEditingAdmin ? (
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminInfo.password}
                    onChange={(e) => setAdminInfo({ ...adminInfo, password: e.target.value })}
                    className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                  />
                ) : (
                  <>
                    <p className='text-[#3A3A3A] font-medium'>{adminInfo.password}</p>
                    <button
                      onClick={togglePasswordVisibility}
                      className='p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer'
                    >
                      <EyeIcon className='w-5 h-5 text-gray-600' />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className='bg-white border-2 border-gray-300 rounded-xl'>
          <div className='flex h-15 rounded-tr-lg rounded-tl-lg bg-gray-300 px-5 justify-between items-center'>
            <h3 className='text-xl font-semibold text-[#3A3A3A]'>Preferences</h3>
            <button
              onClick={() => setIsEditingPreferences(!isEditingPreferences)}
              className='p-2 active:scale-97 rounded-full transition-colors cursor-pointer'
            >
              <EditIcon className='w-5 h-5 text-black' />
            </button>
          </div>
          <div className='p-5 space-y-6'>
            {/* Layout Options */}
            <div>
              <label className='block text-sm text-gray-600 mb-3'>Theme</label>
              <div className='flex px-10 gap-6'>
                <button onClick={() => setSelectedLayout('layout1')} className={`flex gap-4 border-2 rounded-2xl p-4 transition-all ${ selectedLayout === 'layout1' ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300' }`} >
                  <div className='bg-gray-300 w-10 h-10 rounded'></div>
                  <div className='w-25 space-y-2'>
                    <div className='bg-gray-200 h-9 rounded'></div>
                    <div className='bg-gray-200 h-9 rounded'></div>
                    <div className='bg-gray-200 h-5 rounded'></div>
                  </div>
                </button>

                <button onClick={() => setSelectedLayout('layout2')} className={` bg-[#3A3A3A] flex gap-2 border-2 p-4 rounded-2xl transition-all ${ selectedLayout === 'layout2'  ? 'border-blue-500'  : 'border-gray-200 hover:border-gray-300' }`} >
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
                    onClick={() => setSelectedFontSize(size)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedFontSize === size
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
        </div>
      </div>
    </div>
  )
}

export default Profile
