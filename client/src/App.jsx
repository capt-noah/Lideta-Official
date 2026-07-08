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
import UserAuth from './pages/UserAuth.jsx'
import UserDashboard from './pages/UserDashboard.jsx'

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
import { Route, Routes, Navigate } from 'react-router-dom'
import RoleGuard from './components/utils/RoleGuard.jsx'
import ScrollToTop from './components/utils/ScrollToTop.jsx'
import HomePage from './pages/HomePage.jsx'

import GlobalSatisfactionTrigger from './components/forms/GlobalSatisfactionTrigger.jsx'

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

          {/* User auth & dashboard */}
          <Route path='/account/auth' element={<UserAuth />} />
          <Route path='/account' element={<UserDashboard />} />

          <Route path='/admin' element={<Admin />}>
            {/* Home dashboard — only full admin */}
            <Route path='/admin' element={
              <RoleGuard allowedRoles={['admin']}>
                <AdminHome />
              </RoleGuard>
            } />
            {/* Complaints — full admin + complaint_admin */}
            <Route path='compliants' element={
              <RoleGuard allowedRoles={['admin', 'complaint_admin']}>
                <AdminCompliants />
              </RoleGuard>
            } />
            {/* Events — full admin + event_admin */}
            <Route path='events' element={
              <RoleGuard allowedRoles={['admin', 'event_admin']}>
                <AdminEvent />
              </RoleGuard>
            } />
            {/* News — full admin + news_admin */}
            <Route path='news' element={
              <RoleGuard allowedRoles={['admin', 'news_admin']}>
                <AdminNews />
              </RoleGuard>
            } />
            {/* Vacancy — full admin + vacancy_admin */}
            <Route path='vacancy' element={
              <RoleGuard allowedRoles={['admin', 'vacancy_admin']}>
                <AdminVacancy />
              </RoleGuard>
            } />
            {/* Profile — accessible by all admin roles */}
            <Route path='profile' element={
              <RoleGuard allowedRoles={['admin', 'complaint_admin', 'event_admin', 'news_admin', 'vacancy_admin']}>
                <AdminProfile />
              </RoleGuard>
            } />
          </Route>

          <Route path='/superadmin' element={<SuperAdminLayout />}>
            <Route index element={<Navigate to='home' replace />} />
            <Route path='home' element={<SuperAdminHome />} />
            <Route path='profile' element={<SuperAdminProfile />} />
          </Route>
        </Routes>
        
        <GlobalSatisfactionTrigger />

      </div>
    </LanguageProvider>
  )
}

export default App