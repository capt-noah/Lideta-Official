import { useState, useEffect, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import LocationIcon from '../../assets/icons/location_icon.svg?react'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import SortIcon from '../../assets/icons/sort_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon2.svg?react'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import Notification from '../../components/ui/Notification'
import { adminContext } from '../../components/utils/AdminContext.jsx'

function Vaccancy() {
  const [selectedVacancy, setSelectedVacancy] = useState(null)
  const [vacanciesList, setVacanciesList] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [vacancyToDelete, setVacancyToDelete] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState({ isOpen: false, message: '', type: 'success' })
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    location: '',
    salary: '',
    startDate: '',
    endDate: '',
    type: 'Full Time',
    category: 'Technology',
    shortDescription: '',
    skills: [],
    description: '',
    responsibilities: [],
    qualifications: []
  })
  const [newSkill, setNewSkill] = useState('')
  const [newResponsibility, setNewResponsibility] = useState('')
  const [newQualification, setNewQualification] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })

  const { token } = useContext(adminContext)
  const navigate = useNavigate()

  // Fetch vacancies from API
  useEffect(() => {
    async function getVacancies() {
      try {
        const response = await fetch('http://localhost:3000/admin/vacancies', {
          headers: {
            authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token')
            navigate('/auth/login')
            return
          }
          throw new Error('Failed to fetch vacancies')
        }

        const list = await response.json()
        setVacanciesList(list)
      } catch (error) {
        console.error('Error fetching vacancies:', error)
        setNotification({ isOpen: true, message: 'Failed to load vacancies. Please try again.', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      getVacancies()
    }
  }, [token, navigate])

  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    // Handle different date formats from database
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString // Return as-is if invalid
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day} - ${month} - ${year}`
  }

  const handleVacancyClick = (vacancy) => {
    setSelectedVacancy(vacancy)
    setFormData({
      id: vacancy.id,
      title: vacancy.title || '',
      location: vacancy.location || '',
      salary: vacancy.salary || '',
      startDate: formatDateForInput(vacancy.start_date),
      endDate: formatDateForInput(vacancy.end_date),
      type: vacancy.type || 'Full Time',
      category: vacancy.category || 'Technology',
      shortDescription: vacancy.short_description || '',
      skills: vacancy.skills || [],
      description: vacancy.description || '',
      responsibilities: Array.isArray(vacancy.responsibilities)
        ? vacancy.responsibilities
        : vacancy.responsibilities
          ? [vacancy.responsibilities]
          : [],
      qualifications: Array.isArray(vacancy.qualifications)
        ? vacancy.qualifications
        : vacancy.qualifications
          ? [vacancy.qualifications]
          : []
    })
    setNewSkill('')
    setNewResponsibility('')
    setNewQualification('')
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
      id: '',
      title: '',
      location: '',
      salary: '',
      startDate: '',
      endDate: '',
      type: 'Full Time',
      category: 'Technology',
      shortDescription: '',
      skills: [],
      description: '',
      responsibilities: [],
      qualifications: []
    })
    setNewSkill('')
    setNewResponsibility('')
    setNewQualification('')
    setSelectedVacancy(null)
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const handleAddResponsibility = () => {
    const value = newResponsibility.trim()
    if (!value) return
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, value]
    }))
    setNewResponsibility('')
  }

  const handleRemoveResponsibility = (itemToRemove) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter(item => item !== itemToRemove)
    }))
  }

  const handleResponsibilityKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddResponsibility()
    }
  }

  const handleAddQualification = () => {
    const value = newQualification.trim()
    if (!value) return
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, value]
    }))
    setNewQualification('')
  }

  const handleRemoveQualification = (itemToRemove) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(item => item !== itemToRemove)
    }))
  }

  const handleQualificationKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddQualification()
    }
  }

  const getShortLabel = (text) => {
    const words = text.split(' ').filter(Boolean)
    if (words.length <= 2) return text
    return `${words[0]} ${words[1]}...`
  }

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const sortedVacancies = useMemo(() => {
    if (!vacanciesList) return []
    const sorted = [...vacanciesList]

    const compareString = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })
    const parseSalary = (value) => {
      if (!value) return 0
      const numeric = parseInt(String(value).replace(/[^\d]/g, ''), 10)
      return Number.isNaN(numeric) ? 0 : numeric
    }
    const extractDate = (vacancy) => {
      if (vacancy.start_date) return new Date(vacancy.start_date)
      if (vacancy.created_at) return new Date(vacancy.created_at)
      if (vacancy.formatted_date) return new Date(vacancy.formatted_date)
      return new Date(0)
    }

    sorted.sort((a, b) => {
      let result = 0

      switch (sortConfig.key) {
      case 'title':
        result = compareString(a.title || '', b.title || '')
        break
      case 'date': {
        const dateA = extractDate(a).getTime()
        const dateB = extractDate(b).getTime()
        result = dateA - dateB
        break
      }
      case 'type':
        result = compareString(a.type || '', b.type || '')
        break
      case 'salary':
        result = parseSalary(a.salary) - parseSalary(b.salary)
        break
      default:
        result = 0
      }

      return sortConfig.direction === 'asc' ? result : -result
    })

    return sorted
  }, [vacanciesList, sortConfig])

  const convertDateToISO = (dateString) => {
    if (!dateString) return null
    // Convert "DD - MM - YY" to "YYYY-MM-DD"
    const parts = dateString.split(' - ')
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0')
      const month = parts[1].padStart(2, '0')
      const year = '20' + parts[2] // Assuming 20XX for YY format
      return `${year}-${month}-${day}`
    }
    // If already in ISO format or other format, try to parse it
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
    return dateString
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const fetchType = formData.id === '' ? 'create' : 'update'
      const url = `http://localhost:3000/admin/${fetchType}/vacancy`

      // Prepare data with converted dates
      const submitData = {
        ...formData,
        startDate: convertDateToISO(formData.startDate),
        endDate: convertDateToISO(formData.endDate)
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          navigate('/auth/login')
          return
        }
        throw new Error(fetchType === 'create' ? 'Failed to create vacancy' : 'Failed to update vacancy')
      }

      // Refresh vacancies list
      const vacanciesResponse = await fetch('http://localhost:3000/admin/vacancies', {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      const updatedVacancies = await vacanciesResponse.json()
      setVacanciesList(updatedVacancies)

      handleReset()
      setNotification({ 
        isOpen: true, 
        message: fetchType === 'create' ? 'Vacancy created successfully!' : 'Vacancy updated successfully!', 
        type: 'success' 
      })
    } catch (error) {
      console.error('Error:', error)
      setNotification({ 
        isOpen: true, 
        message: error.message || 'An error occurred. Please try again.', 
        type: 'error' 
      })
    }
  }

  const handleDeleteClick = (vacancyId) => {
    setVacancyToDelete(vacancyId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!vacancyToDelete) return

    try {
      const response = await fetch(`http://localhost:3000/admin/vacancy/${vacancyToDelete}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          navigate('/auth/login')
          return
        }
        throw new Error('Failed to delete vacancy')
      }

      // Refresh vacancies list
      const vacanciesResponse = await fetch('http://localhost:3000/admin/vacancies', {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      const updatedVacancies = await vacanciesResponse.json()
      setVacanciesList(updatedVacancies)

      // Reset form if the deleted vacancy was selected
      if (selectedVacancy?.id === vacancyToDelete) {
        handleReset()
      }

      setNotification({ 
        isOpen: true, 
        message: 'Vacancy deleted successfully!', 
        type: 'success' 
      })
    } catch (error) {
      console.error('Error deleting vacancy:', error)
      setNotification({ 
        isOpen: true, 
        message: error.message || 'Failed to delete vacancy. Please try again.', 
        type: 'error' 
      })
    } finally {
      setShowDeleteDialog(false)
      setVacancyToDelete(null)
    }
  }

  return (
    <div className='grid grid-cols-[1fr_500px] gap-4 p-4'>
      {/* Vacancy Form */}
      <div className='bg-white h-fit border rounded-xl font-jost p-5'>
        <h1 className='text-3xl font-medium mb-6'>
          {selectedVacancy ? 'Update Vacancy' : 'Post Vacancy'}
        </h1>

        <form onSubmit={handleSubmit} className='space-y-4'>
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
              required
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
            />
          </div>

          {/* Location & Salary */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
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
                  required
                  className='w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                />
                <LocationIcon className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Salary
              </label>
              <input
                type='text'
                name='salary'
                value={formData.salary}
                onChange={handleInputChange}
                placeholder='e.g. 12,000'
                required
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
              />
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

          {/* Type and Category */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Type
              </label>
              <select
                name='type'
                value={formData.type}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white'
              >
                <option value='Full Time'>Full Time</option>
                <option value='Part Time'>Part Time</option>
                <option value='Contract'>Contract</option>
                <option value='Temporary'>Temporary</option>
                <option value='Internship'>Internship</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Category
              </label>
              <select
                name='category'
                value={formData.category}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white'
              >
                <option value='Technology'>Technology</option>
                <option value='Environment'>Environment</option>
                <option value='Infrastructure'>Infrastructure</option>
                <option value='Health'>Health</option>
                <option value='Education'>Education</option>
                <option value='Security'>Security</option>
                <option value='Event'>Event</option>
              </select>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Short Description (Max 200 characters)
            </label>
            <input
              type='text'
              name='shortDescription'
              value={formData.shortDescription}
              onChange={handleInputChange}
              placeholder='Enter a brief summary of the position'
              maxLength={200}
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
            />
            <p className='text-xs text-gray-500 text-right mt-1'>
              {formData.shortDescription.length}/200 characters
            </p>
          </div>

          {/* Vacancy Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Detailed Job Description
            </label>
            <textarea
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder='Enter detailed job description'
              rows={4}
              required
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] resize-none'
            />
          </div>

          {/* Skills */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Skills
            </label>
            <div className='flex gap-2 mb-2'>
              <input
                type='text'
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleSkillKeyPress}
                placeholder='Enter a skill'
                className='flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
              />
              <button
                type='button'
                onClick={handleAddSkill}
                className='px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#2A2A2A] font-medium cursor-pointer active:scale-98 flex items-center justify-center min-w-[50px]'
                title='Add skill'
              >
                <span className='text-xl font-bold'>+</span>
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className='inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm cursor-pointer'
                    title='Click to edit'
                    onClick={() => {
                      setNewSkill(skill)
                      handleRemoveSkill(skill)
                    }}
                  >
                    {skill}
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveSkill(skill)
                      }}
                      className='text-red-600 hover:text-red-800 font-bold cursor-pointer'
                      title='Remove skill'
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Responsibilities */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Responsibilities
            </label>
            <div className='flex gap-2 mb-2'>
              <input
                type='text'
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                onKeyPress={handleResponsibilityKeyPress}
                placeholder='Add a responsibility'
                className='flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
              />
              <button
                type='button'
                onClick={handleAddResponsibility}
                className='px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#2A2A2A] font-medium cursor-pointer active:scale-98 flex items-center justify-center min-w-[50px]'
                title='Add responsibility'
              >
                <span className='text-xl font-bold'>+</span>
              </button>
            </div>
            {formData.responsibilities.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {formData.responsibilities.map((item, index) => (
                  <span
                    key={index}
                    className='inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm cursor-pointer'
                    title={item}
                    onClick={() => {
                      setNewResponsibility(item)
                      handleRemoveResponsibility(item)
                    }}
                  >
                    {getShortLabel(item)}
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveResponsibility(item)
                      }}
                      className='text-red-600 hover:text-red-800 font-bold cursor-pointer'
                      title='Remove responsibility'
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Qualifications */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Qualifications
            </label>
            <div className='flex gap-2 mb-2'>
              <input
                type='text'
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                onKeyPress={handleQualificationKeyPress}
                placeholder='Add a qualification'
                className='flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
              />
              <button
                type='button'
                onClick={handleAddQualification}
                className='px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#2A2A2A] font-medium cursor-pointer active:scale-98 flex items-center justify-center min-w-[50px]'
                title='Add qualification'
              >
                <span className='text-xl font-bold'>+</span>
              </button>
            </div>
            {formData.qualifications.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {formData.qualifications.map((item, index) => (
                  <span
                    key={index}
                    className='inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm cursor-pointer'
                    title={item}
                    onClick={() => {
                      setNewQualification(item)
                      handleRemoveQualification(item)
                    }}
                  >
                    {getShortLabel(item)}
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveQualification(item)
                      }}
                      className='text-red-600 hover:text-red-800 font-bold cursor-pointer'
                      title='Remove qualification'
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 justify-end pt-4'>
            <button
              type='button'
              onClick={handleReset}
              className='px-6 py-2  text-gray-700 rounded-full shadow-md shadow-gray-400 hover:bg-gray-100 font-medium cursor-pointer active:scale-98'
            >
              Reset
            </button>
            <button
              type='submit'
              className='px-6 py-2 bg-[#3A3A3A] text-white rounded-full shadow-md shadow-gray-400 hover:bg-[#2A2A2A] font-medium cursor-pointer active:scale-98'
            >
              {selectedVacancy ? 'Update' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Vacancies List */}
      <div className='bg-white border rounded-xl font-jost p-5 space-y-5 overflow-y-auto h-fit'>
        <h1 className='text-3xl font-medium'>Vacancies</h1>

        {/* Table Header */}
        <div className='flex gap-2 text-[#818181] text-sm font-medium pb-2'>
          <button
            type='button'
            onClick={() => handleSort('title')}
            className='w-[30%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
          >
            Job title
            <SortIcon />
          </button>
          <button
            type='button'
            onClick={() => handleSort('date')}
            className='w-[20%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
          >
            Date
            <SortIcon />
          </button>
          <button
            type='button'
            onClick={() => handleSort('type')}
            className='w-[25%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
          >
            Type
            <SortIcon />
          </button>
          <button
            type='button'
            onClick={() => handleSort('salary')}
            className='w-[20%] text-left flex items-center gap-0.5 cursor-pointer hover:text-black'
          >
            Salary
            <SortIcon />
          </button>
          <p className='w-[5%]'></p>
        </div>

        <div className='space-y-3'>
          {isLoading ? (
            <div className='w-full flex justify-center items-center p-8'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-[#3A3A3A]'></div>
            </div>
          ) : vacanciesList.length === 0 ? (
            <div className='w-full text-center p-8 text-gray-500'>
              No vacancies found. Create your first vacancy.
            </div>
          ) : (
            sortedVacancies.map((vacancy) => (
              <div key={vacancy.id} onClick={() => handleVacancyClick(vacancy)} className={`flex flex-col gap-2 text-sm cursor-pointer transition-colors pb-3 ${selectedVacancy?.id === vacancy.id ? 'bg-gray-50' : ''}`} >
                <div className='flex items-center gap-2 text-sm'>
                  <p className='w-[30%] font-medium'>{vacancy.title}</p>
                  <p className='w-[20%]'>{vacancy.formatted_date.split('-')[0] + '-' + vacancy.formatted_date.split('-')[1] || 'N/A'}</p>
                  <p className='w-[25%]'>{vacancy.type}</p>
                  <p className='w-[20%]'>{vacancy.salary}</p>

                  <div className='w-[5%] flex gap-2 justify-end'>
                    <button onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(vacancy.id)
                      }}
                      className='p-1 cursor-pointer active:scale-97'
                    >
                      <TrashIcon className='w-4 h-4 text-red-600' />
                    </button>
                  </div>

                </div>

                <hr className='text-[#DEDEDE]' /> 
              </div>
              
            ))
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Vacancy"
        message="Are you sure you want to delete this vacancy? This action cannot be undone."
        confirmText="Delete"
        confirmButtonStyle="bg-red-600 hover:bg-red-700"
      />

      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        message={notification.message}
        type={notification.type}
      />
    </div>
  )
}

export default Vaccancy
