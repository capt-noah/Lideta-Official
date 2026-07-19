import BASE_URL from '../utils/api'
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../components/utils/LanguageContext'
import { useUser } from '../components/utils/UserContext'
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
import Loading from '../components/ui/Loading'

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
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submittedRef, setSubmittedRef] = useState(null)
  const [cvSizeError, setCvSizeError] = useState(false)
  const { language } = useLanguage()
  const { user } = useUser()
  const t = translatedContents.jobs_page.details

  const [notification, setNotification] = useState({isOpen: false, message: '', type: 'success'})

  // Pre-fill from logged-in user
  useEffect(() => {
    if (user) {
      setFullName(`${user.first_name || ''} ${user.last_name || ''}`.trim())
      setEmail(user.email || '')
      setPhone(user.phone || '')
    }
  }, [user])

  useEffect(() => {
    async function fetchVacancies() {
      try {
        const response = await fetch(`${BASE_URL}/api/vacancies`)
        if (response.ok) {
          const data = await response.json()
          setVacancy(data?.find(item => item.id.toString() === id))
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching vacancies:', error)
      }
    }
    fetchVacancies()
  }, [])


  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setNotification({ isOpen: true, message: 'Only PDF files are accepted', type: 'error' })
      e.target.value = ''
      return
    }
    const MAX_SIZE = 30 * 1024 * 1024 // 30 MB
    if (file.size > MAX_SIZE) {
      setCvSizeError(true)
      setSelectedFile(file)
      return
    }
    setCvSizeError(false)
    setSelectedFile(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setCvSizeError(false)
  }

  const handleApply = async (e) => {
    e.preventDefault()

    // Auth gate
    if (!user) {
      window.location.href = `/account/auth?next=/vaccancy/${id}`
      return
    }

    if (cvSizeError) {
      setNotification({ isOpen: true, message: 'Please attach a CV under 30 MB', type: 'error' })
      return
    }

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
        
        const uploadResponse = await fetch(`${BASE_URL}/api/upload-cv`, {
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
      const response = await fetch(`${BASE_URL}/api/applicants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vacancy_id: vacancy?.id || id,
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          cv_path: cvPath,
          user_id: user?.id || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit application')
      }

      const resData = await response.json()
      setSubmittedRef(resData.ref)
      setShowSuccessModal(true)
      // Reset only if not pre-filled from user account
      if (!user) {
        setFullName('')
        setEmail('')
        setPhone('')
      }
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
            <div className='relative'>

              {/* Auth overlay — shown when not logged in */}
              {!user && (
                <div className='absolute inset-0 z-10 rounded-xl overflow-hidden'>
                  <div className='absolute inset-0 backdrop-blur-sm bg-white/70 rounded-xl' />
                  <div className='absolute inset-0 flex items-center justify-center p-4'>
                    <div className='bg-white rounded-2xl shadow-xl border border-gray-200 p-7 w-full text-center'>
                      <div className='w-14 h-14 bg-[#3A3A3A] rounded-full flex items-center justify-center mx-auto mb-4'>
                        <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                        </svg>
                      </div>
                      <h3 className='font-goldman font-bold text-xl text-[#3A3A3A] mb-2'>
                        {{ en: 'Sign in to apply', am: 'ለማመልከት ይግቡ', or: 'Iyyachuuf seenaa' }[language]}
                      </h3>
                      <p className='font-roboto text-sm text-gray-500 mb-5'>
                        {{ en: 'You need an account to apply for this position and track your application status.', am: 'ለዚህ ቦታ ለማመልከት እና ሁኔታዎን ለመከታተል መለያ ያስፈልጋዎታል።', or: 'Bakka kanaaf iyyachuuf fi haala iyyata keessan hordofuuf herrega barbaachisaa dha.' }[language]}
                      </p>
                      <div className='flex flex-col gap-3'>
                        <a href={`/account/auth?next=/vaccancy/${id}`}
                          className='w-full py-2.5 bg-[#3A3A3A] text-white font-bold font-roboto rounded-full hover:bg-black transition-colors text-sm'>
                          {{ en: 'Sign In', am: 'ግባ', or: 'Seeni' }[language]}
                        </a>
                        <a href={`/account/auth?next=/vaccancy/${id}`}
                          className='w-full py-2.5 border border-gray-300 text-gray-700 font-semibold font-roboto rounded-full hover:bg-gray-50 transition-colors text-sm'>
                          {{ en: 'Create Account', am: 'መለያ ፍጠር', or: 'Herrega Uumi' }[language]}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleApply} method='POST' className='bg-white border-2 border-[#D9D9D9] rounded-xl p-6 sticky top-6'>
                {/* Heading */}
                <h2 className='font-goldman font-bold text-2xl mb-2'>{t.apply_for_job[language]}</h2>
                <p className='text-sm text-gray-600 mb-6'>{t.attach_cv[language]}</p>

                {/* Job Details Summary */}
                <div className='space-y-4 mb-6'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'><MailIcon className='w-4.5 h-4.5' /></div>
                    <span className='text-sm'>applyforthisjob@gmail.com</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'><ClockIcon className='w-5 h-5' /></div>
                    <span className='text-sm'>{vacancy.type}</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'><LocationIcon className='w-5 h-5 text-black' /></div>
                    <span className='text-sm'>{vacancy.location}</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gray-200 flex justify-center items-center rounded-full'><CalenderIcon className='w-4.5 h-4.5' /></div>
                    <span className='text-sm'>{vacancy.formatted_date}</span>
                  </div>
                </div>

                {/* Applicant Info */}
                <div className='mb-6 space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {t.full_name[language]} <span className='text-red-500'>*</span>
                    </label>
                    <input required type='text' value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder={{ en: 'Enter your full name', am: 'ሙሉ ስምዎን ያስገቡ', or: 'Maqaa guutuu kee galchi' }[language]}
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {t.email[language]} <span className='text-red-500'>*</span>
                    </label>
                    <input required type='email' value={email} onChange={e => setEmail(e.target.value)}
                      placeholder={{ en: 'Enter your email', am: 'ኢሜልዎን ያስገቡ', or: 'Imeelii kee galchi' }[language]}
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {t.phone_number[language]} <span className='text-red-500'>*</span>
                    </label>
                    <input required type='tel' value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder={{ en: 'Enter your phone number', am: 'ስልክ ቁጥርዎን ያስገቡ', or: 'Lakkoofsa bilbilaa kee galchi' }[language]}
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]' />
                  </div>
                </div>

                {/* CV Upload Section */}
                <div className='mb-6'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-bold text-base'>{t.attach_cv_label[language]} <span className='text-red-500'>*</span></h3>
                    <span className='text-xs text-gray-400'>PDF only · max 30 MB</span>
                  </div>

                  {/* Size error */}
                  {cvSizeError && (
                    <div className='mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 flex items-start gap-2'>
                      <span className='text-red-500 text-base mt-0.5'>⚠️</span>
                      <div>
                        <p className='text-xs font-semibold text-red-700'>
                          {{ en: 'File too large', am: 'ፋይሉ በጣም ትልቅ ነው', or: 'Faayilli baay\'ee guddaa dha' }[language]}
                        </p>
                        <p className='text-xs text-red-500 mt-0.5'>
                          {{ en: 'Your CV must be under 30 MB. Please use a smaller file.', am: 'ሲቪዎ ከ30 MB ያነሰ መሆን አለበት። እባክዎ ፋይሉን ያሳንሱ።', or: 'CV keessan 30 MB gadi ta\'uu qaba. Maaloo faayila xiqqaa fayyadamaa.' }[language]}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedFile && !cvSizeError ? (
                    <div className='bg-[#F5F5F5] rounded-lg p-4 flex items-center justify-between border border-green-200'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 bg-green-100 rounded-md flex items-center justify-center'>
                          <AttachIcon className='w-5 h-5 text-green-600' />
                        </div>
                        <div>
                          <span className='text-sm font-medium text-gray-700 block truncate max-w-[160px]'>{selectedFile.name}</span>
                          <span className='text-xs text-gray-400'>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>
                      <button type='button' onClick={handleRemoveFile} className='cursor-pointer p-1 rounded-full hover:bg-red-50 transition-colors'>
                        <TrashIcon className='w-5 h-5 text-red-400' />
                      </button>
                    </div>
                  ) : (
                    <label className={`bg-white rounded-lg p-1 flex items-center justify-between cursor-pointer border-2 border-dashed transition-colors ${cvSizeError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}>
                      <div className='flex items-center gap-3 p-1'>
                        <div className='w-10 h-10 bg-[#D9D9D9] rounded-md flex justify-center items-center hover:bg-[#E5E5E5] transition-colors'>
                          <AttachIcon className='w-6 h-6 text-black' />
                        </div>
                        <div>
                          <span className='text-sm text-gray-600 block'>
                            {{ en: 'Attach CV (.pdf)', am: 'ሲቪ ያያይዙ (.pdf)', or: 'CV qabsiisaa (.pdf)' }[language]}
                          </span>
                          <span className='text-xs text-gray-400'>PDF only · max 30 MB</span>
                        </div>
                      </div>
                      <input type='file' accept='.pdf' onChange={handleFileChange} className='hidden' />
                    </label>
                  )}
                </div>

                {/* Apply Button */}
                <LoadingButton type='submit' isLoading={isSubmitting}
                  className='w-full bg-[#3A3A3A] text-white font-bold py-3 rounded-lg hover:bg-[#2A2A2A]'>
                  {t.apply_for_job[language]}
                </LoadingButton>
              </form>
            </div>
          </div>
        </div>
        </div>
      }

      <Notification isOpen={notification.isOpen} message={notification.message} type={notification.type} onClose={() => setNotification({...notification, isOpen: false})}  />

      {/* ── Success modal ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center font-roboto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-goldman font-bold text-2xl text-[#3A3A3A] mb-2">
              {{ en: 'Application Submitted!', am: 'ማመልከቻ ቀርቧል!', or: 'Gaaffiin Ergame!' }[language]}
            </h3>
            <p className="text-gray-500 text-sm mb-5">
              {{ en: 'Your application has been received. Save your reference number to track its progress.', am: 'ማመልከቻዎ ደርሷል። ሂደቱን ለመከታተል የማጣቀሻ ቁጥርዎን ያስቀምጡ።', or: 'Gaaffii keessan ni argame. Lakkoofsa wabii kuusuun hordofaa.' }[language]}
            </p>

            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl px-6 py-4 mb-5">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                {{ en: 'Reference Number', am: 'የማጣቀሻ ቁጥር', or: 'Lakkoofsa Wabii' }[language]}
              </p>
              <p className="text-3xl font-goldman font-bold text-[#3A3A3A] tracking-widest">{submittedRef}</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { navigator.clipboard.writeText(submittedRef) }}
                className="px-5 py-2 border border-gray-300 text-gray-600 text-sm font-semibold rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {{ en: 'Copy', am: 'ቅዳ', or: 'Koppii' }[language]}
              </button>
              {user && (
                <a href="/account"
                  className="px-5 py-2 bg-[#3A3A3A] text-white text-sm font-semibold rounded-full hover:bg-black transition-colors"
                >
                  {{ en: 'Track Progress', am: 'ሂደቱን ይከታተሉ', or: 'Deemi Hordofi' }[language]}
                </a>
              )}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-5 py-2 bg-[#FACC14] text-[#1E1E1E] text-sm font-semibold rounded-full hover:bg-yellow-400 transition-colors cursor-pointer"
              >
                {{ en: 'Done', am: 'ተጠናቋል', or: 'Xumurami' }[language]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VacancyDetails





