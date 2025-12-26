import React, { useState, useEffect } from 'react'
import SideBar from '../components/ui/SideBar'
import VacancyCard from '../components/ui/VacancyCard'
import Loading from '../components/ui/Loading'
// import vacanciesData from '../data/vacancies.json'

import SearchIcon from '../assets/icons/search_icon.svg?react'
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

function Vaccancy() {
  const { language } = useLanguage()
  const t = translatedContents.jobs_page
  const [jobs, setJobs] = useState()
  const [results, setResults] = useState(null)
  const [noResultFound, setNoResultFound] = useState(false)
  const [filter, setFilter] = useState('All')
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    async function fetchVacancies() {
      try {
        const response = await fetch('/api/vacancies')
        if (response.ok) {
          const data = await response.json()
          // Format the data to match expected structure
          const formattedVacancies = data.map(item => ({
            id: item.id.toString(),
            title: item.title,
            description: item.short_description || item.description?.substring(0, 100) || '',
            date: item.formatted_date || item.created_at?.split('T')[0] || '',
            category: item.category,
            type: item.type,
            salary: item.salary,
            amh: item.amh,
            orm: item.orm
          }))
          console.log(data)
          setJobs(formattedVacancies)
        }
      } catch (error) {
        console.error('Error fetching news:', error)
        // Keep using JSON data as fallback
      } finally {
        setIsLoading(false)
      }
    }
    fetchVacancies()
  }, [])


  const filtered = filter.toLowerCase() === 'all'
    ? jobs
    : jobs.filter(job => job.category.toLowerCase() === filter.toLowerCase())
  const finalList = results || filtered || []

  const categories = [
    { label: t.categories_section.filters.all[language], value: 'All', bg: '#3A3A3A', color: 'white', icon: AllIcon},
    { label: t.categories_section.filters.technology[language], value: 'Technology', bg: '#FFFFFF', color: 'black', icon: ChipIcon},
    { label: t.categories_section.filters.health[language], value: 'Health', bg: '#FFFFFF', color: 'black', icon: HealthIcon},
    { label: t.categories_section.filters.infrastructure[language], value: 'Infrastructure', bg: '#FFFFFF', color: 'black', icon: CityIcon},
    { label: t.categories_section.filters.education[language], value: 'Education', bg: '#FFFFFF', color: 'black', icon: GraduationIcon},
    { label: t.categories_section.filters.events[language], value: 'Event', bg: '#FFFFFF', color: 'black', icon: EventIcon},
    { label: t.categories_section.filters.security[language], value: 'Security', bg: '#FFFFFF', color: 'black', icon: ShieldIcon},
    { label: t.categories_section.filters.environment[language], value: 'Environment', bg: '#FFFFFF', color: 'black', icon: Enviroment_icon}, 
  ]

  return (
    <div className='w-full flex flex-col gap-4 px-2 mt-10 lg:flex-row lg:px-4 mb-20'>
      <div className='hidden lg:flex mt-20'>
        <SideBar className="hidden" filter={filter} setFilter={setFilter} categories={categories} />
      </div>

      <div className='w-full flex flex-col'>
        <div className='w-fit font-goldman font-bold text-5xl flex items-end py-4 border-b-4 border-[#FACC14] pr-10'>{t.title[language]}</div>

        <div className='bg-[#f5f5f5] w-full h-full rounded-2xl border border-gray-200 py-2 '>
          <div className='flex items-center justify-between gap-4 px-4'>
            <SearchBox
              data={filtered}
              results={results}
              setResults={setResults}
              noResultFound={noResultFound}
              setNoResultFound={setNoResultFound}
            />

            <button className='flex items-center justify-between px-4 py-2 rounded-full bg-white shadow font-roboto font-medium text-md min-w-24 cursor-pointer'>
              <p>{language === 'am' ? 'የቅርብ ጊዜ' : language === 'or' ? 'Dhihoo' : 'Latest'}</p>
              <img src={ArrowSvg} alt="" />
            </button>
          </div>

          <hr className='text-gray-300 mt-5' />

          <div className='w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4 md:px-6 py-4'>
            {
              isLoading ? (
                <div className="col-span-full flex justify-center items-center h-64">
                  <Loading />
                </div>
              ) :
              finalList.length === 0
                ? (
                  <div className='w-full h-105 flex flex-col gap-5 justify-center items-center text-gray-400 col-span-full'>
                    <SearchIcon className="w-20 h-20" />
                    <p className='text-xl'>{language === 'am' ? 'ምንም ውጤት የለም' : language === 'or' ? 'Bu\'aa Hin Argamne' : 'No Results Found'}</p>
                  </div>
                )
                : finalList?.map(job => {
                    let title = job.title
                    let description = job.description
                    // let category = job.category // Preserving category for filtering, but if Card needs it, we might translate. Card doesn't seem to take category.

                    if (language === 'am' && job.amh) {
                         title = job.amh.title || title
                         description = job.amh.short_description || job.amh.description?.substring(0, 100) || description
                    } else if (language === 'or' && job.orm) {
                         title = job.orm.title || title
                         description = job.orm.short_description || job.orm.description?.substring(0, 100) || description
                    }

                  return (
                  <VacancyCard
                    key={job.id}
                    id={job.id}
                    title={title}
                    description={description}
                    salary={job.salary}
                    type={job.type}
                  />
                )})
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Vaccancy