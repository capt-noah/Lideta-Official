import React, { useState, useEffect } from 'react'

import ArrowSvg from '../assets/arrow.svg?react'
import Upload from '../components/ui/Upload'
import ConfirmationDialog from '../components/ui/ConfirmationDialog'
import Notification from '../components/ui/Notification'
import { useLanguage } from '../components/utils/LanguageContext'
import translatedContents from '../data/translated_contents.json'

function Compliants() {
  const { language } = useLanguage()
  const t = translatedContents.complaints_page
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phoneCode: '+251',
    phone: '',
    type: '',
    status: 'assigning',
    description: '',
    concerned_staff_member: '',
    photo: null
  })
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState({ isOpen: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})
  const [complaintTypes, setComplaintTypes] = useState([])

  // Fetch complaint types from database
  useEffect(() => {
    async function fetchComplaintTypes() {
      try {
        const response = await fetch('/api/complaint-types')
        if (response.ok) {
          const types = await response.json()
          setComplaintTypes(types)
        }
      } catch (error) {
        console.error('Error fetching complaint types:', error)
        // Use default types if fetch fails
        setComplaintTypes([
          'sanitation',
          'water supply',
          'road condition',
          'construction',
          'customer service',
          'finance',
          'public health',
          'maintenance',
          'service delivery'
        ])
      }
    }
    fetchComplaintTypes()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9\s-]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.type) {
      newErrors.type = 'Please select a complaint type'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Complaint description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      setShowConfirmDialog(true)
    }
  }

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true)
    setShowConfirmDialog(false)

    try {
      // Combine phone code and phone number
      const fullPhone = `${formData.phoneCode} ${formData.phone}`

      // Format photo as JSON array
      let photoData = []
      if (formData.photo) {
        if (Array.isArray(formData.photo)) {
          photoData = formData.photo
        } else if (typeof formData.photo === 'object' && formData.photo.name) {
          // Single photo object with name and path
          photoData = [formData.photo]
        }
      }

      const submitData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: fullPhone,
        type: formData.type,
        status: 'assigning',
        description: formData.description.trim(),
        concerned_staff_member: formData.concerned_staff_member.trim() || null,
        photo: photoData
      }

      const response = await fetch('/admin/create/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ formData: submitData })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit complaint. Please try again.')
      }

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phoneCode: '+251',
        phone: '',
        type: '',
        status: 'assigning',
        description: '',
        concerned_staff_member: '',
        photo: null
      })
      setErrors({})

      setNotification({ 
        isOpen: true, 
        message: 'Complaint submitted successfully! We will review your complaint and get back to you soon.', 
        type: 'success' 
      })
    } catch (error) {
      console.error('Error submitting complaint:', error)
      setNotification({ 
        isOpen: true, 
        message: error.message || 'An error occurred while submitting your complaint. Please try again.', 
        type: 'error' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='w-full h-fit mb-20 bg-white'>
      <div className='max-w-7xl mx-auto'>
        <div className='mx-auto grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16 2xl:gap-20'>

          <div className='flex flex-col w-full mx-auto px-16 py-8 text-center lg:text-start mt-10'>

            <h1 className='font-goldman font-bold text-5xl mb-6 border-b-[6px] border-[#FACC14] pb-2 w-fit'> {t.title[language]} </h1>
            
            <p className='font-roboto font-bold text-lg text-gray-400 mb-6 '>{t.description[language]}</p>
            
            <p className='font-roboto font-bold text-base mb-8'>{t.contact_methods.title[language]}</p>

            <div className='space-y-4 font-roboto'>

              <div>
                <p className='text-gray-700'>{t.contact_methods.email.label[language]}: </p>
                <p className='font-bold text-gray-900'>{t.contact_methods.email.value[language]}</p>
              </div>

              <div>
                <p className='text-gray-700'>{t.contact_methods.phone.label[language]}: </p>
                <p className='font-bold text-gray-900'>{t.contact_methods.phone.value[language]}</p>
              </div>

            </div>

          </div>

          {/* Right Form Section */}
          <div className='bg-white w-full min-w-sm max-w-lg xl:max-w-2xl mx-auto rounded-xl shadow-lg p-4 border mt-10 mb-0 border-gray-200 lg:mb-4'>
            <h2 className='font-goldman font-bold text-3xl mb-6'>{t.complaint_form.title[language]}</h2>
            
            <form onSubmit={handleFormSubmit} className='space-y-6'>
              {/* First Name and Last Name - Two Columns */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block font-roboto font-medium text-sm mb-1  text-gray-700'>{t.complaint_form.fields.first_name.label[language]}</label>
                  <input 
                    type='text' 
                    name='first_name' 
                    value={formData.first_name} 
                    onChange={handleChange} 
                    placeholder={t.complaint_form.fields.first_name.placeholder[language]} 
                    className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 ${
                      errors.first_name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                    }`}
                  />
                  {errors.first_name && (
                    <p className='text-red-500 text-xs mt-1'>{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'> {t.complaint_form.fields.last_name.label[language]} </label>
                  <input 
                    type='text' 
                    name='last_name' 
                    value={formData.last_name} 
                    onChange={handleChange} 
                    placeholder={t.complaint_form.fields.last_name.placeholder[language]} 
                    className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 ${
                      errors.last_name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                    }`}
                  />
                  {errors.last_name && (
                    <p className='text-red-500 text-xs mt-1'>{errors.last_name}</p>
                  )}
                </div>
              </div>


              <div className=' grid-cols-2 grid gap-4' >
                {/* Email */}
                <div className='w-full' >
                  <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.complaint_form.fields.email.label[language]}</label>
                  <input 
                    type='email' 
                    name='email' 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder={t.complaint_form.fields.email.placeholder[language]} 
                    className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 ${
                      errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                    }`}
                  />
                  {errors.email && (
                    <p className='text-red-500 text-xs mt-1'>{errors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className='w-full' >
                  <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'> {t.complaint_form.fields.phone_number.label[language]} </label>
                  <div className='flex gap-2'>
                    <select 
                      name='phoneCode' 
                      value={formData.phoneCode} 
                      onChange={handleChange} 
                      className='px-3 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white'
                    >
                      <option value='+251'>{t.complaint_form.fields.phone_number.country_code[language]}</option>
                      <option value='+1'>🇺🇸 +1</option>
                      <option value='+44'>🇬🇧 +44</option>
                    </select>

                    <input 
                      type='tel' 
                      name='phone' 
                      value={formData.phone} 
                      onChange={handleChange} 
                      placeholder={t.complaint_form.fields.phone_number.placeholder[language]} 
                      className={`flex-1 px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 ${
                        errors.phone ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className='text-red-500 text-xs mt-1'>{errors.phone}</p>
                  )}
                </div>
              </div>


              {/* Complaint Text Area */}
              <div>
                <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>
                  {t.complaint_form.fields.complaint.label[language]}
                </label>
                <textarea
                  name='description'
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t.complaint_form.fields.complaint.placeholder[language]}
                  rows={5}
                  className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 resize-none ${
                    errors.description ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                  }`}
                />
                {errors.description && (
                  <p className='text-red-500 text-xs mt-1'>{errors.description}</p>
                )}
                {!errors.description && formData.description && (
                  <p className='text-gray-500 text-xs mt-1'>{formData.description.length} characters</p>
                )}
              </div>

              {/* Complaint Type */}
              <div>
                <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>
                  {t.complaint_form.fields.complaint_type.label[language]}
                </label>
                <div className='relative'>
                  <select
                    name='type'
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 appearance-none bg-white ${
                      errors.type ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                    }`}
                  >
                    <option value=''>{t.complaint_form.fields.complaint_type.placeholder[language]}</option>
                    {complaintTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ArrowSvg className='absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none'/>
                </div>
                {errors.type && (
                  <p className='text-red-500 text-xs mt-1'>{errors.type}</p>
                )}
              </div>

              {/* Staff Member */}
              <div>
                <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>
                  {t.complaint_form.fields.staff_member.label[language]}
                </label>
                <input
                  type='text'
                  name='concerned_staff_member'
                  value={formData.concerned_staff_member}
                  onChange={handleChange}
                  placeholder={t.complaint_form.fields.staff_member.placeholder[language]}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400'
                />
              </div>

              {/* Upload Photo */}
              <div>
                <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>
                  {t.complaint_form.fields.photo_upload.label[language]}
                </label>
                <p className='font-roboto text-xs text-gray-500 mb-3'>
                  {t.complaint_form.fields.photo_upload.description?.[language] || "Drag and drop or browse image to add a photo of evidence for complaint"}
                </p>
                
                <Upload photo={formData.photo} setFormData={setFormData} />
              </div>



              {/* Submit Button */}
              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full bg-[#3A3A3A] text-white text-lg font-roboto font-bold py-3 rounded-full hover:bg-[#FACC14] hover:text-[#1E1E1E] transition-colors cursor-pointer shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? 'Submitting...' : t.complaint_form.submit_button[language]}
              </button>
            </form>
          </div>

        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Submission"
        message="Are you sure you want to submit this complaint? Please review your information before confirming."
        confirmText="Yes, Submit"
        cancelText="Cancel"
        confirmButtonStyle=""
      />

      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        message={notification.message}
        type={notification.type}
        duration={5000}
      />

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 flex flex-col">
            <div className="p-6 md:p-8 border-b border-gray-100 sticky top-0 bg-white z-10 flex justify-between items-start">
              <div>
                <h2 className="font-goldman font-bold text-2xl md:text-3xl text-[#3A3A3A] leading-tight">
                  Main issues you should be aware of
                </h2>
                <p className="font-roboto text-gray-500 mt-2 text-sm md:text-base">
                  Cases where the standard complaint procedure does not apply to Order No. 143/2015
                </p>
              </div>
              <button 
                onClick={() => setShowDisclaimer(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 md:p-8 font-roboto text-gray-700 leading-relaxed text-base space-y-4">
               <ul className="list-disc pl-5 space-y-3 marker:text-[#FACC14]">
                  <li>
                    Cases that are stipulated in other laws regarding complaint submittal and decision making; cases lodged or pending cases or cases presumed to be lodged in regular courts of law and quasi-judicial organs, or decisions or orders given by the thereof.
                  </li>
                  <li>
                    Cases being handled by an organ that has a judicial power, office of the auditor general, or activities related to an ongoing criminal investigation.
                  </li>
                  <li>
                    Matters decided by or pending issues with the council or standing committees of the council, judicial and public prosecutors administrative councils.
                  </li>
                  <li>
                    Matters decided by or pending with the federal institutions; or matters under the jurisdiction of federal institutions.
                  </li>
                  <li>
                    Even if the submitted grievance or complaint falls under the jurisdiction of the office, pending matters at the public office or matters that the public office does not give final decisions for.
                  </li>
                  <li>
                    Notwithstanding matters to be referred to the office by the mayor, pending grievance and complaint that was submitted to the cabinet of the city.
                  </li>
                  <li>
                    Grievance and complaint to be submitted regarding revenues, finance, grievances of civil servants, and contractual agreements.
                  </li>
               </ul>
            </div>

            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setShowDisclaimer(false)}
                className="bg-[#3A3A3A] hover:bg-[#FACC14] hover:text-[#1E1E1E] text-white font-bold font-roboto py-3 px-8 rounded-full transition-all duration-300 shadow-lg transform hover:-translate-y-1"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Compliants
