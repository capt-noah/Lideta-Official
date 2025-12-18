import { Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import { adminContext } from '../../components/utils/AdminContext.jsx'

function SuperAdminLayout() {
  const navigate = useNavigate()

  const [admin, setAdmin] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (!token) {
      navigate('/auth/login')
      return
    }
  }, [token, navigate])

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
    }

    if (token) getAdminData()
  }, [token, navigate])

  return (
    <adminContext.Provider value={{ admin, setAdmin, token }}>
      <div className='w-full min-h-screen bg-[#F5F5F5]'>
        <Outlet />
      </div>
    </adminContext.Provider>
  )
}

export default SuperAdminLayout
