import { useContext, useEffect, useMemo, useState } from 'react'
import ChartArrowIcon from '../../assets/icons/chart_arrow.svg?react'
import EditIcon from '../../assets/icons/edit_icon.svg?react'
import ImageIcon from '../../assets/icons/image_icon.svg?react'
import ComplaintIcon from '../../assets/icons/compliant_icon2.svg?react'
import SortIcon from '../../assets/icons/sort_icon.svg?react'

import StatusSection from '../../components/ui/Status.jsx'
import Upload from '../../components/ui/Upload.jsx'
import Notification from '../../components/ui/Notification'
import LoadingButton from '../../components/ui/LoadingButton'

import { useNavigate } from 'react-router-dom'
import { adminContext } from '../../components/utils/AdminContext.jsx'

function Compliants() {
  const [activeTab, setActiveTab] = useState('new compliant')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [complaintsList, setComplaintsList] = useState()
  const [complaintsStat, setComplaintsStat] = useState()
  const [notification, setNotification] = useState({ isOpen: false, message: '', type: 'success' })
  const [complaintTypes, setComplaintTypes] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })
  const [formData, setFormData] = useState({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    type: '',
    status: '',
    description: '',
    concerned_staff_member: '',
    photo: null
  })

  const compliantStats = [
    {title: 'Total Compliants', stat: complaintsStat?.total || 0, percentage: 2.01},
    {title: 'Pending Compliants', stat: complaintsStat?.pending || 0, percentage: 53.01},
    {title: 'Resolved Compliants', stat: complaintsStat?.resolved || 0, percentage: 14.52},
  ]

  const handleSort = (key) => {
    setSortConfig((prev) => {
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

      switch (sortConfig.key) {
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

      return sortConfig.direction === 'asc' ? result : -result
    })

    return sorted
  }, [complaintsList, sortConfig])

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint)
    setActiveTab('compliant')
    
    // Handle photo data - could be array or single object
    let photoData = []
    let rawPhotos = complaint?.photos

    if (rawPhotos) {
        // Parse string if needed
        if (typeof rawPhotos === 'string') {
            try {
                rawPhotos = JSON.parse(rawPhotos)
            } catch (e) {
                console.error("Failed to parse photos JSON", e)
            }
        }

        if (Array.isArray(rawPhotos)) {
            photoData = rawPhotos
        } else if (typeof rawPhotos === 'object' && rawPhotos !== null && rawPhotos.name) {
             photoData = [rawPhotos]
        }
    }
    
    setFormData({
      id: complaint.complaint_id,
      first_name: complaint.first_name,
      last_name: complaint.last_name,
      email: complaint.email,
      phone: complaint.phone,
      type: complaint.type,
      status: complaint.status,
      description: complaint.description,
      concerned_staff_member: complaint.concerned_staff_member || '',
      photo: photoData
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleReset = () => {
    setFormData({
      id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      type: '',
      status: '',
      description: '',
      concerned_staff_member: '',
      photo: null
    })
    setSelectedComplaint(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const fetchType = formData.id == ''? 'create' : 'update'

      // Format photo as JSON array
      let photoData = []
      if (formData.photo) {
        if (Array.isArray(formData.photo)) {
          photoData = formData.photo
        } else if (typeof formData.photo === 'object' && formData.photo.name) {
          photoData = [formData.photo]
        }
      }

      const submitData = {
        ...formData,
        concerned_staff_member: formData.concerned_staff_member || null,
        photo: photoData
      }

      const response = await fetch(`http://localhost:3000/admin/${fetchType}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({formData: submitData})
      })

      if (!response.ok) {
        throw new Error(fetchType === 'create' ? 'Failed to create complaint' : 'Failed to update complaint')
      }

      // Refresh complaints list
      const complaintsResponse = await fetch('http://localhost:3000/admin/complaints', {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      const data = await complaintsResponse.json()
      setComplaintsList(data.complaints)
      setComplaintsStat(data.counts)

      setNotification({ 
        isOpen: true, 
        message: fetchType === 'create' ? 'Complaint created successfully!' : 'Complaint updated successfully!', 
        type: 'success' 
      })

      handleReset()
    } catch (error) {
      console.error('Error:', error)
      setNotification({ 
        isOpen: true, 
        message: error.message || 'An error occurred. Please try again.', 
        type: 'error' 
      })
    } finally {
        setIsSubmitting(false)
    }
  }

  const { token } = useContext(adminContext)
  const navigate = useNavigate()

  // Fetch complaint types from database
  useEffect(() => {
    async function fetchComplaintTypes() {
      try {
        const response = await fetch('http://localhost:3000/api/complaint-types')
        if (response.ok) {
          const types = await response.json()
          setComplaintTypes(types)
        }
      } catch (error) {
        console.error('Error fetching complaint types:', error)
        // Use default types if fetch fails
        setComplaintTypes([
          'sanitation',
          'water supply',
          'road condition',
          'construction',
          'customer service',
          'finance',
          'public health',
          'maintenance',
          'service delivery'
        ])
      }
    }
    fetchComplaintTypes()
  }, [])

  const [loading, setLoading] = useState(true)

  // ... (existing state)

  useEffect(() => {

    async function getComplaints() {
      try {
        const response = await fetch('http://localhost:3000/admin/complaints', {
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
        setComplaintsStat(list.counts)
      } catch (error) {
        console.error("Error loading complaints:", error)
      } finally {
        setLoading(false)
      }
    }

    if(token) getComplaints()
    
  }, [token])


  if (loading) return (
    <div className='grid grid-cols-[1fr_500px] gap-4 p-4 animate-pulse'>
      <div className='grid grid-rows-[120px_1fr] gap-4'>
        {/* Stats Skeleton */}
        <div className='flex justify-between items-center'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='w-60 h-full border rounded-xl bg-gray-100 flex flex-col justify-around px-4'>
               <div className='h-4 w-32 bg-gray-200 rounded'></div>
               <div className='h-8 w-16 bg-gray-300 rounded'></div>
               <div className='h-4 w-24 bg-gray-200 rounded'></div>
            </div>
          ))}
        </div>

        {/* Form Skeleton */}
        <div className='bg-white border rounded-xl p-5 space-y-6'>
           <div className='flex gap-2 mb-5'>
              <div className='h-10 w-32 bg-gray-200 rounded-md'></div>
              <div className='h-10 w-24 bg-gray-100 rounded-md'></div>
           </div>
           <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                 <div className='space-y-2'>
                    <div className='h-4 w-20 bg-gray-200 rounded'></div>
                    <div className='h-10 w-full bg-gray-100 rounded-md'></div>
                 </div>
                 <div className='space-y-2'>
                    <div className='h-4 w-20 bg-gray-200 rounded'></div>
                    <div className='h-10 w-full bg-gray-100 rounded-md'></div>
                 </div>
              </div>
              {[1, 2, 3, 4].map((i) => (
                 <div key={i} className='space-y-2'>
                    <div className='h-4 w-24 bg-gray-200 rounded'></div>
                    <div className='h-10 w-full bg-gray-100 rounded-md'></div>
                 </div>
              ))}
               <div className='space-y-2'>
                  <div className='h-4 w-24 bg-gray-200 rounded'></div>
                  <div className='h-32 w-full bg-gray-100 rounded-md'></div>
               </div>
           </div>
        </div>
      </div>

      {/* List Skeleton */}
      <div className='bg-white h-screen border rounded-xl p-5 space-y-5'>
         <div className='h-8 w-40 bg-gray-200 rounded'></div>
         <div className='flex gap-2'>
            <div className='h-6 w-1/3 bg-gray-100 rounded'></div>
            <div className='h-6 w-1/3 bg-gray-100 rounded'></div>
            <div className='h-6 w-1/3 bg-gray-100 rounded'></div>
         </div>
         <div className='space-y-4 mt-6'>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
               <div key={i} className='flex flex-col space-y-3'>
                  <div className='flex items-center gap-2'>
                     <div className='h-6 w-1/3 bg-gray-100 rounded'></div>
                     <div className='h-6 w-16 bg-gray-100 rounded'></div>
                     <div className='h-6 w-1/4 bg-gray-100 rounded'></div>
                     <div className='h-6 w-20 bg-gray-200 rounded-md'></div>
                  </div>
                  <hr className='border-gray-100' />
               </div>
            ))}
         </div>
      </div>
    </div>
  )


  return (
    <div className='grid grid-cols-[1fr_500px] gap-4 p-4'>
      <div className='grid grid-rows-[120px_1fr] gap-4'>
        {/* Stats Cards */}
        <div className='flex justify-between items-center'>
          {compliantStats.map((com, index) => (
            <div key={index} className='w-60 h-full border rounded-xl font-roboto flex flex-col justify-around px-4'>
              <p className='text-lg font-medium'>{com.title}</p>
              <h1 className='text-4xl font-mono font-bold'>{com.stat}</h1>
              <div className='flex items-center gap-2'>
                  <ChartArrowIcon />
                <p className='text-[#71DD8C] text-xl'>{com.percentage}%</p>
                <p className='text-gray-400 text-xs'>since last month</p>
              </div>
            </div>
          ))}
        </div>

        {/* Complaint Form/Details Section */}
        <div className='bg-white border rounded-xl font-jost p-5'>
          {/* Tabs */}
          <div className='flex gap-2 mb-5'>
            <button onClick={() => { setActiveTab('new compliant')
                handleReset()
              }}
              className={`px-4 py-2 rounded-md font-medium border cursor-pointer ${
                activeTab === 'new compliant'
                  ? 'bg-[#3A3A3A] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              new compliant
            </button>

            <button
              onClick={() => {
                setActiveTab('compliant')
                if (!selectedComplaint) {
                  handleReset()
                }
              }}
              className={`px-4 py-2 rounded-md font-medium cursor-pointer ${ activeTab === 'compliant' ? 'bg-[#3A3A3A] text-white' : 'bg-gray-100 text-gray-600'}`}>
              compliant
            </button>


          </div>
              
          {/* Form Fields */}
          { activeTab !== 'compliant' || selectedComplaint !== null ?
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    First name
                  </label>
                  <input
                    required
                    type='text'
                    name='first_name'
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder='Enter first name'
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Last name
                  </label>
                  <input
                    required
                    type='text'
                    name='last_name'
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder='Enter last name'
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email
                </label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='Enter email'
                  className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Phone number
                </label>
                <input
                  required
                  type='tel'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder='Enter phone number'
                  className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Compliant type
                </label>
                <select
                  required
                  name='type'
                  value={formData.type}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white'
                >
                  <option value=''>Select compliant type</option>
                  {complaintTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Staff member concerned (if any)
                </label>
                <input
                  type='text'
                  name='concerned_staff_member'
                  value={formData.concerned_staff_member}
                  onChange={handleInputChange}
                  placeholder='Enter name of staff member'
                  className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                />
              </div>

              <div className='flex items-center gap-2'>
                <div className='flex-1'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Status
                  </label>
                  <select
                    required
                    name='status'
                    value={formData.status}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                  >
                    <option value=''>Select status</option>
                    <option value='assigning'>assigning</option>
                    <option value='in progress'>in progress</option>
                    <option value='resolved'>resolved</option>
                  </select>
                </div>
                {selectedComplaint && (
                  <button className='mt-6 px-4 py-2 bg-[#3A3A3A] rounded-md hover:bg-[#444444] flex items-center gap-2 cursor-pointer'>
                    <EditIcon className='w-4 h-4 text-white' />
                    <span className='text-sm text-white '>Edit</span>
                  </button>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Attached photo
                </label>
                <div className=' rounded-md p-2 flex flex-col items-center justify-center min-h-[120px]'>

                  <Upload photo={formData.photo} setFormData={setFormData} />


                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Compliant
                </label>
                <textarea
                  required
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder='Enter compliant here'
                  rows={6}
                  className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] resize-none'
                />
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3 justify-end pt-4'>
                <button
                  type='button'
                  onClick={handleReset}
                  className='px-6 py-2  text-gray-700 rounded-full shadow-md shadow-gray-400 hover:bg-gray-100 font-medium cursor-pointer active:scale-98'
                >
                  Reset
                </button>
                <LoadingButton
                  type='submit'
                  isLoading={isSubmitting}
                  className='px-6 py-2 bg-[#3A3A3A] text-white rounded-full shadow-md shadow-gray-400 hover:bg-[#2A2A2A] font-medium active:scale-98 '
                >
                  {selectedComplaint ? 'Update' : 'Create'}
                </LoadingButton>
              </div>


            </form>
            :
            <div className='w-full h-full flex flex-col py-40 gap-5 items-center text-xl text-gray-400 ' >
              <ComplaintIcon className='w-15 h-15' />
              <p>Please Select a Complaint</p>

            </div>
          }

        </div>
      </div>

      {/* Complaints List */}
      <div className='bg-white h-fit border rounded-xl font-jost p-5 space-y-5 overflow-y-auto '>
        <h1 className='text-3xl font-medium'>Compliants</h1>

        <div className='flex gap-2 text-[#818181] text-sm font-medium'>
          <button
            type='button'
            onClick={() => handleSort('name')}
            className='w-[30%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
          >
            Full name
            <SortIcon />
          </button>
          <button
            type='button'
            onClick={() => handleSort('date')}
            className='w-[15%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
          >
            Date
            <SortIcon />
          </button>
          <button
            type='button'
            onClick={() => handleSort('type')}
            className='w-[30%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
          >
            Type
            <SortIcon />
          </button>
          <button
            type='button'
            onClick={() => handleSort('status')}
            className='w-[20%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
          >
            Status
            <SortIcon />
          </button>
        </div>

        <div className='space-y-3 h-275'>
          {complaintsList?
              sortedComplaints.map((list) => {
                let dateObj = new Date(list.created_at)
                const month = dateObj.getUTCMonth() + 1
                const day = dateObj.getUTCDay()
                return (
                  <div key={list.id} onClick={() => handleComplaintClick(list)} className={`flex flex-col space-y-3 cursor-pointer transition-colors `}>
                    <div className='flex items-center gap-2 text-sm'>
                      <p className='w-[30%]'>{list.first_name} {list.last_name} </p>
                      <p className='w-[15%]'>{month} - {day}</p>
                      <p className='w-[30%]'>{list.type}</p>
                      <StatusSection status={list.status} />
                    </div>
                    <hr className='text-[#DEDEDE]' />
                  </div>
                )
              })
              :
              <div className='w-full text-center p-8 text-gray-500'>
                No events found. Create your first event item.
              </div>
          }
        </div>
      </div>

      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        message={notification.message}
        type={notification.type}
      />
    </div>
  )
}

export default Compliants
