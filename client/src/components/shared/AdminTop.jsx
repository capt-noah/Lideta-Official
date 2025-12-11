import { useContext } from 'react'
import { adminContext } from '../utils/AdminContext'

import SearchIcon from '../../assets/icons/search_icon.svg?react'
import ArrowSvg from '../../assets/arrow.svg?react'
import UkFlag from '../../assets/uk_flag.png'
import BellIcon from '../../assets/icons/bell_icon.svg?react'

import ProfilePic from '../../assets/profile.jpeg'

function AdminTop() {

  const { admin, setAdmin } = useContext(adminContext)
  console.log(admin)

  const token = localStorage.getItem('token')

  if (token) {
    
  }



  return (
      <div className='flex bg-white/80 backdrop-blur-2xl justify-between items-center px-2 sticky top-0 ' >
        
          <div className='w-80 h-13 bg-[#F0F0F0] rounded-xl flex items-center justify-around font-roboto font-medium relative ' >
            <SearchIcon className="w-6 h-6 text-[#3A3A3A] " />
            <input type="text" placeholder='Search' className='w-65 h-10 text-[#3A3A3A] font-light focus:outline-0 ' />
          </div>

          <div className='w-100 h-15 flex justify-around items-center' >
            <div className='w-30 h-10 px-1 flex items-center justify-around rounded-full border font-roboto font-normal ' >
                
                <img src={UkFlag} alt="" />
                <p>English</p>
                <button>
                    <ArrowSvg />
                </button>
                
            </div>
              
              <div className='w-12 h-12 bg-[#3A3A3A] rounded-full flex justify-center items-center ' >
                <BellIcon className="w-6 h-6" />
              </div>
              

                {
                  admin?
                  <div className='w-45 h-16 bg-[#3A3A3A] rounded-full flex gap-2 items-center px-1 ' >
                    <img src={ProfilePic} className='w-14 h-14 bg-gray-500 rounded-full ' />
                    <div className='w-25 h-14 font-roboto text-sm text-white flex flex-col justify-center ' >
                        <p className='font-semibold truncate' >{admin.first_name} {admin.last_name}</p>
                        <p className='text-xs truncate' >{admin.username}</p>
                    </div>
                  </div>
                  :
                  'Loading'
                }
              

              
          </div>


      </div>
  )
}

export default AdminTop