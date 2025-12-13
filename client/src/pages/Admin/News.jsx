import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import EditIcon from '../../assets/icons/edit_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon.svg?react'
import ImageIcon from '../../assets/icons/image_icon.svg?react'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import Notification from '../../components/ui/Notification'

import Upload from '../../components/ui/Upload.jsx'
import { adminContext } from '../../components/utils/AdminContext.jsx'

function News() {
  const [selectedNews, setSelectedNews] = useState(null)
  const [newsList, setNewsList] = useState()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [newsToDelete, setNewsToDelete] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState({ isOpen: false, message: '', type: 'success' })
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    date: '',
    category: '',
    shortDescription: '',
    description: '',
    photo: null
  })
  
  const { token } = useContext(adminContext)
  const navigate = useNavigate()

  // Fetch news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:3000/admin/news', {
          headers: {
            'authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch news')
        }
        
        const data = await response.json()
        console.log(data)
        setNewsList(data)
      } catch (error) {
        console.error('Error fetching news:', error)
        setNotification({ isOpen: true, message: 'Failed to load news. Please try again.', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchNews()
  }, [token])

  const categories = ['Technology', 'Infrastructure', 'Health', 'Education', 'Events', 'Security', 'Environment']

  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day} - ${month} - ${year}`
  }

  const handleNewsClick = (news) => {
    console.log(news)
    setSelectedNews(news)
    setFormData({
      news_id: news.id,
      title: news.title,
      date: formatDateForInput(news.created_at.split('T')[0]),
      category: news.category,
      shortDescription: news.short_description,
      description: news.description,
      photo: news.photo || null
    })
  }

  const handlePhotoUpload = () => {
    
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
      date: '',
      category: '',
      shortDescription: '',
      description: '',
      photo: null
    })
    setSelectedNews(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = selectedNews 
        ? 'http://localhost:3000/admin/update/news'
        : 'http://localhost:3000/admin/create/news'
      
      // Format photo as JSON object
      let photoData = null
      if (formData.photo) {
        if (Array.isArray(formData.photo)) {
          photoData = formData.photo.length > 0 ? formData.photo[0] : null
        } else if (typeof formData.photo === 'object' && formData.photo.name) {
          photoData = formData.photo
        }
      }

      const submitData = {
        ...formData,
        photo: photoData
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      console.log(formData)
      
      if (!response.ok) {
        throw new Error(selectedNews ? 'Failed to update news' : 'Failed to create news')
      }
      
      // Refresh news list
      const newsResponse = await fetch('http://localhost:3000/admin/news', {
        headers: {
          'authorization': `Bearer ${token}`
        }
      })
      const updatedNews = await newsResponse.json()
      setNewsList(updatedNews)
      
      // Reset form
      handleReset()
      
      setNotification({ 
        isOpen: true, 
        message: selectedNews ? 'News updated successfully!' : 'News created successfully!', 
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

  const handleDeleteClick = (newsId) => {
    setNewsToDelete(newsId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!newsToDelete) return


    try {
      const response = await fetch(`http://localhost:3000/admin/news/${newsToDelete}`, {
        method: 'DELETE',
        headers: {
          'authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete news')
      }
      
      // Refresh news list
      const newsResponse = await fetch('http://localhost:3000/admin/news', {
        headers: {
          'authorization': `Bearer ${token}`
        }
      })
      const updatedNews = await newsResponse.json()
      setNewsList(updatedNews)
      
      // Reset form if the deleted news was selected
      if (selectedNews?.news_id === newsToDelete) {
        handleReset()
      }
      
      setNotification({ 
        isOpen: true, 
        message: 'News deleted successfully!', 
        type: 'success' 
      })
    } catch (error) {
      console.error('Error deleting news:', error)
      setNotification({ 
        isOpen: true, 
        message: error.message || 'Failed to delete news. Please try again.', 
        type: 'error' 
      })
    } finally {
      setShowDeleteDialog(false)
      setNewsToDelete(null)
    }
  }

  return (
    <div className='grid grid-cols-[1fr_500px] gap-4 p-4'>
      {/* News Form */}
      <div className='bg-white h-fit border rounded-xl font-jost p-5'>
        <h1 className='text-3xl font-medium mb-6'>
          {selectedNews ? 'Update News' : 'Create News'}
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
              placeholder='Enter news title'
              required
              className='w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] focus:border-transparent'
            />
          </div>

          {/* Date and Category */}
          <div className='grid grid-cols-2 gap-5'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Date
              </label>
              <div className='relative'>
                <input
                  required
                  type='text'
                  name='date'
                  value={formData.date}
                  onChange={handleInputChange}
                  placeholder='DD/MM/YY'
                  className='w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                />
                <CalenderIcon className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Category
              </label>
              <select
                name='category'
                required
                value={formData.category}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
              >
                <option value=''>Select news category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Short Description <span className='text-xs text-gray-500'>(max 100 characters)</span>
            </label>
            <input
              type='text'
              name='shortDescription'
              value={formData.shortDescription || ''}
              onChange={handleInputChange}
              maxLength={100}
              placeholder='Enter a brief summary (max 100 characters)'
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] mb-4'
            />
            <div className='text-xs text-right text-gray-500 -mt-3 mb-3'>
              {formData.shortDescription ? formData.shortDescription.length : 0}/100 characters
            </div>
          </div>

          {/* News Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              News description
            </label>
            <textarea
              required
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder='Enter news description'
              rows={6}
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] resize-none'
            />
          </div>

          {/* Upload News Cover */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              {selectedNews ? 'Update news cover' : 'Upload news cover'}
            </label>
            <p className='text-xs text-gray-500 mb-2'>
              {selectedNews 
                ? 'Drag and drop or browse image to update the cover for the news'
                : 'Drag and drop or browse image to add a cover for the news'}
            </p>
            <div className='min-h-[200px]'>
              <Upload 
                onFileUpload={handlePhotoUpload} 
                initialFile={formData.photo}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 justify-end pt-4'>
            <button 
              type='button' 
              onClick={handleReset}
              className='px-6 py-2 text-gray-700 rounded-full shadow-md shadow-gray-400 hover:bg-gray-100 font-medium cursor-pointer active:scale-98'
            >
              Cancel
            </button>
            <button 
              type='submit' 
              className='px-6 py-2 bg-[#3A3A3A] text-white rounded-full shadow-md shadow-gray-400 hover:bg-[#2A2A2A] font-medium cursor-pointer active:scale-98'
            >
              {selectedNews ? 'Update' : 'Save'}
            </button>

          </div>

        </form>
      </div>

      {/* News List */}
      <div className='bg-white border rounded-xl font-jost p-5 space-y-5 overflow-y-auto h-227'>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-medium'>News</h1>
          <select className='px-2 py-1 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'>
            <option>Latest</option>
            <option>Oldest</option>
            <option>All</option>
          </select>
        </div>

        <div className='space-y-4'>
          {isLoading ? (
            <div className='w-full flex justify-center items-center p-8'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3A3A3A]'></div>
            </div>
          ) : newsList.length === 0 ? (
            <div className='w-full text-center p-8 text-gray-500'>
              No news found. Create your first news item.
            </div>
          ) : (
            newsList.map((news) => (
              <div
                key={news.news_id}
                onClick={() => handleNewsClick(news)}
                className={`border-2 border-gray-200 rounded-2xl p-2 cursor-pointer transition-colors ${
                  selectedNews?.news_id === news.news_id ? 'bg-gray-50 border-[#3A3A3A]' : 'hover:bg-gray-50'
                }`}
              >
                <div className='flex gap-4'>
                  {/* Image Placeholder */}
                  <div className='w-28 h-28 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0'>
                    {news.photo ? (
                      <ImageIcon className='w-12 h-12 opacity-50' />
                    ) : (
                      <ImageIcon className='w-12 h-12 opacity-30' />
                    )}
                  </div>

                  {/* News Details */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between mb-2'>
                      <h3 className='font-semibold text-lg text-[#3A3A3A] truncate'>{news.title}</h3>
                      <div className='flex gap-2 flex-shrink-0'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleNewsClick(news)
                          }}
                          className='w-7 h-7 flex justify-center items-center bg-[#3A3A3A] hover:bg-[#4e4e4e] rounded-full shadow-sm shadow-gray-400 cursor-pointer active:scale-97'
                        >
                          <EditIcon className='w-4 h-4 text-white' />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(news.id)
                          }}
                          className='w-7 h-7 flex justify-center items-center bg-red-600 hover:bg-red-500 rounded-full shadow-sm shadow-gray-400 cursor-pointer active:scale-97'
                        >
                          <TrashIcon className='w-4 h-4 text-white' />
                        </button>
                      </div>
                    </div>

                    <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{news.short_description}</p>

                    <div className='flex items-center gap-3 text-xs text-gray-600'>
                      <div className='flex items-center gap-2 border border-gray-400 px-2 py-1 rounded-full '>
                        <CalenderIcon className='w-4 h-4' />
                        <span>{news.formatted_date}</span>
                      </div>
                      <span className='px-2 py-1 bg-[#3A3A3A] text-white rounded-full text-xs'>
                        {news.category}
                      </span>
                    </div>
                  </div>
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
        title="Delete News"
        message="Are you sure you want to delete this news?"
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

export default News
