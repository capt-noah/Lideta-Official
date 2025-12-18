import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import departmentsData from '../data/departments.json';
import ArrowRight from '../assets/icons/arrow_right.svg?react';
import MailIcon from '../assets/icons/mail_icon.svg?react';
import ClockIcon from '../assets/icons/clock_icon.svg?react';
import LocationIcon from '../assets/icons/location_icon.svg?react';
import PhoneIcon from '../assets/icons/mail_icon.svg?react';
import WebsiteIcon from '../assets/icons/globe_icon.svg?react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '../components/utils/LanguageContext';

function DepartmentDetails() {
  const { language } = useLanguage();
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        <div className='w-full py-6 absolute font-jost'>
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className='bg-[#3A3A3A] left-[1%] relative flex items-center gap-2 mb-6 font-medium text-xs lg:text-base text-white py-2 px-2 lg:px-4 rounded-full hover:bg-[#202020] active:scale-99 transition-colors cursor-pointer'
          >
            <ArrowRight className='w-4 h-4 rotate-180' />
            <span>Back to Departments</span>
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
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <svg className="w-32 h-32 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="mt-4">
                  <p className="text-lg font-medium text-gray-700">Department Head</p>
                  <p className="text-gray-600">{department?.leader?.[language] || 'Not specified'}</p>
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
                <h2 className='font-goldman font-bold text-2xl mb-4'>About Us</h2>
                <p className='text-base leading-relaxed text-gray-800 px-2'>
                  {department.mission?.[language]}
                </p>
              </div>

              {/* Vision */}
              <div className='mb-8'>
                <h2 className='font-goldman font-bold text-2xl mb-4'>Our Vision</h2>
                <p className='text-base leading-relaxed text-gray-800 px-2'>
                  {department?.vision?.[language] || 'No vision statement available.'}
                </p>
              </div>

              {/* Services */}
              <div className='mb-8'>
                <h2 className='font-goldman font-bold text-2xl mb-4'>Our Services</h2>
                <ul className='list-disc space-y-2 px-6 text-base text-gray-800'>
                  {department?.services?.[language]?.length > 0 ? (
                    department.services[language].map((service, index) => (
                      <li key={index}>{service}</li>
                    ))
                  ) : (
                    <li>No services listed</li>
                  )}
                </ul>
              </div>

              {/* Core Values */}
              <div className='mb-8'>
                <h2 className='font-goldman font-bold text-2xl mb-4'>Core Values</h2>
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
                    <span className='text-gray-600'>No values specified</span>
                  )}
                </div>
              </div>
            </div>

            <hr className='text-gray-300 w-full lg:hidden' />

            {/* Contact Information Sidebar */}
            <div className='flex mx-auto flex-col gap-8 lg:max-w-sm xl:max-w-100 2xl:max-w-150 2xl:gap-16'>
              <div className='bg-white border-2 border-[#D9D9D9] rounded-xl p-6 sticky top-6'>
                {/* Heading */}
                <h2 className='font-goldman font-bold text-2xl mb-2'>Contact Information</h2>
                <p className='text-sm text-gray-600 mb-6'>
                  Get in touch with us for more information
                </p>

                {/* Department Details */}
                <div className='space-y-4 mb-6'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'>
                      <LocationIcon className='w-5 h-5 text-black' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-700'>Location</p>
                      <p className='text-sm text-gray-600'>{department?.contacts?.location || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'>
                      <MailIcon className='w-4.5 h-4.5' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-700'>Email</p>
                      {(department?.contacts?.email) ? (
                        <a 
                          href={`mailto:${department.contacts.email}`}
                          className='text-sm text-blue-600 hover:underline'
                        >
                          {department.contacts.email}
                        </a>
                      ) : (
                        <p className='text-sm text-gray-600'>Not specified</p>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'>
                      <PhoneIcon className='w-5 h-5' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-700'>Phone</p>
                      {(department?.contacts?.phone) ? (
                        <a 
                          href={`tel:${department.contacts.phone}`}
                          className='text-sm text-blue-600 hover:underline'
                        >
                          {department.contacts.phone}
                        </a>
                      ) : (
                        <p className='text-sm text-gray-600'>Not specified</p>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'>
                      <ClockIcon className='w-5 h-5' />
                    </div>
                  </div>
                </div>

                {/* Visit Website Button */}
                {(department?.contacts?.website) && (
                  <a
                    href={department.contacts.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-full bg-[#3A3A3A] text-white font-bold py-3 rounded-lg hover:bg-[#2A2A2A] transition-colors flex items-center justify-center gap-2'
                  >
                    <WebsiteIcon className='w-6 h-6 text-white' />
                    Visit Our Website
                  </a>
                )}

                {/* Social Media Links */}
                <div className='mt-6'>
                  <h3 className='font-bold text-base mb-3'>Connect With Us</h3>
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
