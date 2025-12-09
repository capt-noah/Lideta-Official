import React, { useState } from 'react'
import SideBar from '../components/ui/SideBar'
import VacancyCard from '../components/ui/VacancyCard'
import vacanciesData from '../data/vacancies.json'

import SearchIcon from '../assets/icons/search_icon.svg?react'
import DividerIcon from '../assets/icons/divider_icon.svg'
import ArrowSvg from '../assets/arrow.svg'

import SearchBox from '../components/ui/Search.jsx'

function Vaccancy() {
  const jobs = vacanciesData
  const [results, setResults] = useState(null)
  const [noResultFound, setNoResultFound] = useState(false)
  const [filter, setFilter] = useState('All')

  const filtered = filter.toLowerCase() === 'all'
    ? jobs
    : jobs.filter(job => job.category.toLowerCase() === filter.toLowerCase())
  const finalList = results !== null ? results : filtered

  return (
    <div className='w-full flex flex-col gap-4 px-2 mt-10 lg:flex-row lg:px-4'>
      <div className='hidden lg:flex mt-20'>
        <SideBar className="hidden" filter={filter} setFilter={setFilter} />
      </div>

      <div className='w-full flex flex-col'>
        <div className='w-fit font-goldman font-bold text-5xl flex items-end py-4'>Jobs</div>

        <div className='bg-[#f5f5f5] w-full py-2'>
          <div className='flex items-center justify-between gap-4 px-4'>
            <SearchBox
              data={filtered}
              results={results}
              setResults={setResults}
              noResultFound={noResultFound}
              setNoResultFound={setNoResultFound}
            />

            <button className='flex items-center justify-between px-4 py-2 rounded-full bg-white shadow font-roboto font-medium text-md min-w-24 cursor-pointer'>
              <p>Latest</p>
              <img src={ArrowSvg} alt="" />
            </button>
          </div>

          <hr className='text-gray-300 mt-5' />

          <div className='w-full flex flex-wrap justify-start items-center gap-12 px-12 md:flex-col lg:px-2 lg:gap-4 lg:flex-row xl:gap-6 xl:px-6 py-4'>
            {
              noResultFound || filtered.length < 1
                ? (
                  <div className='w-full h-100 flex flex-col gap-5 justify-center items-center text-gray-400'>
                    <SearchIcon className="w-20 h-20" />
                    <p className='text-xl'>No Results Found</p>
                  </div>
                )
                : finalList.map(job => (
                  <VacancyCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    description={job.description_summary}
                    salary={job.salary}
                    type={job.type}
                  />
                ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Vaccancy