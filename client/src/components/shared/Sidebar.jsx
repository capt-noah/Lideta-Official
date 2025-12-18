import { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { adminContext } from '../utils/AdminContext'

import HomeIcon from '../../assets/icons/home_icon.svg?react'
import UserIcon from '../../assets/icons/user_icon.svg?react'
import CompliantIcon from '../../assets/icons/compliant_icon2.svg?react'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import BookIcon from '../../assets/icons/book_icon.svg?react'
import VacancyIcon from '../../assets/icons/search_icon.svg?react'
import GearIcon from '../../assets/icons/gear_icon.svg?react'
import LogoutIcon from '../../assets/icons/logout_icon.svg?react'

import ConfirmationDialog from '../ui/ConfirmationDialog'


function Sidebar() {

  const { admin, setAdmin } = useContext(adminContext)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const navigate = useNavigate()
  const { pathname } = useLocation()

  function handleLogout() {
    setShowLogoutDialog(true)

  }

  const handleDeleteConfirm = () => {
    localStorage.removeItem('token')
    setAdmin(null)
    navigate('/auth/login')
  }

  const items = [
    { id: 'home', icon: HomeIcon, path: '/admin' },
    { id: 'compliants', icon: CompliantIcon, path: '/admin/compliants' },
    { id: 'events', icon: CalenderIcon, path: '/admin/events' },
    { id: 'news', icon: BookIcon, path: '/admin/news' },
    { id: 'vacancy', icon: VacancyIcon, path: '/admin/vacancy' },
    { id: 'profile', icon: GearIcon, path: '/admin/profile' },
  ]

  return (
    <div className='w-25 h-195 bg-[#3A3A3A] rounded-2xl flex flex-col items-center justify-between py-6 fixed top-5'>
      {/* Top user avatar */}
      <div className='flex flex-col items-center space-y-10'>
        <div className='w-10 h-10 rounded-full bg-white flex items-center justify-center'>
          <UserIcon alt='User' className='w-5 h-5' />
        </div>

        <div className='flex flex-col items-center space-y-1'>
          {items.map((item) => {
            const isActive = pathname === item.path

            return (
              <Link to={item.path} key={item.id} className=' w-25 flex flex-col items-end cursor-pointer' >

                {isActive ?
                  
                  <div className='w-4 h-4 bg-white ' >
                    <div className='w-full h-full bg-[#3A3A3A] rounded-br-xl' />
                  </div>
                  :
                  <div className='w-4 h-4 bg-[#3A3A3A] ' />
                }
                <div className={`w-17 h-10 ${isActive? 'bg-white' : 'bg-[#3A3A3A]'} rounded-tl-xl rounded-bl-xl`}  >
                  <button className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition-colors`} >
                      <item.icon alt={item.id} className={`w-6 h-6 ${isActive? 'text-black' : 'text-white' } `} />
                  </button>
                </div>

                {isActive ?
                  
                  <div className='w-4 h-4 bg-white ' >
                    <div className='w-full h-full bg-[#3A3A3A] rounded-tr-xl' />
                  </div>
                  :
                  <div className='w-4 h-4 bg-[#3A3A3A] ' />
                }
              
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom logout button */}
      <button className='w-10 h-10 flex items-center justify-center rounded-md cursor-pointer hover:bg-white/10 transition-colors' onClick={handleLogout} >
        <LogoutIcon alt='Logout' className='w-6 h-6' />
      </button>

      <ConfirmationDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Logout?"
        message="Are you sure you want to logout?"
        confirmText="Logout"
      />
    </div>

  
  )
}

export default Sidebar














