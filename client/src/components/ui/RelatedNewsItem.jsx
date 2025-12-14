import React from 'react'
import { useNavigate } from 'react-router-dom'
import ImageIcon from '../../assets/icons/image_icon.svg?react'

function RelatedNewsItem({ title, category, path, onClick }) {
  return (
    <div onClick={onClick} className='flex items-start gap-3 cursor-pointer border-2 border-[#D9D9D9] rounded-md p-1 hover:opacity-80 transition-opacity mb-2' >
      <div className='bg-[#D9D9D9] w-20 h-20 rounded-sm flex items-center justify-center flex-shrink-0'>
        {path?
          <img src={path} alt="" className='w-full h-full rounded-sm'  />
          :
          <ImageIcon className='w-8 h-8 opacity-50' />
        }
      </div>
      <div className='flex flex-col gap-1'>
        <h3 className='font-roboto font-semibold leading-tight'>{title}</h3>
        <span className='font-roboto text-xs text-gray-600'>{category}</span>
      </div>
    </div>
  )
}

export default RelatedNewsItem






