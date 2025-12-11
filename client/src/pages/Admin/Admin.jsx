import { Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Sidebar from '../../components/shared/Sidebar.jsx'
import AdminTop from '../../components/shared/AdminTop.jsx'

import { adminContext } from '../../components/utils/AdminContext.jsx'


function Admin() {
  const navigate = useNavigate()

  const [admin, setAdmin] = useState(null)
  const [activeItem, setActiveItem] = useState('home')

  const token = localStorage.getItem('token')

  useEffect(() => {
    if(!token) navigate('/login')
  })


  useEffect(() => {

    async function getAdminData() {
      const response = await fetch('http://localhost:3000/auth/admin/me', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        localStorage.removeItem('token')
        navigate('/login')
      }
      const adminsData = await response.json()
      
      setAdmin(adminsData)
    }

    if(token) getAdminData()
  }, [token])

  return (

    <adminContext.Provider value={{ admin, setAdmin}}>
      <div className='w-full h-screen grid grid-cols-[130px_1fr] ' >
          <div className='flex justify-center items-start py-5' >
              <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
          </div>

          <div className='grid grid-rows-[90px_1fr_30px] ' >
                <AdminTop />
                <Outlet />
          </div> 
      </div>
    </adminContext.Provider>
  )
}

export default Admin