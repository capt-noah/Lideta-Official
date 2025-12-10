import React from 'react'

function DepCard({title, description}) {
  return (
        <div className='w-full max-w-75 h-50 bg-white rounded-xl flex flex-col justify-between py-2 px-2 items-center font-roboto font-medium shadow-lg shadow-gray-300 cursor-pointer hover:scale-101 active:scale-99 transition-all ' >

            <div className='w-full flex items-center px-2 space-x-2' >
              <div className='w-12 h-12 bg-[#D9D9D9] rounded-full' />
              <h1 className='w-60 font-bold text-xl truncate ' >{ title }</h1>
          </div>
          
          <p className='w-full text-[#6c6c6c] px-4' > {description} </p>

          <div className=' w-full flex justify-end px-2' >
              <button className='w-26 h-8 bg-[#3A3A3A] text-white text-sm rounded-lg' >Readmore</button>   
              
          </div>

          
        </div>
  )
}

export default DepCard