import { useState } from 'react'
import Upload from '../components/ui/Upload'
import LoadingButton from '../components/ui/LoadingButton'
import { useLanguage } from '../components/utils/LanguageContext'
import translatedContents from '../data/translated_contents.json'

function Contacts() {
  const { language } = useLanguage()
  const t = translatedContents.contact_page
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
    photo: null
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
        // Format photo as JSON array if present
        let photoData = []
        if (formData.photo) {
            if (Array.isArray(formData.photo)) {
                photoData = formData.photo
            } else if (typeof formData.photo === 'object' && formData.photo.name) {
                photoData = [formData.photo]
            }
        }

        const submitData = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            description: formData.message,
            photos: photoData,
            type: 'customer service', // Default type for general contact form
            status: 'assigning' // Default status
        }

        const response = await fetch('/api/complaints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submitData)
        })

        if (!response.ok) {
            throw new Error('Failed to submit message')
        }

        alert('Message sent successfully!')
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            message: '',
            photo: null
        })

    } catch (error) {
        console.error('Error submitting form:', error)
        alert('Failed to send message. Please try again.')
    } finally {
        setIsSubmitting(false)
    }
  }
// grid grid-cols-[1fr_1.2fr]
  return (
    <div className='w-full bg-white'>
      <div className='w-full px-4'>
        <div className='flex flex-col justify-center gap-8 lg:flex-row lg:justify-around lg:gap-0  '>

          <div className='max-w-md flex flex-col mx-auto mt-20 text-center lg:text-start xl:max-w-lg '>

            <h1 className='font-goldman font-bold text-5xl mb-6'>{t.title[language]}</h1>
            
            <p className='w-full font-roboto font-bold text-lg text-gray-400 mb-6 leading-relaxed'>
              {t.description[language]}
            </p>
            
            <p className='font-roboto font-bold text-base mb-8'>{t.contact_methods.direct_contact.title[language]}</p>

            <div className='space-y-4 font-roboto'>

              <div>
                <p className='text-gray-700'>{t.contact_methods.direct_contact.email.label[language]}: </p>
                <p className='font-bold text-gray-900'>{t.contact_methods.direct_contact.email.value[language]}</p>
              </div>

              <div>
                <p className='text-gray-700'>{t.contact_methods.direct_contact.phone.label[language]}: </p>
                <p className='font-bold text-gray-900'>{t.contact_methods.direct_contact.phone.value[language]}</p>
              </div>

              <div>
                <p className='text-gray-700 text-sm'>{t.contact_methods.direct_contact.hours[language]}</p>
              </div>

            </div>

          </div>

          {/* Right Form Section */}
          <div className='bg-white min-w-sm rounded-xl shadow-lg p-8 mx-auto border mt-10 mb-10 border-gray-200'>
            <h2 className='font-goldman font-bold text-3xl mb-6'>{t.contact_form.title[language]}</h2>
            
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* First Name and Last Name - Two Columns */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.contact_form.fields.first_name.label[language]}</label>
                  <input 
                    type='text' 
                    name='firstName' 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    placeholder={t.contact_form.fields.first_name.placeholder[language]} 
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400' 
                    required 
                  />
                </div>

                <div>
                  <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.contact_form.fields.last_name.label[language]}</label>
                  <input 
                    type='text' 
                    name='lastName' 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    placeholder={t.contact_form.fields.last_name.placeholder[language]}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400' 
                    required 
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>{t.contact_form.fields.email.label[language]}</label>
                <input 
                  type='email' 
                  name='email' 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder={t.contact_form.fields.email.placeholder[language]}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400' 
                  required 
                />
              </div>

              {/* Message Text Area */}
              <div>
                <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>
                  {t.contact_form.fields.message.label[language]}
                </label>
                <textarea
                  name='message'
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t.contact_form.fields.message.placeholder[language]}
                  rows={6}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg font-roboto text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none'
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className='block font-roboto font-medium text-sm mb-1 text-gray-700'>
                  {t.contact_form.fields.photo_upload.label[language]}
                </label>
                <div className='min-h-[150px]'>
                  <Upload photo={formData.photo} setFormData={setFormData} />
                </div>
              </div>

              {/* Submit Button */}
              <LoadingButton
                type='submit'
                isLoading={isSubmitting}
                className='w-full bg-[#3A3A3A] text-white text-lg font-roboto font-bold py-3 rounded-full hover:bg-[#5e5e5e] shadow-2xl'
              >
                {t.contact_form.submit_button[language]}
              </LoadingButton>
            </form>
          </div>

        </div>

        {/* Google Maps Section */}
        <div className='w-full mt-10 mb-10'>
          <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-8'>
            <h2 className='font-goldman font-bold text-3xl mb-6'>{t.location.title[language]}</h2>
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
              <p className='font-medium text-gray-700 mb-1'>{t.location.address_label[language]}:</p>
              <p>{t.location.address_value[language]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contacts
