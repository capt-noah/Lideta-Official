import React, { useState } from 'react'
import SideBar from '../components/ui/SideBar'
import NewsCard from '../components/ui/NewsCard'
import newsData from '../data/news.json'

import SearchIcon from '../assets/icons/search_icon.svg?react'
import DividerIcon from '../assets/icons/divider_icon.svg'
import ArrowSvg from '../assets/arrow.svg'

import SearchBox from '../components/ui/Search.jsx'

function News() {
  const news = newsData
  const [results, setResults] = useState(null)
  const [noResultFound, setNoResultFound] = useState(false)
  const [filter, setFilter] = useState('All')


  let filtered = filter.toLowerCase() === 'all' ? news : news.filter(fil => fil.category.toLowerCase() === filter.toLowerCase())
  let finalList = results !== null ? results : filtered


  const categories = [
    {title: 'All'},
    {title: 'Technology'},
    {title: 'Health'},
    {title: 'Infrastructure'},
    {title: 'Education'},
    {title: 'Event'},
    {title: 'Security'},
    {title: 'Enviroment'},
  ]

  return (
    // <div className='w-full grid grid-cols-[280px_1fr] grid-rows-[1fr]'>
    <div className='w-full flex flex-col gap-4 px-2 mt-10 lg:flex-row lg:px-4 '>

      <div className='hidden lg:flex mt-20'>
        <SideBar className=" hidden" filter={filter} setFilter={setFilter} />
      </div>



      <div className='w-full flex flex-col '>

        <div className='w-fit font-goldman font-bold text-5xl flex items-end py-4' >News</div>


        <div className='bg-[#f5f5f5] w-full py-2'>


          <div className=' flex items-center justify-between gap-4 px-4'>

            <SearchBox data={filtered} results={results} setResults={setResults} noResultFound={noResultFound} setNoResultFound={setNoResultFound} />

            <button className='flex items-center justify-between px-4 py-2 rounded-full bg-white shadow font-roboto font-medium text-md min-w-24 cursor-pointer'>
              <p>Latest</p>
              <img src={ArrowSvg} alt="" />
            </button>
          </div>

          <hr className='text-gray-300 mt-5 ' />

          <div className='w-full flex flex-wrap justify-start items-center gap-12 px-12 lg:px-2 lg:gap-4  py-4' >
            {

              noResultFound || filtered.length < 1 ?
                <div className='w-full h-100 flex flex-col gap-5 justify-center items-center text-gray-400 ' >
                  <SearchIcon className="w-20 h-20" />
                  <p className='text-xl' >No Results Found</p>
                </div>
                  
                  :
                  finalList.map(item => {
                    return  <NewsCard key={item.id} id={item.id} title={item.title} description={item.description} date={item.date} category={item.category} />
                  })
            }

          </div>



        </div>

      </div>
    </div>
  )
}

export default News