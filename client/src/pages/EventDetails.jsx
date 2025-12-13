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
    <div className='w-full px-2 bg-white'>

      <div className='w-full py-6 absolute'>
        <button
          onClick={() => navigate('/events')}
          className='bg-[#3A3A3A] left-[1%] relative flex items-center gap-2 mb-6 font-roboto font-medium text-xs lg:text-base text-white py-2 px-2 lg:px-4 rounded-full hover:bg-[#202020] active:scale-99 transition-colors cursor-pointer'
        >
          <ArrowRight className='w-4 h-4 rotate-180' />
          <span>Back to Events</span>
        </button>

        <div className='w-full flex flex-col gap-16 items-start lg:flex-row lg:gap-4 '>

          <div className=' mx-auto w-full flex flex-col md:max-w-3xl lg:max-w-3xl xl:max-w-4xl '>

            <h1 className='font-goldman font-bold text-2xl md:text-3xl lg:text-4xl mb-4  '>
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

            <div className='bg-[#D9D9D9] w-full h-80 sm:h-100 lg:h-120 xl:h-130 rounded-lg mb-6 flex items-center justify-center'>
              <img src={ImageIcon} alt='' className='w-24 h-24 opacity-50' />
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
              
              <h2 className='font-goldman font-bold text-xl mb-4'>Other Events</h2>

              <div className='space-y-3 2xl:space-y-6 '>
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


