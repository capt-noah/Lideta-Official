import React from 'react'

function Loading() {
  return (
    <div className='w-full flex justify-center items-center py-12'>
      <div className='flex gap-1'>
        <div className='bg-[#FACC14] w-3 h-3 rounded-full animate-bounce' />
        <div className='bg-[#FACC14] w-3 h-3 rounded-full animate-bounce [animation-delay:100ms]' />
        <div className='bg-[#FACC14] w-3 h-3 rounded-full animate-bounce [animation-delay:200ms]' />
      </div>
    </div>
  )
}

export default Loading
