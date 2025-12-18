import React from 'react'

function LoadingButton({ isLoading, children, className = '', onClick, type = 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`relative flex justify-center items-center transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-80 ${className}`}
    >
      {isLoading ? (
        <div className='flex gap-1'>
          <div className='bg-white w-3 h-3 rounded-full animate-bounce' />
          <div className='bg-white w-3 h-3 rounded-full animate-bounce [animation-delay:100ms]' />
          <div className='bg-white w-3 h-3 rounded-full animate-bounce [animation-delay:200ms]' />
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default LoadingButton
