import { useState, useEffect, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import LocationIcon from '../../assets/icons/location_icon.svg?react'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import EditIcon from '../../assets/icons/edit_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon.svg?react'

import StatusSection from '../../components/ui/Status.jsx'
import Upload from '../../components/ui/Upload.jsx'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import Notification from '../../components/ui/Notification'
import LoadingButton from '../../components/ui/LoadingButton'

import { adminContext } from '../../components/utils/AdminContext.jsx'

function Event() {
  /* Context & Router */
  const { token } = useContext(adminContext)
  const navigate = useNavigate()

  /* State Declarations */
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  const [statusFilter, setStatusFilter] = useState('All')

  /* Translations state */
  const [language, setLanguage] = useState('en')
  const [translations, setTranslations] = useState({
    am: { title: '', location: '', description: '' },
    or: { title: '', location: '', description: '' }
  })

  /* Fetch Events Effect */
  useEffect(() => {
    async function getEvents() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/events', {
          headers: {
            authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
           if (response.status === 401) {
             navigate('/auth/login')
           }
           throw new Error('Failed to fetch events')
        }
        const list = await response.json()
        setEventsList(list)
      } catch (error) {
        console.error("Error loading events:", error)
      } finally {
        setLoading(false)
      }
    }

    getEvents()
  }, [token, navigate])

  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day} - ${month} - ${year}`
  }

  const convertDateToISO = (dateString) => {
    if (!dateString) return ''
    try {
        // Expected format: DD - MM - YY
        const parts = dateString.split('-').map(p => p.trim())
        if (parts.length !== 3) return new Date().toISOString()
        
        const day = parts[0]
        const month = parts[1]
        const year = parts[2].length === 2 ? '20' + parts[2] : parts[2]
        
        return `${year}-${month}-${day}`
    } catch (e) {
        console.error('Date conversion error', e)
        return new Date().toISOString()
    }
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

  /* Translations state - Removed duplicate */

  /* Update handleEventClick to populate translations */
  const handleEventClick = (event) => {
    setSelectedEvent(event)
    
    // Handle photo data - could be array or single object
    let photoData = null
    if (event?.photos) {
      if (Array.isArray(event.photos) && event.photos.length > 0) {
        photoData = event.photos[0]
      } else if (typeof event.photos === 'object' && event.photos.name) {
        photoData = event.photos
      }
    }
    
    setFormData({
      id: event.events_id,
      title: event.title,
      location: event.location,
      startDate: formatDateForInput(event.start_date.split('T')[0]),
      endDate: formatDateForInput(event.end_date.split('T')[0]),
      description: event.description || '',
      photo: photoData
    })

    // Populate translations if available
    setTranslations({
      am: {
        title: event.amh?.title || '',
        location: event.amh?.location || '',
        description: event.amh?.description || ''
      },
      or: {
        title: event.orm?.title || '',
        location: event.orm?.location || '',
        description: event.orm?.description || ''
      }
    })
    
    // Reset language to English on edit
    setLanguage('en')
  }

  // Handle changes for both English (FormData) and Translations
  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (language === 'en') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    } else {
      setTranslations(prev => ({
        ...prev,
        [language]: {
          ...prev[language],
          [name]: value
        }
      }))
    }
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
    setTranslations({
      am: { title: '', location: '', description: '' },
      or: { title: '', location: '', description: '' }
    })
    setSelectedEvent(null)
    setLanguage('en')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
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
      start_date: convertDateToISO(formData.startDate),
      end_date: convertDateToISO(formData.endDate),
      photo: photoData,
      amh: translations.am,
      orm: translations.or
    }

    const fetchType = selectedEvent ? 'update' : 'create'
    const url = `/admin/${fetchType}/events`
    
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
      const eventsResponse = await fetch('/api/events', {
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
    } finally {
        setIsSubmitting(false)
    }
  }

  // Helper to get current value based on language
  const getValue = (field) => {
    if (language === 'en') return formData[field]
    return translations[language][field] || ''
  }

  // ... (delete handlers remain same) ...

  const handleDeleteClick = (eventId) => {
      setEventToDelete(eventId)
      setShowDeleteDialog(true)
    }
  
    const handleDeleteConfirm = async () => {
      // ... same delete logic ...
      if (!eventToDelete) return
  
      try {
        const response = await fetch(`/admin/events/${eventToDelete}`, {
          method: 'DELETE',
          headers: {
            'authorization': `Bearer ${token}`
          }
        })
  
        if (!response.ok) {
          throw new Error('Failed to delete event')
        }
  
        const eventsResponse = await fetch('/api/events', {
          headers: {
            authorization: `Bearer ${token}`
          }
        })
        const eventsList = await eventsResponse.json()
        setEventsList(eventsList)
  
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


  const filteredEvents = useMemo(() => {
      if (!eventsList) return []
  
      if (statusFilter === 'All') return eventsList
  
      const normalize = (value) => {
        if (!value) return ''
        let v = String(value).toLowerCase()
        if (v === 'cancelled') v = 'canceled'
        return v
      }
  
      const target = normalize(statusFilter)
      return eventsList.filter((event) => normalize(event.status) === target)
    }, [eventsList, statusFilter])


  // Skeleton loader remains....
  if (loading) return (
     <div className='grid grid-cols-[1fr_500px] gap-4 p-4 animate-pulse'>
        {/* ... skeleton content ... */}
       <div className='bg-white h-fit border rounded-xl font-jost p-5 space-y-6'>
          <div className='h-8 w-48 bg-gray-200 rounded mb-6'></div>
          <div className='space-y-5'>
             <div className='grid grid-cols-2 gap-5'>
                <div className='h-10 w-full bg-gray-100 rounded-md'></div>
                <div className='h-10 w-full bg-gray-100 rounded-md'></div>
             </div>
             <div className='grid grid-cols-2 gap-5'>
                <div className='h-10 w-full bg-gray-100 rounded-md'></div>
                <div className='h-10 w-full bg-gray-100 rounded-md'></div>
             </div>
             <div className='h-32 w-full bg-gray-100 rounded-md'></div>
          </div>
       </div>
       <div className='bg-white border overflow-hidden rounded-xl font-jost p-5 space-y-5 h-170'>
          <div className='h-8 w-40 bg-gray-200 rounded mb-4'></div>
          <div className='space-y-4'>
             {[1, 2, 3].map(i => <div key={i} className='h-24 bg-gray-100 rounded-2xl'></div>)}
          </div>
       </div>
    </div>
  )


  return (
    <div className='grid grid-cols-[1fr_500px] gap-4 p-4'>
      {/* Event Form */}
      <div className='bg-white h-fit border rounded-xl font-jost p-5'>
        <div className='flex justify-between items-center mb-6'>
            <h1 className='text-3xl font-medium'>
            {selectedEvent ? 'Update Event' : 'Create Event'}
            </h1>
            
            {/* Language Toggle */}
            <div className='flex bg-gray-100 p-1 rounded-lg'>
                {['en', 'am', 'or'].map((lang) => (
                    <button
                        key={lang}
                        type='button'
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                            language === lang 
                            ? 'bg-white shadow-sm text-[#3A3A3A]' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {lang === 'en' ? 'English' : lang === 'am' ? 'Amharic' : 'Oromo'}
                    </button>
                ))}
            </div>
        </div>


        <form onSubmit={handleSubmit} className='space-y-4'>

          {/* Title and Location */}
          <div className='grid grid-cols-2 gap-5' >
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Title
              </label>
              <input 
                required={language === 'en'} 
                type='text' 
                name='title' 
                value={getValue('title')} 
                onChange={handleInputChange} 
                placeholder={`Enter event title in ${language === 'en' ? 'English' : language === 'am' ? 'Amharic' : 'Oromo'}`} 
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]' 
              />
            </div>


            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Location
              </label>
              <div className='relative'>
                <input 
                    required={language === 'en'} 
                    type='text' 
                    name='location' 
                    value={getValue('location')} 
                    onChange={handleInputChange} 
                    placeholder='Enter Location' 
                    className='w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]' 
                />
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
                <input 
                    required 
                    type='text' 
                    name='startDate' 
                    value={formData.startDate} 
                    onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))} // Shared
                    placeholder='DD - MM - YY' 
                    disabled={language !== 'en'}
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] ${language !== 'en' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
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
                  onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))} // Shared
                  placeholder='DD - MM - YY'
                  disabled={language !== 'en'}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] ${language !== 'en' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
              required={language === 'en'}
              name='description'
              value={getValue('description')}
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
            <div className={`min-h-[200px] ${language !== 'en' ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload photo={formData.photo} setFormData={setFormData} />
            </div>
            {language !== 'en' && <p className='text-xs text-orange-500 mt-1'>Cover image is shared across all languages. Edit in English mode.</p>}
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
            <LoadingButton
              type='submit'
              isLoading={isSubmitting}
              className='px-6 py-2 bg-[#3A3A3A] text-white rounded-full shadow-md shadow-gray-400 hover:bg-[#2A2A2A] font-medium active:scale-98'
            >
              {selectedEvent ? 'Update' : 'Create'}
            </LoadingButton>
          </div>
        </form>
      </div>

      {/* Events List */}
      <div className='bg-white border rounded-xl font-jost p-5 space-y-5 overflow-y-auto h-fit'>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-medium'>Your events</h1>
          
          <select
            className='px-2 py-1 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value='All'>All</option>
            <option value='upcoming'>Upcoming</option>
            <option value='pending'>Pending</option>
            <option value='completed'>Completed</option>
            <option value='Cancelled'>Cancelled</option>
          </select>
        </div>

        <div className='h-175 py-4 space-y-4'>
          {eventsList?
            filteredEvents.map((event) => (
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
            <div className='w-full text-center p-8 text-gray-500'>
              No events found. Create your first event item.
            </div>
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
