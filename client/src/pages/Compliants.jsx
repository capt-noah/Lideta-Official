import React, { useState, useEffect } from 'react'

import ArrowSvg from '../assets/arrow.svg?react'
import Upload from '../components/ui/Upload'
import ConfirmationDialog from '../components/ui/ConfirmationDialog'
import Notification from '../components/ui/Notification'

function Compliants() {
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
    <div className='w-full h-fit bg-white'>
      <div className='max-w-7xl mx-auto'>
        <div className='mx-auto grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16 2xl:gap-20'>

          <div className='flex flex-col w-full mx-auto px-16 py-8 text-center lg:text-start mt-10'>

            <h1 className='font-goldman font-bold text-5xl mb-6'> Submit Your Complaint </h1>
            
            <p className='font-roboto font-bold text-lg text-gray-400 mb-6 '>Tell us what went wrong, and we'll make sure your issue is reviewed, assigned, and resolved as fast as possible.</p>
            
            <p className='font-roboto font-bold text-base mb-8'>Fill out the form or reach us directly</p>

            <div className='space-y-4 font-roboto'>

              <div>
                <p className='text-gray-700'>Email: </p>
                <p className='font-bold text-gray-900'>Lidetasubcityemail@gmail.com</p>
              </div>

              <div>
                <p className='text-gray-700'>Phone: </p>
                <p className='font-bold text-gray-900'>+251 9-12-34-56-78</p>
              </div>

            </div>

          </div>

          {/* Right Form Section */}
          <div className='bg-white w-full min-w-sm max-w-lg xl:max-w-2xl mx-auto rounded-xl shadow-lg p-4 border mt-10 mb-0 border-gray-200 lg:mb-4'>
            <h2 className='font-goldman font-bold text-3xl mb-6'>Compliant Form</h2>
            
            <form onSubmit={handleFormSubmit} className='space-y-6'>
              {/* First Name and Last Name - Two Columns */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block font-roboto font-medium text-sm mb-1  text-gray-700'>First name</label>
                  <input 
                    type='text' 
                    name='first_name' 
                    value={formData.first_name} 
                    onChange={handleChange} 
                    placeholder='Enter first name' 
                    className={`w-full px-4 py-2 border rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 ${
                      errors.first_name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                    }`}
                  />
                  {errors.first_name && (
                    <p className='text-red-500 text-xs mt-1'>{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'> Last name </label>
                  <input 
                    type='text' 
                    name='last_name' 
                    value={formData.last_name} 
                    onChange={handleChange} 
                    placeholder='Enter last name' 
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
                  <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>Email</label>
                  <input 
                    type='email' 
                    name='email' 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder='your-email-address@gmail.com' 
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
                  <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'> Phone Number </label>
                  <div className='flex gap-2'>
                    <select 
                      name='phoneCode' 
                      value={formData.phoneCode} 
                      onChange={handleChange} 
                      className='px-3 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white'
                    >
                      <option value='+251'>🇪🇹 +251</option>
                      <option value='+1'>🇺🇸 +1</option>
                      <option value='+44'>🇬🇧 +44</option>
                    </select>

                    <input 
                      type='tel' 
                      name='phone' 
                      value={formData.phone} 
                      onChange={handleChange} 
                      placeholder='9-12-34-56-78' 
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
                  Compliant
                </label>
                <textarea
                  name='description'
                  value={formData.description}
                  onChange={handleChange}
                  placeholder='Enter compliant description (minimum 10 characters)'
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
                  Compliant type
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
                    <option value=''>Select compliant type</option>
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
                  Staff member concerned (if any)
                </label>
                <input
                  type='text'
                  name='concerned_staff_member'
                  value={formData.concerned_staff_member}
                  onChange={handleChange}
                  placeholder='Enter name of staff member'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400'
                />
              </div>

              {/* Upload Photo */}
              <div>
                <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>
                  Upload photo (OPTIONAL)
                </label>
                <p className='font-roboto text-xs text-gray-500 mb-3'>
                  Drag and drop or browse image to add a photo of evidence for compliant
                </p>
                
                <Upload photo={formData.photo} setFormData={setFormData} />
              </div>



              {/* Submit Button */}
              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full bg-[#3A3A3A] text-white text-lg font-roboto font-bold py-3 rounded-full hover:bg-[#5e5e5e] transition-colors cursor-pointer shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
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
    </div>
  )
}

export default Compliants
