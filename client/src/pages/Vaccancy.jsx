import React, { useState } from 'react'
import SideBar from '../components/ui/SideBar'
import VacancyCard from '../components/ui/VacancyCard'
import vacanciesData from '../data/vacancies.json'

import SearchIcon from '../assets/icons/search_icon.svg'
import DividerIcon from '../assets/icons/divider_icon.svg'
import ArrowSvg from '../assets/arrow.svg'

import SearchBox from '../components/ui/Search.jsx'

function Vaccancy() {
  const jobs = vacanciesData
  const [results, setResults] = useState(null)
  const [noResultFound, setNoResultFound] = useState(false)
  const [filter, setFilter] = useState('All')

  let filtered = filter.toLowerCase() === 'all' ? jobs : jobs.filter(job => job.category.toLowerCase() === filter.toLowerCase())
  let finalList = results !== null? results : filtered



  return (
    <div className='w-full h-screen grid grid-cols-[280px_1fr] grid-rows-[1fr]'>
      {/* Left filters column */}

      <div className=' grid grid-rows-[100px_1fr]'>

        <div></div>

        <div className='flex justify-center'>
          <SideBar filter={filter} setFilter={setFilter} />
        </div>

      </div>


      {/* Right jobs column */}
      <div className='grid grid-rows-[100px_1fr] '>

        <div className='font-goldman font-bold text-5xl flex items-end py-4' >Jobs</div>


        <div className='bg-[#f5f5f5] py-4'>

          <div className='flex items-center justify-between gap-4 px-4'>

            <SearchBox data={filtered} results={results} setResults={setResults} noResultFound={noResultFound} setNoResultFound={setNoResultFound}  />

            <button className='flex items-center justify-between px-4 py-2 rounded-full bg-white shadow font-roboto font-medium text-md min-w-[120px] cursor-pointer'>
              <p>Latest</p>
              <img src={ArrowSvg} alt="" />
            </button>
          </div>

          <div className='w-full flex justify-center items-center pt-4' >
              <hr className='w-280 text-gray-300' />
          </div>


          <div className='flex flex-wrap justify-start gap-10 p-4' >
            {

              noResultFound ?
                <h1>No Results Found</h1>
                :
                finalList.map(job => {
                  return  <VacancyCard key={job.id} id={job.id} title={job.title} description={job.description_summary} salary={job.salary} type={job.type} />
                })

            }
          </div>



        </div>

      </div>
    </div>
  )
}

export default Vaccancy