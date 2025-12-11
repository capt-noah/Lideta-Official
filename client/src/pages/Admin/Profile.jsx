import { useState, useContext } from 'react'
import { adminContext } from '../../components/utils/AdminContext'
import EditIcon from '../../assets/icons/edit_icon.svg?react'
import CopyIcon from '../../assets/icons/copy_icon.svg?react'
import EyeShowIcon from '../../assets/icons/eye_show_icon.svg?react'
import EyeHideIcon from '../../assets/icons/eye_hide_icon.svg?react'
import ProfilePic from '../../assets/profile.jpeg'
import ProfileSkeletons from '../../components/ui/ProfileSkeletons'

function Profile() {
  const [showPassword, setShowPassword] = useState(false)
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [isEditingAdmin, setIsEditingAdmin] = useState(false)
  const [isEditingPreferences, setIsEditingPreferences] = useState(false)
  const [selectedLayout, setSelectedLayout] = useState('layout1')
  const [selectedFontSize, setSelectedFontSize] = useState('medium')

  const { admin, setAdmin } = useContext(adminContext)
  console.log(admin)

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
    password: 'abe_pass'
  })

  const handleCopyAdminId = () => {
    navigator.clipboard.writeText(adminInfo.adminId)
    // You could add a toast notification here
  }

  return (
  <div>
    {
      admin?
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
            <h2 className='text-2xl font-bold text-[#3A3A3A] mb-1'>{admin.first_name} {admin.last_name}</h2>
            <p className='text-gray-600 text-sm'>{admin.username}</p>
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
                    value={admin.first_name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
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
                    value={admin.last_name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
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
                    value={admin.gender}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                    className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
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
                    value={admin.residency}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, residency: e.target.value })}
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
                    value={admin.phone_number}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })}
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
                    value={admin.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                  />
                ) : (
                  <p className='text-[#3A3A3A] font-medium'>{admin.email}</p>
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
                      value={admin.admin_id}
                      onChange={(e) => setAdminInfo({ ...adminInfo, adminId: e.target.value })}
                      className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                    />
                  ) : (
                    <>
                      <p className='text-[#3A3A3A] font-medium'>{admin.admin_id}</p>
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
                    value={admin.username}
                    onChange={(e) => setAdminInfo({ ...adminInfo, username: e.target.value })}
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
                    value={admin.role}
                    onChange={(e) => setAdminInfo({ ...adminInfo, role: e.target.value })}
                    className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                  />
                ) : (
                  <p className='text-[#3A3A3A] font-medium'>{admin.role}</p>
                )}
              </div>
              <div className='flex justify-between items-center py-4'>
                <label className='text-sm text-gray-600'>Password</label>
                <div className='flex items-center gap-2'>
                  {isEditingAdmin ? (
                    <input
                      type={showPassword? 'text' : 'password'}
                      value={adminInfo.password}
                      onChange={(e) => setAdminInfo({ ...adminInfo, password: e.target.value })}
                      className='w-64 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] text-right'
                    />
                  ) : (
                    <>
                      <p className='text-[#3A3A3A] font-medium'>{showPassword? adminInfo.password : '********'}</p>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className='p-1 w-8 h-8 hover:bg-gray-100 rounded transition-colors cursor-pointer'
                      >
                        {showPassword? <EyeHideIcon /> : <EyeShowIcon />}
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
            </div>
            <div className='p-5 space-y-6'>
              {/* Layout Options */}
              <div>
                <label className='block text-sm text-gray-600 mb-3'>Theme</label>
                <div className='flex px-10 gap-6'>
                  <button onClick={() => setSelectedLayout('layout1')} className={`flex gap-4 border-2 rounded-2xl p-4 transition-all cursor-pointer ${ selectedLayout === 'layout1' ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300' }`} >
                    <div className='bg-gray-300 w-10 h-10 rounded'></div>
                    <div className='w-25 space-y-2'>
                      <div className='bg-gray-200 h-9 rounded'></div>
                      <div className='bg-gray-200 h-9 rounded'></div>
                      <div className='bg-gray-200 h-5 rounded'></div>
                    </div>
                  </button>

                  <button onClick={() => setSelectedLayout('layout2')} className={` bg-[#3A3A3A] flex gap-2 border-2 p-4 rounded-2xl transition-all cursor-pointer ${ selectedLayout === 'layout2'  ? 'border-blue-500'  : 'border-gray-200 hover:border-gray-300' }`} >
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
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
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
      :
        <ProfileSkeletons />
    
    }
</div>
  )
}

export default Profile
