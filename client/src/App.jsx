import React from 'react'
import Home from './pages/Home.jsx'
import { LanguageProvider } from './components/utils/LanguageContext.jsx'
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
import DepartmentDetails from './pages/DepartmentDetails.jsx'

import Admin from './pages/Admin/Admin.jsx'
import AdminHome from './pages/Admin/Home.jsx'
import AdminCompliants from './pages/Admin/Compliants.jsx'
import AdminEvent from './pages/Admin/Event.jsx'
import AdminNews from './pages/Admin/News.jsx'
import AdminProfile from './pages/Admin/Profile.jsx'
import AdminVacancy from './pages/Admin/Vaccancy.jsx'
import Login from './pages/Admin/Login.jsx'
import SuperAdminLayout from './pages/SuperAdmin/SuperAdmin.jsx'
import SuperAdminHome from './pages/SuperAdmin/Home.jsx'
import SuperAdminProfile from './pages/SuperAdmin/Profile.jsx'
import { Route, Routes } from 'react-router-dom'
import ScrollToTop from './components/utils/ScrollToTop.jsx'
import HomePage from './pages/HomePage.jsx'

function App() {

  return (
    <LanguageProvider>
      <div>


      <ScrollToTop />
        

        <Routes>

          <Route path='/' element={<Home />}>
            <Route path='/' element={<HomePage />} />
            <Route path='departments' element={<Departments />} />
            <Route path='about_us' element={<AboutUs />} />
            <Route path='contacts' element={<Contacts />} />
            <Route path='compliants' element={<Compliants />} />
            <Route path='events' element={<Events />} />
            <Route path='events/:id' element={<EventDetails />} />
            <Route path='news' element={<News />} />
            <Route path='news/:id' element={<NewsDetails />} />
            <Route path='vaccancy' element={<Vaccancy />} />
            <Route path='vaccancy/:id' element={<VacancyDetails />} />
            <Route path='departments/:id' element={<DepartmentDetails />} />
          </Route>

          <Route path='/auth' > 
            <Route path='login' element={<Login />} />
          </Route>


          <Route path='/admin' element={<Admin />}>
            <Route path='/admin' element={ <AdminHome /> } />
            <Route path='compliants' element={ <AdminCompliants /> } />
            <Route path='events' element={ <AdminEvent /> } />
            <Route path='news' element={ <AdminNews /> } />
            <Route path='vacancy' element={ <AdminVacancy /> } />
            <Route path='profile' element={ <AdminProfile /> } />
          </Route>

          <Route path='/superadmin' element={<SuperAdminLayout />}>
            <Route path='home' element={<SuperAdminHome />} />
            <Route path='profile' element={<SuperAdminProfile />} />
          </Route>


        </Routes>


      </div>
    </LanguageProvider>
  )
}

export default App