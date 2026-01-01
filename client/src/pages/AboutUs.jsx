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

        {/* Discover Lideta Video Section */}
        <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl flex flex-col items-center gap-8 py-16 px-4 md:px-8 lg:px-12 relative overflow-hidden shadow-2xl">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-8">
            {/* Section Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium uppercase tracking-wider backdrop-blur-sm">
                <span>{language === 'am' ? 'ቪዲዮ' : language === 'or' ? 'Viidiyoo' : 'Video'}</span>
              </div>
              <h2 className="font-goldman font-bold text-3xl md:text-4xl lg:text-5xl text-white">
                {language === 'am' ? 'ልደታ ክ/ከተማን ያውቁ' : language === 'or' ? 'Magaalaa Lidetaa Beekaa' : 'Discover Lideta Sub-City'}
              </h2>
              <p className="text-gray-300 text-base md:text-lg max-w-2xl font-light">
                {language === 'am' 
                  ? 'የልደታ ክ/ከተማን ታሪክ፣ እሴቶች እና የማህበረሰብ አገልግሎት ቁርጠኝነት ይመልከቱ' 
                  : language === 'or' 
                  ? 'Seenaa, gatii fi kutannoo tajaajila hawaasaa Magaalaa Lidetaa ilaalaa'
                  : 'Watch our story, values, and commitment to community service'}
              </p>
            </div>

            {/* Video Container */}
            <div className="w-full max-w-4xl group">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
                {/* YouTube Embed */}
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/XtaFwC_RGzY?si=v_YhuhRN1kDgAkRc"
                  title="Lideta Sub-City Introduction"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
                
                {/* Decorative Corner Accents */}
                <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-amber-500 opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-amber-500 opacity-50 pointer-events-none"></div>
              </div>

              {/* Open in YouTube Button */}
              <div className="mt-6 flex justify-center">
                <a
                  href="https://youtu.be/XtaFwC_RGzY?si=v_YhuhRN1kDgAkRc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center gap-3 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-xl font-goldman font-medium shadow-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>{language === 'am' ? 'በ YouTube ላይ ይመልከቱ' : language === 'or' ? 'YouTube irratti ilaalaa' : 'Watch on YouTube'}</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>
        </div>



      </div>
    
    </div>
  ) 
}

export default AboutUs