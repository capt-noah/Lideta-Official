import React from 'react'
import { useNavigate } from 'react-router-dom'
import ImageIcon from '../../assets/icons/image_icon.svg?react'

import ArrowUpRight from '../../assets/arrow_up_right.svg?react'



function NewsCard({ id, title, description, date, category, photo }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (id) {
      navigate(`/news/${id}`)
    }
  }

  // Get image source - use photo path if available, otherwise placeholder
  // const getImageSrc = () => {
  //   if (photo) {
  //     if (typeof photo === 'object' && photo.path) {
  //       return `http://localhost:3000${photo.path}`
  //     } else if (typeof photo === 'string') {
  //       // If it's a JSON string, try to parse it
  //       try {
  //         const parsed = JSON.parse(photo)
  //         if (parsed.path) return `http://localhost:3000${parsed.path}`
  //       } catch (e) {
  //         // Not JSON, might be a path string
  //         if (photo.startsWith('/')) return `http://localhost:3000${photo}`
  //       }
  //     }
  //   }
  //   return null
  // }

  // const imageSrc = getImageSrc()


  return (
        <div 
          onClick={handleClick}
          className='bg-white w-60 h-60 mx-auto rounded-sm flex flex-col items-center py-2 space-y-2 relative shadow-xl hover:scale-101 cursor-pointer ' 
        >

            <div className='bg-[#D9D9D9] w-56 h-35 rounded-sm border border-gray-300 relative overflow-hidden' >
            {
              photo?.path?
                <img src={photo?.path}  alt={ 'News image'} className='w-full h-full object-cover rounded-sm'/>
                : 
                <div className='w-full h-full flex justify-center items-center' >
                  <ImageIcon className="w-10 h-10 text-gray-400"  />
                </div>
            }

              <div className='bg-[#5E5E5E] text-xs text-white w-fit px-2 rounded-full absolute top-1 left-1' >
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