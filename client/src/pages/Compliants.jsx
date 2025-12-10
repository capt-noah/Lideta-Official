import React, { useState } from 'react'

import ArrowSvg from '../assets/arrow.svg?react'
import Upload from '../components/ui/Upload'

function Compliants() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneCode: '+251',
    phoneNumber: '',
    complaint: '',
    complaintType: '',
    staffMember: '',
    photo: null
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    alert('Complaint submitted successfully!')
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
            
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* First Name and Last Name - Two Columns */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block font-roboto font-medium text-sm mb-1  text-gray-700'>First name</label>
                  <input type='text' name='firstName' value={formData.firstName} onChange={handleChange} placeholder='Enter first name' className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400' required />
                </div>

                <div>
                  <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'> Last name </label>
                  <input type='text' name='lastName' value={formData.lastName} onChange={handleChange} placeholder='Enter last name' className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400' required />
                </div>
              </div>


              <div className=' grid-cols-2 grid gap-4' >
                {/* Email */}
                <div className='w-full' >
                  <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>Email</label>
                  <input type='email' name='email' value={formData.email} onChange={handleChange} placeholder='your-email-address@gmail.com' className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400' required />
                </div>

                {/* Phone Number */}
                <div className='w-full' >
                  <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'> Phone Number </label>
                  <div className='flex gap-2'>

                    <select name='phoneCode' value={formData.phoneCode} onChange={handleChange} className='px-1 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400' >
                      <option value='+251'>🇪🇹 +251</option>
                      <option value='+1'>🇺🇸 +1</option>
                      <option value='+44'>🇬🇧 +44</option>
                    </select>

                    <input type='tel' name='phoneNumber' value={formData.phoneNumber} onChange={handleChange} placeholder='9-12-34-56-78' className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400' required />
                  </div>
                </div>
              </div>


              {/* Complaint Text Area */}
              <div>
                <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>
                  Compliant
                </label>
                <textarea
                  name='complaint'
                  value={formData.complaint}
                  onChange={handleChange}
                  placeholder='Enter compliant description'
                  rows={5}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none'
                  required
                />
              </div>

              {/* Complaint Type */}
              <div>
                <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>
                  Compliant type
                </label>
                <div className='relative'>
                  <select
                    name='complaintType'
                    value={formData.complaintType}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 appearance-none bg-white'
                    required
                  >
                    <option value=''>Select compliant type</option>
                    <option value='service'>Service Issue</option>
                    <option value='staff'>Staff Behavior</option>
                    <option value='facility'>Facility Problem</option>
                    <option value='billing'>Billing Issue</option>
                    <option value='other'>Other</option>
                  </select>
                  <ArrowSvg className='absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none'/>
                </div>
              </div>

              {/* Staff Member */}
              <div>
                <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>
                  Staff member concerned (if any)
                </label>
                <input
                  type='text'
                  name='staffMember'
                  value={formData.staffMember}
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
                className='w-full bg-[#3A3A3A] text-white text-lg font-roboto font-bold py-3 rounded-full hover:bg-[#5e5e5e] transition-colors cursor-pointer shadow-2xl '
              >
                Submit
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Compliants
