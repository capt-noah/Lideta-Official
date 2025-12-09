import React from 'react'
import { useNavigate } from 'react-router-dom'

import ArrowUpRight from '../../assets/arrow_up_right.svg?react'

function VacancyCard({ id, title, description, salary, type }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (id) {
      navigate(`/vaccancy/${id}`)
    }
  }

  return (
        <div 
          onClick={handleClick}
          key={id} 
          className='w-87 h-45 bg-white rounded-xl p-4 flex flex-col justify-between shadow-lg shadow-gray-300 cursor-pointer hover:scale-101 active:scale-99 transition-all relative'>
            <div>
                <div className='flex items-start justify-between mb-2'>
                    <h2 className='font-roboto font-bold text-lg'>{title}</h2>
                  <div className='w-12 h-12 bg-[#3A3A3A] rounded-tr-md rounded-bl-md border  flex items-center justify-center absolute right-0 top-0'>
                      <ArrowUpRight className='w-8 text-white' />
                    </div>
                </div>
                <p className='text-sm text-[#6c6c6c] font-roboto'>{description}</p>
            </div>

            <div className='flex items-center gap-2 font-roboto font-bold'>
                
                <p className='px-3 py-1 rounded-full bg-[#C7E7FF] text-xs'> {salary} </p>
                <p className='px-3 py-1 rounded-full bg-[#2D4C65] text-xs text-white'> {type} </p>
              
            </div>
        </div>
  )
}

export default VacancyCard