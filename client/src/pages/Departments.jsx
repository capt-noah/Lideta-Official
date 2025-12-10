import DepCard from '../components/ui/DepCard'
import SideBar from '../components/ui/SideBar'

import departmentsData from '../data/departments.json'

import ArrowSvg from '../assets/arrow.svg?react'
import SearchIcon from '../assets/icons/search_icon.svg?react'

import SearchBox from '../components/ui/Search.jsx'
import { useState } from 'react'

function Departments() {
  const departments = departmentsData

  const [results, setResults] = useState(null)
  const [noResultFound, setNoResultFound] = useState(false)

  const finalList = results !== null ? results : departments

  return (
    <div className='w-full flex flex-col gap-4 px-2 mt-10 lg:flex-row lg:px-4'>
      <div className='hidden lg:flex mt-20'>
        <SideBar className="hidden" />
      </div>

      <div className='w-full flex flex-col'>
        <div className='w-fit font-goldman font-bold text-5xl flex items-end py-4'>Departments</div>

        <div className='bg-[#f5f5f5] w-full py-2'>
          <div className='w-full flex items-center justify-between gap-4 px-4'>
            <SearchBox
              data={departments}
              results={results}
              setResults={setResults}
              noResultFound={noResultFound}
              setNoResultFound={setNoResultFound}
            />

            <button className='flex items-center justify-between px-4 py-2 rounded-full bg-white shadow font-roboto font-medium text-md min-w-24 cursor-pointer'>
              <p>Latest</p>
              <ArrowSvg />
            </button>
          </div>

          <hr className='text-gray-300 mt-5' />

          <div className='w-full flex flex-wrap justify-center items-center gap-12 px-4 text-sm lg:justify-start lg:px-5 lg:gap-6 lg:flex-row xl:gap-5 xl:px-6 2xl:gap-2 2xl:px-3 py-4'>
            {
              noResultFound || finalList.length < 1
                ? (
                  <div className='w-full h-100 flex flex-col gap-5 justify-center items-center text-gray-400'>
                    <SearchIcon className="w-20 h-20" />
                    <p className='text-xl'>No Results Found</p>
                  </div>
                )
                : finalList.map(dep => (
                  <DepCard key={dep.title} title={dep.title} description={dep.description} />
                ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Departments