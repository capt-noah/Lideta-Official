import { useState, useEffect, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import LocationIcon  from '../../assets/icons/location_icon.svg?react'
import CalenderIcon  from '../../assets/icons/calender_icon.svg?react'
import EditIcon      from '../../assets/icons/edit_icon.svg?react'
import TrashIcon     from '../../assets/icons/trash_icon.svg?react'
import SearchIcon    from '../../assets/icons/search_icon.svg?react'
import ImageIcon     from '../../assets/icons/image_icon.svg?react'
import StatusSection from '../../components/ui/Status.jsx'
import Upload        from '../../components/ui/Upload.jsx'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import Notification  from '../../components/ui/Notification'
import LoadingButton from '../../components/ui/LoadingButton'
import { adminContext } from '../../components/utils/AdminContext.jsx'

const STATUS_OPTIONS = ['upcoming', 'pending', 'completed', 'cancelled']

// ── helpers ───────────────────────────────────────────────────────────────────
const getImageSrc = (photos) => {
  if (!photos) return null
  let p = photos
  if (typeof p === 'string') { try { p = JSON.parse(p) } catch (_) {} }
  if (Array.isArray(p) && p.length > 0) p = p[0]
  return (typeof p === 'object' && p?.path) ? p.path : null
}

const isoToInput = (isoStr) => {
  if (!isoStr) return ''
  try { return isoStr.split('T')[0] } catch { return '' }
}

// ── Slide-over panel ──────────────────────────────────────────────────────────
function EventPanel({ isOpen, onClose, selectedEvent, token, onSaved }) {
  const emptyForm = { id: '', title: '', location: '', startDate: '', endDate: '', description: '', photo: null }
  const emptyTrans = {
    am: { title: '', location: '', description: '' },
    or: { title: '', location: '', description: '' }
  }

  const [formData,     setFormData]     = useState(emptyForm)
  const [translations, setTranslations] = useState(emptyTrans)
  const [language,     setLanguage]     = useState('en')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (selectedEvent) {
      let photoData = null
      if (selectedEvent.photos) {
        let raw = selectedEvent.photos
        if (typeof raw === 'string') { try { raw = JSON.parse(raw) } catch (_) {} }
        if (Array.isArray(raw) && raw.length > 0) photoData = raw[0]
        else if (typeof raw === 'object' && raw?.path) photoData = raw
      }
      setFormData({
        id:          selectedEvent.events_id,
        title:       selectedEvent.title || '',
        location:    selectedEvent.location || '',
        startDate:   isoToInput(selectedEvent.start_date),
        endDate:     isoToInput(selectedEvent.end_date),
        description: selectedEvent.description || '',
        photo:       photoData
      })
      setTranslations({
        am: { title: selectedEvent.amh?.title || '', location: selectedEvent.amh?.location || '', description: selectedEvent.amh?.description || '' },
        or: { title: selectedEvent.orm?.title || '', location: selectedEvent.orm?.location || '', description: selectedEvent.orm?.description || '' }
      })
    } else {
      setFormData(emptyForm)
      setTranslations(emptyTrans)
    }
    setLanguage('en')
  }, [selectedEvent, isOpen])

  const getValue = (field) => language === 'en' ? formData[field] : (translations[language][field] || '')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (language === 'en') setFormData(p => ({ ...p, [name]: value }))
    else setTranslations(p => ({ ...p, [language]: { ...p[language], [name]: value } }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let photoData = null
      if (formData.photo) {
        photoData = Array.isArray(formData.photo) ? (formData.photo[0] || null) : formData.photo
      }
      const fetchType = selectedEvent ? 'update' : 'create'
      const payload = {
        formData: {
          ...formData,
          start_date: formData.startDate,
          end_date:   formData.endDate,
          photo:      photoData,
          amh:        translations.am,
          orm:        translations.or,
          ...(selectedEvent ? { events_id: selectedEvent.events_id } : {})
        }
      }
      const res = await fetch(`/api/admin/${fetchType}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(selectedEvent ? 'Failed to update event' : 'Failed to create event')
      onSaved(fetchType)
      onClose()
    } catch (err) {
      onSaved(null, err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0'>
          <h2 className='text-xl font-bold text-[#3A3A3A]'>{selectedEvent ? 'Edit Event' : 'New Event'}</h2>
          <div className='flex items-center gap-3'>
            <div className='flex bg-gray-100 p-1 rounded-lg'>
              {['en', 'am', 'or'].map(lang => (
                <button key={lang} type='button' onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${language === lang ? 'bg-white shadow-sm text-[#3A3A3A]' : 'text-gray-500 hover:text-gray-700'}`}>
                  {lang === 'en' ? 'EN' : lang === 'am' ? 'AM' : 'OR'}
                </button>
              ))}
            </div>
            <button onClick={onClose} className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl cursor-pointer transition-colors'>×</button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className='flex-1 overflow-y-auto px-6 py-5 space-y-5'>
          {/* Cover image */}
          <div>
            <label className={labelCls}>Cover Image {language !== 'en' && <span className='text-orange-400 normal-case font-normal'>(edit in EN mode)</span>}</label>
            <div className={language !== 'en' ? 'opacity-50 pointer-events-none' : ''}>
              <Upload photo={formData.photo} setFormData={setFormData} />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={labelCls}>Title {language === 'en' && <span className='text-red-400'>*</span>}</label>
            <input type='text' name='title' value={getValue('title')} onChange={handleChange}
              placeholder={`Event title in ${language === 'en' ? 'English' : language === 'am' ? 'Amharic' : 'Oromo'}`}
              required={language === 'en'} className={inputCls} />
          </div>

          {/* Location */}
          <div>
            <label className={labelCls}>Location {language === 'en' && <span className='text-red-400'>*</span>}</label>
            <div className='relative'>
              <input type='text' name='location' value={getValue('location')} onChange={handleChange}
                placeholder='Enter location' required={language === 'en'} className={inputCls + ' pr-10'} />
              <LocationIcon className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            </div>
          </div>

          {/* Dates */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className={labelCls}>Start Date <span className='text-red-400'>*</span></label>
              <div className='relative'>
                <input type='date' name='startDate' value={formData.startDate}
                  onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                  required disabled={language !== 'en'}
                  className={inputCls + ' pr-9' + (language !== 'en' ? ' bg-gray-100 cursor-not-allowed' : '')} />
                <CalenderIcon className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
              </div>
            </div>
            <div>
              <label className={labelCls}>End Date <span className='text-red-400'>*</span></label>
              <div className='relative'>
                <input type='date' name='endDate' value={formData.endDate}
                  onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                  required disabled={language !== 'en'}
                  className={inputCls + ' pr-9' + (language !== 'en' ? ' bg-gray-100 cursor-not-allowed' : '')} />
                <CalenderIcon className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description {language === 'en' && <span className='text-red-400'>*</span>}</label>
            <textarea name='description' value={getValue('description')} onChange={handleChange}
              placeholder={`Description in ${language === 'en' ? 'English' : language === 'am' ? 'Amharic' : 'Oromo'}`}
              rows={7} required={language === 'en'} className={inputCls + ' resize-none'} />
          </div>
        </form>

        {/* Footer */}
        <div className='px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 shrink-0'>
          <button type='button' onClick={onClose} className='px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors'>Cancel</button>
          <LoadingButton isLoading={isSubmitting} onClick={handleSubmit}
            className='px-6 py-2 bg-[#3A3A3A] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors'>
            {selectedEvent ? 'Save Changes' : 'Create Event'}
          </LoadingButton>
        </div>
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
function Event() {
  const { token } = useContext(adminContext)
  const navigate  = useNavigate()

  const [loading,          setLoading]          = useState(true)
  const [eventsList,       setEventsList]        = useState([])
  const [panelOpen,        setPanelOpen]         = useState(false)
  const [editingEvent,     setEditingEvent]      = useState(null)
  const [showDeleteDialog, setShowDeleteDialog]  = useState(false)
  const [eventToDelete,    setEventToDelete]     = useState(null)
  const [notification,     setNotification]      = useState({ isOpen: false, message: '', type: 'success' })
  const [searchQuery,      setSearchQuery]       = useState('')
  const [statusFilter,     setStatusFilter]      = useState('All')

  const notify = (message, type = 'success') => setNotification({ isOpen: true, message, type })

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events', { headers: { authorization: `Bearer ${token}` } })
      if (!res.ok) { if (res.status === 401) navigate('/auth/login'); throw new Error() }
      setEventsList(await res.json())
    } catch { /* handled by notify */ }
  }

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetchEvents().finally(() => setLoading(false))
  }, [token])

  const filteredEvents = useMemo(() => {
    let list = [...eventsList]
    if (statusFilter !== 'All') {
      const t = statusFilter.toLowerCase()
      list = list.filter(e => e.status?.toLowerCase().replace('cancelled','canceled') === t.replace('cancelled','canceled'))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(e => e.title?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q))
    }
    return list
  }, [eventsList, statusFilter, searchQuery])

  // Stats
  const totalEvents    = eventsList.length
  const upcomingCount  = eventsList.filter(e => e.status?.toLowerCase() === 'upcoming').length
  const completedCount = eventsList.filter(e => ['completed','complete'].includes(e.status?.toLowerCase())).length

  const handleOpenCreate = () => { setEditingEvent(null); setPanelOpen(true) }
  const handleOpenEdit   = (ev) => { setEditingEvent(ev); setPanelOpen(true) }

  const handleSaved = (action, errMsg) => {
    if (errMsg) { notify(errMsg, 'error'); return }
    notify(action === 'create' ? 'Event created!' : 'Event updated!')
    fetchEvents()
  }

  const handleDeleteClick   = (id) => { setEventToDelete(id); setShowDeleteDialog(true) }
  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return
    try {
      const res = await fetch(`/api/admin/events/${eventToDelete}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to delete')
      await fetchEvents()
      notify('Event deleted.')
    } catch (err) { notify(err.message, 'error') }
    finally { setShowDeleteDialog(false); setEventToDelete(null) }
  }

  const formatDisplayDate = (ev) => {
    if (ev.start_date_short) return ev.start_date_short
    try { return new Date(ev.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return '' }
  }

  if (loading) return (
    <div className='p-6 space-y-6 animate-pulse'>
      <div className='flex justify-between'><div className='h-8 w-32 bg-gray-200 rounded' /><div className='h-10 w-36 bg-gray-300 rounded-lg' /></div>
      <div className='grid grid-cols-3 gap-4'>{[1,2,3].map(i => <div key={i} className='h-20 bg-gray-100 rounded-xl' />)}</div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>{[1,2,3,4,5,6].map(i => <div key={i} className='h-60 bg-gray-100 rounded-2xl' />)}</div>
    </div>
  )

  return (
    <div className='p-6 font-jost min-h-screen bg-[#F6F6F6]'>
      <Notification isOpen={notification.isOpen} message={notification.message} type={notification.type} onClose={() => setNotification(n => ({ ...n, isOpen: false }))} />

      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-[#3A3A3A]'>Events</h1>
          <p className='text-sm text-gray-500 mt-0.5'>{totalEvents} event{totalEvents !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={handleOpenCreate}
          className='px-5 py-2.5 bg-[#3A3A3A] text-white text-sm font-semibold rounded-xl hover:bg-black active:scale-95 transition-all cursor-pointer shadow-sm'>
          + New Event
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[
          { label: 'Total Events',   value: totalEvents },
          { label: 'Upcoming',       value: upcomingCount },
          { label: 'Completed',      value: completedCount }
        ].map(s => (
          <div key={s.label} className='bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm'>
            <p className='text-xs text-gray-400 uppercase font-semibold tracking-wide'>{s.label}</p>
            <p className='text-2xl font-bold text-[#3A3A3A] mt-1'>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-3 mb-6 items-center'>
        <div className='relative flex-1 min-w-48'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input type='text' placeholder='Search events…' value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white' />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className='px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white'>
          <option value='All'>All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Grid */}
      {filteredEvents.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-24 text-gray-400'>
          <CalenderIcon className='w-16 h-16 mb-4 opacity-30' />
          <p className='text-lg font-medium'>No events found</p>
          <p className='text-sm mt-1'>Try adjusting your filters or create a new event</p>
          <button onClick={handleOpenCreate} className='mt-5 px-5 py-2 bg-[#3A3A3A] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors cursor-pointer'>+ New Event</button>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {filteredEvents.map(event => (
            <div key={event.events_id} className='bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group'>
              {/* Cover */}
              <div className='relative w-full h-44 bg-gray-100 overflow-hidden'>
                {getImageSrc(event.photos) ? (
                  <img src={getImageSrc(event.photos)} alt={event.title} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <ImageIcon className='w-10 h-10 text-gray-300' />
                  </div>
                )}
                <div className='absolute top-3 left-3'><StatusSection status={event.status} /></div>
                <div className='absolute top-3 right-3 flex gap-1.5'>
                  <button onClick={() => handleOpenEdit(event)}
                    className='w-8 h-8 flex items-center justify-center bg-[#3A3A3A] hover:bg-black rounded-full shadow cursor-pointer active:scale-95 transition-all'>
                    <EditIcon className='w-4 h-4 text-white' />
                  </button>
                  <button onClick={() => handleDeleteClick(event.events_id)}
                    className='w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-full shadow cursor-pointer active:scale-95 transition-all'>
                    <TrashIcon className='w-4 h-4 text-white' />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className='p-4'>
                <h3 className='font-bold text-[#3A3A3A] leading-snug mb-2 line-clamp-2'>{event.title}</h3>
                <div className='space-y-1.5 text-xs text-gray-500'>
                  <div className='flex items-center gap-1.5'>
                    <CalenderIcon className='w-3.5 h-3.5 shrink-0' />
                    <span>{formatDisplayDate(event)}</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <LocationIcon className='w-3.5 h-3.5 shrink-0' />
                    <span className='truncate'>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EventPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        selectedEvent={editingEvent}
        token={token}
        onSaved={handleSaved}
      />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title='Delete Event'
        message='Are you sure you want to delete this event? This cannot be undone.'
        confirmText='Delete'
        confirmButtonStyle='bg-red-600 hover:bg-red-700'
      />
    </div>
  )
}

export default Event
