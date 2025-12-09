import { useState } from 'react'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import EditIcon from '../../assets/icons/edit_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon.svg?react'
import ImageIcon from '../../assets/icons/image_icon.svg?react'

import Upload from '../../components/ui/Upload.jsx'

function News() {
  const [selectedNews, setSelectedNews] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    category: '',
    description: '',
    photo: null
  })

  const newsList = [
    {
      id: 1,
      title: 'News title',
      description: 'Drag and drop or browse image to add a cover for the news. Drag and drop or br..',
      date: 'Dec 12, 2025',
      category: 'category',
      photo: { name: 'news1.jpg' }
    },
    {
      id: 2,
      title: 'News title',
      description: 'Drag and drop or browse image to add a cover for the news. Drag and drop or br..',
      date: 'Dec 12, 2025',
      category: 'category',
      photo: null
    },
    {
      id: 3,
      title: 'News title',
      description: 'Drag and drop or browse image to add a cover for the news. Drag and drop or br..',
      date: 'Dec 12, 2025',
      category: 'category',
      photo: null
    },
    {
      id: 4,
      title: 'News title',
      description: 'Drag and drop or browse image to add a cover for the news. Drag and drop or br..',
      date: 'Dec 12, 2025',
      category: 'category',
      photo: null
    },
    {
      id: 5,
      title: 'News title',
      description: 'Drag and drop or browse image to add a cover for the news. Drag and drop or br..',
      date: 'Dec 12, 2025',
      category: 'category',
      photo: null
    }
  ]

  const categories = ['Technology', 'Infrastructure', 'Health', 'Education', 'Events', 'Security', 'Environment']

  const handleNewsClick = (news) => {
    setSelectedNews(news)
    setFormData({
      title: news.title,
      date: news.date,
      category: news.category,
      description: news.description,
      photo: news.photo || null
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
      date: '',
      category: '',
      description: '',
      photo: null
    })
    setSelectedNews(null)
  }

  const handleSubmit = () => {
    // Handle create/update logic here
    console.log('Form data:', formData)
    handleReset()
  }

  const handleDelete = (newsId) => {
    // Handle delete logic here
    console.log('Delete news:', newsId)
    if (selectedNews?.id === newsId) {
      handleReset()
    }
  }

  return (
    <div className='grid grid-cols-[1fr_500px] gap-4 p-4'>
      {/* News Form */}
      <div className='bg-white h-fit border rounded-xl font-jost p-5'>
        <h1 className='text-3xl font-medium mb-6'>
          {selectedNews ? 'Update News' : 'Create News'}
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
              placeholder='Enter news title'
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
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

          {/* News Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              News description
            </label>
            <textarea
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
              <Upload photo={formData.photo} setFormData={setFormData} />
            </div>
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
              {selectedNews ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className='bg-white border rounded-xl font-jost p-5 space-y-5 overflow-y-auto h-fit'>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-medium'>News</h1>
          <select className='px-2 py-1 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'>
            <option>Latest</option>
            <option>Oldest</option>
            <option>All</option>
          </select>
        </div>

        <div className='space-y-4'>
          {newsList.map((news) => (
            <div
              key={news.id}
              onClick={() => handleNewsClick(news)}
              className={`border-2 border-gray-200 rounded-2xl p-2 cursor-pointer transition-colors ${
                selectedNews?.id === news.id ? 'bg-gray-50 border-[#3A3A3A]' : 'hover:bg-gray-50'
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
                          handleDelete(news.id)
                        }}
                        className='w-7 h-7 flex justify-center items-center bg-red-600 hover:bg-red-500 rounded-full shadow-sm shadow-gray-400 cursor-pointer active:scale-97'
                      >
                        <TrashIcon className='w-4 h-4 text-white' />
                      </button>
                    </div>
                  </div>

                  <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{news.description}</p>

                  <div className='flex items-center gap-3 text-xs text-gray-600'>
                    <div className='flex items-center gap-1'>
                      <CalenderIcon className='w-4 h-4' />
                      <span>{news.date}</span>
                    </div>
                    <span className='px-2 py-1 bg-[#3A3A3A] text-white rounded-full text-xs'>
                      {news.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default News
