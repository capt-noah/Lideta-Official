import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/shared/Navbar.jsx'
import Footer from '../components/shared/Footer.jsx'

function Home() {

  return (
    <div>
      <Navbar />
      <Outlet />
      {/* <Footer /> */}
    </div>


  )
}

export default Home