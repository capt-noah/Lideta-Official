import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import departmentsData from '../data/departments.json';
import translatedContents from '../data/translated_contents.json';
import ArrowRight from '../assets/icons/arrow_right.svg?react';
import MailIcon from '../assets/icons/mail_icon.svg?react';
import ClockIcon from '../assets/icons/clock_icon.svg?react';
import LocationIcon from '../assets/icons/location_icon.svg?react';
import PhoneIcon from '../assets/icons/mail_icon.svg?react';
import WebsiteIcon from '../assets/icons/globe_icon.svg?react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Loading from '../components/ui/Loading';
import { useLanguage } from '../components/utils/LanguageContext';
import { getDepartmentHead } from '../components/utils/departmentAssets';

function DepartmentDetails() {
  const { language } = useLanguage();
  const t = translatedContents.departments.details;
  const navigate = useNavigate();
  const { id } = useParams();
  const [department, setDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        // Find the department by ID from the URL
        const data = departmentsData.departments.find(dept => dept.id === id);
        if (data) {
          setDepartment(data);
        } else {
          console.error('Department not found');
        }
      } catch (error) {
        console.error('Error fetching department:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartment();
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Department not found</h2>
        <button
          onClick={() => navigate('/departments')}
          className="px-6 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#2A2A2A] transition-colors flex items-center"
        >
          <ArrowRight className="w-5 h-5 mr-2 transform rotate-180" />
          Back to Departments
        </button>
      </div>
    );
  }

  return (
    <div className='w-full px-2 bg-white'>
      {!department ?
        'Loading...'
        :
        <div className='w-full py-6 font-jost'>
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className='bg-[#3A3A3A] left-[1%] relative flex items-center gap-2 mb-6 font-medium text-xs lg:text-base text-white py-2 px-2 lg:px-4 rounded-full hover:bg-[#202020] active:scale-99 transition-colors cursor-pointer'
          >
            <ArrowRight className='w-4 h-4 rotate-180' />
            <span>{t.back_button[language]}</span>
          </button>

          <div className='w-full flex flex-col gap-16 items-start lg:flex-row lg:gap-4'>
            {/* Main Content Area */}
            <div className='mx-auto w-full flex flex-col md:max-w-3xl lg:max-w-3xl xl:max-w-4xl'>
              {/* Department Title */}
              <h1 className='font-goldman font-bold text-2xl md:text-3xl lg:text-4xl mb-2'>
                {department?.title?.[language] || 'Department Title'}
              </h1>
              <p className='text-lg text-gray-600 mb-2'>{department?.name?.[language] || ''}</p>
              {/* Department Leader */}
              <div className="w-full mb-6">
                <div className="relative w-full h-120 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {getDepartmentHead(department.id) ? (
                     <img 
                       src={getDepartmentHead(department.id)} 
                       alt={`Head of ${department?.title?.[language] || 'Department'}`} 
                       className="w-full h-full object-cover object-top"
                     />
                  ) : (
                    <svg className="w-32 h-32 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-lg font-medium text-gray-700">{t.department_head[language]}</p>
                  <p className="text-gray-600">{department?.leader?.[language] || t.not_specified[language]}</p>
                </div>
              </div>

              {/* Mission */}
              <p className='text-lg text-gray-700 mb-4'>
                {department?.mission?.[language] || 'No mission statement available.'}
              </p>

              {/* Metadata */}
              <div className='flex items-center gap-3 mb-8 text-sm text-gray-700 flex-wrap'>
                <span>{department.contacts.location}</span>
              </div>

              {/* About Department */}
              <div className='mb-8'>
                <h2 className='font-goldman font-bold text-2xl mb-4'>{t.sections.about[language]}</h2>
                <p className='text-base leading-relaxed text-gray-800 px-2'>
                  {department.mission?.[language]}
                </p>
              </div>

              {/* Vision */}
              <div className='mb-8'>
                <h2 className='font-goldman font-bold text-2xl mb-4'>{t.sections.vision[language]}</h2>
                <p className='text-base leading-relaxed text-gray-800 px-2'>
                  {department?.vision?.[language] || t.not_specified[language]}
                </p>
              </div>

              {/* Services */}
              <div className='mb-8'>
                <h2 className='font-goldman font-bold text-2xl mb-4'>{t.sections.services[language]}</h2>
                <ul className='list-disc space-y-2 px-6 text-base text-gray-800'>
                  {department?.services?.[language]?.length > 0 ? (
                    department.services[language].map((service, index) => (
                      <li key={index}>{service}</li>
                    ))
                  ) : (
                    <li>{t.sections.no_services[language]}</li>
                  )}
                </ul>
              </div>

              {/* Core Values */}
              <div className='mb-8'>
                <h2 className='font-goldman font-bold text-2xl mb-4'>{t.sections.values[language]}</h2>
                <div className='flex flex-wrap gap-3'>
                  {department?.values?.[language]?.length > 0 ? (
                    department.values[language].map((value, index) => (
                      <span
                        key={index}
                        className='px-4 py-2 bg-[#3A3A3A] text-white rounded-full text-sm font-medium'
                      >
                        {value}
                      </span>
                    ))
                  ) : (
                    <span className='text-gray-600'>{t.sections.no_values[language]}</span>
                  )}
                </div>
              </div>
            </div>

            <hr className='text-gray-300 w-full lg:hidden' />

            {/* Contact Information Sidebar */}
            <div className='flex mx-auto flex-col gap-8 lg:max-w-sm xl:max-w-100 2xl:max-w-150 2xl:gap-16'>
              <div className='bg-white shadow-xl shadow-gray-200/60 border border-gray-100 rounded-2xl p-8 sticky top-6 hover:shadow-2xl transition-shadow duration-300'>
                {/* Heading */}
                <h2 className='font-goldman font-bold text-2xl mb-2 text-gray-800'>{t.contact_info.title[language]}</h2>
                <p className='text-sm text-gray-500 mb-8 font-light'>
                  {t.contact_info.subtitle[language]}
                </p>

                {/* Department Details */}
                <div className='flex flex-col gap-6'>
                  <div className='flex items-start gap-4 group'>
                    <div className='w-12 h-12 bg-amber-50 group-hover:bg-amber-100 flex justify-center items-center rounded-xl transition-colors duration-300 shrink-0'>
                      <LocationIcon className='w-6 h-6 text-amber-500' />
                    </div>
                    <div>
                      <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>{t.contact_info.location[language]}</p>
                      <p className='text-base text-gray-700 font-medium leading-tight'>{department?.contacts?.location || t.not_specified[language]}</p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4 group'>
                    <div className='w-12 h-12 bg-blue-50 group-hover:bg-blue-100 flex justify-center items-center rounded-xl transition-colors duration-300 shrink-0'>
                      <MailIcon className='w-5 h-5 text-blue-500' />
                    </div>
                    <div>
                      <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>{t.contact_info.email[language]}</p>
                      {(department?.contacts?.email) ? (
                        <a 
                          href={`mailto:${department.contacts.email}`}
                          className='text-base text-blue-600 hover:text-blue-700 font-medium transition-colors'
                        >
                          {department.contacts.email}
                        </a>
                      ) : (
                        <p className='text-base text-gray-700 font-medium'>{t.not_specified[language]}</p>
                      )}
                    </div>
                  </div>

                  <div className='flex items-start gap-4 group'>
                    <div className='w-12 h-12 bg-green-50 group-hover:bg-green-100 flex justify-center items-center rounded-xl transition-colors duration-300 shrink-0'>
                      <PhoneIcon className='w-6 h-6 text-green-500' />
                    </div>
                    <div>
                      <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>{t.contact_info.phone[language]}</p>
                      {(department?.contacts?.phone) ? (
                        <a 
                          href={`tel:${department.contacts.phone}`}
                          className='text-base text-gray-700 hover:text-gray-900 font-medium transition-colors'
                        >
                          {department.contacts.phone}
                        </a>
                      ) : (
                        <p className='text-base text-gray-700 font-medium'>{t.not_specified[language]}</p>
                      )}
                    </div>
                  </div>

                  <div className='flex items-start gap-4 group'>
                    <div className='w-12 h-12 bg-purple-50 group-hover:bg-purple-100 flex justify-center items-center rounded-xl transition-colors duration-300 shrink-0'>
                      <ClockIcon className='w-6 h-6 text-purple-500' />
                    </div>
                    <div>
                      <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>
                        {t.contact_info.office_hours[language]}
                      </p>
                      <p className='text-base text-gray-700 font-medium leading-tight'>
                        {department?.contacts?.office_hours || t.not_specified[language]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Website Button */}
                {(department?.contacts?.website) && (
                  <a 
                    href={department.contacts.website.startsWith('http') ? department.contacts.website : `https://${department.contacts.website}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-8 w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold py-4 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 group'
                  >
                    <WebsiteIcon className='w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform' />
                    <span>{t.contact_info.visit_website[language]}</span>
                    <ArrowRight className='w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all' />
                  </a>
                )}

                {/* Video Guide Section */}
                {(department?.contacts?.video_guide) && (
                  <div className='mt-8 pt-6 border-t border-gray-100'>
                    <h3 className='font-goldman font-bold text-lg mb-4 text-gray-800 flex items-center gap-2'>
                       <span className='w-2 h-6 bg-red-500 rounded-full'></span>
                       {t.video_guide.title[language]}
                    </h3>
                    <div className='w-full aspect-video rounded-xl overflow-hidden shadow-md border border-gray-200 group relative'>
                       <iframe
                        className='w-full h-full'
                        src={department.contacts.video_guide}
                        title="Website Guide"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                       ></iframe>
                    </div>
                    <p className='mt-3 text-xs text-center text-gray-500 font-medium'>
                      {t.video_guide.watch_guide[language]}
                    </p>
                  </div>
                )}

                {/* Social Media Links */}
                <div className='mt-6'>
                  <h3 className='font-bold text-base mb-3'>{t.social_media.title[language]}</h3>
                  <div className='flex gap-4'>
                    <a 
                      href='#' 
                      className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors'
                      aria-label='Facebook'
                    >
                      <Facebook className='w-5 h-5' />
                    </a>
                    <a 
                      href='#' 
                      className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors'
                      aria-label='Twitter'
                    >
                      <Twitter className='w-5 h-5' />
                    </a>
                    <a 
                      href='#' 
                      className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors'
                      aria-label='Instagram'
                    >
                      <Instagram className='w-5 h-5' />
                    </a>
                    <a 
                      href='#' 
                      className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors'
                      aria-label='LinkedIn'
                    >
                      <Linkedin className='w-5 h-5' />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

export default DepartmentDetails;
