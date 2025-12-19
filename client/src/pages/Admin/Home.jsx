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
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { authorization: `Bearer ${token}` }
        
        // Fetch all data in parallel
        const [vacanciesRes, applicantsRes, eventsRes, newsRes, activitiesRes] = await Promise.all([
          fetch('/admin/vacancies', { headers }),
          fetch('/admin/applicants', { headers }),
          fetch('/admin/events', { headers }),
          fetch('/admin/news', { headers }),
          fetch('/admin/activities', { headers })
        ])

        const vacancies = await vacanciesRes.json()
        const applicants = await applicantsRes.json()
        const events = await eventsRes.json()
        const news = await newsRes.json()
        const activitiesData = await activitiesRes.json()
        
        // Set Stats
        setStats({
          vacancies: vacancies.length || 0,
          applicants: applicants.length || 0,
          events: events.length || 0,
          news: news.length || 0
        })

        // Set Latest Items
        if (vacancies.length > 0) setLatestVacancy(vacancies[0]) // Assumes sorted by latest
        
        // Filter upcoming events and pick nearest
        const upcoming = events.filter(e => e.status === 'upcoming')
        if (upcoming.length > 0) setUpcomingEvent(upcoming[0])
         else if (events.length > 0) setUpcomingEvent(events[0]) // Fallback
         

        if (news.length > 0) setLatestNews(news[0])

        // Set Recent Activities
        if (activitiesData.status === 'Success') {
           setRecentActivities(activitiesData.activities)
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (token) fetchData()
  }, [token])

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
               {[1, 2, 3, 4, 5, 6, 7].map((i) => (
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
            {/* Can add a date/time widget here if needed */}
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

      {/* Sidebar: Recent Activities */}
        <div className=' px-2' >
          <div className='w-full h-full bg-[#F5F5F7] rounded-xl flex flex-col py-6 px-4 space-y-6 overflow-hidden' >
             <div className='flex justify-between items-center px-1'>
                <h2 className='font-bold font-goldman text-xl text-gray-800'>Recent Activities</h2>
             </div>
             
             <div className='overflow-y-auto pr-1 flex-1'>
                <div className='space-y-4'>
                   {recentActivities.length > 0 ? (
                      recentActivities.map((act, idx) => (
                         <div key={idx} className='bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex gap-3 hover:bg-gray-50 transition-colors'>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                               act.entity_type === 'VACANCY' ? 'bg-blue-100 text-blue-600' :
                               act.entity_type === 'EVENT' ? 'bg-orange-100 text-orange-600' :
                               'bg-pink-100 text-pink-600'
                            }`}>
                               {act.entity_type === 'VACANCY' ? <FileIcon className="w-4 h-4"/> :
                                act.entity_type === 'EVENT' ? <CalenderIcon className="w-4 h-4"/> :
                                <GraphIcon className="w-4 h-4"/>}
                            </div>
                            <div className='flex-1 min-w-0'>
                               <p className='text-xs text-gray-500 font-bold'>
                                 <span className='text-[#4F46E5]'>@{act.username}</span> {act.action.toLowerCase()} a {act.entity_type.toLowerCase()}
                               </p>
                               <p className='text-sm font-bold text-gray-800 truncate leading-tight mt-0.5'>{act.entity_title}</p>
                               <p className='text-[10px] text-gray-400 mt-1'>
                                 {new Date(act.created_at).toLocaleDateString()}
                               </p>
                            </div>
                         </div>
                      ))
                   ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                         <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                            <ClockIcon className="w-6 h-6 opacity-30"/>
                         </div>
                         <p className='text-sm text-center'>No recent activities</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
  )
}

export default Home