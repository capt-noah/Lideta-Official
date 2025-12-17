import React, { useMemo } from 'react'
import Status from './Status.jsx'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import LocationIcon from '../../assets/icons/location_icon.svg?react'

const getDateParts = (event) => {
  const rawDate = event?.startDate || event?.date || event?.start_date
  const parsed = rawDate ? new Date(rawDate) : null

  if (parsed && !isNaN(parsed)) {
    return {
      day: parsed.getDate(),
      dayOfWeek: parsed.toLocaleString('en-US', { weekday: 'short' }).toUpperCase(),
      month: parsed.toLocaleString('en-US', { month: 'short' }),
      year: parsed.getFullYear()
    }
  }

  return {
    day: event?.day || '--',
    dayOfWeek: event?.dayOfWeek || '',
    month: event?.month || '',
    year: event?.year || ''
  }
}

function EventCard({ event, onClick }) {
  const dateParts = useMemo(() => getDateParts(event), [event])

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-2xl p-3 shadow-sm transition hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className='flex gap-3'>
        {/* Date section only on cards (no image thumbnail) */}
        <div className='flex flex-col items-center justify-center px-2 min-w-[56px]'>
          <span className='text-3xl font-bold text-[#3A3A3A]'>{dateParts.day}</span>
          <span className='text-sm font-medium text-gray-500'>{dateParts.dayOfWeek}</span>
        </div>

        <div className='w-px bg-gray-200 rounded-full' />

        <div className='flex-1'>
          <h3 className='font-semibold text-[#3A3A3A] mb-3 leading-snug'>
            {event.title}
          </h3>

          <div className='flex flex-wrap items-center gap-2 text-xs text-gray-600'>
            <Status status={event.status} />

            <div className='flex items-center gap-1'>
              <CalenderIcon className='w-4 h-4' />
              <span>{dateParts.month} {dateParts.day}, {dateParts.year}</span>
            </div>

            <div className='flex items-center gap-1'>
              <LocationIcon className='w-4 h-4' />
              <span className='truncate max-w-[180px]' title={event.location}>{event.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCard


