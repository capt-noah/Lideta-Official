import { NavLink, Outlet } from 'react-router-dom'

import Sidebar from '../../components/shared/SideBar'
import AdminTop from '../../components/shared/AdminTop'

import AdminCompliants from './Compliants'

function Admin() {


  return (
    <div className='w-full h-screen grid grid-cols-[130px_1fr] ' >
      <div className='flex justify-center items-start py-5' >
          <Sidebar />
      </div>

      <div className='grid grid-rows-[90px_1fr_30px] ' >
            <AdminTop />
            <Outlet />
      </div> 
    </div>
  )
}

export default Admin