import DepCard from '../components/ui/DepCard';
import SideBar from '../components/ui/SideBar';
import { getDepartmentLogo } from '../components/utils/departmentAssets';
import { useNavigate } from 'react-router-dom';
import departmentsData from '../data/departments.json';
import ArrowSvg from '../assets/arrow.svg?react';
import SearchIcon from '../assets/icons/search_icon.svg?react';
import SearchBox from '../components/ui/Search.jsx';

import AllIcon from '../assets/icons/all_icon.svg?react'
import ChipIcon from '../assets/icons/chip_icon.svg?react'
import Enviroment_icon from '../assets/icons/enviroment_icon.svg?react'
import CityIcon from '../assets/icons/city_icon.svg?react'
import HealthIcon from '../assets/icons/heart_pulse_icon.svg?react'
import GraduationIcon from '../assets/icons/graduation_cap_solid.svg?react'
import ScaleIcon from '../assets/icons/scale_icon.svg?react'
import BarleyIcon from '../assets/icons/barley_icon.svg?react'
import SocialServicesIcon from '../assets/icons/social_service_icon.svg?react'
import GrowthIcon from '../assets/icons/economic_growth_icon.svg?react'
import { useState } from 'react';
import { useLanguage } from '../components/utils/LanguageContext';
import translatedContents from '../data/translated_contents.json';

function Departments() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const departments = departmentsData.departments;
  const t = translatedContents.departments;

  const [results, setResults] = useState(null);
  const [noResultFound, setNoResultFound] = useState(false);
  const [filter, setFilter] = useState('All')

  let filtered = filter.toLowerCase() === 'all'? departments : departments.filter(dep => dep.category.toLocaleLowerCase() == filter.toLowerCase() )
  const finalList = results !== null ? results : filtered;

  console.log(filtered)

  const handleDepartmentClick = (departmentId) => {
    navigate(`/departments/${departmentId}`);
  };

  const categories = [
      { label: t.filters.all[language], value: 'All', bg: '#3A3A3A', color: 'white', icon: AllIcon},
      { label: t.filters.social_services[language], value: 'Social services', bg: '#FFFFFF', color: 'black', icon: SocialServicesIcon},
      { label: t.filters.agriculture[language], value: 'Agriculture', bg: '#FFFFFF', color: 'black', icon: BarleyIcon},
      { label: t.filters.economic_development[language], value: 'Economic Development', bg: '#FFFFFF', color: 'black', icon: GrowthIcon},
      { label: t.filters.environment[language], value: 'Environment', bg: '#FFFFFF', color: 'black', icon: Enviroment_icon},
      { label: t.filters.infrastructure[language], value: 'Infrastructure', bg: '#FFFFFF', color: 'black', icon: CityIcon},
      { label: t.filters.health[language], value: 'Health', bg: '#FFFFFF', color: 'black', icon: HealthIcon},
      { label: t.filters.education[language], value: 'Education', bg: '#FFFFFF', color: 'black', icon: GraduationIcon},
      { label: t.filters.legal[language], value: 'Legal', bg: '#FFFFFF', color: 'black', icon: ScaleIcon},
  ]

  return (
    <div className='w-full flex flex-col gap-4 px-2 mt-10 lg:flex-row lg:px-4'>
      <div className='hidden lg:flex mt-20'>
        <SideBar categories={categories} filter={filter} setFilter={setFilter} />
      </div>

      <div className='w-full flex flex-col'>
        <div className='w-fit font-goldman font-bold text-3xl md:text-5xl flex items-end py-4 border-b-4 border-[#FACC14] pr-10 mb-4 lg:mb-0'>{t.title[language]}</div>
        
        {/* Mobile Filters */}
        <div className='flex lg:hidden overflow-x-auto gap-3 pb-4 mb-4 scrollbar-hide'>
            {categories.map((cat, index) => (
                <button 
                  key={index} 
                  onClick={() => setFilter(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap border transition-all ${filter === cat.value ? 'bg-[#3A3A3A] text-white border-[#3A3A3A]' : 'bg-white text-gray-700 border-gray-200'}`}
                >
                   {/* Icon logic can be simplified or omitted for mobile chips if too cluttered, but keeping for consistency if desired */}
                   <span>{cat.label}</span>
                </button>
            ))}
        </div>

        <div className='bg-[#f5f5f5] w-full py-2 mb-10'>
          <div className='w-full flex items-center justify-between gap-4 px-4'>
            <SearchBox
              data={departments}
              results={results}
              setResults={setResults}
              noResultFound={noResultFound}
              setNoResultFound={setNoResultFound}
            />

            <button className='flex items-center justify-between px-4 py-2 rounded-full bg-white shadow font-roboto font-medium text-md min-w-24 cursor-pointer'>
              <p>{language === 'am' ? 'የቅርብ ጊዜ' : language === 'or' ? 'Dhihoo' : 'Latest'}</p>
              <ArrowSvg />
            </button>
          </div>

          <hr className='text-gray-300 mt-5' />

          <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 px-4 py-4'>
            {
              noResultFound || finalList.length < 1
                ? (
                  <div className='w-full h-100 flex flex-col gap-5 justify-center items-center text-gray-400 col-span-full'>
                    <SearchIcon className="w-20 h-20" />
                    <p className='text-xl'>{language === 'am' ? 'ምንም ውጤት የለም' : language === 'or' ? 'Bu\'aa Hin Argamne' : 'No Results Found'}</p>
                  </div>
                )
                : finalList.map(dep => {
                    // Handle multilingual structure
                    // The data is now expected to have 'or' keys after my fix.
                    const title = typeof dep.title === 'object' ? dep.title[language] : (dep.name[language] || 'Department');
                    const description = dep.shortDescription?.[language] || 
                                     (typeof dep.mission === 'object' ? dep.mission[language] : 
                                     (dep.description?.[language] || 'No description available'));
                    
                    return (
                      <div 
                        key={dep.id} 
                        onClick={() => handleDepartmentClick(dep.id)}
                        className="cursor-pointer hover:opacity-90 transition-opacity w-full"
                      >
                        <DepCard 
                          title={title} 
                          description={description} 
                          logo={getDepartmentLogo(dep.id)}
                        />
                      </div>
                    );
                  })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Departments