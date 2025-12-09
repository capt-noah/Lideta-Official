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
    <div className='w-full h-screen grid grid-cols-[280px_1fr] grid-rows-[1fr]'>

      <div className=' grid grid-rows-[100px_1fr]'>

        <div></div>

        <div className='flex justify-center'>
          <SideBar filter={filter} setFilter={setFilter} />
        </div>

      </div>


      <div className='grid grid-rows-[100px_1fr] '>

        <div className='font-goldman font-bold text-5xl flex items-end py-4' >News</div>


        <div className='bg-[#f5f5f5] py-4'>

          <div className='flex items-center justify-between gap-4 px-4'>

            <SearchBox data={filtered} results={results} setResults={setResults} noResultFound={noResultFound} setNoResultFound={setNoResultFound} />

            <button className='flex items-center justify-between px-4 py-2 rounded-full bg-white shadow font-roboto font-medium text-md min-w-[120px] cursor-pointer'>
              <p>Latest</p>
              <img src={ArrowSvg} alt="" />
            </button>
          </div>

          <div className='w-full flex justify-center items-center pt-4' >
              <hr className='w-280 text-gray-300' />
          </div>


          <div className='flex flex-wrap justify-start gap-12 p-4' >
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