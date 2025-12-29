import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../components/utils/LanguageContext.jsx'
import EventCard from '../components/ui/EventCard.jsx'
import Loading from '../components/ui/Loading.jsx'
import eventsData from '../data/events.json'
import translatedContents from '../data/translated_contents.json'
import ArrowRight from '../assets/icons/arrow_right.svg?react'
import ImageIcon from '../assets/icons/image_icon.svg'
import Status from '../components/ui/Status.jsx'
import CalenderIcon from '../assets/icons/calender_icon.svg?react'
import LocationIcon from '../assets/icons/location_icon.svg?react'

const formatFullDate = (dateValue) => {
  const parsed = new Date(dateValue)
  if (!isNaN(parsed)) {
    return parsed.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }
  return dateValue || ''
}

function EventDetails() {
  const { language } = useLanguage()
  const t = translatedContents.events_page.details
  const navigate = useNavigate()
  const { id } = useParams()

  const [events, setEvents] = useState(eventsData)
  const [currentEvent, setCurrentEvent] = useState(eventsData.find(item => item.id === id) || eventsData[0])
  const [relatedEvents, setRelatedEvents] = useState(eventsData.filter(event => event.id !== (eventsData.find(item => item.id === id)?.id)).slice(0, 6))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events')
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
          photos: item.photos || item.photo || null,
          description: item.description || '',
          content: item.content || null,
          amh: item.amh,
          orm: item.orm
        }))

        setEvents(formatted)

        const selected = formatted.find(ev => ev.id === id) || formatted[0]
        setCurrentEvent(selected)

        const related = formatted
          .filter(ev => ev.id !== selected?.id)
          .slice(0, 6)
        setRelatedEvents(related)
      } catch (error) {
        console.error('Error fetching events:', error)
        // fallback to static data
        const selected = eventsData.find(ev => ev.id === id) || eventsData[0]
        setCurrentEvent(selected)
        const related = eventsData
          .filter(ev => ev.id !== selected?.id)
          .slice(0, 6)
        setRelatedEvents(related)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [id])

  const contentBlocks = useMemo(() => {
    if (!currentEvent) return []
    
    // Translation Logic
    let description = currentEvent.description;
    if (language === 'am' && currentEvent.amh?.description) {
        description = currentEvent.amh.description;
    } else if (language === 'or' && currentEvent.orm?.description) {
        description = currentEvent.orm.description;
    }

    if (currentEvent.content && Array.isArray(currentEvent.content) && currentEvent.content.length) {
      // Content array handling might be complex for translation if it's structured data. 
      // For now assume description override is main way or handle content if available in translation?
      // The prompt implies amh/orm JSON has title/description.
      // So I will rely on description field from translation.
      return currentEvent.content // fallback to original content array if no translation logic for it yet, or...
      // actually if description is translated, we should probably use that.
      // existing logic prefers content array over description.
    }
    
    if (description) {
       return description.split('\n').filter(p => p.trim())
    }

    return ['']
  }, [currentEvent, language])

  if (isLoading || !currentEvent) {
    return (
      <div className='w-full flex justify-center items-center h-screen'>
        <Loading />
      </div>
    )
  }

  return (
    <div className='w-full px-2 bg-white'>

      <div className='w-full py-6'>
        <button
          onClick={() => navigate('/events')}
          className='bg-[#3A3A3A] left-[1%] relative flex items-center gap-2 mb-6 font-roboto font-medium text-xs lg:text-base text-white py-2 px-2 lg:px-4 rounded-full hover:bg-[#202020] active:scale-99 transition-colors cursor-pointer'
        >
          <ArrowRight className='w-4 h-4 rotate-180' />
          <span>{t.back_to_events[language]}</span>
        </button>

        <div className='w-full flex flex-col gap-16 items-start lg:flex-row lg:gap-4 '>

          <div className=' mx-auto w-full flex flex-col md:max-w-3xl lg:max-w-3xl xl:max-w-4xl '>

            <h1 className='font-goldman font-bold text-2xl md:text-3xl lg:text-4xl mb-4  '>
              {(() => {
                  if (language === 'am' && currentEvent.amh?.title) return currentEvent.amh.title
                  if (language === 'or' && currentEvent.orm?.title) return currentEvent.orm.title
                  return currentEvent.title
              })()}
            </h1>

            <div className='flex items-center gap-3 mb-6 font-roboto text-sm text-gray-700 flex-wrap'>
              <Status status={currentEvent.status} />

              <div className='flex items-center gap-1'>
                <CalenderIcon className='w-4 h-4' />
                <span>{formatFullDate(currentEvent.startDate || currentEvent.date)}</span>
              </div>

              <div className='flex items-center gap-1'>
                <LocationIcon className='w-4 h-4' />
                <span>{currentEvent.location}</span>
              </div>
            </div>

            <div className='bg-[#D9D9D9] w-full h-80 sm:h-100 lg:h-120 xl:h-130 rounded-lg mb-6 flex items-center justify-center overflow-hidden relative'>
              {(() => {
                let photoSrc = null
                if (currentEvent?.photos) {
                  let photo = null
                  if (Array.isArray(currentEvent.photos) && currentEvent.photos.length > 0) {
                    photo = currentEvent.photos[0]
                  } else if (typeof currentEvent.photos === 'object' && currentEvent.photos.path) {
                    photo = currentEvent.photos
                  } else if (typeof currentEvent.photos === 'string') {
                    try {
                      const parsed = JSON.parse(currentEvent.photos)
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        photo = parsed[0]
                      } else if (parsed.path) {
                        photo = parsed
                      }
                    } catch (e) {}
                  }
                  if (photo && photo.path) {
                    photoSrc = photo.path
                  }
                }
                return photoSrc ? (
                  <img 
                    src={photoSrc} 
                    alt={currentEvent.title || 'Event'} 
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextElementSibling.style.display = 'flex'
                    }}
                  />
                ) : null
              })()}
              <div className={`${currentEvent?.photos ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                <img src={ImageIcon} alt='' className='w-24 h-24 opacity-50' />
              </div>
            </div>

            <div className='font-roboto text-base leading-tight space-y-4 text-gray-800'>
              {contentBlocks.map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <hr className='text-gray-300 w-full lg:hidden' />

          <div className=' flex mx-auto flex-col gap-8 lg:max-w-sm xl:max-w-100 2xl:max-w-150 2xl:gap-16 '>

            <div>
              
              <h2 className='font-goldman font-bold text-xl mb-4'>{t.other_events[language]}</h2>

              <div className='space-y-3 2xl:space-y-6 '>
                {relatedEvents.map(event => {
                    let rTitle = event.title
                    let rLocation = event.location
                    if (language === 'am' && event.amh) {
                        rTitle = event.amh.title || rTitle
                        rLocation = event.amh.location || rLocation
                    } else if (language === 'or' && event.orm) {
                        rTitle = event.orm.title || rTitle
                        rLocation = event.orm.location || rLocation
                    }

                  return (
                  <EventCard
                    key={event.id}
                    event={{...event, title: rTitle, location: rLocation}}
                    onClick={() => navigate(`/events/${event.id}`)}
                  />
                )})}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default EventDetails


