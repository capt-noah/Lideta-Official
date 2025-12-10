import React from 'react'
import Home from './pages/Home.jsx'
import Departments from './pages/Departments.jsx'
import AboutUs from './pages/AboutUs.jsx'
import Contacts from './pages/Contacts.jsx'
import Compliants from './pages/Compliants.jsx'
import Events from './pages/Events.jsx'
import News from './pages/News.jsx'
import NewsDetails from './pages/NewsDetails.jsx'
import EventDetails from './pages/EventDetails.jsx'
import Vaccancy from './pages/Vaccancy.jsx'
import VacancyDetails from './pages/VacancyDetails.jsx'
import Navbar from './components/shared/Navbar.jsx'

import Admin from './pages/Admin/Admin.jsx'
import AdminHome from './pages/Admin/Home.jsx'
import AdminCompliants from './pages/Admin/Compliants.jsx'
import AdminEvent from './pages/Admin/Event.jsx'
import AdminNews from './pages/Admin/News.jsx'
import AdminProfile from './pages/Admin/Profile.jsx'
import AdminVacancy from './pages/Admin/Vaccancy.jsx'
import { Route, Routes } from 'react-router-dom'
import ScrollToTop from './components/utils/ScrollToTop.jsx'

function App() {

  return (
    <div>

      <Navbar />


    <ScrollToTop />
        

      <Routes>

        <Route path='/' element={<Home />} />
        <Route path='/departments' element={<Departments />} />
        <Route path='/about_us' element={<AboutUs />} />
        <Route path='/contacts' element={<Contacts />} />
        <Route path='/compliants' element={<Compliants />} />
        <Route path='/events' element={<Events />} />
        <Route path='/events/:id' element={<EventDetails />} />
        <Route path='/news' element={<News />} />
        <Route path='/news/:id' element={<NewsDetails />} />
        <Route path='/vaccancy' element={<Vaccancy />} />
        <Route path='/vaccancy/:id' element={<VacancyDetails />} />

        <Route path='/admin' element={<Admin />}>
          <Route path='home' element={ <AdminHome /> } />
          <Route path='compliants' element={ <AdminCompliants /> } />
          <Route path='events' element={ <AdminEvent /> } />
          <Route path='news' element={ <AdminNews /> } />
          <Route path='vacancy' element={ <AdminVacancy /> } />
          <Route path='profile' element={ <AdminProfile /> } />
        </Route>


      </Routes>


    </div>
  )
}

export default App