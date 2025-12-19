import React from 'react'

import { Link } from 'react-router-dom'
import { useLanguage } from '../components/utils/LanguageContext'
import translatedContents from '../data/translated_contents.json'

import BuildingBackground from '../assets/building_background.png'
import Subtract from '../assets/subtract.png'
import Cloud1 from '../assets/cloud_1.png'
import Cloud2 from '../assets/cloud_2.png'

import ArrowRight from '../assets/icons/arrow_right.svg?react'

import SheildIcon from '../assets/icons/sheild_icon.svg?react'
import BoltIcon from '../assets/icons/bolt_icon.svg?react'
import GlobeIcon from '../assets/icons/globe_icon1.svg?react'
import CompliantIcon from '../assets/icons/compliant_icon.svg?react'
import LidetaBuilding from '../assets/icons/lideta_building.svg'

import BackgroundNocut from '../assets/icons/background_nocut.svg'

import Data from '../data/news.json'



import NewsCard from '../components/ui/NewsCard'
import CutoutCard from '../components/ui/CutoutCard'

function HomePage() {
  const { language } = useLanguage()
  const t = translatedContents
  const newsData = Data

  const latestNews = newsData.filter(news => Number(news.id) < 5)

  return (
    <div className='w-full flex flex-col gap-16'>

      {/* Hero */}
      <div className='relative w-full overflow-hidden px-4 pt-10 '>
        
        <div className='relative max-w-6xl mx-auto flex flex-col gap-10 '>
          
          <div className='relative w-full flex justify-center sm:p-[2.5%] '>
            <img className='w-full hidden sm:block object-contain drop-shadow-xl' src={BuildingBackground} alt="" />
            
            <div className=' w-full sm:hidden flex justify-center items-center relative z-10 ' >
              <img className='w-full object-contain drop-shadow-xl' src={BackgroundNocut} alt="" />
              <div className='w-1/2 absolute' >
                <img src={LidetaBuilding} className=' w-full mx-auto ' />
              </div>
             
            </div>

            <img className='absolute top-[10%] right-[30%] w-[20%] h-[25%] md:w-[25%] md:h-[30%] md:right-[30%] md:top-[10%] lg:w-[30%] lg:h-[35%] opacity-90' src={Cloud1} alt="" />
            <img className='absolute top-[0%] right-[5%] w-[25%] h-[40%] md:w-[25%] md:h-[40%] md:right-[0%] md:top-[0%] lg:w-[40%] lg:h-[50%] opacity-90' src={Cloud2} alt="" />
            
            <div className='w-full h-full hidden  sm:flex justify-end absolute bottom-0 ' > 
              <div className='w-1/2' >
                <img src={LidetaBuilding} className=' w-full h-full relative right-0 ' />
              </div>
              
            </div>

            <div className='absolute hidden top-10 left-5 z-10 w-1/2 sm:flex flex-col gap-4 font-goldman text-white max-w-2xl md:max-w-3xl px-2 md:px-6 lg:px-12 lg:py-4'>
              <h1 className='text-2xl leading-tight sm:text-md md:text-3xl lg:text-5xl drop-shadow-md'>{t.landing.welcome_section.title[language]}</h1>
              <p className='text-xs md:text-sm lg:text-[1rem] font-normal drop-shadow'>{t.landing.welcome_section.description[language]}</p>
            </div>
            
            <div className='absolute hidden w-[27%] bottom-[6%] left-[2.5%] md:bottom-[5%] sm:flex flex-col sm:flex-row sm:items-center sm:gap-4 px-2'>
              <img className=' w-full ' src={Subtract} alt="" />

              <div className='absolute inset-0 flex flex-col items-start px-[15%] text-xs md:text-sm lg:text-lg lg:gap-6 lg:py-4 '>
                <Link to='/contacts' className=' h-11 flex items-center gap-2 text-black rounded-lg font-goldman cursor-pointer'>
                  <p>{t.landing.contact_cta[language]}</p>
                  <ArrowRight />
                </Link>

                <Link to='/departments' className='ml-2 h-11 flex items-center justify-center gap-2 rounded-lg font-goldman cursor-pointer'>
                  <p>{t.landing.departments_cta[language]}</p>
                  <ArrowRight />
                </Link>

              </div>
            </div>

          </div>

            <div className=' w-full flex flex-col gap-4 font-goldman max-w-2xl text-center sm:hidden md:max-w-3xl px-2 md:px-6'>
              <h1 className='text-3xl font-bold '>{t.landing.welcome_section.title[language]}</h1>
              <p className='text-xs font-normal '>{t.landing.welcome_section.description[language]}</p>
            </div>
            
            <div className=' flex flex-col px-2 sm:hidden '>

              <div className=' flex flex-col items-start mx-auto gap-6 text-xs '>
                <Link to='/contacts' className=' h-11 flex items-center gap-4 bg-white text-black rounded-lg shadow-md shadow-gray-300 px-4 font-goldman cursor-pointer'>
                  <p>{t.landing.contact_cta[language]}</p>
                  <ArrowRight />
                </Link>

                <Link to='/departments' className='ml-2 h-11 bg-[#3A3A3A] text-white px-4 flex items-center shadow-md shadow-gray-300 justify-center gap-4 rounded-lg font-goldman cursor-pointer'>
                  <p>{t.landing.departments_cta[language]}</p>
                  <ArrowRight />
                </Link>

              </div>
            </div>




        </div>
      </div>

      {/* Latest News */}
      <div className='w-full bg-[#F7F7F7] flex flex-col items-center gap-8 py-10 px-4 md:px-6 lg:px-12'>

        <div className='flex flex-col items-center gap-2 font-goldman font-bold text-center'>
          <h1 className='text-3xl md:text-4xl'>{t.latest_news.title[language]}</h1>
          <p className='font-normal text-sm md:text-base text-gray-600'>{t.latest_news.subtitle[language]}</p>
        </div>

        <div className='w-full max-w-3xl flex flex-wrap justify-center items-center gap-6 lg:gap-4 lg:flex-nowrap xl:gap-8 '>
          {
            latestNews.map(news => (
              <div key={news.id} className='w-full sm:w-[320px] md:w-[360px] lg:w-[380px]'>
                <NewsCard id={news.id} title={news.title} description={news.description} date={news.date} category={news.category} />
              </div>
            ))
          }
        </div>

      </div>

      {/* Additional Services */}
      <div className='w-full bg-[#F7F7F7] flex flex-col items-center gap-8 py-10 px-4 md:px-6 lg:px-12'>

        <div className='flex flex-col items-center gap-2 font-goldman font-bold text-center'>
          <h1 className='text-2xl md:text-3xl'>{t.additional_services.title[language]}</h1>
          <p className='font-normal text-sm md:text-base text-gray-600'>{t.additional_services.description[language]}</p>
        </div>

        <div className='w-full flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:justify-center lg:gap-10'>
          <Link to='/news' className='flex justify-center w-full sm:w-auto'>
            <CutoutCard title={t.additional_services.services.news_updates.title[language]} description={t.additional_services.services.news_updates.description[language]} />
          </Link>
          <Link to='/vaccancy' className='flex justify-center w-full sm:w-auto'>
            <CutoutCard title={t.additional_services.services.job_opportunities.title[language]} description={t.additional_services.services.job_opportunities.description[language]} />
          </Link>
          <Link to='/events' className='flex justify-center w-full sm:w-auto'>
            <CutoutCard title={t.additional_services.services.events.title[language]} description={t.additional_services.services.events.description[language]} />
          </Link>
        </div>
      </div>

      {/* Commitment */}
      <div className='w-full bg-[#F7F7F7] flex flex-col items-center gap-8 py-10 px-4 md:px-6 lg:px-12'>
        <div className='flex flex-col items-center gap-2 font-goldman font-bold text-center'>
          <h1 className='text-2xl md:text-3xl'>{t.our_commitment.title[language]}</h1>
          <p className='font-normal text-sm md:text-base text-gray-600'>{t.our_commitment.description[language]}</p>
        </div>
        
        <div className='w-full flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:justify-center lg:gap-10 lg:max-w-6xl '>

          <div className='w-full max-w-xs h-full mx-auto rounded-xl flex flex-col justify-center items-center gap-3 px-6 py-8 '>

            <div className='w-15 h-15 bg-amber-100 flex justify-center items-center rounded-md'>
              <SheildIcon className='text-[#FACC14]' />
            </div>
            
            <p className='font-bold text-xl text-center'>{t.commitment_cards.transparency.title[language]}</p>
            <p className='font-light text-sm md:text-base text-center text-gray-700'>{t.commitment_cards.transparency.description[language]}</p>
            
          </div>

          <div className='w-full max-w-xs h-full mx-auto  rounded-xl flex flex-col justify-center items-center gap-3 px-6 py-8 '>

            <div className='w-15 h-15 bg-amber-100 flex justify-center items-center rounded-md'>
              <BoltIcon />
            </div>
            
            <p className='font-bold text-xl text-center'>{t.commitment_cards.efficient_service.title[language]}</p>
            <p className='font-light text-sm md:text-base text-center text-gray-700'>{t.commitment_cards.efficient_service.description[language]}</p>
            
          </div>

          <div className='w-full max-w-xs h-full mx-auto rounded-xl flex flex-col justify-center items-center gap-3 px-6 py-8 '>

            <div className='w-15 h-15 bg-amber-100 flex justify-center items-center rounded-md'>
              <GlobeIcon />
            </div>
            
            <p className='font-bold text-xl text-center'>{t.commitment_cards.innovation.title[language]}</p>
            <p className='font-light text-sm md:text-base text-center text-gray-700'>{t.commitment_cards.innovation.description[language]}</p>
            
          </div>
        </div>
      </div>

      {/* Complaint CTA */}
      <div className='w-full px-4 md:px-6 lg:px-12 pb-24'>

        <div className='w-full max-w-5xl mx-auto bg-[linear-gradient(180deg,_#484848_0%,_#3A3A3A_50%,_#1E1E1E_100%)] rounded-2xl flex flex-col items-center justify-around py-10 px-6 md:px-10 gap-6 shadow-lg'>

          <CompliantIcon className="w-16 h-16 md:w-20 md:h-20" />

          <h1 className='font-bold text-3xl md:text-4xl text-white text-center'>{t.complaints_section.title[language]}</h1>
          <p className='w-full md:w-3/4 font-light text-sm md:text-base text-white text-center'>{t.complaints_section.description[language]}</p>
          <Link to='/compliants' className='w-full sm:w-56 h-12 border border-white rounded-xl font-bold text-white flex justify-center items-center gap-3 cursor-pointer ' >
            <p>{t.complaints_section.cta_button[language]}</p>
            <ArrowRight className="text-white" />
          </Link>
        </div>

      </div>

    </div>
  )
}

export default HomePage