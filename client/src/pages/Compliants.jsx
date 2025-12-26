import React, { useState, useEffect } from 'react'

import ArrowSvg from '../assets/arrow.svg?react'
import Upload from '../components/ui/Upload'
import ConfirmationDialog from '../components/ui/ConfirmationDialog'
import Notification from '../components/ui/Notification'
import { useLanguage } from '../components/utils/LanguageContext'
import translatedContents from '../data/translated_contents.json'

const subcities = [
  'Bole', 'Yeka', 'Gullele', 'Lideta', 'Addis Ketema', 'Arada', 
  'Kolfe Keranio', 'Akaki Kality', 'Nifas Silk', 'Lemi Kura', 'Kirkos'
];

const sectorGroups = [
  'Office of Public Service and Human Resource Development',
  'Government Property Administration Bureau',
  'Women, Children and Social Affairs Bureau',
  'Culture, Arts and Tourism Bureau',
  'Communication Bureau',
  'Health Bureau',
  'Education Bureau',
  'Main Executive Office',
  'Justice Bureau',
  'Peace and Security Bureau',
  'Law Enforcement Bureau',
  'Council',
  'Agriculture and Urban Farming Bureau',
  'Community Affairs',
  'Trade Bureau',
  'Finance Bureau',
  'Renewal Coordination Bureau',
  'Planning Commission',
  'Good Governance, Complaints and Petitions Bureau',
  'Design and Construction Works Bureau',
  'Construction Permit and Inspection Bureau',
  'Housing Development Administration Bureau',
  'Labor and Skills Bureau',
  'Workplace Development Administration Bureau',
  'Industry Development Bureau',
  'Community, Volunteer and Social Mobilization Bureau',
  'Youth and Sports Bureau',
  "Administrator's Office",
  'Civil Registration and Citizenship Bureau',
  'Local Security Bureau',
  'Urban Beautification and Green Development Bureau',
  'Sanitation Management Bureau',
  'Land Development and Administration Bureau',
  'Land Ownership and Information Bureau',
  'Roads and Transport Bureau',
  'Vehicle and Transport Bureau',
  'Food and Drug Bureau',
  'General Education Quality and Inspection Bureau',
  'Traffic Management Bureau'
];

