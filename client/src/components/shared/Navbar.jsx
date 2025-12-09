import React, { useState } from 'react'
import LidetaLogo from '../../assets/LidetaLogo.svg'
import ArrowSvg from '../../assets/arrow.svg'
import UkFlag from '../../assets/uk_flag.png'


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

  const [currentPage, setCurrentPage] = useState('Home')

  return (
    <div className='w-full h-18 flex bg-white/60 backdrop-blur-3xl justify-around items-center sticky top-0 z-10 ' >
          <img src={LidetaLogo} alt="" />
          
          <div className='flex justify-center items-center gap-12 font-jost font-medium ' >
        
          {
            navs.map(nav => {
              return <Link to={nav.to} >{ nav.name }</Link>
            })
          }

          </div>

          <div className='w-40 h-full flex justify-center items-center' >
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