import { Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Sidebar from '../../components/shared/Sidebar.jsx'
import AdminTop from '../../components/shared/AdminTop.jsx'

import { adminContext } from '../../components/utils/AdminContext.jsx'


function Admin() {
  const navigate = useNavigate()

  /* State Declarations */
  const [admin, setAdmin] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (!token) {
      navigate('/auth/login')
    }
  }, [token, navigate])


  // Role → default landing path for dedicated admins
  const ROLE_DEFAULT_PATH = {
    news_admin: '/admin/news',
    event_admin: '/admin/events',
    complaint_admin: '/admin/compliants',
    vacancy_admin: '/admin/vacancy',
  }

  useEffect(() => {

    async function getAdminData() {

      const response = await fetch('/auth/admin/me', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        localStorage.removeItem('token')
        setToken(null)
        navigate('/auth/login')
        return
      }
      const adminsData = await response.json()
      
      setAdmin(adminsData)

      // Redirect role-specific admins if they land on the generic /admin home
      const defaultPath = ROLE_DEFAULT_PATH[adminsData.role]
      if (defaultPath && window.location.pathname === '/admin') {
        navigate(defaultPath, { replace: true })
      }
    }

    if(token) getAdminData()
  }, [token])

  return (

    <adminContext.Provider value={{ admin, setAdmin, token}}>
      <div className='w-full h-screen grid grid-cols-[130px_1fr] ' >
          <div className='flex justify-center items-start py-5' >
              <Sidebar />
          </div>

          <div className='grid grid-rows-[90px_1fr_30px] ' >
              <AdminTop />
              {token ? <Outlet /> : ''}
          </div> 
      </div>
    </adminContext.Provider>
  )
}

export default Admin