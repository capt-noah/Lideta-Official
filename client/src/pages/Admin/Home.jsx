import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import Graph from '../../assets/compliants_graph.svg?react'
import GroupIcon from '../../assets/icons/group_icon.svg?react'
import ClockIcon from '../../assets/icons/clock_icon.svg?react'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import CheckmarkIcon from '../../assets/icons/checkmark_icon.svg?react'
import GraphIcon from '../../assets/icons/graph_icon.svg?react'
import ChartArrowIcon from '../../assets/icons/chart_arrow.svg?react'
import LocationIcon from '../../assets/icons/location_icon.svg?react'
import FileIcon from '../../assets/icons/file_icon.svg?react'
import ArrowRight from '../../assets/icons/arrow_right.svg?react'

import { adminContext } from '../../components/utils/AdminContext.jsx'


import ArrowUpRightIcon from '../../assets/arrow_up_right.svg?react'

import Status from '../../components/ui/Status.jsx'
import Notification from '../../components/ui/Notification'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'

function Home() {

  const { admin, token } = useContext(adminContext)
  
  const [stats, setStats] = useState({
    vacancies: 0,
    applicants: 0,
    events: 0,
    news: 0
  })
  
  const [latestVacancy, setLatestVacancy] = useState(null)
  const [upcomingEvent, setUpcomingEvent] = useState(null)
  const [latestNews, setLatestNews] = useState(null)
  
  // New state for Contact Requests
  const [contactRequests, setContactRequests] = useState([])
  const [selectedContact, setSelectedContact] = useState(null) // For modal
  const [loading, setLoading] = useState(true)

  // State for Resolve Confirmation
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [contactToResolve, setContactToResolve] = useState(null)
  
  const [notification, setNotification] = useState({
      isOpen: false,
      message: '',
      type: 'success'
  })

  useEffect(() => {
    const fetchData = async () => {
      // Use localStorage directly to avoid context timing issues
      const currentToken = localStorage.getItem('token')

      if (!currentToken || currentToken === 'null' || currentToken === 'undefined') {
        setLoading(false)
        return
      }

      try {
        const headers = { authorization: `Bearer ${currentToken}` }
        
        // Fetch all data in parallel using allSettled to prevent one failure from breaking everything
        const results = await Promise.allSettled([
          fetch('/api/admin/vacancies', { headers }),
          fetch('/api/admin/applicants', { headers }),
          fetch('/api/events', { headers }),
          fetch('/api/admin/news', { headers }),
          fetch('/api/admin/contacts', { headers })
        ])

        const [vacanciesRes, applicantsRes, eventsRes, newsRes, contactsRes] = results

        // Helper to process response
        const processResult = async (result, name) => {
            console.log(`Processing ${name}: status=${result.status}`)
            if (result.status === 'fulfilled') {
                 if (result.value.ok) {
                    try {
                        const data = await result.value.json()
                        console.log(`Fetch ${name} success:`, Array.isArray(data) ? `Array(${data.length})` : 'Object')
                        return data
                    } catch (e) {
                         console.error(`Fetch ${name} failed to parse JSON:`, e)
                         return []
                    }
                 } else {
                    console.error(`Fetch ${name} failed with status:`, result.value.status, result.value.statusText)
                    return []
                 }
            } else {
                console.error(`Fetch ${name} rejected:`, result.reason)
                return []
            }
        }

        const vacancies = await processResult(vacanciesRes, 'vacancies')
        const applicants = await processResult(applicantsRes, 'applicants')
        const events = await processResult(eventsRes, 'events')
        const news = await processResult(newsRes, 'news')
        const contactsData = await processResult(contactsRes, 'contacts')
        
        // Set Stats
        setStats({
          vacancies: vacancies.length || 0,
          applicants: applicants.length || 0,
          events: events.length || 0,
          news: news.length || 0
        })

        // Set Latest Items
        if (vacancies.length > 0) setLatestVacancy(vacancies[0]) 
        
        const upcoming = events.filter(e => e.status === 'upcoming')
        if (upcoming.length > 0) setUpcomingEvent(upcoming[0])
         else if (events.length > 0) setUpcomingEvent(events[0]) 

        if (news.length > 0) setLatestNews(news[0])

        // Set Contact Requests
        if (Array.isArray(contactsData)) {
           setContactRequests(contactsData)
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (token || localStorage.getItem('token')) {
        fetchData()
    } else {
        setLoading(false)
    }
  }, [token])

  const handleResolveContact = (id, e) => {
      e.stopPropagation(); // Prevent modal opening
      setContactToResolve(id);
      setShowConfirmDialog(true);
  }

  const confirmResolveContact = async () => {
      if (!contactToResolve) return;
      
      const currentToken = localStorage.getItem('token')
      
      try {
          const response = await fetch(`/api/admin/contacts/${contactToResolve}/resolve`, {
              method: 'PUT',
              headers: { authorization: `Bearer ${currentToken}` }
          })
          
          if (response.ok) {
              setContactRequests(prev => prev.filter(c => c.id !== contactToResolve))
              setNotification({
                  isOpen: true,
                  message: 'Contact request resolved successfully!',
                  type: 'success'
              })
          } else {
              setNotification({
                  isOpen: true,
                  message: 'Failed to resolve request.',
                  type: 'error'
              })
          }
      } catch (error) {
          console.error("Error resolving contact:", error)
          setNotification({
              isOpen: true,
              message: 'An error occurred while resolving.',
              type: 'error'
          })
      } finally {
          setContactToResolve(null);
      }
  }

  if (loading) return (
    <div className='grid grid-cols-[1fr_350px] gap-6 animate-pulse'>
      <div className='rounded-xl grid grid-rows-[130px_1fr_250px] gap-5'>
        {/* Greeting Section Skeleton */}
        <section className='bg-gray-200 rounded-3xl h-full w-full shadow-sm'></section>

        {/* Quick Stats Skeleton */}
        <div className='w-full grid grid-cols-2 md:grid-cols-4 gap-4'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='bg-white border-2 border-gray-100 rounded-2xl p-4 flex flex-col justify-between h-full'>
                  <div className='flex justify-between items-start'>
                    <div className='w-10 h-10 bg-gray-200 rounded-lg'></div>
                    <div className='w-12 h-5 bg-gray-100 rounded-full'></div>
                  </div>
                  <div>
                    <div className='h-8 w-12 bg-gray-200 rounded mb-2'></div>
                    <div className='h-4 w-24 bg-gray-100 rounded'></div>
                  </div>
              </div>
            ))}
        </div>

        {/* Featured Content Skeleton */}
        <div className='h-full grid grid-cols-4 gap-4 pb-2'>
           {/* Left Card */}
           <div className='bg-white border-2 border-gray-100 rounded-xl p-5 h-full flex flex-col justify-between'>
              <div className='flex justify-between'>
                 <div className='h-5 w-24 bg-gray-100 rounded-full'></div>
                 <div className='w-16 h-16 bg-gray-50 rounded-full'></div>
              </div>
              <div className='space-y-2 mt-4'>
                 <div className='h-6 w-full bg-gray-200 rounded'></div>
                 <div className='h-6 w-3/4 bg-gray-200 rounded'></div>
                 <div className='h-4 w-1/2 bg-gray-100 rounded mt-2'></div>
              </div>
              <div className='h-4 w-20 bg-gray-200 rounded mt-4'></div>
           </div>

           {/* Middle Card */}
           <div className='bg-gray-800 rounded-xl col-span-2 p-6 flex flex-col justify-between relative overflow-hidden'>
               <div className='absolute top-0 right-0 w-12 h-12 bg-gray-700/50 rounded-bl-2xl'></div>
               <div>
                  <div className='h-5 w-20 bg-gray-700 rounded-full mb-4'></div>
                  <div className='h-8 w-3/4 bg-gray-600 rounded mb-3'></div>
                  <div className='h-4 w-full bg-gray-700/50 rounded'></div>
                  <div className='h-4 w-5/6 bg-gray-700/50 rounded mt-2'></div>
               </div>
               <div className='flex gap-4 mt-4'>
                  <div className='h-8 w-24 bg-gray-700 rounded-lg'></div>
                  <div className='h-8 w-32 bg-gray-700 rounded-lg'></div>
               </div>
           </div>

           {/* Right Card */}
           <div className='bg-gray-200 rounded-xl h-full relative'>
              <div className='absolute bottom-0 left-0 p-4 w-full'>
                 <div className='h-4 w-20 bg-gray-300 rounded mb-2'></div>
                 <div className='h-5 w-full bg-gray-300 rounded mb-1'></div>
                 <div className='h-5 w-2/3 bg-gray-300 rounded'></div>
              </div>
           </div>
        </div>
      </div>

      {/* Sidebar Skeleton */}
      <div className='px-2'>
         <div className='w-full h-full bg-[#F5F5F7] rounded-xl py-6 px-4 space-y-6'>
            <div className='h-7 w-40 bg-gray-200 rounded'></div>
            <div className='space-y-5'>
               {[1, 2, 3, 4].map((i) => (
                  <div key={i} className='flex gap-3'>
                     <div className='w-8 h-8 rounded-full bg-gray-200 shrink-0'></div>
                     <div className='flex-1 space-y-2'>
                        <div className='h-3 w-full bg-gray-200 rounded'></div>
                        <div className='h-3 w-2/3 bg-gray-200 rounded'></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  )

  return (
      <div className=' grid grid-cols-[1fr_350px] gap-6'>
      <div className=' rounded-xl grid grid-rows-[130px_1fr_250px] gap-5 ' >

        {/* Greeting Section */}
        <section className='bg-[#3A3A3A] rounded-3xl text-white px-8 py-8 flex justify-between items-center shadow-xl'>
            <div className='space-y-2'>
              <h1 className='text-3xl font-goldman font-bold'>Hello, {admin?.first_name || 'Admin'}!</h1>
              <p className='text-sm opacity-80 max-w-md'>
                Manage complaints, events, news and vacancies
              </p>
            </div>
        </section>

        {/* Quick Stats Section */}
        <div className='w-full grid grid-cols-2 md:grid-cols-4 gap-4'>
           {/* Vacancies Stat */}
           <div className='bg-white border-2 border-[#E0E0E0] rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow'>
              <div className='flex justify-between items-start'>
                 <div className='p-2 bg-blue-50 rounded-lg'>
                    <FileIcon className='w-6 h-6 text-blue-600' />
                 </div>
                 <span className='text-xs text-green-500 font-bold bg-green-50 px-2 py-1 rounded-full'>Active</span>
              </div>
              <div>
                 <h2 className='text-3xl font-bold font-roboto'>{stats.vacancies}</h2>
                 <p className='text-sm text-gray-500 font-medium'>Total Vacancies</p>
              </div>
           </div>

           {/* Applicants Stat */}
           <div className='bg-white border-2 border-[#E0E0E0] rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow'>
              <div className='flex justify-between items-start'>
                 <div className='p-2 bg-purple-50 rounded-lg'>
                    <GroupIcon className='w-6 h-6 text-purple-600' />
                 </div>
                 <span className='text-xs text-green-500 font-bold bg-green-50 px-2 py-1 rounded-full'>New</span>
              </div>
              <div>
                 <h2 className='text-3xl font-bold font-roboto'>{stats.applicants}</h2>
                 <p className='text-sm text-gray-500 font-medium'>Total Applicants</p>
              </div>
           </div>

           {/* Events Stat */}
           <div className='bg-white border-2 border-[#E00E0E0] rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow'>
              <div className='flex justify-between items-start'>
                 <div className='p-2 bg-orange-50 rounded-lg'>
                    <CalenderIcon className='w-6 h-6 text-orange-600' />
                 </div>
              </div>
              <div>
                 <h2 className='text-3xl font-bold font-roboto'>{stats.events}</h2>
                 <p className='text-sm text-gray-500 font-medium'>Events</p>
              </div>
           </div>

           {/* News Stat */}
           <div className='bg-white border-2 border-[#E0E0E0] rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow'>
              <div className='flex justify-between items-start'>
                 <div className='p-2 bg-pink-50 rounded-lg'>
                    <GraphIcon className='w-6 h-6 text-pink-600' />
                 </div>
              </div>
              <div>
                 <h2 className='text-3xl font-bold font-roboto'>{stats.news}</h2>
                 <p className='text-sm text-gray-500 font-medium'>News Articles</p>
              </div>
           </div>
        </div>

        {/* Featured Content Grid */}
        <div className='h-full grid grid-cols-4 gap-4 pb-2'>

          {/* LEFT: Recent Vacancy */}
          <div className='bg-white border-2 border-[#E0E0E0] rounded-xl p-5 flex flex-col justify-between cursor-pointer hover:border-gray-400 transition-all shadow-sm relative overflow-hidden group'>
             {latestVacancy ? (
                <>
                  <div className='absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity'>
                     <FileIcon className='w-24 h-24 text-gray-800' />
                  </div>
                  <div>
                    <span className='inline-block px-3 py-1 bg-gray-100 text-xs font-semibold rounded-full mb-3 uppercase tracking-wide text-gray-600'>
                      Recent Vacancy
                    </span>
                    <h3 className='text-xl font-bold font-goldman leading-tight mb-1 line-clamp-2'>
                      {latestVacancy.title}
                    </h3>
                    <p className='text-sm text-gray-500 mb-2'>{latestVacancy.category}</p>
                    <p className='text-xs text-gray-400 font-mono'>
                       Posted: {new Date(latestVacancy.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link to="/admin/vacancy" className='flex items-center gap-2 text-sm font-bold text-[#3A3A3A] mt-4 hover:underline'>
                     View Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
             ) : (
                <div className='flex items-center justify-center h-full text-gray-400 italic'>No vacancies yet</div>
             )}
          </div>

          {/* MIDDLE: Upcoming Event */}
          <div className='bg-[#3A3A3A] border-2 border-gray-500 text-white font-roboto col-span-2 rounded-xl flex flex-col justify-between relative p-6 cursor-pointer hover:scale-[1.01] transition-all shadow-lg overflow-hidden' >
            {upcomingEvent ? (
              <>
                 <button className='absolute top-0 right-0 bg-white w-12 h-12 rounded-bl-2xl flex justify-center items-center z-10'>
                   <ArrowUpRightIcon className="text-black w-6 h-6 " />
                 </button>
                 
                 <div>
                    <h1 className='text-2xl font-bold mb-2 line-clamp-2' >{upcomingEvent.title}</h1>
                    <p className='font-light text-sm text-gray-300 line-clamp-2' >{upcomingEvent.description}</p>
                 </div>

                 <div className='flex gap-2 items-center text-xs mt-4' >
                   <div className='flex items-center gap-2 bg-[#555555] py-1.5 px-3 rounded-lg' >
                     <CalenderIcon className="w-3.5 h-3.5" />
                     <p>{upcomingEvent.start_date.split('T')[0]}</p>
                   </div>

                   <div className='flex items-center gap-2 bg-[#555555] py-1.5 px-3 rounded-lg' >
                     <LocationIcon className="w-3.5 h-3.5" />
                     <p className="truncate max-w-[150px]">{upcomingEvent.location}</p>
                  </div>
                  
                  <Status status={upcomingEvent.status || 'upcoming'} className="mb-4 inline-block" />
                  
                 </div>
              </>
            ) : (
               <div className='flex items-center justify-center h-full text-gray-400 italic'>No upcoming events</div>
            )}
          </div>

          {/* RIGHT: Latest News */}
          <div className='rounded-xl cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden group shadow-md'>
             {latestNews ? (
                <>
                   {/* Background Image */}
                   <img 
                      src={`${latestNews.image_path}`} 
                      alt="" 
                      className='w-full h-full object-cover absolute inset-0'
                      onError={(e) => {e.target.style.display='none'}}
                   />
                   {/* Gradient Overlay */}
                   <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent' />
                   
                   <div className='absolute bottom-0 left-0 p-4 w-full text-white'>
                      <span className='text-[10px] font-bold uppercase tracking-wider bg-red-600 px-2 py-0.5 rounded-sm mb-2 inline-block'>
                        Latest News
                      </span>
                      <h3 className='font-bold text-sm leading-tight line-clamp-2 mb-1 group-hover:underline'>
                         {latestNews.title}
                      </h3>
                      <p className='text-sm leading-tight line-clamp-2 opacity-80'>
                        {latestNews.short_description || latestNews.description}
                      </p>
                      <p className='text-[10px] bg-red-600 w-fit px-1 mt-1 font-bold'>{new Date(latestNews.posted_date || latestNews.created_at).toLocaleDateString()}</p>
                   </div>
                </>
             ) : (
                <div className='bg-gray-100 h-full flex items-center justify-center text-gray-400 italic border-2 border-dashed'>
                   No News
                </div>
             )}
          </div>

        </div>

      </div>

      {/* Sidebar: Contact Requests */}
        <div className=' px-2' >
          <div className='w-full h-170 bg-[#F5F5F7] rounded-xl flex flex-col py-6 px-4 space-y-6 overflow-hidden' >
             <div className='flex justify-between items-center px-1'>
                <h2 className='font-bold font-goldman text-xl text-gray-800'>Contact Requests</h2>
                 {contactRequests.length > 0 && 
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{contactRequests.length}</span>
                 }
             </div>
             
             <div className=' overflow-y-scroll pr-1 flex-1'>
                <div className='space-y-3'>
                   {contactRequests.length > 0 ? (
                      contactRequests.map((contact) => (
                         <div 
                            key={contact.id} 
                            onClick={() => setSelectedContact(contact)}
                            className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer group'
                         >
                            {/* Avatar / Initials */}
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                {contact.first_name[0]}{contact.last_name[0]}
                            </div>

                            <div className='flex-1 min-w-0'>
                               <p className='text-sm font-bold text-gray-900 truncate'>{contact.first_name} {contact.last_name}</p>
                               <p className='text-xs text-gray-500 truncate'>{contact.email}</p>
                            </div>

                            {/* Checkmark Action */}
                            <button 
                                onClick={(e) => handleResolveContact(contact.id, e)}
                                title="Mark as addressed"
                                className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-green-100 hover:text-green-600 transition-colors shrink-0'
                            >
                                <CheckmarkIcon className="w-4 h-4" />
                            </button>
                         </div>
                      ))
                   ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                         <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                            <ClockIcon className="w-6 h-6 opacity-30"/>
                         </div>
                         <p className='text-sm text-center'>No pending requests</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Modal for Contact Details */}
        {selectedContact && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedContact(null)}>
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 md:p-8 relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={() => setSelectedContact(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>

                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                             <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
                                {selectedContact.first_name[0]}{selectedContact.last_name[0]}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold font-goldman text-gray-900">{selectedContact.first_name} {selectedContact.last_name}</h2>
                                <p className="text-gray-500 flex items-center gap-2 text-sm">
                                    {selectedContact.email}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Received: {new Date(selectedContact.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message</h3>
                            <p className="text-gray-700 font-roboto leading-relaxed whitespace-pre-wrap">
                                {selectedContact.message}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button 
                                onClick={() => setSelectedContact(null)}
                                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button 
                                onClick={(e) => {
                                    handleResolveContact(selectedContact.id, e);
                                    setSelectedContact(null);
                                }}
                                className="px-5 py-2 rounded-full bg-[#3A3A3A] text-white font-bold text-sm hover:bg-black flex items-center gap-2"
                            >
                                <CheckmarkIcon className="w-4 h-4" /> Mark as Addressed
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <ConfirmationDialog
            isOpen={showConfirmDialog}
            onClose={() => setShowConfirmDialog(false)}
            onConfirm={confirmResolveContact}
            title="Mark as Addressed?"
            message="Are you sure you want to mark this request as resolved?"
            confirmText="Resolve"
        />

        <Notification
            isOpen={notification.isOpen}
            onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
            message={notification.message}
            type={notification.type}
        />

      </div>
  )
}

export default Home