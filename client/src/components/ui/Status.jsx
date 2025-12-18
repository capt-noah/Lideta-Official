import React, { useEffect, useState } from 'react'

function Status({ status }) {




    const statusList = [
      { name: ['assigning', 'upcoming', 'submitted'], bgColor: '#CCD8F8', textColor: '#0032B6' },
       { name: ['in progress', 'pending', 'reviewing'], bgColor: '#FEE5CC', textColor: '#BC5E00' },
      { name: ['resolved', 'complete', 'completed', 'accepted'], bgColor: '#C2FEDE', textColor: '#006E33' },
       { name: ['canceled', 'cancelled', 'rejected'], bgColor: '#FBDEDF', textColor: '#9A0005' },

    ]

    const stat = statusList.find(stat => stat.name.includes(status?.toLowerCase())) || {
      bgColor: '#E5E5E5',
      textColor: '#666666'
    }

  return (
      <div
          className="py-1 px-3 flex justify-center items-center rounded-md text-xs font-medium"
          style={{ backgroundColor: stat.bgColor, color: stat.textColor }}
      >
          {status}
      </div>
  )
}

export default Status