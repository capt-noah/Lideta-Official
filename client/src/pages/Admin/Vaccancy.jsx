import { useState } from 'react'
import LocationIcon from '../../assets/icons/location_icon.svg?react'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon2.svg?react'

function Vaccancy() {
  const [selectedVacancy, setSelectedVacancy] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    responsibilities: '',
    qualifications: ''
  })

  const vacanciesList = [
    {
      id: 1,
      title: 'Road Inspector',
      date: '24-11',
      type: 'Engineering',
      salary: '10,500'
    },
    {
      id: 2,
      title: 'Sanitation Worker',
      date: '22-01',
      type: 'Sanitation',
      salary: '6,500'
    },
    {
      id: 3,
      title: 'Health Officer',
      date: '03-23',
      type: 'Health',
      salary: '12,000'
    },
    {
      id: 4,
      title: 'Revenue Auditor',
      date: '15-12',
      type: 'Finance',
      salary: '13,000'
    },
    {
      id: 5,
      title: 'Permit Clerk',
      date: '08-11',
      type: 'Admin',
      salary: '5,000'
    },
    {
      id: 6,
      title: 'Security Officer',
      date: '01-11',
      type: 'Security',
      salary: '6,500'
    },
    {
      id: 7,
      title: 'Welfare Coordinator',
      date: '10-11',
      type: 'Social',
      salary: '11,500'
    },
    {
      id: 8,
      title: 'Traffic Controller',
      date: '05-12',
      type: 'Transport',
      salary: '9,000'
    },
    {
      id: 9,
      title: 'Water Technician',
      date: '18-11',
      type: 'Utility',
      salary: '10,000'
    },
    {
      id: 10,
      title: 'Archive Assistant',
      date: '12-10',
      type: 'Records',
      salary: '8,000'
    }
  ]

  const handleVacancyClick = (vacancy) => {
    setSelectedVacancy(vacancy)
    setFormData({
      title: vacancy.title,
      location: vacancy.location || '',
      startDate: vacancy.startDate || '',
      endDate: vacancy.endDate || '',
      description: vacancy.description || '',
      responsibilities: vacancy.responsibilities || '',
      qualifications: vacancy.qualifications || ''
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleReset = () => {
    setFormData({
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      responsibilities: '',
      qualifications: ''
    })
    setSelectedVacancy(null)
  }

  const handleSubmit = () => {
    // Handle create/update logic here
    console.log('Form data:', formData)
    handleReset()
  }

  const handleDelete = (vacancyId) => {
    // Handle delete logic here
    console.log('Delete vacancy:', vacancyId)
    if (selectedVacancy?.id === vacancyId) {
      handleReset()
    }
  }

  return (
    <div className='grid grid-cols-[1fr_500px] gap-4 p-4'>
      {/* Vacancy Form */}
      <div className='bg-white h-fit border rounded-xl font-jost p-5'>
        <h1 className='text-3xl font-medium mb-6'>
          {selectedVacancy ? 'Update Vacancy' : 'Post Vacancy'}
        </h1>

        <div className='space-y-4'>
          {/* Title */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Title
            </label>
            <input
              type='text'
              name='title'
              value={formData.title}
              onChange={handleInputChange}
              placeholder='Enter vacancy title'
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
            />
          </div>

          {/* Location */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Location
            </label>
            <div className='relative'>
              <input
                type='text'
                name='location'
                value={formData.location}
                onChange={handleInputChange}
                placeholder='Enter location'
                className='w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
              />
              <LocationIcon className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
            </div>
          </div>

          {/* Start and End Date */}
          <div className='grid grid-cols-2 gap-5'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Start Date
              </label>
              <div className='relative'>
                <input
                  type='text'
                  name='startDate'
                  value={formData.startDate}
                  onChange={handleInputChange}
                  placeholder='DD/MM/YY'
                  className='w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                />
                <CalenderIcon className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                End Date
              </label>
              <div className='relative'>
                <input
                  type='text'
                  name='endDate'
                  value={formData.endDate}
                  onChange={handleInputChange}
                  placeholder='DD/MM/YY'
                  className='w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                />
                <CalenderIcon className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              </div>
            </div>
          </div>

          {/* Vacancy Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Vacancy description
            </label>
            <textarea
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder='Enter vacancy description'
              rows={4}
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] resize-none'
            />
          </div>

          {/* Responsibilities */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Responsibilities
            </label>
            <textarea
              name='responsibilities'
              value={formData.responsibilities}
              onChange={handleInputChange}
              placeholder='Enter job responsibilities'
              rows={4}
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] resize-none'
            />
          </div>

          {/* Qualifications */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Qualifications
            </label>
            <textarea
              name='qualifications'
              value={formData.qualifications}
              onChange={handleInputChange}
              placeholder='Enter job qualifications'
              rows={4}
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] resize-none'
            />
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 justify-end pt-4'>
            <button
              onClick={handleReset}
              className='px-6 py-2 border text-gray-700 rounded-full shadow-lg hover:bg-gray-100 font-medium cursor-pointer active:scale-98'
            >
              Reset
            </button>
            <button
              onClick={handleSubmit}
              className='px-6 py-2 bg-[#3A3A3A] text-white rounded-full shadow-lg hover:bg-[#2A2A2A] font-medium cursor-pointer active:scale-98'
            >
              {selectedVacancy ? 'Update' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Vacancies List */}
      <div className='bg-white border rounded-xl font-jost p-5 space-y-5 overflow-y-auto h-fit'>
        <h1 className='text-3xl font-medium'>Vacancies</h1>

        {/* Table Header */}
        <div className='flex gap-2 text-[#818181] text-sm font-medium border-b pb-2'>
          <p className='w-[30%]'>Job title</p>
          <p className='w-[15%]'>Date</p>
          <p className='w-[30%]'>Type</p>
          <p className='w-[20%]'>Salary</p>
          <p className='w-[5%]'></p>
        </div>

        <div className='space-y-3'>
          {vacanciesList.map((vacancy) => (
            <div
              key={vacancy.id}
              onClick={() => handleVacancyClick(vacancy)}
              className={`flex items-center gap-2 text-sm cursor-pointer transition-colors border-b pb-3`}
            >
              <p className='w-[30%] font-medium'>{vacancy.title}</p>
              <p className='w-[15%]'>{vacancy.date}</p>
              <p className='w-[30%]'>{vacancy.type}</p>
              <p className='w-[20%]'>{vacancy.salary}</p>

              <div className='w-[5%] flex gap-2 justify-end'>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(vacancy.id)
                  }}
                  className=' p-1 cursor-pointer active:scale-97'
                >
                  <TrashIcon className='w-4 h-4 text-white' />
                </button>

              </div> 

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Vaccancy