function Compliants() {
  const { language } = useLanguage()
  const t = translatedContents.complaints_page
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phoneCode: '+251',
    phone: '',
    // Address Fields
    address_city: '',
    address_subcity: '',
    address_woreda: '',
    address_house_number: '',
    // Complaint Location Fields
    complaint_subcity: '',
    complaint_woreda: '',
    complaint_sector_group: '',
    

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
  const [disclaimerMode, setDisclaimerMode] = useState('initial') // 'initial' or 'submission'

  // Fetch complaint types from database
  // ... existing useEffect ...

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
    // ... existing validation logic ...
    const newErrors = {}

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address'
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^[0-9\s-]+$/.test(formData.phone)) newErrors.phone = 'Please enter a valid phone number'

    // Address Validation
    if (!formData.address_city.trim()) newErrors.address_city = t.complaint_form.validation.required.city[language]
    if (!formData.address_subcity.trim()) newErrors.address_subcity = t.complaint_form.validation.required.subcity[language]
    if (!formData.address_woreda.trim()) newErrors.address_woreda = t.complaint_form.validation.required.woreda[language]

    // Complaint Location Validation
    if (!formData.complaint_subcity.trim()) newErrors.complaint_subcity = t.complaint_form.validation.required.complaint_subcity[language]
    if (!formData.complaint_woreda.trim()) newErrors.complaint_woreda = t.complaint_form.validation.required.complaint_woreda[language]
    if (!formData.complaint_sector_group.trim()) newErrors.complaint_sector_group = t.complaint_form.validation.required.sector_group[language]

    if (!formData.description.trim()) {
      newErrors.description = t.complaint_form.validation.required.description[language]
    } else if (formData.description.trim().length < 10) {
      newErrors.description = t.complaint_form.validation.required.description_length[language]
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Instead of generic dialog, show disclaimer in submission mode
      setDisclaimerMode('submission')
      setShowDisclaimer(true)
    }
  }

  // ... (Submission logic remains the same) ...
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true)
    setShowDisclaimer(false) // Close the disclaimer modal
    // setShowConfirmDialog(false) // No longer used

    try {
      // ... existing submission logic ...
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
        // Address fields
        address_city: formData.address_city.trim(),
        address_subcity: formData.address_subcity.trim(),
        address_woreda: formData.address_woreda.trim(),
        address_house_number: formData.address_house_number.trim(),
        // Complaint Location fields
        complaint_subcity: formData.complaint_subcity.trim(),
        complaint_woreda: formData.complaint_woreda.trim(),
        complaint_sector_group: formData.complaint_sector_group.trim(),
        
        type: formData.complaint_sector_group,
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
        address_city: '',
        address_subcity: '',
        address_woreda: '',
        address_house_number: '',
        complaint_subcity: '',
        complaint_woreda: '',
        complaint_sector_group: '',
        status: 'assigning',
        description: '',
        concerned_staff_member: '',
        photo: null
      })
      setErrors({})
      setDisclaimerMode('initial') // Reset mode back to initial

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
      {/* ... (Header and Form Sections same as before) ... */}
      <div className='max-w-7xl mx-auto'>
        <div className='mx-auto grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16 2xl:gap-20'>

          <div className='flex flex-col w-full mx-auto px-16 py-8 text-center lg:text-start mt-10'>
             {/* ... Left Side Content ... */}
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
            
            <form onSubmit={handleFormSubmit} className='space-y-8'>
              
             {/* ... Form Fields (Address, Personal, Complaint Details) ... */}
             <div className="space-y-6">
                 <h2 className='font-roboto text-gray-500 text-lg border-b border-gray-300 pb-2'>{t.complaint_form.sections.personal_info[language]}</h2>
                 {/* ... (Personal & Address Fields) ... */}
                 <div className="space-y-4">
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
                        {errors.first_name && <p className='text-red-500 text-xs mt-1'>{errors.first_name}</p>}
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
                        {errors.last_name && <p className='text-red-500 text-xs mt-1'>{errors.last_name}</p>}
                      </div>
                    </div>
                    {/* ... (Email Phone) ... */}
                    <div className=' grid-cols-2 grid gap-4' >
                      <div className='w-full' >
                        <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.complaint_form.fields.email.label[language]}</label>
                        <input type='email' name='email' value={formData.email} onChange={handleChange} placeholder={t.complaint_form.fields.email.placeholder[language]} className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'}`} />
                        {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
                      </div>
                      <div className='w-full' >
                        <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'> {t.complaint_form.fields.phone_number.label[language]} </label>
                        <div className='flex gap-2'>
                          <select name='phoneCode' value={formData.phoneCode} onChange={handleChange} className='px-3 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white'>
                            <option value='+251'>{t.complaint_form.fields.phone_number.country_code[language]}</option>
                            <option value='+1'>🇺🇸 +1</option>
                            <option value='+44'>🇬🇧 +44</option>
                          </select>
                          <input type='tel' name='phone' value={formData.phone} onChange={handleChange} placeholder={t.complaint_form.fields.phone_number.placeholder[language]} className={`flex-1 px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'}`} />
                        </div>
                        {errors.phone && <p className='text-red-500 text-xs mt-1'>{errors.phone}</p>}
                      </div>
                    </div>
                 </div>
                 {/* ... (Address Sub-section) ... */}
                 <div className="space-y-4">
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.complaint_form.address_fields.city.label[language]}</label>
                        <input type='text' name='address_city' value={formData.address_city} onChange={handleChange} placeholder={t.complaint_form.address_fields.city.placeholder[language]} className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 ${errors.address_city ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'}`} />
                        {errors.address_city && <p className='text-red-500 text-xs mt-1'>{errors.address_city}</p>}
                      </div>
                      <div>
                        <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.complaint_form.address_fields.subcity.label[language]}</label>
                        <div className='relative'>
                          <select name='address_subcity' value={formData.address_subcity} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 appearance-none bg-white ${errors.address_subcity ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'}`}>
                            <option value="">{t.complaint_form.address_fields.subcity.placeholder[language]}</option>
                            {subcities.map(city => (<option key={city} value={city}>{city}</option>))}
                          </select>
                          <ArrowSvg className='absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none'/>
                        </div>
                        {errors.address_subcity && <p className='text-red-500 text-xs mt-1'>{errors.address_subcity}</p>}
                      </div>
                      <div>
                        <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.complaint_form.address_fields.woreda.label[language]}</label>
                        <input type='text' name='address_woreda' value={formData.address_woreda} onChange={handleChange} placeholder={t.complaint_form.address_fields.woreda.placeholder[language]} className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 ${errors.address_woreda ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'}`} />
                        {errors.address_woreda && <p className='text-red-500 text-xs mt-1'>{errors.address_woreda}</p>}
                      </div>
                      <div>
                        <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.complaint_form.address_fields.house_number.label[language]}</label>
                        <input type='text' name='address_house_number' value={formData.address_house_number} onChange={handleChange} placeholder={t.complaint_form.address_fields.house_number.placeholder[language]} className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400' />
                      </div>
                    </div>
                 </div>
              </div>

              {/* Complaint Details Group */}
              <div className="space-y-6">
                 <h2 className='font-roboto text-gray-500 text-lg border-b border-gray-300 pb-2'>{t.complaint_form.sections.complaint_details[language]}</h2>
                 {/* ... (Location & Sector) ... */}
                 <div className="space-y-4">
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.complaint_form.address_fields.subcity.label[language]}</label>
                        <div className='relative'>
                          <select name='complaint_subcity' value={formData.complaint_subcity} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 appearance-none bg-white ${errors.complaint_subcity ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'}`}>
                            <option value="">{t.complaint_form.address_fields.subcity.placeholder[language]}</option>
                            {subcities.map(city => (<option key={city} value={city}>{city}</option>))}
                          </select>
                          <ArrowSvg className='absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none'/>
                        </div>
                        {errors.complaint_subcity && <p className='text-red-500 text-xs mt-1'>{errors.complaint_subcity}</p>}
                      </div>
                      <div>
                        <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.complaint_form.address_fields.woreda.label[language]}</label>
                        <input type='text' name='complaint_woreda' value={formData.complaint_woreda} onChange={handleChange} placeholder={t.complaint_form.address_fields.woreda.placeholder[language]} className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 ${errors.complaint_woreda ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'}`} />
                        {errors.complaint_woreda && <p className='text-red-500 text-xs mt-1'>{errors.complaint_woreda}</p>}
                      </div>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                        {/* Sector Group */}
                        <div>
                            <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.complaint_form.sector_group.label[language]}</label>
                            <div className='relative'>
                              <select name='complaint_sector_group' value={formData.complaint_sector_group} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 appearance-none bg-white ${errors.complaint_sector_group ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'}`}>
                                <option value="">{t.complaint_form.sector_group.placeholder[language]}</option>
                                {sectorGroups.map(sector => (<option key={sector} value={sector}>{sector}</option>))}
                              </select>
                              <ArrowSvg className='absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none'/>
                            </div>
                            {errors.complaint_sector_group && <p className='text-red-500 text-xs mt-1'>{errors.complaint_sector_group}</p>}
                        </div>
                 </div>

                 {/* Description */}
                 <div className="space-y-4">
                    <div>
                        <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.complaint_form.fields.complaint.label[language]}</label>
                        <textarea name='description' value={formData.description} onChange={handleChange} placeholder={t.complaint_form.fields.complaint.placeholder[language]} rows={5} className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 resize-none ${errors.description ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'}`} />
                        {errors.description && <p className='text-red-500 text-xs mt-1'>{errors.description}</p>}
                        {!errors.description && formData.description && <p className='text-gray-500 text-xs mt-1'>{formData.description.length} characters</p>}
                    </div>
                 </div>

                 {/* Additional Info */}
                 <div className="space-y-4">
                    <h3 className="font-roboto font-medium text-gray-500 text-sm uppercase tracking-wide">{t.complaint_form.sections.additional_info[language]}</h3>
                    <div>
                        <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.complaint_form.fields.staff_member.label[language]}</label>
                        <input type='text' name='concerned_staff_member' value={formData.concerned_staff_member} onChange={handleChange} placeholder={t.complaint_form.fields.staff_member.placeholder[language]} className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400' />
                    </div>
                    <div>
                        <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.complaint_form.fields.photo_upload.label[language]}</label>
                        <p className='font-roboto text-xs text-gray-500 mb-3'>{t.complaint_form.fields.photo_upload.description?.[language] || "Drag and drop or browse image to add a photo of evidence for complaint"}</p>
                        <Upload photo={formData.photo} setFormData={setFormData} />
                    </div>
                 </div>
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

      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        message={notification.message}
        type={notification.type}
        duration={5000}
      />

      {/* Disclaimer Modal / Confirmation Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 flex flex-col">
            <div className="p-6 md:p-8 border-b border-gray-100 sticky top-0 bg-white z-10 flex justify-between items-start">
              <div>
                <h2 className="font-goldman font-bold text-2xl md:text-3xl text-[#3A3A3A] leading-tight">
                  {t.disclaimer?.title[language]}
                </h2>
                <p className="font-roboto text-gray-500 mt-2 text-sm md:text-base">
                  {t.disclaimer?.subtitle[language]}
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
                  {t.disclaimer?.items?.map((item, index) => (
                    <li key={index}>
                        {typeof item === 'string' ? item : (item[language] || item['en'])}
                    </li>
                  ))}
               </ul>
            </div>

            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 flex justify-end gap-4 rounded-b-2xl">
              {disclaimerMode === 'submission' && (
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-roboto font-medium hover:bg-gray-100 transition-colors"
                >
                  {t.disclaimer?.actions?.cancel[language]}
                </button>
              )}
              <button
                onClick={() => {
                   if (disclaimerMode === 'initial') {
                     setShowDisclaimer(false)
                   } else {
                     handleConfirmSubmit()
                   }
                }}
                className="bg-[#3A3A3A] hover:bg-[#FACC14] hover:text-[#1E1E1E] text-white font-bold font-roboto py-3 px-8 rounded-full transition-all duration-300 shadow-lg transform hover:-translate-y-1"
              >
                {disclaimerMode === 'initial' ? t.disclaimer?.actions?.confirm[language] : t.disclaimer?.actions?.confirm_submit[language]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Compliants
