import DepCard from '../components/ui/DepCard';
import SideBar from '../components/ui/SideBar';
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
      { label: t.filters.social_services[language], value: 'Social services', bg: '#FFFFFF', color: 'black', icon: ChipIcon},
      { label: t.filters.agriculture[language], value: 'Agriculture', bg: '#FFFFFF', color: 'black', icon: ChipIcon},
      { label: t.filters.economic_development[language], value: 'Economic Development', bg: '#FFFFFF', color: 'black', icon: ChipIcon},
      { label: t.filters.environment[language], value: 'Environment', bg: '#FFFFFF', color: 'black', icon: Enviroment_icon},
      { label: t.filters.infrastructure[language], value: 'Infrastructure', bg: '#FFFFFF', color: 'black', icon: CityIcon},
      { label: t.filters.health[language], value: 'Health', bg: '#FFFFFF', color: 'black', icon: HealthIcon},
      { label: t.filters.education[language], value: 'Education', bg: '#FFFFFF', color: 'black', icon: GraduationIcon},
      { label: t.filters.legal[language], value: 'Legal', bg: '#FFFFFF', color: 'black', icon: ScaleIcon},
  ]

  // Map the translated labels back to the original values for filtering if needed, 
  // but SideBar/Filter logic usually depends on the label matching the data category.
  // However, the data categories are in English (e.g., "social services").
  // So we should verify if SideBar uses label for display and value for filtering.
  // Looking at SideBar usage in other files, it seems to use `filter` state which is compared to `dep.category`.
  // If SideBar uses the label to set the filter, we might break filtering if we translate labels but not data.
  // Let's assume SideBar needs to be updated or we pass a separate value for filtering.
  // Checking the original code: `categories` had `label` only. `setFilter` sets the label. 
  // And `filtered` logic is: `filter.toLowerCase() === 'all' ... dep.category.toLocaleLowerCase() == filter.toLowerCase()`
  // This means if we translate labels, filtering will BREAK because "ክፍሎች" != "social services".
  // PROPOSED FIX: Add `value` property to categories matching the English data keys, and update SideBar to use `value` if present, or we need to check SideBar implementation.
  // Since I cannot check SideBar implementation right now without viewing it, I will assume I should pass `value` effectively or update SideBar.
  // But wait, the previous `categories` array ONLY had `label`.
  // To avoid breaking it, I should modify `SideBar` logic in my head: if I change label to Amharic, `filter` becomes Amharic. `dep.category` is English.
  // So I MUST handle this. I will added `value` to the categories array above.
  // But `SideBar` component props: `categories`, `filter`, `setFilter`.
  // I should check `SideBar.jsx` to be sure. 
  // FOR NOW, I will use a simple workaround in `Departments.jsx`:
  // I'll keep the `categories` array structure compatibale if possible, but I suspect SideBar just iterates and renders labels and onClick sets filter to label.
  
  // Actually, I'll update the `categories` definition to include `original` or `value` and pass that to SideBar if it supports it, 
  // OR, I'll wrapping the `SideBar` to handle translation mapping?
  // No, easiest is to check SideBar. 
  
  // Let's assume SideBar is simple.
  // I will check SideBar in a separate step if I was unsure, but I need to proceed.
  // Verification: The user said "departments list... or selection doesnt work".
  
  // Let's modify `SideBar` to use `onClick={() => setFilter(cat.value || cat.label)}` ?
  // I don't want to edit SideBar if I can avoid it to keep scope small, but it seems necessary for functionality.
  // Actually, `Departments.jsx` lines 52: `<SideBar categories={categories} filter={filter} setFilter={setFilter} />`.
  
  // Let's look at `Departments.jsx` logic again:
  // `let filtered = filter.toLowerCase() === 'all'? departments : departments.filter(dep => dep.category.toLocaleLowerCase() == filter.toLowerCase() )`
  
  // If `filter` is "ክፍሎች" (Amharic for Departments? No, social services is "ማህበራዊ አገልግሎቶች"), it won't match "social services".
  // So `filter` MUST remain English "Social services", but the UI must show Amharic.
  
  // So I need to separate the *display label* from the *filter value*.
  // I will update the `categories` array to have both.
  
  // But does `SideBar` support objects with label/value?
  // Standard SideBar implementation usually maps categories. 
  // If I can't see SideBar, I should assume it uses the whole object or just the label.
  // If it uses just the label, I'm stuck.
  // I will assume I need to update SideBar too if it's not smart enough.
  // I'll check SideBar content in the next step or just blindly update it if it's simple.
  // Actually, I'll just check SideBar.jsx quickly. 
  
  // Wait, I can't check it *inside* this tool call.
  // I will assume I need to pass `name` (displayed) and `value` (for logic).
  // But the original `categories` had `label`.
  
  // Let's try to map the filter back to english before filtering.
  // Create a mapping:
  // const mapCategoryToEnglish = (val) => ...
  
  // Better: Maintain `filter` state in English (value).
  // Pass `categories` with `label` (Translated) and `value` (English).
  // If `SideBar` renders `label` and returns `label` on click, we have a problem.
  // If `SideBar` returns the `item`, we are good.
  
  // I will assume I need to check SideBar. I'll read it in the next step.
  // For now, I will write `Departments.jsx` assuming `SideBar` needs to be checked or updated.
  // Actually, I'll include `value` in the objects.
  
  return (
    <div className='w-full flex flex-col gap-4 px-2 mt-10 lg:flex-row lg:px-4'>
      <div className='hidden lg:flex mt-20'>
        <SideBar categories={categories} filter={filter} setFilter={setFilter} />
      </div>

      <div className='w-full flex flex-col'>
        <div className='w-fit font-goldman font-bold text-5xl flex items-end py-4'>{t.title[language]}</div>

        <div className='bg-[#f5f5f5] w-full py-2'>
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

          <div className='w-full flex flex-wrap justify-center items-center gap-12 px-4 text-sm lg:justify-start lg:px-5 lg:gap-6 lg:flex-row xl:gap-5 xl:px-6 2xl:gap-2 2xl:px-3 py-4'>
            {
              noResultFound || finalList.length < 1
                ? (
                  <div className='w-full h-100 flex flex-col gap-5 justify-center items-center text-gray-400'>
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
                        className="cursor-pointer hover:opacity-90 transition-opacity w-full sm:w-[calc(50%-1rem)] md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] 2xl:w-[calc(25%-1.5rem)]"
                      >
                        <DepCard 
                          title={title} 
                          description={description} 
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