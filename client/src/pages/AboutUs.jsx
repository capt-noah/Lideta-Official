import React from 'react'
import { useLanguage } from '../components/utils/LanguageContext'
import translatedContents from '../data/translated_contents.json'
import { Link } from 'react-router-dom'
import ArrowRight from '../assets/icons/arrow_right.svg?react'
import SheildIcon from '../assets/icons/sheild_icon.svg?react'
import BoltIcon from '../assets/icons/bolt_icon.svg?react'
import GlobeIcon from '../assets/icons/globe_icon1.svg?react' // Using existing icons for Mission/Vision/Values for now
import CompliantIcon from '../assets/icons/compliant_icon.svg?react'
import LidetaImage from '../assets/lideta_building_front.jpeg'

// Placeholder images - using gradients or existing assets if specific ones aren't available yet to keep it clean
import BuildingBackground from '../assets/building_background.png'
import CeoImage from '../assets/ceo.jpg'
import AboutUsHero from '../assets/about_us_hero.jpg'

function AboutUs() {
  const { language } = useLanguage()
  const t = translatedContents.about_page

  return (
    <div className='w-full flex flex-col gap-16 bg-white'>
      
      {/* Hero Section */}
      <div className='relative w-full h-[40vh] md:h-[50vh] overflow-hidden flex justify-center items-center'>
        
        {/* Background Image */}
        <div className='absolute inset-0 z-0'>
            <img src={AboutUsHero} alt="Lideta Subcity Night View" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className='relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col gap-4'>
            <h1 className='text-white font-goldman font-bold text-3xl md:text-5xl lg:text-6xl drop-shadow-lg'>
                {t.title[language]}
            </h1>
            <p className='text-gray-200 font-roboto text-base md:text-xl lg:text-2xl font-light max-w-2xl mx-auto'>
                {t.subtitle[language]}
            </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className='w-full px-4 md:px-6 lg:px-12 flex flex-col gap-16 pb-16'>

        {/* Introduction */}
        <div className='max-w-4xl mx-auto text-center relative py-8 px-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm'>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-[#FACC14] rounded-full"></div>
            <p className='font-roboto text-gray-700 leading-relaxed text-lg lg:text-xl italic'>
                 "{t.intro[language]}"
            </p>
        </div>

        {/* CEO Message Section */}
        <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center'>
            <div className='order-1 w-full h-[400px] md:h-[500px] bg-gray-100 rounded-2xl overflow-hidden shadow-xl relative group'>
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 transition-opacity duration-300 opacity-80 group-hover:opacity-60"></div>
                 <img 
                    src={CeoImage} 
                    alt="CEO" 
                    className='w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105' 
                 />
                 <div className="absolute bottom-6 left-6 z-20 text-white">
                    <p className="font-goldman font-bold text-xl md:text-2xl drop-shadow-md">{t.ceo_section.name[language]}</p>
                    <div className="h-1 w-12 bg-[#FACC14] my-2 rounded-full"></div>
                    <p className="font-roboto text-sm md:text-base font-light text-gray-200">{t.ceo_section.title[language]}</p>
                 </div>
            </div>
            <div className='order-2 flex flex-col gap-6 justify-center'>
                <h2 className='font-goldman font-bold text-3xl md:text-4xl text-[#3A3A3A] relative inline-block'>
                    Leadership
                    <span className='absolute bottom-0 left-0 w-12 h-1.5 bg-[#FACC14] rounded-full'></span>
                </h2>
                <div className="flex flex-col gap-4">
                    <p className='font-roboto text-gray-700 leading-relaxed text-lg text-justify'>
                        "Our administration is dedicated to serving the community with transparency, efficiency, and unwavering commitment. We believe in building a future where every resident of Lideta Sub-City thrives."
                    </p>
                    <p className='font-roboto text-gray-700 leading-relaxed text-lg text-justify'>
                        Under the guidance of our leadership, we continue to implement innovative solutions to urban challenges, ensuring sustainable development and improved quality of life for all.
                    </p>
                </div>
                <div className="pt-4">
                     <Link to="/contacts" className="text-[#FACC14] font-bold font-goldman hover:text-amber-600 transition-colors flex items-center gap-2">
                        Contact Office <ArrowRight className="w-4 h-4" />
                     </Link>
                </div>
            </div>
        </div>

        {/* History Section */}
        <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center'>
            <div className='order-2 md:order-1 flex flex-col gap-6'>
                <h2 className='font-goldman font-bold text-3xl md:text-4xl text-[#3A3A3A] relative inline-block'>
                    {t.sections.history.title[language]}
                    <span className='absolute bottom-0 left-0 w-1/3 h-1 bg-[#FACC14] rounded-full'></span>
                </h2>
                <p className='font-roboto text-gray-700 leading-relaxed text-lg text-justify'>
                    {t.sections.history.content[language]}
                </p>
            </div>
            <div className='order-1 md:order-2 w-full h-64 md:h-96 bg-gray-200 rounded-2xl overflow-hidden shadow-xl'>
                 {/* Placeholder for a history image */}
                 <img src={LidetaImage} className='w-full h-full object-cover hover:scale-105 transition-transform duration-500' />
            </div>
        </div>

        {/* Administrative Role Section */}
        <div className='w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12'>
             <div className='max-w-4xl mx-auto flex flex-col gap-6 text-center'>
                <h2 className='font-goldman font-bold text-3xl md:text-4xl text-[#3A3A3A]'>
                    {t.admin_role.title[language]}
                </h2>
                 <p className='font-roboto text-gray-700 leading-relaxed text-lg lg:text-xl'>
                    {t.admin_role.content[language]}
                </p>
             </div>
        </div>

        {/* Mission, Vision & Values Cards */}
        <div className='w-full bg-[#F7F7F7] rounded-3xl p-8 md:p-12'>
            <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                
                {/* Mission */}
                <div className='bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center gap-6 border-t-4 border-[#FACC14] h-full'>
                    <div className='w-16 h-16 bg-amber-50 rounded-full flex justify-center items-center'>
                        <BoltIcon className='text-[#FACC14] w-8 h-8' /> 
                    </div>
                    <h3 className='font-goldman font-bold text-2xl text-[#1E1E1E]'>{t.sections.mission.title[language]}</h3>
                    <p className='font-roboto text-gray-600 leading-relaxed'>
                        {t.sections.mission.content[language]}
                    </p>
                </div>

                {/* Vision */}
                <div className='bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center gap-6 border-t-4 border-[#3A3A3A] h-full'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex justify-center items-center'>
                        <GlobeIcon className='text-[#3A3A3A] w-8 h-8' />
                    </div>
                    <h3 className='font-goldman font-bold text-2xl text-[#1E1E1E]'>{t.sections.vision.title[language]}</h3>
                    <p className='font-roboto text-gray-600 leading-relaxed'>
                        {t.sections.vision.content[language]}
                    </p>
                </div>

                {/* Values */}
                <div className='bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center gap-6 border-t-4 border-[#FACC14] h-full'>
                    <div className='w-16 h-16 bg-amber-50 rounded-full flex justify-center items-center'>
                        <SheildIcon className='text-[#FACC14] w-8 h-8' />
                    </div>
                    <h3 className='font-goldman font-bold text-2xl text-[#1E1E1E]'>{t.sections.values.title[language]}</h3>
                    <div className='flex flex-wrap justify-center gap-2'>
                        {Object.entries(t.sections.values.items).map(([key, value]) => (
                            <span key={key} className='px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 border border-gray-200'>
                                {value[language]}
                            </span>
                        ))}
                    </div>
                </div>

            </div>
        </div>



      </div>
    
    </div>
  ) 
}

export default AboutUs