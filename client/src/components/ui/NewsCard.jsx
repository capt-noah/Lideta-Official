import React from 'react'
import { useNavigate } from 'react-router-dom'

import ArrowUpRight from '../../assets/arrow_up_right.svg?react'

function NewsCard({ id, title, description, date, category }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (id) {
      navigate(`/news/${id}`)
    }
  }

  return (
        <div 
          onClick={handleClick}
          className='bg-white w-60 h-60 rounded-sm flex flex-col items-center py-2 space-y-2 relative shadow-xl hover:scale-101 cursor-pointer ' 
        >

            <div className='bg-[#D9D9D9] w-56 h-35 rounded-sm p-1' >

              <div className='bg-[#5E5E5E] text-xs text-white w-fit px-2 rounded-full ' >
                <p >{date}</p>
              </div>

            </div>

            <button className='bg-[#3A3A3A] w-12 h-12 absolute top-0 right-0 rounded-tr-sm rounded-bl-xl flex justify-center items-center cursor-pointer ' >
                <ArrowUpRight className="w-10 h-10 text-white" />
            </button>

            <div className='w-55 flex flex-col gap-2' >

                <div className='flex items-center gap-2' >
                  <h1 className=' text-lg truncate font-bold' >{title}</h1>
                  {category && (
                    <span className='bg-[#D9D9D9] text-xs px-2 py-1 rounded-full' >{category}</span>
                  )}
                </div>
                <p className='h-15 text-xs font-light' >{description}</p>

            </div>

        </div>
  )
}

export default NewsCard