import { useState } from 'react'

function Contacts() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
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
    alert('Message sent successfully!')
  }

  return (
    <div className='w-full min-h-screen bg-white'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='grid grid-cols-[1fr_1.2fr]'>

          <div className='flex flex-col ml-5 mt-20'>

            <h1 className='font-goldman font-bold text-5xl mb-6'>Get in — touch with us</h1>
            
            <p className='w-100 font-roboto font-bold text-lg text-gray-400 mb-6 leading-relaxed'>
              We're here to help! Whether you have a question about our services, need assistance with your account, or want to provide feedback, our team is ready to assist you.
            </p>
            
            <p className='font-roboto font-bold text-base mb-8'>Fill out the form or reach us directly</p>

            <div className='space-y-4 font-roboto'>

              <div>
                <p className='text-gray-700'>Email: </p>
                <p className='font-bold text-gray-900'>hello@finpro.com</p>
              </div>

              <div>
                <p className='text-gray-700'>Phone: </p>
                <p className='font-bold text-gray-900'>+1 234 567 78</p>
              </div>

              <div>
                <p className='text-gray-700 text-sm'>Available Monday to Friday, 9 AM - 6 PM GMT</p>
              </div>

            </div>

          </div>

          {/* Right Form Section */}
          <div className='bg-white rounded-xl shadow-lg p-8 border mt-10 mb-10 border-gray-200'>
            <h2 className='font-goldman font-bold text-3xl mb-6'>Contact Form</h2>
            
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* First Name and Last Name - Two Columns */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>First name</label>
                  <input 
                    type='text' 
                    name='firstName' 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    placeholder='Enter your first name...' 
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400' 
                    required 
                  />
                </div>

                <div>
                  <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>Last name</label>
                  <input 
                    type='text' 
                    name='lastName' 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    placeholder='Enter your last name...' 
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400' 
                    required 
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>Email</label>
                <input 
                  type='email' 
                  name='email' 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder='Enter your email address...' 
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400' 
                  required 
                />
              </div>

              {/* Message Text Area */}
              <div>
                <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>
                  How can we help you?
                </label>
                <textarea
                  name='message'
                  value={formData.message}
                  onChange={handleChange}
                  placeholder='Enter your message...'
                  rows={6}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none'
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                className='w-full bg-[#3A3A3A] text-white text-lg font-roboto font-bold py-3 rounded-full hover:bg-[#5e5e5e] transition-colors cursor-pointer shadow-2xl'
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Google Maps Section */}
        <div className='w-full mt-10 mb-10'>
          <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-8'>
            <h2 className='font-goldman font-bold text-3xl mb-6'>Our Location</h2>
            <div className='w-full h-96 rounded-lg overflow-hidden'>
              <iframe
                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.1234567890123!2d38.7636!3d9.0054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDAnMTkuNCJOIDM4wrA0NSc0OS4wIkU!5e0!3m2!1sen!2set!4v1234567890123!5m2!1sen!2set'
                width='100%'
                height='100%'
                style={{ border: 0 }}
                allowFullScreen
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                title='Lideta Sub-City Location'
                className='w-full h-full'
              ></iframe>
            </div>
            <div className='mt-4 font-roboto text-sm text-gray-600'>
              <p className='font-medium text-gray-700 mb-1'>Address:</p>
              <p>Sar Bet Area, Lideta Sub-City, Addis Ababa, Ethiopia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contacts
