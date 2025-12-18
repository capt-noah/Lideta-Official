import { useState, useEffect, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import LocationIcon from '../../assets/icons/location_icon.svg?react'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import SortIcon from '../../assets/icons/sort_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon2.svg?react'
import FileIcon from '../../assets/icons/file_icon.svg?react'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import Notification from '../../components/ui/Notification'
import { adminContext } from '../../components/utils/AdminContext.jsx'

import Status from '../../components/ui/Status.jsx'
import LoadingButton from '../../components/ui/LoadingButton'

function Vaccancy() {
  const [selectedVacancy, setSelectedVacancy] = useState(null)
  const [vacanciesList, setVacanciesList] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [vacancyToDelete, setVacancyToDelete] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const [applicantsList, setApplicantsList] = useState([])
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [cvFile, setCvFile] = useState(null)
  const [applicantFormData, setApplicantFormData] = useState({
    id: '',
    vacancyId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cvPath: '',
    status: 'submitted', // Default status set to 'submitted'
    category: ''
  })

  const { token } = useContext(adminContext)
  const navigate = useNavigate()

  // Fetch vacancies from API
  useEffect(() => {
    async function getVacancies() {
      try {
        const response = await fetch('/admin/vacancies', {
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

  // Fetch applicants from API
  useEffect(() => {
    async function getApplicants() {
      try {
        const response = await fetch('/admin/applicants', {
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
          throw new Error('Failed to fetch applicants')
        }

        const list = await response.json()
        console.log(list)
        setApplicantsList(list)
      } catch (error) {
        console.error('Error fetching applicants:', error)
        setNotification({ isOpen: true, message: 'Failed to load applicants. Please try again.', type: 'error' })
      }
    }

    if (token) {
      getApplicants()
    }
  }, [token, navigate])

  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
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
      responsibilities: Array.isArray(vacancy.responsibilities) ? vacancy.responsibilities : [],
      qualifications: Array.isArray(vacancy.qualifications) ? vacancy.qualifications : []
    })
  }

  const handleApplicantInputChange = (e) => {
    const { name, value } = e.target
    
    // Auto-update category when vacancy changes
    if (name === 'vacancyId') {
      const selectedVacancy = vacanciesList.find(v => v.id === value)
      setApplicantFormData(prev => ({ 
        ...prev, 
        [name]: value,
        category: selectedVacancy?.category || prev.category
      }))
    } else {
      setApplicantFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0])
    }
  }

  const handleApplicantSelect = (applicant) => {
    console.log('Selected applicant:', applicant) // Debug log
    setSelectedApplicant(applicant)
    setIsEditing(false)
    
    // Find the full vacancy details to get the correct ID
    const vacancy = vacanciesList.find(v => 
      v.id === applicant.vacancy_id || 
      v.id === applicant.vacancyId ||
      v.title === applicant.vacancy_title
    )
    
    console.log('Found vacancy:', vacancy) // Debug log
    
    setApplicantFormData({
      id: applicant.id,
      vacancyId: vacancy?.id || applicant.vacancy_id || applicant.vacancyId || '',
      firstName: applicant.first_name || applicant.firstName || '',
      lastName: applicant.last_name || applicant.lastName || '',
      email: applicant.email || '',
      phone: applicant.phone || '',
      cvPath: applicant.cv_path || applicant.cvPath || '',
      status: applicant.status || 'submitted',
      category: applicant.category || vacancy?.category || ''
    })
  }

  const handleCancelEdit = () => {
    if (selectedApplicant) {
      // Find the full vacancy details to get the correct ID
      const vacancy = vacanciesList.find(v => 
        v.id === selectedApplicant.vacancy_id || 
        v.id === selectedApplicant.vacancyId ||
        v.title === selectedApplicant.vacancy_title
      )
      
      setApplicantFormData({
        id: selectedApplicant.id,
        vacancyId: vacancy?.id || selectedApplicant.vacancy_id || selectedApplicant.vacancyId || '',
        firstName: selectedApplicant.first_name || selectedApplicant.firstName || '',
        lastName: selectedApplicant.last_name || selectedApplicant.lastName || '',
        email: selectedApplicant.email || '',
        phone: selectedApplicant.phone || '',
        cvPath: selectedApplicant.cv_path || selectedApplicant.cvPath || '',
        status: selectedApplicant.status || 'submitted',
        category: selectedApplicant.category || vacancy?.category || ''
      })
    }
    setIsEditing(false)
    setCvFile(null)
  }

  const handleApplicantSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      
      // Prepare the data object for both new and existing applicants
      const applicantData = {
        first_name: applicantFormData.firstName || '',
        last_name: applicantFormData.lastName || '',
        email: applicantFormData.email || '',
        phone: applicantFormData.phone || '',
        status: applicantFormData.status || 'submitted',
        vacancy_id: applicantFormData.vacancyId || '',
        category: applicantFormData.category || ''
      }
      
      // Append all fields to formData
      Object.entries(applicantData).forEach(([key, value]) => {
        formData.append(key, value)
      })
      if (cvFile) formData.append('cv', cvFile)

      const endpoint = applicantFormData.id 
        ? `/admin/applicants/${applicantFormData.id}`
        : `/admin/applicants`

      const response = await fetch(endpoint, {
        method: applicantFormData.id ? 'PUT' : 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process applicant')
      }

      const result = await response.json()
      
      // Update the applicants list
      if (applicantFormData.id) {
        // Get the current vacancy for the updated applicant
        const vacancy = vacanciesList.find(v => v.id === (result.vacancy_id || applicantFormData.vacancyId))
        
        // Update existing applicant with the full result from the server
        setApplicantsList(prev => 
          prev.map(a => a.id === result.id ? {
            ...a,
            ...result,
            first_name: result.first_name || a.first_name,
            last_name: result.last_name || a.last_name,
            full_name: `${result.first_name || a.first_name} ${result.last_name || a.last_name}`.trim(),
            vacancy_id: result.vacancy_id || a.vacancy_id,
            vacancy_title: vacancy?.title || a.vacancy_title,
            category: vacancy?.category || a.category,
            status: result.status || a.status || 'submitted'
          } : a)
        )
        setNotification({ isOpen: true, message: 'Applicant updated successfully', type: 'success' })
      } else {
        // Add new applicant with proper structure
        const vacancy = vacanciesList.find(v => v.id === result.vacancy_id)
        const newApplicant = {
          ...result,
          full_name: `${result.first_name} ${result.last_name}`.trim(),
          vacancy_title: vacancy?.title || '',
          category: vacancy?.category || '',
          status: result.status || 'submitted'
        }
        setApplicantsList(prev => [newApplicant, ...prev])
        setNotification({ isOpen: true, message: 'Applicant added successfully', type: 'success' })
      }
      
      // Reset form
      setApplicantFormData({ 
        id: '',
        vacancyId: '', 
        firstName: '', 
        lastName: '', 
        email: '', 
        phone: '',
        cvPath: '',
        category: ''
      })
      setCvFile(null)
      setSelectedApplicant(null)
      setIsEditing(false)
      
    } catch (error) {
      console.error('Error processing applicant:', error)
      setNotification({ 
        isOpen: true, 
        message: error.message || 'Failed to process applicant. Please try again.', 
        type: 'error' 
      })
    } finally {
        setIsSubmitting(false)
    }
  }

  const sortedApplicants = useMemo(() => {
    if (!applicantsList) return []
    const sorted = [...applicantsList]
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]
        if (sortConfig.key === 'applied_date') {
          aVal = new Date(a.created_at)
          bVal = new Date(b.created_at)
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sorted
  }, [applicantsList, sortConfig])

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const fetchType = formData.id === '' ? 'create' : 'update'
      const url = `/admin/${fetchType}/vacancy`

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

      const vacanciesResponse = await fetch('/admin/vacancies', {
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
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (vacancyId) => {
    setVacancyToDelete(vacancyId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!vacancyToDelete) return

    try {
      const response = await fetch(`/admin/vacancy/${vacancyToDelete}`, {
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

      const vacanciesResponse = await fetch('/admin/vacancies', {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      const updatedVacancies = await vacanciesResponse.json()
      setVacanciesList(updatedVacancies)

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

  const convertDateToISO = (dateString) => {
    if (!dateString) return null
    const parts = dateString.split(' - ')
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0')
      const month = parts[1].padStart(2, '0')
      const year = '20' + parts[2]
      return `${year}-${month}-${day}`
    }
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
    return dateString
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

  if (isLoading) return (
    <div className='grid grid-cols-[1fr_500px] gap-4 p-4 animate-pulse'>
      {/* Form Skeleton */}
      <div className='bg-white h-fit border rounded-xl font-jost p-5 space-y-6'>
         <div className='h-8 w-48 bg-gray-200 rounded mb-6'></div>
         
         <div className='space-y-6'>
           {/* Title */}
           <div className='space-y-2'>
              <div className='h-4 w-16 bg-gray-200 rounded'></div>
              <div className='h-10 w-full bg-gray-100 rounded-md'></div>
           </div>

           {/* Location & Salary */}
           <div className='grid grid-cols-2 gap-5'>
              <div className='space-y-2'>
                 <div className='h-4 w-20 bg-gray-200 rounded'></div>
                 <div className='h-10 w-full bg-gray-100 rounded-md'></div>
              </div>
              <div className='space-y-2'>
                 <div className='h-4 w-20 bg-gray-200 rounded'></div>
                 <div className='h-10 w-full bg-gray-100 rounded-md'></div>
              </div>
           </div>

           {/* Dates */}
           <div className='grid grid-cols-2 gap-5'>
              <div className='space-y-2'>
                 <div className='h-4 w-20 bg-gray-200 rounded'></div>
                 <div className='h-10 w-full bg-gray-100 rounded-md'></div>
              </div>
              <div className='space-y-2'>
                 <div className='h-4 w-20 bg-gray-200 rounded'></div>
                 <div className='h-10 w-full bg-gray-100 rounded-md'></div>
              </div>
           </div>

           {/* Type & Category */}
           <div className='grid grid-cols-2 gap-5'>
              <div className='space-y-2'>
                 <div className='h-4 w-20 bg-gray-200 rounded'></div>
                 <div className='h-10 w-full bg-gray-100 rounded-md'></div>
              </div>
              <div className='space-y-2'>
                 <div className='h-4 w-20 bg-gray-200 rounded'></div>
                 <div className='h-10 w-full bg-gray-100 rounded-md'></div>
              </div>
           </div>

           {/* Short Description */}
           <div className='space-y-2'>
              <div className='h-4 w-32 bg-gray-200 rounded'></div>
              <div className='h-16 w-full bg-gray-100 rounded-md'></div>
           </div>

           {/* Long Description */}
           <div className='space-y-2'>
              <div className='h-4 w-40 bg-gray-200 rounded'></div>
              <div className='h-40 w-full bg-gray-100 rounded-md'></div>
           </div>
         </div>
      </div>

      {/* List Skeleton */}
      <div className='bg-white border rounded-xl font-jost p-5 space-y-5 h-full'>
         <div className='flex justify-between items-center mb-4'>
            <div className='h-8 w-32 bg-gray-200 rounded'></div>
            <div className='flex gap-4 w-full mt-4 pl-1'>
               <div className='h-4 w-[30%] bg-gray-100 rounded'></div>
               <div className='h-4 w-[20%] bg-gray-100 rounded'></div>
               <div className='h-4 w-[25%] bg-gray-100 rounded'></div>
               <div className='h-4 w-[20%] bg-gray-100 rounded'></div>
            </div>
         </div>

         <div className='space-y-4'>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
               <div key={i} className='flex flex-col space-y-3 pb-2'>
                  <div className='flex items-center gap-2'>
                     <div className='h-5 w-[30%] bg-gray-200 rounded'></div>
                     <div className='h-5 w-[20%] bg-gray-100 rounded'></div>
                     <div className='h-5 w-[25%] bg-gray-100 rounded'></div>
                     <div className='h-5 w-[20%] bg-gray-100 rounded'></div>
                     <div className='h-5 w-[5%] bg-gray-100 rounded'></div>
                  </div>
                  <hr className='border-gray-100' />
               </div>
            ))}
         </div>
      </div>
    </div>
  )

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
            <LoadingButton
              type='submit'
              isLoading={isSubmitting}
              className='px-6 py-2 bg-[#3A3A3A] text-white rounded-full shadow-md shadow-gray-400 hover:bg-[#2A2A2A] font-medium active:scale-98'
            >
              {selectedVacancy ? 'Update' : 'Post'}
            </LoadingButton>
          </div>
        </form>
      </div>

      {/* Vacancies List */}
      <div className='bg-white border rounded-xl font-jost p-5 space-y-5 overflow-y-auto h-250'>
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

      <hr className='w-full col-span-2 mt-10 mb-10 text-gray-300' />

      {/* Applicant Form */}
      <div className='bg-white border rounded-xl font-jost p-5 space-y-5'>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-medium'>Applicant Details</h1>
        </div>
        
        {selectedApplicant? (
          <form onSubmit={handleApplicantSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>First Name</label>
              <input
                type='text'
                name='firstName'
                value={applicantFormData.firstName}
                onChange={handleApplicantInputChange}
                placeholder='First Name'
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                disabled={!isEditing && selectedApplicant}
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name</label>
              <input
                type='text'
                name='lastName'
                value={applicantFormData.lastName}
                onChange={handleApplicantInputChange}
                placeholder='Last Name'
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                disabled={!isEditing && selectedApplicant}
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
              <input
                type='email'
                name='email'
                value={applicantFormData.email}
                onChange={handleApplicantInputChange}
                placeholder='Email'
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                disabled={!isEditing && selectedApplicant}
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Phone</label>
              <input
                type='tel'
                name='phone'
                value={applicantFormData.phone}
                onChange={handleApplicantInputChange}
                placeholder='Phone'
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                disabled={!isEditing && selectedApplicant}
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
              <select
                name='status'
                value={applicantFormData.status}
                onChange={handleApplicantInputChange}
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                disabled={!isEditing && selectedApplicant}
                required
              >
                <option value='submitted'>Submitted</option>
                <option value='reviewing'>Reviewing</option>
                <option value='accepted'>Accepted</option>
                <option value='rejected'>Rejected</option>
              </select>
            </div>

            <div>
             <label className='block text-sm font-medium text-gray-700 mb-1'>Category</label>
             <select
               name='category'
               value={applicantFormData.category}
               className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-gray-100'
               disabled={true}
             >
               <option value=''>Select Category</option>
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

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              CV / Resume
            </label>
            {applicantFormData.cvPath ? (
              <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-200'>
                <FileIcon className='w-5 h-5 text-gray-500' />
                <a 
                  href={`${applicantFormData.cvPath}`} 
                  target='_blank' 
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:text-blue-800 font-medium hover:underline'
                >
                  Click here to view CV
                </a>
                {isEditing && (
                  <label className='ml-auto px-3 py-1 text-sm bg-white border rounded-md cursor-pointer hover:bg-gray-50'>
                    Change
                    <input 
                      type='file' 
                      className='hidden' 
                      accept='application/pdf'
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            ) : isEditing || !selectedApplicant ? (
              <div className='flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-md'>
                <input 
                  type='file' 
                  id='cv-upload'
                  className='hidden' 
                  accept='application/pdf'
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor='cv-upload'
                  className='px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors'
                >
                  {cvFile ? cvFile.name : 'Upload CV (PDF)'}
                </label>
                <p className='mt-1 text-xs text-gray-500'>Max. file size: 5MB</p>
              </div>
            ) : (
              <p className='text-gray-500'>No CV uploaded</p>
            )}
          </div>

          <div className='flex justify-end space-x-3 pt-2'>
            {!isEditing && selectedApplicant && (
              <button
                type='button'
                onClick={() => setIsEditing(true)}
                className='px-6 py-2 bg-blue-600 text-white rounded-full shadow-md shadow-gray-400 hover:bg-blue-700 font-medium cursor-pointer active:scale-98'
              >
                Edit
              </button>
            )}
            
            {isEditing && (
              <>
                <button
                  type='button'
                  onClick={handleCancelEdit}
                  className='px-6 py-2 text-gray-700 bg-gray-100 rounded-full shadow-md shadow-gray-400 hover:bg-gray-200 font-medium cursor-pointer active:scale-98'
                >
                  Cancel
                </button>
                <LoadingButton
                  type='submit'
                  isLoading={isSubmitting}
                  className='px-6 py-2 bg-[#3A3A3A] text-white rounded-full shadow-md shadow-gray-400 hover:bg-[#2A2A2A] font-medium active:scale-98'
                >
                  Save Changes
                </LoadingButton>
              </>
            )}
            
          </div>
        </form>

        )
          
          :

          (
            <div className='w-full h-full flex justify-center mt-50 font-medium text-xl text-gray-400 ' >Please Select an Applicant to Edit</div>
          )
        
      
      }


      </div>

      {/* Applicants List */}
      <div className='bg-white border rounded-xl font-jost p-5 space-y-4 overflow-y-auto h-150'>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-medium'>Applicants</h1>
          <div className='text-sm text-gray-500'>
            {applicantsList.length} {applicantsList.length === 1 ? 'applicant' : 'applicants'}
          </div>
        </div>
        
        {/* Search and Filter */}
        {/* <div className='relative'>
          <input
            type='text'
            placeholder='Search applicants...'
            className='w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <svg
            className='absolute left-3 top-2.5 h-5 w-5 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div> */}

        {/* Table Header */}
        <div className='grid grid-cols-11 gap-2 text-sm font-medium text-gray-600'>
          
          <div className='col-span-4 flex items-center'>
            <button
              type='button'
              onClick={() => handleSort('full_name')}
              className='flex items-center gap-1 hover:text-black transition-colors'
            >
              Full name
              <SortIcon className='w-3 h-3' />
            </button>
          </div>

          <div className='col-span-3 flex items-center'>
            <button
              type='button'
              onClick={() => handleSort('applied_date')}
              className='flex items-center gap-1 hover:text-black transition-colors'
            >
              Category
              <SortIcon className='w-3 h-3' />
            </button>
          </div>

          <div className='col-span-2 flex items-center'>
            <button
              type='button'
              onClick={() => handleSort('applied_date')}
              className='flex items-center gap-1 hover:text-black transition-colors'
            >
              Date
              <SortIcon className='w-3 h-3' />
            </button>
          </div>

          <div className='col-span-2 text-center'>Status</div>
        </div>

        {/* Applicants List */}
        <div className='space-y-2'>
          {isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
            </div>
          ) : sortedApplicants.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              No applicants found. When you receive applications, they'll appear here.
            </div>
          ) : (
            sortedApplicants.map(applicant => (
              <div
                key={applicant.id}
                className={`grid grid-cols-11 gap-2 items-center py-2 rounded-lg transition-colors ${
                  selectedApplicant?.id === applicant.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleApplicantSelect(applicant)}
              >
                <div className='col-span-4 font-medium'>
                  <div className='font-medium'>{applicant.full_name || 'N/A'}</div>
                </div>

                <div className='col-span-3'>
                  <div className='text-sm text-gray-500'>{applicant.category || ''}</div>
                </div>

                <div className='col-span-2 text-sm text-gray-600'>
                  {applicant.applied_date ? 
                    `${applicant.applied_date.split('-')[0]}-${applicant.applied_date.split('-')[1]}` : 
                    'N/A'}
                </div>
                
                <div className='col-span-2 text-center'>
                  <Status status={applicant.status} />
                </div>

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
