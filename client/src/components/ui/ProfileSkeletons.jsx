import React from 'react'

function ProfileSkeletons() {
  return (
      <div className='grid grid-cols-[400px_1fr] gap-15 py-6 px-15'>
        {/* Profile Card Skeleton */}
          <div className='bg-gray-100 h-fit border rounded-xl p-10 flex flex-col items-center relative animate-pulse'>
            <div className='relative mb-4'>
              <div className='w-60 h-60 rounded-full bg-gray-300 border-4 border-white shadow-lg'></div>
              <div className='absolute bottom-0 right-0 w-10 h-10 bg-gray-300 rounded-full shadow-lg'></div>
            </div>
            <div className='h-7 w-40 bg-gray-300 rounded mb-1'></div>
            <div className='h-4 w-24 bg-gray-300 rounded'></div>
          </div>

        <div className='space-y-6 w-180 '>

          {/* Personal Information Section Skeleton */}
          <div className='bg-white border-2 border-gray-300 rounded-xl animate-pulse'>
            <div className='flex h-15 rounded-tr-lg rounded-tl-lg bg-gray-300 px-8 justify-between items-center'>
              <div className='h-6 w-48 bg-gray-400 rounded'></div>
              <div className='w-9 h-9 bg-gray-400 rounded-full'></div>
            </div>
            <div className='py-5 px-8 space-y-0'>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className={`flex justify-between items-center py-4 ${item !== 6 ? 'border-b border-gray-200' : ''}`}>
                  <div className='h-4 w-24 bg-gray-300 rounded'></div>
                  <div className='h-5 w-48 bg-gray-300 rounded'></div>
                </div>
              ))}
            </div>
          </div>

          {/* dmin Information Section Skeleton */}
          <div className='bg-white border-2 border-gray-300 rounded-xl animate-pulse'>
          <div className='flex h-15 rounded-tr-lg rounded-tl-lg bg-gray-300 px-5 justify-between items-center'>
            <div className='h-6 w-40 bg-gray-400 rounded'></div>
            <div className='w-9 h-9 bg-gray-400 rounded-full'></div>
          </div>
          <div className='p-5 space-y-0'>
            <div className='flex justify-between items-center py-4 border-b border-gray-200'>
              <div className='h-4 w-20 bg-gray-300 rounded'></div>
              <div className='flex items-center gap-2'>
                <div className='h-5 w-48 bg-gray-300 rounded'></div>
                <div className='w-7 h-7 bg-gray-300 rounded'></div>
              </div>
            </div>
            <div className='flex justify-between items-center py-4 border-b border-gray-200'>
              <div className='h-4 w-20 bg-gray-300 rounded'></div>
              <div className='h-5 w-32 bg-gray-300 rounded'></div>
            </div>
            <div className='flex justify-between items-center py-4 border-b border-gray-200'>
              <div className='h-4 w-12 bg-gray-300 rounded'></div>
              <div className='h-5 w-64 bg-gray-300 rounded'></div>
            </div>
            <div className='flex justify-between items-center py-4'>
              <div className='h-4 w-20 bg-gray-300 rounded'></div>
              <div className='flex items-center gap-2'>
                <div className='h-5 w-32 bg-gray-300 rounded'></div>
                <div className='w-7 h-7 bg-gray-300 rounded'></div>
              </div>
            </div>
          </div>
          </div>

          {/* Preferences Section Skeleton */}
          <div className='bg-white border-2 border-gray-300 rounded-xl animate-pulse'>
            <div className='flex h-15 rounded-tr-lg rounded-tl-lg bg-gray-300 px-5 justify-between items-center'>
              <div className='h-6 w-32 bg-gray-400 rounded'></div>
              <div className='w-9 h-9 bg-gray-400 rounded-full'></div>
            </div>
            <div className='p-5 space-y-6'>
              {/* Theme Options Skeleton */}
              <div>
                <div className='h-4 w-16 bg-gray-300 rounded mb-3'></div>
                <div className='flex px-10 gap-6'>
                  <div className='flex gap-4 border-2 border-gray-200 rounded-2xl p-4'>
                    <div className='bg-gray-300 w-10 h-10 rounded'></div>
                    <div className='w-25 space-y-2'>
                      <div className='bg-gray-200 h-9 rounded'></div>
                      <div className='bg-gray-200 h-9 rounded'></div>
                      <div className='bg-gray-200 h-5 rounded'></div>
                    </div>
                  </div>
                  <div className='bg-gray-300 flex gap-2 border-2 border-gray-200 p-4 rounded-2xl'>
                    <div className='bg-gray-400 w-10 h-10 rounded'></div>
                    <div className='w-25 space-y-2'>
                      <div className='bg-gray-400 h-9 rounded'></div>
                      <div className='bg-gray-400 h-9 rounded'></div>
                      <div className='bg-gray-400 h-5 rounded'></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Font Size Options Skeleton */}
              <div>
                <div className='h-4 w-12 bg-gray-300 rounded mb-3'></div>
                <div className='flex gap-3'>
                  {[1, 2, 3].map((item) => (
                    <div key={item} className='h-9 w-20 bg-gray-300 rounded-full'></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>  
  )
}

export default ProfileSkeletons

