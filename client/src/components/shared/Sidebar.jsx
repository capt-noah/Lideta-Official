import { useState, useContext } from 'react'
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

  const handleLogout = () => setShowLogoutDialog(true)

  const handleDeleteConfirm = () => {
    localStorage.removeItem('token')
    setAdmin(null)
    navigate('/auth/login')
  }

  // ── Role-specific nav items (top section) ──────────────────────────
  const ALL_NAV_ITEMS = [
    { id: 'home',       icon: HomeIcon,      path: '/admin' },
    { id: 'compliants', icon: CompliantIcon, path: '/admin/compliants' },
    { id: 'events',     icon: CalenderIcon,  path: '/admin/events' },
    { id: 'news',       icon: BookIcon,      path: '/admin/news' },
    { id: 'vacancy',    icon: VacancyIcon,   path: '/admin/vacancy' },
  ]

  const ROLE_ITEMS = {
    admin:           ['home', 'compliants', 'events', 'news', 'vacancy'],
    complaint_admin: ['compliants'],
    event_admin:     ['events'],
    news_admin:      ['news'],
    vacancy_admin:   ['vacancy'],
  }

  // ── Bottom section — always visible regardless of role ─────────────
  const BOTTOM_ITEMS = [
    { id: 'profile', icon: GearIcon, path: '/admin/profile' },
  ]

  // Only compute allowed items once admin is loaded — prevents flash on refresh
  const allowedIds  = admin ? (ROLE_ITEMS[admin.role] ?? ROLE_ITEMS['admin']) : null
  const topItems    = allowedIds ? ALL_NAV_ITEMS.filter(item => allowedIds.includes(item.id)) : []
  const bottomItems = BOTTOM_ITEMS

  // ── Shared nav-item renderer ────────────────────────────────────────
  const NavItem = ({ icon: Icon, path, id }) => {
    const isActive = pathname === path
    return (
      <Link to={path} key={id} className='w-25 flex flex-col items-end cursor-pointer'>
        {/* Top corner cap */}
        <div className='w-4 h-4' style={{ background: isActive ? 'white' : 'transparent' }}>
          <div className={`w-full h-full bg-[#3A3A3A] ${isActive ? 'rounded-br-xl' : ''}`} />
        </div>

        {/* Icon pill */}
        <div className={`w-17 h-10 ${isActive ? 'bg-white' : 'bg-[#3A3A3A]'} rounded-tl-xl rounded-bl-xl`}>
          <button className='w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition-colors'>
            <Icon alt={id} className={`w-6 h-6 ${isActive ? 'text-black' : 'text-white'}`} />
          </button>
        </div>

        {/* Bottom corner cap */}
        <div className='w-4 h-4' style={{ background: isActive ? 'white' : 'transparent' }}>
          <div className={`w-full h-full bg-[#3A3A3A] ${isActive ? 'rounded-tr-xl' : ''}`} />
        </div>
      </Link>
    )
  }

  // ── Skeleton pill (shown while admin loads) ─────────────────────────
  const SkeletonPill = ({ delay = 0 }) => (
    <div className='w-25 flex flex-col items-end' style={{ animationDelay: `${delay}ms` }}>
      <div className='w-4 h-4 bg-[#3A3A3A]' />
      <div
        className='w-17 h-10 rounded-tl-xl rounded-bl-xl bg-white/10 animate-pulse'
        style={{ animationDelay: `${delay}ms` }}
      />
      <div className='w-4 h-4 bg-[#3A3A3A]' />
    </div>
  )

  return (
    <div className='w-25 h-[calc(100vh-40px)] bg-[#3A3A3A] rounded-2xl flex flex-col items-center justify-between py-6 fixed top-5'>

      {/* ── TOP SECTION: role-specific nav ────────────────────────── */}
      <div className='flex flex-col items-center space-y-10'>
        {/* Avatar */}
        <div className='w-10 h-10 rounded-full bg-white flex items-center justify-center'>
          <UserIcon alt='User' className='w-5 h-5' />
        </div>

        <div className='flex flex-col items-center space-y-1'>
          {allowedIds === null ? (
            // Loading state — show animated skeleton pills
            <>
              <SkeletonPill delay={0} />
              <SkeletonPill delay={80} />
              <SkeletonPill delay={160} />
            </>
          ) : (
            // Loaded — show only the items this role can access
            topItems.map(item => (
              <NavItem key={item.id} {...item} />
            ))
          )}
        </div>
      </div>

      {/* ── BOTTOM SECTION: always-visible profile + logout ───────── */}
      <div className='flex flex-col items-center space-y-1'>
        {/* Profile / Settings — always shown */}
        {bottomItems.map(item => (
          <NavItem key={item.id} {...item} />
        ))}

        {/* Divider */}
        <div className='w-8 h-px bg-white/20 my-1' />

        {/* Logout */}
        <button
          className='w-10 h-10 flex items-center justify-center rounded-md cursor-pointer hover:bg-white/10 transition-colors'
          onClick={handleLogout}
        >
          <LogoutIcon alt='Logout' className='w-6 h-6 text-white' />
        </button>
      </div>

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
