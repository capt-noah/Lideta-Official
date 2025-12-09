import React from 'react'

import { Link } from 'react-router-dom'

import Navbar from '../components/shared/Navbar'
import BuildingBackground from '../assets/building_background.png'
import Subtract from '../assets/subtract.png'
import Cloud1 from '../assets/cloud_1.png'
import Cloud2 from '../assets/cloud_2.png'
import Building from '../assets/building.png'

import ArrowRight from '../assets/icons/arrow_right.svg?react'

import SheildIcon from '../assets/icons/sheild_icon.svg?react'
import BoltIcon from '../assets/icons/bolt_icon.svg?react'
import GlobeIcon from '../assets/icons/globe_icon1.svg?react'
import CompliantIcon from '../assets/icons/compliant_icon.svg?react'

import Data from '../data/news.json'



import NewsCard from '../components/ui/NewsCard'
import CutoutCard from '../components/ui/CutoutCard'

function Home() {
  
  const newsData = Data

  const latestNews = newsData.filter(news => Number(news.id) < 5)

  return (
    <div className='w-full flex flex-col gap-10' >

      <div className='w-full h-180 flex justify-center items-center' >

        <img className='w-300' src={BuildingBackground} alt="" />
        <img className='absolute top-40' src={Cloud1} alt="" />
        <img className='absolute top-20 right-30' src={Cloud2} alt="" />
        <img className='absolute w-160 top-17 right-35' src={Building} alt="" />

        <div className='absolute top-55 left-40 flex flex-col gap-7 font-goldman font-bold text-white ' >
          <h1 className='text-6xl w-130' >Welcome to Lideta Sub-City</h1>
          <p className='w-120 font-normal ' >Your trusted partner in community development and public service. We are committed to transparency, efficiency, and excellence in serving our community.</p>
        </div>

        {/* <img className='absolute bottom-33 left-30' src={Subtract} alt="" /> */}

        <div className='w-80 h-40 absolute left-30 bottom-28 flex font-goldman text-xl' >
          <img src={Subtract} alt="" />

          <Link to='/contacts' className='absolute w-40 h-10 top-5 left-15 flex items-center justify-around cursor-pointer' >
            <p>Contact Us</p>
            <ArrowRight />
          </Link>

          <button className='absolute w-55 h-10 bottom-5 left-15 flex justify-around items-center cursor-pointer' >
            <p>Explore Services</p>
            <ArrowRight />
          </button>
        </div>

      </div>

      <div className='w-full h-110 bg-[#F7F7F7] flex flex-col items-center gap-10 py-5 ' >

        <div className='flex flex-col items-center gap-2 font-goldman font-bold ' >
            <h1 className='text-4xl' >Latest News</h1>
            <p className='font-normal' >Recent updates and announcements from Lideta Sub-City</p>
        </div>



        <div className='w-full flex justify-center items-center gap-10' >
          
          {
            latestNews.map(news => {
             return <NewsCard key={news.id} id={news.id} title={news.title} description={news.description} date={news.date} category={news.category} />
            })
          }
          
        </div>

      </div>

      <div className='w-full h-110 bg-[#F7F7F7] flex flex-col items-center gap-10 py-5 mt-20 '>
          <div className='flex flex-col items-center gap-2 font-goldman font-bold ' >
              <h1 className='text-3xl' >Additional Services</h1>
              <p className='font-normal' >Access our comprehensive range of government services</p>
          </div>
        
        <div className='flex gap-15' >
          <Link to='/news' > <CutoutCard title={'News & Updates'} description={'Stay informed with the latest news, announcements, and updates from Lideta Sub-City government'} /></Link> 
          <Link to='/vaccancy' > <CutoutCard title={'Job Opportunities'} description={'Explore career opportunities and join our growing team of dedicated public servants.'} /> </Link>
          <Link to='/events' > <CutoutCard title={'Events'} description={'Participate in community events and forums organized and managed by Lideta Sub-City.'} /> </Link>
        </div>

      </div>


      <div className='w-full h-110 bg-[#F7F7F7] flex flex-col items-center gap-10 py-5 mt-20 '>
          <div className='flex flex-col items-center gap-2 font-goldman font-bold ' >
              <h1 className='text-3xl' >Our Commitment</h1>
              <p className='font-normal' >We are committed to transparent governance, fast service delivery, and innovative development.</p>
        </div>
        
        <div className='flex gap-15' >

          <div className='w-80 h-70  flex flex-col justify-center items-center gap-3' >

            <div className=' w-15 h-15 bg-amber-100 flex justify-center items-center' >
              <SheildIcon className='text-[#FACC14]' />
            </div>
            
            <p className='font-bold text-xl' >Transparency</p>
            <p className='font-light text-md flex text-center w-70' >We maintain open and accountable operations so residents clearly understand how services are delivered and how decisions are made.</p>
            
          </div>

          <div className='w-80 h-70  flex flex-col justify-center items-center gap-3' >

            <div className=' w-15 h-15 bg-amber-100 flex justify-center items-center' >
              <BoltIcon />
            </div>
            
            <p className='font-bold text-xl' >Efficient Service</p>
            <p className='font-light text-md flex text-center w-70' >We provide fast, reliable, and streamlined services designed to save time and make every process easier for the community.</p>
            
          </div>

          <div className='w-80 h-70  flex flex-col justify-center items-center gap-3' >

            <div className=' w-15 h-15 bg-amber-100 flex justify-center items-center' >
              <GlobeIcon />
            </div>
            
            <p className='font-bold text-xl' >Innovation</p>
            <p className='font-light text-md flex text-center w-70' >We adopt modern tools and digital solutions to improve service delivery and create smarter, more accessible public services.</p>
            
          </div>
        </div>
      </div>

      <div className='w-full mt-20 flex justify-center mb-100' >

        <div className='w-220 h-90 bg-[linear-gradient(180deg,_#484848_0%,_#3A3A3A_50%,_#1E1E1E_100%)] rounded-2xl flex flex-col items-center justify-around py-5' >

          <CompliantIcon />

          <h1 className='font-bold text-4xl text-white' >Have a Compliant?</h1>
          <p className='w-150 font-sm font-light text-white text-center' >We take your feedback seriously. Submit your complaint or suggestion through our secure online system.</p>
          <Link to='/compliants' className='w-50 h-12 border border-white rounded-xl font-bold text-white flex justify-center items-center gap-4 cursor-pointer ' >
            <p>File a Compliant</p>
            <ArrowRight className="text-white" />
          </Link>
        </div>

      </div>

    </div>
  )
}

export default Home