import { useContext, useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminContext } from '../../components/utils/AdminContext.jsx'

import GroupIcon from '../../assets/icons/group_icon.svg?react'
import ClockIcon from '../../assets/icons/clock_icon.svg?react'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import CheckmarkIcon from '../../assets/icons/checkmark_icon.svg?react'
import GraphIcon from '../../assets/icons/graph_icon.svg?react'
import ChartArrowIcon from '../../assets/icons/chart_arrow.svg?react'
import SortIcon from '../../assets/icons/sort_icon.svg?react'
import LocationIcon from '../../assets/icons/location_icon.svg?react'
import ProfilePic from '../../assets/profile.jpeg'

import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import Status from '../../components/ui/Status.jsx'

function SuperAdminHome() {
  const { admin, token } = useContext(adminContext)
  const navigate = useNavigate()

  const [activeStat, setActiveStat] = useState('vacancy')
  const [activeProfileTab, setActiveProfileTab] = useState('profile')
  const [complaintsList, setComplaintsList] = useState()
  const [complaintsSortConfig, setComplaintsSortConfig] = useState({ key: 'date', direction: 'desc' })
  const [vacancyApplications, setVacancyApplications] = useState([])
  const [vacancyStats, setVacancyStats] = useState()
  const [vacancyCounts, setVacancyCounts] = useState()
  const [complaintStats, setComplaintStats] = useState()
  const [complaintCounts, setComplaintCounts] = useState()
  const [vacancySortConfig, setVacancySortConfig] = useState({ key: 'date', direction: 'desc' })
  const [overviewStats, setOverviewStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingApplications: 0,
    activeEvents: 0
  })

  useEffect(() => {
    async function fetchOverviewStats() {
      try {
        const response = await fetch('/superadmin/overview', {
          headers: {
            authorization: `Bearer ${token}`
          }
        })

        if (response.ok) {
          const stats = await response.json()
          setOverviewStats(stats)
        }
      } catch (error) {
        console.error('Error fetching overview stats:', error)
      }
    }

    if (token) {
      fetchOverviewStats()
    }
  }, [token])

    useEffect(() => {
  
      async function getComplaints() {
        const response = await fetch('/admin/complaints', {
          headers: {
            authorization: `Bearer ${token}`
          }
        })
        const list = await response.json()
  
        if (!response.ok) {
          localStorage.removeItem('token')
          navigate('/auth/login')
          return
        }
        console.log(list)
        setComplaintsList(list.complaints)
        setComplaintCounts(list.counts)
        setComplaintStats(list.stats)
      }
  
      getComplaints()
      
    }, [token])

    // Load vacancy applications (joined applicants + vacancies)
  useEffect(() => {
    async function fetchVacancyApplications() {
      try {
        const response = await fetch('/superadmin/vacancy-applications', {
          headers: {
            authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token')
            navigate('/auth/login')
            return
          }
          throw new Error('Failed to fetch vacancy applications')
        }

        const data = await response.json()
        console.log(data)
        setVacancyApplications(data.vacants)
        setVacancyCounts(data.counts)
        setVacancyStats(data.stats)
      } catch (error) {
        console.error('Error fetching vacancy applications:', error)
      }
    }

    if (token) {
      fetchVacancyApplications()
    }
  }, [token, navigate])

  
  const overviewCards = [
    { title: 'Total complaints', value: overviewStats.totalComplaints, trend: '+ 2.01%', up: true },
    { title: 'Resolved Complaints', value: overviewStats.resolvedComplaints, trend: '↓ 2.01%', up: false },
    { title: 'Pending Applications', value: overviewStats.pendingApplications, trend: '+ 2.01%', up: true },
    { title: 'Active Events', value: overviewStats.activeEvents, trend: '+ 2.01%', up: true }
  ]

  const data = [
    { day: '03', thisMonth: 120, lastMonth: 80 },
    { day: '06', thisMonth: 75, lastMonth: 95 },
    { day: '09', thisMonth: 150, lastMonth: 110 },
    { day: '12', thisMonth: 90, lastMonth: 130 },
    { day: '15', thisMonth: 200, lastMonth: 250 },
    { day: '18', thisMonth: 160, lastMonth: 140 },
    { day: '21', thisMonth: 30, lastMonth: 190 },
    { day: '24', thisMonth: 180, lastMonth: 210 },
    { day: '28', thisMonth: 160, lastMonth: 100 },
    { day: '31', thisMonth: 220, lastMonth: 70 }
  ]

  const vacancyMonthlyStats = [
    { month: 'Jan', applications: 32 },
    { month: 'Feb', applications: 28 },
    { month: 'Mar', applications: 45 },
    { month: 'Apr', applications: 38 },
    { month: 'May', applications: 52 },
    { month: 'Jun', applications: 47 },
    { month: 'Jul', applications: 41 },
    { month: 'Aug', applications: 39 },
    { month: 'Sep', applications: 44 },
    { month: 'Oct', applications: 36 },
    { month: 'Nov', applications: 29 },
    { month: 'Dec', applications: 33 }
  ]

  const statsConfig =
    activeStat === 'vacancy'
      ? {
          title: 'Vacancy overview',
          subtitle: 'Applicants per category this month',
          total: vacancyStats?.total,
          data: vacancyStats
        }
      : {
          title: 'Complaints overview',
          subtitle: 'Complaints per type this month',
          total: complaintCounts.total,
          data: complaintStats
        }


  function handleComplaintsSort(key) {
    setComplaintsSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  function handleVacancySort(key) {
    setVacancySortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const sortedComplaints = useMemo(() => {
    if (!complaintsList) return []
    const sorted = [...complaintsList]

    const compareString = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })

    sorted.sort((a, b) => {
      let result = 0

      switch (complaintsSortConfig.key) {
      case 'name': {
        const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim()
        const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim()
        result = compareString(nameA, nameB)
        break
      }
      case 'date': {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        result = dateA - dateB
        break
      }
      case 'type':
        result = compareString(a.type || '', b.type || '')
        break
      case 'status':
        result = compareString(a.status || '', b.status || '')
        break
      default:
        result = 0
      }

      return complaintsSortConfig.direction === 'asc' ? result : -result
    })

    return sorted
  }, [complaintsList, complaintsSortConfig])

  const sortedVacancyApplications = useMemo(() => {
    if (!vacancyApplications) return []
    const rows = [...vacancyApplications]

    const compareString = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })
    const parseNumber = (value) => {
      if (value == null) return 0
      const n = parseFloat(String(value).toString().replace(/[^\d.-]/g, ''))
      return Number.isNaN(n) ? 0 : n
    }

    rows.sort((a, b) => {
      let result = 0

      switch (vacancySortConfig.key) {
      case 'name':
        result = compareString(a.full_name || '', b.full_name || '')
        break
      case 'date': {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        result = dateA - dateB
        break
      }
      case 'category':
        result = compareString(a.category || '', b.category || '')
        break
      case 'salary':
        result = parseNumber(a.salary) - parseNumber(b.salary)
        break
      default:
        result = 0
      }

      return vacancySortConfig.direction === 'asc' ? result : -result
    })

    return rows
  }, [vacancyApplications, vacancySortConfig])

  return (
    <div className='w-full min-h-screen flex justify-center items-start py-3 px-4 md:px-6 bg-white font-roboto'>
      <div className='w-full max-w-8xl grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6'>
        {/* Left column */}
        <div className='space-y-8'>
          {/* Hero card */}
          <section className='bg-[#3A3A3A] rounded-3xl text-white px-8 py-8 flex justify-between items-center shadow-xl'>
            <div className='space-y-2'>
              <h1 className='text-3xl font-goldman font-bold'>Hello, {admin?.first_name || 'Stranger'}!</h1>
              <p className='text-sm opacity-80 max-w-md'>
                Manage complaints, events, news and vacancies
              </p>
            </div>

          </section>

          {/* Overview cards */}
          <section className='space-y-4'>
            <h2 className='text-2xl font-bold text-[#111827]'>Overview</h2>
            <div className='grid grid-cols-4 gap-4'>
              {overviewCards.map((card, index) => (
                <div
                  key={index}
                  className='bg-white rounded-2xl border border-gray-200 px-4 py-3 flex flex-col justify-between shadow-sm'
                >
                  <p className='text-xs text-gray-500 mb-1'>{card.title}</p>
                  <div className='flex items-end justify-between'>
                    <p className='text-2xl font-semibold text-[#111827]'>{card.value}</p>
                    <span
                      className={`text-xs font-medium flex items-center gap-1 ${
                        card.up ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {card.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Complaints graph and table */}
          <section className='space-y-4'>
            <h2 className='text-2xl font-bold text-[#111827]'>Complaints</h2>
            <div className='bg-white rounded-3xl border border-gray-200 px-6 py-5 shadow-sm space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='flex items-end gap-2'>
                  <p className='text-4xl font-semibold text-[#111827]'>468</p>
                  <span className='text-xs text-green-500 flex items-center gap-1'>
                    <ChartArrowIcon className='w-4 h-4' /> 22.41%
                  </span>
                </div>
              </div>

              <div className='flex items-center gap-4 text-xs text-gray-600'>
                <button className='px-4 py-1 rounded-full bg-[#111827] text-white text-xs'>January</button>
                <div className='flex items-center gap-2'>
                  <span className='w-2.5 h-2.5 rounded-full bg-[#AEAEB2]' />
                  <span>This Month</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='w-2.5 h-2.5 rounded-full bg-[#111827]' />
                  <span>Last Month</span>
                </div>
              </div>
            </div>

            <div className='w-full h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey='day' tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
                  <YAxis tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
                  <CartesianGrid stroke='#E5E7EB' strokeDasharray='4 4' />
                  <Tooltip />
                  <Line type='natural' dataKey='thisMonth' stroke='#111827' strokeWidth={3} dot={false} />
                  <Line type='natural' dataKey='lastMonth' stroke='#D1D5DB' strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Complaints table */}

            <div className='bg-white h-100 rounded-xl font-jost p-5 pt-0 space-y-5 overflow-y-auto '>
              <h1 className='text-sm font-bold bg-white sticky top-0'>Compliants List</h1>
      
              <div className='flex gap-2 text-[#818181] text-sm font-medium'>
                <button
                  type='button'
                  onClick={() => handleComplaintsSort('name')}
                  className='w-[30%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
                >
                  Full name
                  <SortIcon />
                </button>
                <button
                  type='button'
                  onClick={() => handleComplaintsSort('date')}
                  className='w-[20%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
                >
                  Date
                  <SortIcon />
                </button>
                <button
                  type='button'
                  onClick={() => handleComplaintsSort('type')}
                  className='w-[25%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
                >
                  Type
                  <SortIcon />
                </button>
                <button
                  type='button'
                  onClick={() => handleComplaintsSort('status')}
                  className='w-[20%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
                >
                  Status
                  <SortIcon />
                </button>
              </div>
      
              <div className='space-y-3'>
                {complaintsList?
                    sortedComplaints.map((list) => {
                      let dateObj = new Date(list.created_at)
                      const month = dateObj.getUTCMonth() + 1
                      const day = dateObj.getUTCDay()
                      return (
                        <div key={list.id} onClick={() => handleComplaintClick(list)} className={`flex flex-col space-y-3 cursor-pointer transition-colors `}>
                          <div className='flex items-center gap-2 text-sm'>
                            <p className='w-[30%]'>{list.first_name} {list.last_name} </p>
                            <p className='w-[20%]'>{month} - {day}</p>
                            <p className='w-[25%]'>{list.type}</p>
                            <Status status={list.status} />
                          </div>
                          <hr className=' w-full text-[#DEDEDE]' />
                        </div>
                      )
                    })
                    :
                    'Loading...'}
              </div>
            </div>  

            </div>
          </section>

          {/* Vacancy stats & applications */}
          <section className='space-y-4 font-jost'>
            <h2 className='text-2xl font-bold text-[#111827]'>Vacancy Application</h2>
            <div className='bg-white rounded-3xl border border-gray-200 px-6 py-5 shadow-sm space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='flex items-end gap-2'>
                  <p className='text-4xl font-semibold text-[#111827]'>
                    {vacancyApplications.length}
                  </p>
                  <span className='text-xs text-green-500 flex items-center gap-1'>
                    <ChartArrowIcon className='w-4 h-4' /> 12.4%
                  </span>
                </div>
              </div>

              <div className='flex items-center gap-4 text-xs text-gray-600'>
                <button className='px-4 py-1 rounded-full bg-[#111827] text-white text-xs'>This Month</button>
              </div>
            </div>

            {/* Vacancy vertical bar chart - applications per month */}
            <div className='w-full h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={vacancyMonthlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid stroke='#E5E7EB' strokeDasharray='4 4' vertical={false} />
                  <XAxis
                    dataKey='month'
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}`, 'Applications']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar
                    dataKey='applications'
                    radius={[8, 8, 0, 0]}
                    barSize={46}
                    fill='#3A3A3A'
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Vacancy applications table */}
          
            <div className='bg-white h-100 rounded-xl font-jost p-5 pt-0 space-y-5 overflow-y-auto '>
              <h1 className='text-sm font-bold bg-white sticky top-0'>Vacancy Applications</h1>
      
              <div className='flex gap-2 text-[#818181] text-sm font-medium'>
                <button
                  type='button'
                  onClick={() => handleVacancySort('name')}
                  className='w-[30%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
                >
                  Full name
                  <SortIcon />
                </button>
                <button
                  type='button'
                  onClick={() => handleVacancySort('date')}
                  className='w-[20%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
                >
                  Date
                  <SortIcon />
                </button>
                <button
                  type='button'
                  onClick={() => handleVacancySort('category')}
                  className='w-[25%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
                >
                  Category
                  <SortIcon />
                </button>
                <button
                  type='button'
                  onClick={() => handleVacancySort('salary')}
                  className='w-[20%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
                >
                  Status
                  <SortIcon />
                </button>
              </div>
      
              <div className='space-y-3'>
                {vacancyApplications && vacancyApplications.length > 0
                  ? sortedVacancyApplications.map((app) => (
                    <div
                      key={app.id}
                      className='flex flex-col space-y-3 cursor-pointer transition-colors '
                    >
                      <div className='flex items-center gap-2 text-sm'>
                        <p className='w-[30%]'>{app.full_name}</p>
                        <p className='w-[20%]'>{app.applied_date}</p>
                        <p className='w-[25%]'>{app.category}</p>
                        <Status className='w-[20%]' status={app.status} />
                      </div>
                      <hr className='w-full text-[#DEDEDE]' />
                    </div>
                  ))
                  : 'No applications found.'}
              </div>
            </div>  
            </div>
          </section>
        </div>

        {/* Right column: Superadmin profile summary */}
        <aside className='h-197 flex flex-col sticky top-3'>
          <div className='flex-1 bg-[#F2F2F2] rounded-3xl border border-[#E5E7EB] flex flex-col items-stretch pt-8 px-3'>
            <div className='w-full flex justify-between items-center mb-6'>
              <h2 className='font-goldman text-lg text-[#111827]'>Superadmin</h2>
            </div>

            <div className='w-full bg-white rounded-3xl shadow-md p-5'>
              {/* Profile / Create account toggle */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center bg-gray-100 rounded-full p-1 text-[11px]'>
                  <button
                    type='button'
                    onClick={() => setActiveProfileTab('profile')}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      activeProfileTab === 'profile' ? 'bg-white text-[#111827] shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    type='button'
                    onClick={() => setActiveProfileTab('create')}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      activeProfileTab === 'create' ? 'bg-white text-[#111827] shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    Create account
                  </button>
                </div>
              </div>

              {activeProfileTab === 'profile' ? (
                <div className='flex items-center gap-4'>
                  <div className='w-14 h-14 rounded-full overflow-hidden border border-gray-200'>
                    <img src={ProfilePic} alt='Profile' className='w-full h-full object-cover' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-[#111827] truncate'>
                      {admin?.first_name && admin?.last_name
                        ? `${admin.first_name} ${admin.last_name}`
                        : 'Abebe Kebede'}
                    </p>
                    <p className='text-xs text-gray-500 truncate mb-1'>{admin?.username || 'abe_kebe'}</p>
                    <button
                      type='button'
                      onClick={() => navigate('/superadmin/profile')}
                      className='text-[11px] text-[#4F46E5] hover:underline font-medium'
                    >
                      View & update profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className='space-y-3 text-xs text-gray-600'>
                  <p className='text-sm font-semibold text-[#111827]'>Create new admin account</p>
                  <p className='text-[11px] text-gray-500'>
                    Quickly onboard new admins and superadmins. You can set roles, contact info and access levels.
                  </p>
                  <button
                    type='button'
                    onClick={() => navigate('/superadmin/profile')}
                    className='mt-1 inline-flex items-center justify-center px-3 py-2 rounded-full bg-[#111827] text-white text-[11px] font-medium hover:bg-black transition-colors'
                  >
                    Go to create account
                  </button>
                </div>
              )}
            </div>

            {/* Stats section */}
            <div className='w-full mt-6 bg-white rounded-3xl shadow-md p-5'>
              {/* Header + toggle */}
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3 className='text-sm font-semibold text-[#111827]'>Stats</h3>
                  <p className='text-[11px] text-gray-400 mt-0.5'>
                    {activeStat === 'vacancy' ? 'Vacancy categories' : 'Complaint types'}
                  </p>
                </div>
                <div className='flex items-center bg-gray-100 rounded-full p-1 text-[11px]'>
                  <button
                    type='button'
                    onClick={() => setActiveStat('vacancy')}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      activeStat === 'vacancy' ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    Vacancy
                  </button>
                  <button
                    type='button'
                    onClick={() => setActiveStat('complaints')}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      activeStat === 'complaints' ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    Complaints
                  </button>
                </div>
              </div>

              {/* Main metric */}
              <div className='mb-3'>
                <p className='text-[11px] text-gray-500 mb-1 uppercase tracking-wide'>
                  {activeStat === 'vacancy' ? 'Monthly applicants' : 'Monthly complaints'}
                </p>
                <p className='text-2xl font-semibold text-[#111827] leading-tight'>
                  {statsConfig.total}
                </p>
                <p className='text-[11px] text-gray-400 mt-1'>{statsConfig.subtitle}</p>
              </div>

              {/* Horizontal bar chart */}
              <div className='w-full h-56 mt-2'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={statsConfig.data} layout='vertical' barCategoryGap={10}>
                    <CartesianGrid horizontal={false} stroke='#E5E7EB' />
                    <XAxis type='number' hide />
                    <YAxis type='category' dataKey='category' width={120} tick={{ fontSize: 11, fill: '#4B5563' }}/>
                    <Tooltip
                      formatter={(value) => [
                        `${value}`,
                        activeStat === 'vacancy' ? 'Applicants' : 'Complaints'
                      ]}
                      labelFormatter={(label) => label}
                    />
                    <Bar dataKey='count' radius={[0, 2, 2, 0]} barSize={18} fill={activeStat === 'vacancy' ? '#4F46E5' : '#10B981'}
                      label={{
                        position: 'insideLeft',
                        formatter: (value) => value.toString(),
                        fill: '#FFFFFF',
                        fontSize: 10
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default SuperAdminHome
