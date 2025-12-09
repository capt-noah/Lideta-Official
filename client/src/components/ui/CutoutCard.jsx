import React from 'react'
import cutout_card from '../../assets/icons/cutout_card.svg'
import GlobeIcon from '../../assets/icons/globe_icon.svg'
import ArrowRight from '../../assets/icons/arrow_right.svg?react'

function CutoutCard({title, description}) {
  return (
        <div className='relative flex' >
          <img className='w-70' src={cutout_card} alt="" />
          
          <div className='w-[90%] h-3/4 ml-[5%] mt-2 absolute flex flex-col justify-around'>
              <img className='w-12 h-12 ' src={GlobeIcon} alt="" />
              <p className='font-bold text-2xl' >{ title }</p>
              <p className='font-light text-sm' > { description } </p>
          </div>


          <button className='w-11 h-11 bg-[#3A3A3A] rounded-full absolute right-0 bottom-0.5 flex justify-center items-center' >
              <ArrowRight className="text-white" />
          </button>
        </div>
  )
}

export default CutoutCard