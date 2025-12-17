import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../components/ui/EventCard.jsx'
import eventsData from '../data/events.json'
import SearchIcon from '../assets/icons/search_icon.svg'
import ArrowSvg from '../assets/arrow.svg'
import CalenderIcon from '../assets/icons/calender_icon.svg?react'

import SearchBox from '../components/ui/Search.jsx'

const statusFilters = ['All', 'Upcoming', 'Pending', 'Complete', 'Canceled']

const getMonthLabel = (dateValue) => {
  const parsed = new Date(dateValue)
  if (!isNaN(parsed)) {
    return parsed.toLocaleString('en-US', { month: 'long' })
  }
  return 'Other'
}

function Events() {

  const navigate = useNavigate()
  const [events, setEvents] = useState(eventsData)
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState(null)
  const [noResultFound, setNoResultFound] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load events from API (fallback to static JSON on failure)
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('http://localhost:3000/api/events')
        if (!res.ok) throw new Error('Failed to load events')
        const data = await res.json()

        const formatted = data.map(item => ({
          ...item,
          id: item.id?.toString() || item.event_id?.toString() || item.events_id?.toString() || item.id,
          title: item.title,
          location: item.location || '',
          status: item.status || 'Upcoming',
          startDate: item.start_date || item.startDate || item.date,
          date: item.start_date || item.startDate || item.date,
          photos: item.photos || item.photo || null
        }))

        setEvents(formatted)
      } catch (error) {
        console.error('Error fetching events:', error)
        setEvents(eventsData)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const filteredEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    const source = results ?? events

    return source
      .filter(event => {
        const matchesSearch = !term || event.title.toLowerCase().includes(term) || event.location.toLowerCase().includes(term)
        const matchesStatus = selectedStatus === 'All' || event.status?.toLowerCase() === selectedStatus.toLowerCase()
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => new Date(b.startDate || b.date) - new Date(a.startDate || a.date))
  }, [searchTerm, selectedStatus, events, results])

  const monthSections = useMemo(() => {
    return filteredEvents.reduce((sections, event) => {
      const monthLabel = getMonthLabel(event.startDate || event.date)
      const existing = sections.find(section => section.label === monthLabel)

      if (existing) {
        existing.events.push(event)
      } else {
        sections.push({ label: monthLabel, events: [event] })
      }

      return sections
    }, [])
  }, [filteredEvents])

  return (
    <div className='w-full flex flex-col gap-4 px-2 mt-10 lg:px-4 bg-white'>
      <div className='w-full flex flex-col'>
        <div className='w-fit font-goldman font-bold text-4xl lg:text-5xl flex items-end py-4'>Events</div>

        <div className='bg-[#f5f5f5] w-full rounded-2xl border border-gray-200 p-3 lg:p-4 space-y-6'>

          <div className='flex flex-wrap items-center gap-4 justify-between'>

            <SearchBox data={events} results={results} setResults={setResults} noResultFound={noResultFound} setNoResultFound={setNoResultFound} />

            <div className='border-2 border-[#D9D9D9] rounded-lg p-2 flex flex-wrap items-center gap-2'>
              {statusFilters.map(status => {
                const isActive = selectedStatus === status
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-md border border-[#D9D9D9] text-sm font-medium transition-colors cursor-pointer ${isActive ? 'bg-[#3A3A3A] text-white shadow border-gray-300' : 'bg-transparent hover:bg-gray-200 '}`}
                  >
                    {status}
                  </button>
                )
              })}
            </div>

            <button className='flex items-center justify-between px-4 py-2 rounded-full bg-white shadow font-roboto font-medium text-md min-w-24 cursor-pointer'>
              <p>Latest</p>
              <img src={ArrowSvg} alt='' />
            </button>
          </div>

          <hr className='text-gray-300' />

          <div className='space-y-10'>
            {isLoading ? (
              <div className='w-full flex justify-center items-center py-12'>
                <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#3A3A3A]'></div>
              </div>
            ) : monthSections.map(section => (
              <div key={section.label} className='space-y-2'>
                <h3 className='font-roboto text-xl px-1'>{section.label}</h3>
                <div className='w-full flex flex-wrap justify-center items-center gap-6 md:justify-start md:gap-4 lg:gap-6'>
                  {
                    results ?
                      results.map(event => (
                        <div key={event.id} className='w-full sm:w-[320px] md:w-[360px] lg:w-[380px]'>
                          <EventCard event={event} onClick={() => navigate(`/events/${event.id}`)} />
                        </div>
                      ))
                      :
                      noResultFound ?
                        <div className='flex flex-col items-center justify-center py-12 text-center text-gray-500 w-full'>
                          <CalenderIcon className='w-8 h-8 mb-2 ' />
                          <p className='font-roboto'>No events match your filters yet.</p>
                        </div>
                        :
                        section.events.map(event => (
                          <div key={event.id} className='w-full sm:w-[320px] md:w-[360px] lg:w-[380px]'>
                            <EventCard event={event} onClick={() => navigate(`/events/${event.id}`)} />
                          </div>
                        ))
                  }
                </div>
              </div>
            ))}


          </div>
        </div>
      </div>
    </div>
  )
}

export default Events