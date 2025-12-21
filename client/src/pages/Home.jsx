import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/shared/Navbar.jsx'
import Footer from '../components/shared/Footer.jsx'

function Home() {

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <div className='flex-grow'>
        <Outlet />
      </div>
      <Footer />
    </div>


  )
}

export default Home