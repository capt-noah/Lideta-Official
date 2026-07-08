import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { adminContext } from '../utils/AdminContext'

// Maps each role to its default landing path
const ROLE_DEFAULT_PATH = {
  admin:           '/admin',
  complaint_admin: '/admin/compliants',
  event_admin:     '/admin/events',
  news_admin:      '/admin/news',
  vacancy_admin:   '/admin/vacancy',
}

/**
 * RoleGuard
 * 
 * Wraps a route and only renders it if the logged-in admin's role
 * is included in the `allowedRoles` prop.
 * 
 * If not allowed, redirects to the admin's own default section.
 * If admin data isn't loaded yet (null), renders nothing (waits).
 *
 * Usage:
 *   <RoleGuard allowedRoles={['admin', 'news_admin']}>
 *     <AdminNews />
 *   </RoleGuard>
 */
function RoleGuard({ allowedRoles, children }) {
  const { admin } = useContext(adminContext)

  // Still loading admin data — don't redirect yet
  if (!admin) return null

  if (allowedRoles.includes(admin.role)) {
    return children
  }

  // Redirect to the admin's permitted landing page
  const fallback = ROLE_DEFAULT_PATH[admin.role] ?? '/admin'
  return <Navigate to={fallback} replace />
}

export default RoleGuard
