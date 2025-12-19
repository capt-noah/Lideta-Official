import React, { useState } from 'react'

import SidebarIcon from '../../assets/icons/sidebar_icon.svg'
import DividerIcon from '../../assets/icons/divider_icon.svg'

import AllIcon from '../../assets/icons/all_icon.svg?react'
import ChipIcon from '../../assets/icons/chip_icon.svg?react'
import Enviroment_icon from '../../assets/icons/enviroment_icon.svg?react'
import CityIcon from '../../assets/icons/city_icon.svg?react'
import HealthIcon from '../../assets/icons/heart_pulse_icon.svg?react'
import GraduationIcon from '../../assets/icons/graduation_cap_solid.svg?react'
import ShieldIcon from '../../assets/icons/shield_solid_icon.svg?react'
import EventIcon from '../../assets/icons/calendar_day_icon.svg?react'

function SideBar({ categories, filter, setFilter }) {


  if (!categories) {
      categories = [
        { label: 'All', bg: '#3A3A3A', color: 'white', icon: AllIcon},
        { label: 'Technology', bg: '#FFFFFF', color: 'black', icon: ChipIcon},
        { label: 'Environment', bg: '#FFFFFF', color: 'black', icon: Enviroment_icon},
        { label: 'Infrastructure', bg: '#FFFFFF', color: 'black', icon: CityIcon},
        { label: 'Health', bg: '#FFFFFF', color: 'black', icon: HealthIcon},
        { label: 'Education', bg: '#FFFFFF', color: 'black', icon: GraduationIcon},
        { label: 'Security', bg: '#FFFFFF', color: 'black', icon: ShieldIcon},
        { label: 'Events', bg: '#FFFFFF', color: 'black', icon: EventIcon},
    ]
  }






  return (
      <div className='w-60 h-140 border-2 border-[#D9D9D9] flex flex-col items-center space-y-3 rounded-xl font-jost py-5' >
          
          <div className='w-full h-10 px-5 flex justify-between items-center' >
              <p className='font-medium text-xl' >Categories</p>
              <img src={SidebarIcon} alt="" />
          </div>

          <img src={DividerIcon} alt="" />
          
          <div className='w-53 h-100 py-2 space-y-2 ' >
              
            {
              categories.map(cat => {
                  const isSelected = filter === cat.label
                  const bgColor = isSelected ? '#3A3A3A' : '#FFFFFF'
                  const textColor = isSelected ? 'white' : '#3A3A3A'
                  
                  return (
                    <button  key={cat.label} onClick={() => setFilter(cat.value || cat.label)} className={`w-full h-10 rounded-sm flex items-center px-3 space-x-3 cursor-pointer transition-colors`} style={{ backgroundColor: bgColor, color: textColor }}>
                      <cat.icon className="w-5 h-5" fill={textColor} />
                      <p className=' font-medium text-sm' >{ cat.label }</p>
                    </button>
                )
              })
            }
             

          </div>

        </div>
  )
}

export default SideBar