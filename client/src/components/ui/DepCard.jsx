import React from 'react'

function DepCard({title, description}) {
  return (
        <div className='w-90 h-50 bg-white rounded-xl flex flex-col justify-between py-2 items-center font-roboto font-medium shadow-lg shadow-gray-300 cursor-pointer hover:scale-101 active:scale-99 transition-all ' >

            <div className='w-full flex items-center px-2 space-x-3' >
              <div className='w-15 h-15 bg-[#D9D9D9] rounded-full' />
              <h1 className='w-65 font-bold text-xl truncate ' >{ title }</h1>
          </div>
          
          <p className='w-80 text-[#6c6c6c]' > {description} </p>

          <div className=' w-full flex justify-end px-2' >
              <button className='w-26 h-8 bg-[#3A3A3A] text-white text-sm rounded-lg' >Readmore</button>   
              
          </div>

          
        </div>
  )
}

export default DepCard