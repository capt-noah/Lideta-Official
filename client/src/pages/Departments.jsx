import DepCard from '../components/ui/DepCard'
import SideBar from '../components/ui/SideBar'

import departmentsData from '../data/departments.json'

import ArrowSvg from '../assets/arrow.svg?react'

import SearchBox from '../components/ui/Search.jsx'
import { useState } from 'react'

function Departments() {

  const departments = departmentsData

  const [results, setResults] = useState(null)
  const [noResultFound, setNoResultFound] = useState(false)
  
  return (
    <div className='w-full h-screen grid grid-cols-[280px_1fr] grid-rows-[1fr]' >

      <div className='grid grid-rows-[100px_1fr]' >
        <div></div>
        <div className='flex justify-center' >
            <SideBar />
        </div>
      </div>

      <div className=' grid grid-rows-[100px_1fr]' >
        
        <div className='font-goldman font-bold text-5xl flex items-end py-4' >Departments</div>

        <div className='bg-[#f5f5f5] p-4 space-y-4 ' >

          <div className='w-full flex items-center justify-between gap-4 px-4'>

            <SearchBox data={departments} results={results} setResults={setResults} noResultFound={noResultFound} setNoResultFound={setNoResultFound} />

            <button className='flex items-center justify-between px-4 py-2 rounded-full bg-white shadow font-roboto font-medium text-md min-w-[120px] cursor-pointer'>
              <p>Latest</p>
              <ArrowSvg />
            </button>
          </div>

          <div className='w-full flex justify-center items-center' >
              <hr className='w-280 text-gray-300' />
          </div>

          <div className='flex flex-wrap justify-start gap-x-6 gap-y-6 py-4' > 

          {
            results ?
              results.map(dep => {
                return <DepCard title={dep.title} description={dep.description} />
              })
            :
              noResultFound ?
                <h1>No Results Found</h1>
                :
                departments.map(dep => {
                  return <DepCard title={dep.title} description={dep.description} />
                })
            }
          </div>

        </div>
        
      </div>


    </div>
  )
}

export default Departments