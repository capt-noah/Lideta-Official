import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import vacanciesData from '../data/vacancies.json'
import ArrowRight from '../assets/icons/arrow_right.svg?react'
import MailIcon from '../assets/icons/mail_icon.svg?react'
import ClockIcon from '../assets/icons/clock_icon.svg?react'
import LocationIcon from '../assets/icons/location_icon.svg?react'
import CalenderIcon from '../assets/icons/calender_icon.svg?react'
import AttachIcon from '../assets/icons/attach_icon.svg?react'
import TrashIcon from '../assets/icons/trash_icon2.svg?react'

import UploadIcon from '../assets/icons/upload_icon.svg?react'

function VacancyDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [selectedFile, setSelectedFile] = useState(null)

  // Find the current vacancy from JSON data
  const vacancy = vacanciesData.find(item => item.id === id) || vacanciesData[0]

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const handleApply = () => {
    // Handle application submission
    if (!selectedFile) {
      alert('Please attach your CV before applying')
      return
    }
    // Here you would typically send the application to an API
    alert('Application submitted successfully!')
  }

  return (
    <div className='w-full px-2 bg-white'>
      <div className='w-full py-6 absolute'>
        {/* Back Button */}
        <button
          onClick={() => navigate('/vaccancy')}
          className='bg-[#3A3A3A] left-[1%] relative flex items-center gap-2 mb-6 font-roboto font-medium text-xs lg:text-base text-white py-2 px-2 lg:px-4 rounded-full hover:bg-[#202020] active:scale-99 transition-colors cursor-pointer'
        >
          <ArrowRight className='w-4 h-4 rotate-180' />
          <span>Back to Jobs</span>
        </button>

        <div className='w-full flex flex-col gap-16 items-start lg:flex-row lg:gap-4'>
          {/* Main Content Area */}
          <div className='mx-auto w-full flex flex-col md:max-w-3xl lg:max-w-3xl xl:max-w-4xl'>
            {/* Job Title */}
            <h1 className='font-goldman font-bold text-2xl md:text-3xl lg:text-4xl mb-2'>
              {vacancy.title}
            </h1>

            {/* Category */}
            <p className='font-roboto text-lg text-gray-700 mb-4'>
              {vacancy.category}
            </p>

            {/* Metadata */}
            <div className='flex items-center gap-3 mb-8 font-roboto text-sm text-gray-700 flex-wrap'>
              <span>{vacancy.date}</span>
              <span>•</span>
              <span>{vacancy.location}</span>
            </div>

            {/* Job Description */}
            <div className='mb-8'>
              <h2 className='font-goldman font-bold text-2xl mb-4'>Job Description</h2>
              <p className='font-roboto text-base leading-relaxed text-gray-800'>
                {vacancy.description}
              </p>
            </div>

            {/* Key Responsibilities */}
            <div className='mb-8'>
              <h2 className='font-goldman font-bold text-2xl mb-4'>Key Responsibilities</h2>
              <ul className='list-disc list-inside space-y-2 font-roboto text-base text-gray-800'>
                {vacancy.responsibilities.map((responsibility, index) => (
                  <li key={index}>{responsibility}</li>
                ))}
              </ul>
            </div>

            {/* Required Qualification */}
            <div className='mb-8'>
              <h2 className='font-goldman font-bold text-2xl mb-4'>Required Qualification</h2>
              <ul className='list-disc list-inside space-y-2 font-roboto text-base text-gray-800'>
                {vacancy.qualifications.map((qualification, index) => (
                  <li key={index}>{qualification}</li>
                ))}
              </ul>
            </div>

            {/* Skills and Expertise */}
            <div className='mb-8'>
              <h2 className='font-goldman font-bold text-2xl mb-4'>Skills and Expertise</h2>
              <div className='flex flex-wrap gap-3'>
                {vacancy.skills.map((skill, index) => (
                  <span
                    key={index}
                    className='px-4 py-2 bg-[#3A3A3A] text-white rounded-full font-roboto text-sm font-medium'
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <hr className='text-gray-300 w-full lg:hidden' />

          {/* Application Sidebar */}
          <div className='flex mx-auto flex-col gap-8 lg:max-w-sm xl:max-w-100 2xl:max-w-150 2xl:gap-16'>
            <div className='bg-white border-2 border-[#D9D9D9] rounded-xl p-6 sticky top-6'>
              {/* Heading */}
              <h2 className='font-goldman font-bold text-2xl mb-2'>Apply for This Job</h2>
              <p className='font-roboto text-sm text-gray-600 mb-6'>
                Please attach your detailed CV to apply to this job post
              </p>

              {/* Job Details Summary */}
              <div className='space-y-4 mb-6'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'>
                    <MailIcon className='w-4.5 h-4.5' />
                  </div>
                  <span className='font-roboto text-sm'>{vacancy.contactEmail}</span>
                </div>
                
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'>
                    <ClockIcon className='w-5 h-5' />
                  </div>
                  <span className='font-roboto text-sm'>{vacancy.type}</span>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'>
                    <LocationIcon className='w-5 h-5 text-black' />
                  </div>
                  <span className='font-roboto text-sm'>{vacancy.location}</span>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'>
                    <CalenderIcon className='w-4.5 h-4.5' />
                  </div>
                  <span className='font-roboto text-sm'>{vacancy.date}</span>
                </div>
              </div>

              {/* CV Upload Section */}
              <div className='mb-6'>
                <h3 className='font-roboto font-bold text-base mb-3'>Attach CV here (.pdf)</h3>
                {selectedFile ? (
                  <div className='bg-[#F5F5F5] rounded-lg p-4 flex items-center justify-between border'>
                    <div className='flex items-center gap-3'>
                      <AttachIcon className='w-5 h-5' />
                      <span className='font-roboto text-sm truncate w-60'>{selectedFile.name}</span>
                    </div>
                    <button onClick={handleRemoveFile} className='cursor-pointer'>
                      <TrashIcon className='w-5 h-5 text-red-400' />
                    </button>
                  </div>
                ) : (
                  <label className='bg-white rounded-lg p-1 flex items-center justify-between cursor-pointer border'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-[#D9D9D9] rounded-md flex justify-center items-center hover:bg-[#E5E5E5] transition-colors'>
                        <AttachIcon className='w-6 h-6 text-black' />
                      </div>
                      <span className='font-roboto text-sm text-gray-600'>No File Attached</span>
                    </div>
                    <input type='file' accept='.pdf, .doc, .docx' onChange={handleFileChange} className='hidden'/>
                  </label>
                )}
              </div>

              {/* Apply Button */}
              <button onClick={handleApply} className='w-full bg-[#3A3A3A] text-white font-roboto font-bold py-3 rounded-lg hover:bg-[#2A2A2A] transition-colors'>
                Apply for this job
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VacancyDetails





