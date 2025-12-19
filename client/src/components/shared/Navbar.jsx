import React, { useEffect, useState } from 'react'
import LidetaLogo from '../../assets/LidetaLogo.svg?react'
import ArrowSvg from '../../assets/arrow.svg'
import UkFlag from '../../assets/uk_flag.png'
import AmFlag from '../../assets/am_flag.jpeg'
import OrFlag from '../../assets/or_flag.jpeg'
import BarsIcon from '../../assets/icons/bars_icon.svg?react'
import { useLanguage } from '../utils/LanguageContext'
import translatedContents from '../../data/translated_contents.json'


import { useLocation, Link } from 'react-router-dom'



function Navbar() {

  const { pathname } = useLocation()
  const { language, changeLanguage } = useLanguage()
  const [isLangOpen, setIsLangOpen] = useState(false)


  const t = translatedContents.navbar

  const navs = [
    {name: t.home[language], to: '/'},
    {name: t.departments[language], to: '/departments' },
    {name: t.about_us[language], to: '/about_us'},
    {name: t.contacts[language], to: '/contacts'},
    {name: t.complaints[language], to: '/compliants'},
    {name: t.events[language], to: '/events'},
    {name: t.news[language], to: '/news'},
    {name: t.vacancy[language], to: '/vaccancy'},
  ]

  const [menu, setMenu] = useState(true)


  return (
    <div className='relative z-50 w-full bg-white/60 backdrop-blur-3xl flex justify-between items-start md:items-center p-6 ' >
          <LidetaLogo />
          
          <div className='hidden font-jost font-medium text-xs gap-2 md:flex md:justify-between md:text-xs md:gap-4 lg:gap-4 lg:text-sm xl:text-lg xl:gap-10 ' >
        
            {
              navs.map((nav, index) => {
                return <Link to={nav.to} className={`cursor-pointer hover:scale-103 transition-all ${nav.to == pathname? 'bg-[#3A3A3A] text-white px-4 rounded-full' : ''} `} key={index} >{nav.name}</Link>
              })
            }
          </div>
        {
        menu && (
          <div className=' h-100 px-10 flex flex-col font-jost font-medium text-lg gap-4 md:hidden ' >
            {
              navs.map((nav, index) => {
                return <Link to={nav.to} className={`cursor-pointer flex justify-center hover:scale-103 transition-all `} key={index} onClick={() => setMenu(false)}  >{nav.name}</Link>
              })
            }
          </div>
          )
            

        }

     
      
      

      <div className='w-40 h-full flex justify-center items-center gap-5' >
        
        <BarsIcon className={`w-5 h-5 cursor-pointer md:hidden ${menu? '-rotate-90' : 'rotate-0'} transition-all `} onClick={() => setMenu(!menu)} />
        

        <div className='relative'>
          <div 
            className='w-30 h-8 px-1 flex items-center justify-around rounded-full border font-roboto font-normal cursor-pointer hover:bg-gray-50' 
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            <img src={language === 'en' ? UkFlag : language === 'am' ? AmFlag : OrFlag} alt="" className="w-6 h-4 object-cover rounded-sm" />
            <p className="capitalize text-sm">{language === 'en' ? 'English' : language === 'am' ? 'Amharic' : 'Oromiffa'}</p>
            <img src={ArrowSvg} alt="" className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
          </div>

          {isLangOpen && (
             <div className='absolute top-10 right-0 w-32 bg-white rounded-lg shadow-lg border py-2 z-50 flex flex-col'>
               <div 
                 className='flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer'
                 onClick={() => { changeLanguage('en'); setIsLangOpen(false); }}
               >
                 <img src={UkFlag} alt="English" className="w-5 h-3 object-cover" />
                 <span className="text-sm">English</span>
               </div>
               <div 
                 className='flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer'
                 onClick={() => { changeLanguage('am'); setIsLangOpen(false); }}
               >
                 <img src={AmFlag} alt="Amharic" className="w-5 h-3 object-cover" />
                 <span className="text-sm">Amharic</span>
               </div>
               <div 
                 className='flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer'
                 onClick={() => { changeLanguage('or'); setIsLangOpen(false); }}
               >
                 <img src={OrFlag} alt="Oromiffa" className="w-5 h-3 object-cover" />
                 <span className="text-sm">Oromiffa</span>
               </div>
             </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Navbar