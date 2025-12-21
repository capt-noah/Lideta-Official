import { useContext } from 'react'
import { adminContext } from '../utils/AdminContext'

import ArrowSvg from '../../assets/arrow.svg?react'
import UkFlag from '../../assets/uk_flag.png'
import BellIcon from '../../assets/icons/bell_icon.svg?react'



function AdminTop() {

  const { admin, setAdmin } = useContext(adminContext)

  const token = localStorage.getItem('token')

  if (token) {
    
  }



  return (
      <div className='flex bg-white/60 backdrop-blur-2xl z-10 justify-end items-center px-2 sticky top-0 ' >
        

          <div className='w-fit h-15 flex justify-around items-center' >
            {/* Language and Bell icons commented out in original */}
              
                {
                  admin?
                  <div className='w-45 h-16 bg-[#3A3A3A] rounded-full flex gap-2 items-center px-1' >
                    <div className='w-14 h-14 rounded-full overflow-hidden border-2 border-white flex-shrink-0 bg-gray-600 flex items-center justify-center text-white font-bold text-xl'>
                      {admin.photo ? (
                        <img src={admin.photo} className='w-full h-full object-cover' alt="Profile" />
                      ) : (
                        <span>{admin.first_name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className='w-25 h-14 font-roboto text-sm text-white flex flex-col justify-center ' >
                        <p className='font-semibold truncate' >{admin.first_name} {admin.last_name}</p>
                        <p className='text-xs truncate' >{admin.username}</p>
                    </div>
                  </div>
                  :
                  // Loading Skeleton
                  <div className='w-45 h-16 bg-[#3A3A3A] rounded-full flex gap-2 items-center px-1 animate-pulse'>
                    <div className='w-14 h-14 bg-gray-600 rounded-full flex-shrink-0' />
                    <div className='w-25 h-14 flex flex-col justify-center gap-2'>
                        <div className='h-3 bg-gray-600 rounded w-20' />
                        <div className='h-2 bg-gray-600 rounded w-12' />
                    </div>
                  </div>
                }
              
          </div>


      </div>
  )
}

export default AdminTop