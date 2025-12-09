import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EventCard from '../components/ui/EventCard.jsx'
import eventsData from '../data/events.json'
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
  const navigate = useNavigate()
  const { id } = useParams()

  const currentEvent = eventsData.find(item => item.id === id) || eventsData[0]
  const relatedEvents = eventsData.filter(event => event.id !== currentEvent.id).slice(0, 6)

  const contentBlocks = currentEvent?.content?.length ? currentEvent.content : [currentEvent?.description || '']

  return (
    <div className='w-full min-h-screen bg-white'>
      <div className='max-w-7xl mx-auto py-6'>
        <button
          onClick={() => navigate('/events')}
          className='bg-[#3A3A3A] flex items-center gap-2 mb-6 font-roboto font-medium text-white py-2 px-4 rounded-full hover:bg-[#202020] active:scale-99 transition-colors cursor-pointer'
        >
          <ArrowRight className='w-4 h-4 rotate-180' />
          <span>Back to Events</span>
        </button>

        <div className='grid grid-cols-[1fr_350px] gap-8 items-start'>
          <div className='flex flex-col'>
            <h1 className='font-goldman font-bold text-4xl mb-4'>
              {currentEvent.title}
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

            <div className='bg-[#D9D9D9] w-full h-96 rounded-lg mb-6 flex items-center justify-center'>
              <img src={ImageIcon} alt='' className='w-24 h-24 opacity-50' />
            </div>

            <div className='font-roboto text-base leading-relaxed space-y-4 text-gray-800'>
              {contentBlocks.map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-8'>
            <div>
              <h2 className='font-goldman font-bold text-xl mb-4'>Events</h2>

              <div className='space-y-3'>
                {relatedEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => navigate(`/events/${event.id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails

