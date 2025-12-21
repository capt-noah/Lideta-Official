import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import vacanciesData from '../data/vacancies.json'
import { useLanguage } from '../components/utils/LanguageContext'
import translatedContents from '../data/translated_contents.json'
import ArrowRight from '../assets/icons/arrow_right.svg?react'
import MailIcon from '../assets/icons/mail_icon.svg?react'
import ClockIcon from '../assets/icons/clock_icon.svg?react'
import LocationIcon from '../assets/icons/location_icon.svg?react'
import CalenderIcon from '../assets/icons/calender_icon.svg?react'
import AttachIcon from '../assets/icons/attach_icon.svg?react'
import TrashIcon from '../assets/icons/trash_icon2.svg?react'

import UploadIcon from '../assets/icons/upload_icon.svg?react'
import Notification from '../components/ui/Notification'
import LoadingButton from '../components/ui/LoadingButton'

function VacancyDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobs, setJobs] = useState()
  const [vacancy, setVacancy] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { language } = useLanguage()
  const t = translatedContents.jobs_page.details

  const [notification, setNotification] = useState({isOpen: false, message: '', type: 'success'})

    useEffect(() => {
      async function fetchVacancies() {
        try {
          const response = await fetch('/api/vacancies')
          if (response.ok) {
            const data = await response.json()
            console.log(data)
            setVacancy(data?.find(item => item.id.toString() === id))
            setIsLoading(false)
          }
        } catch (error) {
          console.error('Error fetching news:', error)
          // Keep using JSON data as fallback
        }
      }
      fetchVacancies()
    }, [])


  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setNotification({ isOpen: true, message: 'Please Attach A CV', type:'error'})
      return
    }

    setIsSubmitting(true)

    try {
      let cvPath = null
      
      // Step 1: Upload CV if selected
      if (selectedFile) {
        const fileFormData = new FormData()
        fileFormData.append('cv', selectedFile)
        
        const uploadResponse = await fetch('/api/upload-cv', {
           method: 'POST',
           body: fileFormData
        })
        
        if (!uploadResponse.ok) {
           throw new Error('Failed to upload CV')
        }
        
        const uploadData = await uploadResponse.json()
        cvPath = uploadData.path
      }

      // Step 2: Submit Application
      const response = await fetch('/api/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vacancy_id: vacancy?.id || id,
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          cv_path: cvPath
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit application')
      }

      setNotification({isOpen: true, message: 'Application Submitted Successfully', type: 'success'})
      setFullName('')
      setEmail('')
      setPhone('')
      setSelectedFile(null)
    } catch (error) {
      console.error('Error submitting application:', error)
      alert(error.message || 'An error occurred while submitting your application')
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <div className='w-full px-2 bg-white'>

      {isLoading || !vacancy ? (
        <div className='w-full flex justify-center items-center h-screen'>
          <Loading />
        </div>
      ) :
        <div className='w-full py-6 font-jost'>
        {/* Back Button */}
        <button
          onClick={() => navigate('/vaccancy')}
          className='bg-[#3A3A3A] left-[1%] relative flex items-center gap-2 mb-6 font-medium text-xs lg:text-base text-white py-2 px-2 lg:px-4 rounded-full hover:bg-[#202020] active:scale-99 transition-colors cursor-pointer'
        >
          <ArrowRight className='w-4 h-4 rotate-180' />
          <span>{t.back_to_jobs[language]}</span>
        </button>

        <div className='w-full flex flex-col gap-16 items-start lg:flex-row lg:gap-4 '>
          {/* Main Content Area */}
          <div className='mx-auto w-full flex flex-col md:max-w-3xl lg:max-w-3xl xl:max-w-4xl'>
            {/* Job Title */}
            <h1 className='font-goldman font-bold text-2xl md:text-3xl lg:text-4xl mb-2'>
              {(() => {
                  if (language === 'am' && vacancy.amh?.title) return vacancy.amh.title
                  if (language === 'or' && vacancy.orm?.title) return vacancy.orm.title
                  return vacancy.title
              })()}
            </h1>

            {/* Category */}
            <p className=' text-lg text-gray-700 mb-4'>
              {(() => {
                  if (language === 'am' && vacancy.amh?.category) return vacancy.amh.category
                  if (language === 'or' && vacancy.orm?.category) return vacancy.orm.category
                  return vacancy.category
              })()}
            </p>

            {/* Metadata */}
            <div className='flex items-center gap-3 mb-8  text-sm text-gray-700 flex-wrap'>
              <span>{vacancy.formatted_date}</span>
              <span>•</span>
              <span>{vacancy.location}</span>
            </div>

            {/* Responsibilities, Qualifications, Skills - Translation logic if arrays exist in JSON, otherwise fallback */}
            {/* For now, assuming only title/desc/category are reliably translated. If arrays are needed, users should provide structure. */}
            
            {/* Job Description */}
            <div className='mb-8'>
              <h2 className='font-goldman font-bold text-2xl mb-4'>{t.job_description[language]}</h2>
              <p className=' text-base leading-relaxed text-gray-800 px-2'>
                {(() => {
                    if (language === 'am' && vacancy.amh?.description) return vacancy.amh.description
                    if (language === 'or' && vacancy.orm?.description) return vacancy.orm.description
                    return vacancy.description
                })()}
              </p>
            </div>

            {/* Key Responsibilities */}
            <div className='mb-8'>
              <h2 className='font-goldman font-bold text-2xl mb-4'>{t.key_responsibilities[language]}</h2>
              <ul className='list-disc space-y-2 px-6 text-base text-gray-800'>
                {(() => {
                    let items = vacancy.responsibilities
                    // Check translations. User mentioned 'responsibility' key in JSON array.
                    // We also check 'responsibilities' just in case.
                    if (language === 'am' && vacancy.amh) {
                        items = vacancy.amh.responsibility || vacancy.amh.responsibilities || items
                    } else if (language === 'or' && vacancy.orm) {
                        items = vacancy.orm.responsibility || vacancy.orm.responsibilities || items
                    }
                    
                    if (!items || !Array.isArray(items)) return null;

                    return items.map((responsibility, index) => (
                      <li key={index}>{responsibility}</li>
                    ))
                })()}
              </ul>
            </div>

            {/* Required Qualification */}
            <div className='mb-8'>
              <h2 className='font-goldman font-bold text-2xl mb-4'>{t.required_qualification[language]}</h2>
              <ul className='list-disc space-y-2 px-6 text-base text-gray-800'>
                {(() => {
                    let items = vacancy.qualifications
                     if (language === 'am' && vacancy.amh) {
                        items = vacancy.amh.qualification || vacancy.amh.qualifications || items
                    } else if (language === 'or' && vacancy.orm) {
                        items = vacancy.orm.qualification || vacancy.orm.qualifications || items
                    }

                     if (!items || !Array.isArray(items)) return null;
                     
                    return items.map((qualification, index) => (
                      <li key={index} >{qualification}</li>
                    ))
                })()}
              </ul>
            </div>

            {/* Skills and Expertise */}
            <div className='mb-8'>
              <h2 className='font-goldman font-bold text-2xl mb-4'>{t.skills_and_expertise[language]}</h2>
              <div className='flex flex-wrap gap-3'>
                {(() => {
                    let items = vacancy.skills
                     if (language === 'am' && vacancy.amh) {
                        items = vacancy.amh.skill || vacancy.amh.skills || items
                    } else if (language === 'or' && vacancy.orm) {
                        items = vacancy.orm.skill || vacancy.orm.skills || items
                    }

                    if (!items || !Array.isArray(items)) return null;

                    return items.map((skill, index) => (
                      <span key={index} className='px-4 py-2 bg-[#3A3A3A] text-white rounded-full  text-sm font-medium'>
                          {skill}
                      </span>
                    ))
                })()}
              </div>
            </div>
          </div>

          <hr className='text-gray-300 w-full lg:hidden' />

          {/* Application Sidebar */}
          <div className='flex mx-auto flex-col gap-8 lg:max-w-sm xl:max-w-100 2xl:max-w-150 2xl:gap-16'>
            <form onSubmit={handleApply} method='POST' className='bg-white border-2 border-[#D9D9D9] rounded-xl p-6 sticky top-6'>
              {/* Heading */}
              <h2 className='font-goldman font-bold text-2xl mb-2'>{t.apply_for_job[language]}</h2>
              <p className=' text-sm text-gray-600 mb-6'>
                {t.attach_cv[language]}
              </p>

              {/* Job Details Summary */}
              <div className='space-y-4 mb-6'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'>
                    <MailIcon className='w-4.5 h-4.5' />
                  </div>
                  <span className=' text-sm'>applyforthisjob@gmail.com</span>
                </div>
                
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'>
                    <ClockIcon className='w-5 h-5' />
                  </div>
                  <span className=' text-sm'>{vacancy.type}</span>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'>
                    <LocationIcon className='w-5 h-5 text-black' />
                  </div>
                  <span className=' text-sm'>{vacancy.location}</span>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'>
                    <CalenderIcon className='w-4.5 h-4.5' />
                  </div>
                  <span className=' text-sm'>{vacancy.formatted_date}</span>
                </div>
              </div>

              {/* Applicant Info */}
              <div className='mb-6 space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t.full_name[language]}
                  </label>
                    <input
                    required
                    type='text'
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder='Enter your full name'
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t.email[language]}
                  </label>
                  <input
                    required
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Enter your email'
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t.phone_number[language]}
                  </label>
                  <input
                    required
                    type='tel'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder='Enter your phone number'
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                  />
                </div>
              </div>

              {/* CV Upload Section */}
              <div className='mb-6'>
                <h3 className=' font-bold text-base mb-3'>{t.attach_cv_label[language]}</h3>
                {selectedFile ? (
                  <div className='bg-[#F5F5F5] rounded-lg p-4 flex items-center justify-between border'>
                    <div className='flex items-center gap-3'>
                      <AttachIcon className='w-5 h-5' />
                      <span className=' text-sm truncate w-60'>{selectedFile.name}</span>
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
                      <span className=' text-sm text-gray-600'>No File Attached</span>
                    </div>
                    <input type='file' accept='.pdf, .doc, .docx' onChange={handleFileChange} className='hidden'/>
                  </label>
                )}
              </div>

              {/* Apply Button */}
              <LoadingButton 
                type='submit' 
                isLoading={isSubmitting}
                className='w-full bg-[#3A3A3A] text-white font-bold py-3 rounded-lg hover:bg-[#2A2A2A]'
              >
                {t.apply_for_job[language]}
              </LoadingButton>
            </form>
          </div>
        </div>
        </div>
      }

      <Notification isOpen={notification.isOpen} message={notification.message} type={notification.type} onClose={() => setNotification({...notification, isOpen: false})}  />

    </div>
  )
}

export default VacancyDetails





