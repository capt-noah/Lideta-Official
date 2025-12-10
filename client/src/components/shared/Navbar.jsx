import React, { useState } from 'react'
import LidetaLogo from '../../assets/LidetaLogo.svg?react'
import ArrowSvg from '../../assets/arrow.svg'
import UkFlag from '../../assets/uk_flag.png'
import BarsIcon from '../../assets/icons/bars_icon.svg?react'


import { Link } from 'react-router-dom'



function Navbar() {

  const navs = [
    {name: 'Home', to: '/'},
    {name: 'Departments', to: '/departments' },
    {name: 'About Us', to: '/about_us'},
    {name: 'Contacts', to: '/contacts'},
    {name: 'Compliants', to: '/compliants'},
    {name: 'Events', to: '/events'},
    {name: 'News', to: '/news'},
    {name: 'Vaccancy', to: '/vaccancy'},
  ]

  const [menu, setMenu] = useState(true)


  return (
    <div className='w-full bg-white/60 backdrop-blur-3xl flex justify-between items-start md:items-center p-6 ' >
          <LidetaLogo />
          
          <div className='hidden font-jost font-medium text-xs gap-2 md:flex md:justify-between md:text-xs md:gap-4 lg:gap-4 lg:text-sm xl:text-lg xl:gap-10 ' >
        
            {
              navs.map(nav => {
                return <Link to={nav.to} >{ nav.name }</Link>
              })
            }
          </div>
        {
        menu && (
          <div className=' h-100 px-10 flex flex-col font-jost font-medium text-lg gap-4 md:hidden ' >
            {
              navs.map(nav => {
                return <Link to={nav.to} >{nav.name}</Link>
              })
            }
          </div>
          )
            

        }

     
      
      

      <div className='w-40 h-full flex justify-center items-center gap-5' >
        
        <BarsIcon className={`w-5 h-5 cursor-pointer md:hidden ${menu? '-rotate-90' : 'rotate-0'} transition-all `} onClick={() => setMenu(!menu)} />
        
        <div className='w-30 h-8 px-1 flex items-center justify-around rounded-full border font-roboto font-normal ' >
            
          <img src={UkFlag} alt="" />

          <p>English</p>

          <button>
              <img src={ArrowSvg} alt="" />
          </button>
          
        </div>

      </div>
    </div>
  )
}

export default Navbar