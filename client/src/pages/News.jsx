import React, { useState, useEffect } from 'react'
import SideBar from '../components/ui/SideBar'
import NewsCard from '../components/ui/NewsCard'
import Loading from '../components/ui/Loading'
import newsData from '../data/news.json'

import SearchIcon from '../assets/icons/book_icon.svg?react'
import DividerIcon from '../assets/icons/divider_icon.svg'
import ArrowSvg from '../assets/arrow.svg'

import AllIcon from '../assets/icons/all_icon.svg?react'
import ChipIcon from '../assets/icons/chip_icon.svg?react'
import Enviroment_icon from '../assets/icons/enviroment_icon.svg?react'
import CityIcon from '../assets/icons/city_icon.svg?react'
import HealthIcon from '../assets/icons/heart_pulse_icon.svg?react'
import GraduationIcon from '../assets/icons/graduation_cap_solid.svg?react'
import ShieldIcon from '../assets/icons/shield_solid_icon.svg?react'
import EventIcon from '../assets/icons/calendar_day_icon.svg?react'

import SearchBox from '../components/ui/Search.jsx'
import { useLanguage } from '../components/utils/LanguageContext'
import translatedContents from '../data/translated_contents.json'

function News() {
  const { language } = useLanguage()
  const t = translatedContents.news_page
  const [news, setNews] = useState()
  const [results, setResults] = useState(null)
  const [noResultFound, setNoResultFound] = useState(false)
  const [filter, setFilter] = useState('All')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch news from API
  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch('/api/news')
        if (response.ok) {
          const data = await response.json()
          // Format the data to match expected structure
          const formattedNews = data.map(item => ({
            id: item.id.toString(),
            title: item.title,
            description: item.short_description || item.description?.substring(0, 100) || '',
            date: item.formatted_date || item.created_at?.split('T')[0] || '',
            category: item.category,
            photo: item.photo,
            amh: item.amh,
            orm: item.orm
          }))
          console.log(formattedNews)
          setNews(formattedNews)
        }
      } catch (error) {
        console.error('Error fetching news:', error)
        // Keep using JSON data as fallback
      } finally {
        setIsLoading(false)
      }
    }
    fetchNews()
  }, [])


  let filtered = filter.toLowerCase() === 'all' ? news : news.filter(fil => fil.category.toLowerCase() === filter.toLowerCase())
  const finalList = results || filtered || []

  const categories = [
    { label: t.categories_section.filters.all[language], value: 'All', bg: '#3A3A3A', color: 'white', icon: AllIcon},
    { label: t.categories_section.filters.technology[language], value: 'Technology', bg: '#FFFFFF', color: 'black', icon: ChipIcon},
    { label: t.categories_section.filters.health[language], value: 'Health', bg: '#FFFFFF', color: 'black', icon: HealthIcon},
    { label: t.categories_section.filters.infrastructure[language], value: 'Infrastructure', bg: '#FFFFFF', color: 'black', icon: CityIcon},
    { label: t.categories_section.filters.education[language], value: 'Education', bg: '#FFFFFF', color: 'black', icon: GraduationIcon},
    { label: t.categories_section.filters.events[language], value: 'Event', bg: '#FFFFFF', color: 'black', icon: EventIcon},
    { label: t.categories_section.filters.security[language], value: 'Security', bg: '#FFFFFF', color: 'black', icon: ShieldIcon},
    { label: t.categories_section.filters.environment[language], value: 'Enviroment', bg: '#FFFFFF', color: 'black', icon: Enviroment_icon},
  ]

  return (
    <div className='w-full flex flex-col gap-4 px-2 mt-10 lg:flex-row lg:px-4 mb-20'>

      <div className='hidden lg:flex mt-20'>
        <SideBar className=" hidden" filter={filter} setFilter={setFilter} categories={categories} />
      </div>



      <div className='w-full flex flex-col '>

        <div className='w-fit font-goldman font-bold text-4xl lg:text-5xl flex items-end py-4 border-b-4 border-[#FACC14] pr-10'>{t.title[language]}</div>


        <div className='bg-[#f5f5f5] w-full h-full rounded-2xl border border-gray-200 p-3 lg:p-4'>


          <div className='flex flex-wrap items-center justify-between gap-4 px-1 lg:px-2'>

            <SearchBox data={filtered} results={results} setResults={setResults} noResultFound={noResultFound} setNoResultFound={setNoResultFound} />

            <button className='flex items-center justify-between px-4 py-2 rounded-full bg-white shadow font-roboto font-medium text-md min-w-24 cursor-pointer'>
              <p>{language === 'am' ? 'የቅርብ ጊዜ' : language === 'or' ? 'Dhihoo' : 'Latest'}</p>
              <img src={ArrowSvg} alt="" />
            </button>
          </div>

          <hr className='text-gray-300 mt-5' />

          <div className='w-full flex flex-wrap justify-center items-center gap-12 px-4 text-sm sm:justify-start sm:gap-12 md:gap-4 sm:px-2 lg:px-2 lg:gap-6 lg:flex-row xl:gap-5 xl:px-6 2xl:gap-2 2xl:px-3 py-4'>

            {

            isLoading ? (
              <Loading />
            ) :
              finalList.length === 0 ?
                <div className='w-full h-105 flex flex-col gap-5 justify-center items-center text-gray-400 ' >
                  <SearchIcon className="w-20 h-20" />
                  <p className='text-xl' >{language === 'am' ? 'ምንም ውጤት የለም' : language === 'or' ? 'Bu\'aa Hin Argamne' : 'No Results Found'}</p>
                </div>
                  
                  :
                  finalList.map(item => {
                    let title = item.title;
                    let description = item.description;
                    let category = item.category;

                    if (language === 'am' && item.amh) {
                         title = item.amh.title || title;
                         description = item.amh.short_description || item.amh.description?.substring(0, 100) || description;
                         category = item.amh.category || category;
                    } else if (language === 'or' && item.orm) {
                         title = item.orm.title || title;
                         description = item.orm.short_description || item.orm.description?.substring(0, 100) || description;
                         category = item.orm.category || category;
                    }

                    return (
                      <div key={item.id} className='w-full sm:w-[250px] md:w-[260px] lg:w-[280px] xl:w-[250px]'>
                        <NewsCard 
                          id={item.id} 
                          title={title} 
                          description={description} 
                          date={item.date} 
                          category={category}
                          photo={item.photo}
                        />
                      </div>
                    )
                  })
            }

          </div>



        </div>

      </div>
    </div>
  )
}

export default News