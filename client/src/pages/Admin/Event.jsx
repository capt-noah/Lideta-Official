import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import LocationIcon from '../../assets/icons/location_icon.svg?react'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import EditIcon from '../../assets/icons/edit_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon.svg?react'

import StatusSection from '../../components/ui/Status.jsx'
import Upload from '../../components/ui/Upload.jsx'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import Notification from '../../components/ui/Notification'

import { adminContext } from '../../components/utils/AdminContext.jsx'

function Event() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventsList, setEventsList] = useState()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [notification, setNotification] = useState({ isOpen: false, message: '', type: 'success' })
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    photo: null
  })

  // const eventsList = [
  //   {
  //     id: 1,
  //     title: 'Community Clean-up Day',
  //     location: 'Sar Bet Area, Lideta Sub-City',
  //     startDate: '2025-12-12',
  //     endDate: '2025-12-12',
  //     status: 'upcoming',
  //     day: 20,
  //     dayOfWeek: 'FRI',
  //     month: 'Dec',
  //     year: '2025'
  //   },
  //   {
  //     id: 2,
  //     title: 'Global Summit 2025',
  //     location: 'Sar Bet Area, Lideta Sub-City',
  //     startDate: '2025-12-12',
  //     endDate: '2026-01-16',
  //     status: 'pending',
  //     day: 31,
  //     dayOfWeek: 'SUN',
  //     month: 'Dec',
  //     year: '2025',
  //     photo: { name: 'globalsummit.jpg' }
  //   },
  //   {
  //     id: 3,
  //     title: 'Community Clean-up Day',
  //     location: 'Sar Bet Area, Lideta Sub-City',
  //     startDate: '2025-12-12',
  //     endDate: '2025-12-12',
  //     status: 'canceled',
  //     day: 25,
  //     dayOfWeek: 'WED',
  //     month: 'Dec',
  //     year: '2025'
  //   },
  //   {
  //     id: 4,
  //     title: 'World Design Challenge',
  //     location: 'Sar Bet Area, Lideta Sub-City',
  //     startDate: '2025-12-12',
  //     endDate: '2025-12-12',
  //     status: 'completed',
  //     day: 3,
  //     dayOfWeek: 'MON',
  //     month: 'Dec',
  //     year: '2025'
  //   },
  //   {
  //     id: 5,
  //     title: 'Innovation and Technology Day',
  //     location: 'Sar Bet Area, Lideta Sub-City',
  //     startDate: '2025-12-12',
  //     endDate: '2025-12-12',
  //     status: 'upcoming',
  //     day: 11,
  //     dayOfWeek: 'SAT',
  //     month: 'Dec',
  //     year: '2025'
  //   },
  //   {
  //     id: 6,
  //     title: 'Sports and Festival Day',
  //     location: 'Sar Bet Area, Lideta Sub-City',
  //     startDate: '2025-12-12',
  //     endDate: '2025-12-12',
  //     status: 'pending',
  //     day: 22,
  //     dayOfWeek: 'TUE',
  //     month: 'Dec',
  //     year: '2025'
  //   }
  // ]

  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day} - ${month} - ${year}`
  }

  const parseDateFromInput = (dateString) => {
    if (!dateString) return ''
    const parts = dateString.split(' - ')
    if (parts.length !== 3) return ''
    const day = parts[0]
    const month = parts[1]
    const year = parts[2]
    // Convert 2-digit year to 4-digit (assuming 2000s)
    const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`
    return `${fullYear}-${month}-${day}`
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setFormData({
      id: event.events_id,
      title: event.title,
      location: event.location,
      startDate: formatDateForInput(event.start_date.split('T')[0]),
      endDate: formatDateForInput(event.end_date.split('T')[0]),
      description: event.description || '',
      photo: event.photo || null
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
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      photo: null
    })
    setSelectedEvent(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Format dates for the database
    // Format photo as JSON object or array
    let photoData = null
    if (formData.photo) {
      if (Array.isArray(formData.photo)) {
        photoData = formData.photo.length > 0 ? formData.photo[0] : null
      } else if (typeof formData.photo === 'object' && formData.photo.name) {
        photoData = formData.photo
      }
    }

    const formattedData = {
      ...formData,
      start_date: parseDateFromInput(formData.startDate),
      end_date: parseDateFromInput(formData.endDate),
      photo: photoData
    }

    const fetchType = selectedEvent ? 'update' : 'create'
    const url = `http://localhost:3000/admin/${fetchType}/events`
    
    // If updating, include the events_id in the request body
    if (selectedEvent) {
      formattedData.events_id = selectedEvent.events_id
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ formData: formattedData })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process request')
      }

      // Refresh events list
      const eventsResponse = await fetch('http://localhost:3000/admin/events', {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      const eventsList = await eventsResponse.json()
      setEventsList(eventsList)
      
      // Show success message
      setNotification({ 
        isOpen: true, 
        message: `Event ${selectedEvent ? 'updated' : 'created'} successfully!`, 
        type: 'success' 
      })
      
      // Reset form
      handleReset()
      
    } catch (error) {
      console.error('Error:', error)
      setNotification({ 
        isOpen: true, 
        message: error.message || 'An error occurred. Please try again.', 
        type: 'error' 
      })
      alert(error.message || 'An error occurred. Please try again.')
    }
  }

  const handleDeleteClick = (eventId) => {
    setEventToDelete(eventId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return

    try {
      const response = await fetch(`http://localhost:3000/admin/events/${eventToDelete}`, {
        method: 'DELETE',
        headers: {
          'authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      // Refresh events list
      const eventsResponse = await fetch('http://localhost:3000/admin/events', {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      const eventsList = await eventsResponse.json()
      setEventsList(eventsList)

      // Reset form if the deleted event was selected
      if (selectedEvent?.events_id === eventToDelete) {
        handleReset()
      }

      setNotification({ 
        isOpen: true, 
        message: 'Event deleted successfully!', 
        type: 'success' 
      })
    } catch (error) {
      console.error('Error deleting event:', error)
      setNotification({ 
        isOpen: true, 
        message: error.message || 'Failed to delete event. Please try again.', 
        type: 'error' 
      })
    } finally {
      setShowDeleteDialog(false)
      setEventToDelete(null)
    }
  }

  const { token } = useContext(adminContext)
  const navigate = useNavigate()

  useEffect(() => {

    async function getEvents() {
      const response = await fetch('http://localhost:3000/admin/events', {
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
      setEventsList(list)
    }

    getEvents()
    
  }, [token])

  return (
    <div className='grid grid-cols-[1fr_500px] gap-4 p-4'>
      {/* Event Form */}
      <div className='bg-white h-fit border rounded-xl font-jost p-5'>
        <h1 className='text-3xl font-medium mb-6'>
          {selectedEvent ? 'Update Event' : 'Create Event'}
        </h1>


        <form onSubmit={handleSubmit} className='space-y-4'>

          {/* Title and Location */}
          <div className='grid grid-cols-2 gap-5' >
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Title
              </label>
              <input required type='text' name='title' value={formData.title} onChange={handleInputChange} placeholder='Enter event title' className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]' />
            </div>


            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Location
              </label>
              <div className='relative'>
                <input required type='text' name='location' value={formData.location} onChange={handleInputChange} placeholder='Enter Location' className='w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]' />
                <LocationIcon className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              </div>
            </div>
          </div>


          {/* Start and End Date */}
          <div className='grid grid-cols-2 gap-5' >
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Start Date
              </label>

              <div className='relative'>
                <input required type='text' name='startDate' value={formData.startDate} onChange={handleInputChange} placeholder='DD - MM - YY' className='w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'/>
                <CalenderIcon className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              </div>
              
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                End Date
              </label>
              <div className='relative'>
                <input
                  required
                  type='text'
                  name='endDate'
                  value={formData.endDate}
                  onChange={handleInputChange}
                  placeholder='DD - MM - YY'
                  className='w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                />
                <CalenderIcon className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              </div>
            </div>
          </div>

          

          {/* Event Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Event description
            </label>
            <textarea
              required
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder='Enter event description'
              rows={6}
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] resize-none'
            />
          </div>

          {/* Upload Event Cover */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              {selectedEvent ? 'Update event cover' : 'Upload event cover'}
            </label>
            <p className='text-xs text-gray-500 mb-2'>
              {selectedEvent 
                ? 'Drag and drop or browse image to update the cover for the event'
                : 'Drag and drop or browse image to add a cover for the event'}
            </p>
            <div className='min-h-[200px]'>
              <Upload photo={formData.photo} setFormData={setFormData} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 justify-end pt-4'>
            <button
              type='button'
              onClick={handleReset}
              className='px-6 py-2 border border-gray-200 text-gray-700 rounded-full shadow-md shadow-gray-400 hover:bg-gray-100 font-medium cursor-pointer active:scale-98'
            >
              Reset
            </button>
            <button
              type='submit'
              className='px-6 py-2 bg-[#3A3A3A] text-white rounded-full shadow-md shadow-gray-400 hover:bg-[#2A2A2A] font-medium cursor-pointer active:scale-98'
            >
              {selectedEvent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>


      </div>

      {/* Events List */}
      <div className='bg-white border rounded-xl font-jost p-5 space-y-5 overflow-y-auto h-fit'>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-medium'>Your events</h1>
          
          <select className='px-2 py-1 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'>
            <option>All</option>
            <option>Upcoming</option>
            <option>Pending</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>

        <div className='h-175 py-4 space-y-4'>
          {eventsList?
            eventsList.map((event) => (
            <div key={event.events_id} onClick={() => handleEventClick(event)} className={`border-2 border-gray-200 rounded-2xl py-2 px-1 cursor-pointer transition-colors ${   selectedEvent?.id === event.id ? 'bg-gray-50 border-[#3A3A3A]' : 'hover:bg-gray-50' }`} >
              <div className='flex gap-3'>
                {/* Date Display */}
                <div className='flex flex-col items-center justify-center px-3'>
                  <span className='text-2xl font-bold text-[#3A3A3A]'>{event.start_date_short.split(' ')[2]}</span>
                    <span className='text-sm font-medium text-gray-600'>{ event.start_date_short.split('.')[0] }</span>
                </div>

                <div className=' w-0.5 h-17 bg-gray-200 rounded-2xl flex ' >
                  {/* <hr className='w-full h-full' /> */}
                
                </div>


                {/* Event Details */}
                <div className='flex-1'>
                  <div className='flex items-start justify-between pr-1 mb-4'>

                    <h3 className='font-semibold w-[80%] truncate text-[#3A3A3A]'>{event.title}</h3>

                    <div className='flex gap-2'>

                      <button onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(event)
                        }}
                        className='w-7 h-7 flex justify-center items-center bg-[#3A3A3A] hover:bg-[#4e4e4e] rounded-full shadow-sm shadow-gray-400 cursor-pointer active:scale-97 '
                      >
                        <EditIcon className='w-4 h-4 text-white' />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(event.events_id)
                        }}
                        className='w-7 h-7 flex justify-center items-center bg-red-600 hover:bg-red-500 rounded-full shadow-sm shadow-gray-400 cursor-pointer active:scale-97'
                      >
                        <TrashIcon className='w-4 h-4 text-white' />
                      </button>
                    </div>
                  </div>



                  <div className='flex items-center gap-2 text-xs text-gray-600'>

                    <StatusSection status={event.status} />

                    <div className='flex items-center gap-1 font-medium'>
                      <CalenderIcon className='w-4 h-4' />
                        <span>{ event.start_date_short.split('.')[1] } </span>
                    </div>

                    <div className='flex items-center gap-1'>
                      <LocationIcon className='w-4 h-4' />
                      <p className='truncate w-[85%]' >{event.location}</p>
                    </div>
                    
                  </div>

                </div>
              </div>
            </div>
            ))
            :
            'Loading...'
          }
        </div>
      </div>
      
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message="Are you sure you want to delete this event?"
        confirmText="Delete"
        confirmButtonStyle="bg-red-600 hover:bg-red-700"
      />

      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        message={notification.message}
        type={notification.type}
      />
    </div>
  )
}

export default Event
