import React, { useState, useEffect } from 'react'
import { useLanguage } from '../components/utils/LanguageContext'
import { useNavigate, useParams } from 'react-router-dom'
import RelatedNewsItem from '../components/ui/RelatedNewsItem'
import Loading from '../components/ui/Loading'
import newsData from '../data/news.json'
import translatedContents from '../data/translated_contents.json'
import ArrowRight from '../assets/icons/arrow_right.svg?react'
import ImageIcon from '../assets/icons/image_icon.svg?react'
import InstagramIcon from '../assets/icons/instagram_icon.svg?react'
import FacebookIcon from '../assets/icons/facebook_icon.svg?react'
import TwitterIcon from '../assets/icons/twitter_icon.svg?react'
import MailIcon from '../assets/icons/mail_icon.svg?react'
import TelegramIcon from '../assets/icons/telegram_icon.svg?react'

function NewsDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { language } = useLanguage()
  const t = translatedContents.news_page.details
  const [currentNews, setCurrentNews] = useState(null)
  const [relatedNews, setRelatedNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch news from API
  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch('/api/news')
        if (response.ok) {
          const data = await response.json()
          const newsItem = data.find(item => item.id.toString() === id) || data[0]
          
          // Determine language-specific content
          let title = newsItem.title
          let description = newsItem.description
          let category = newsItem.category

          if (language === 'am' && newsItem.amh) {
            title = newsItem.amh.title || title
            description = newsItem.amh.description || description
            category = newsItem.amh.category || category
          } else if (language === 'or' && newsItem.orm) {
            title = newsItem.orm.title || title
            description = newsItem.orm.description || description
            category = newsItem.orm.category || category
          }

          // Format current news
          const formattedNews = {
            id: newsItem.id.toString(),
            title: title,
            category: category,
            date: newsItem.formatted_date || newsItem.created_at?.split('T')[0] || '',
            content: description ? description.split('\n').filter(p => p.trim()) : ['No content available'],
            photo: newsItem.photo
          }
          setCurrentNews(formattedNews)

          // Format related news
          const related = data
            .filter(item => item.id.toString() !== id)
            .slice(0, 6)
            .map(item => {
                let rTitle = item.title
                let rCategory = item.category
                
                if (language === 'am' && item.amh) {
                    rTitle = item.amh.title || rTitle
                    rCategory = item.amh.category || rCategory
                } else if (language === 'or' && item.orm) {
                    rTitle = item.orm.title || rTitle
                    rCategory = item.orm.category || rCategory
                }
                return {
                  id: item.id.toString(),
                  title: rTitle,
                  category: rCategory,
                  photo: item?.photo || null
                }
            })
          setRelatedNews(related)
        } else {
          // Fallback to JSON data
          const newsItem = newsData.find(item => item.id === id) || newsData[0]
          setCurrentNews(newsItem)
          const related = newsData
            .filter(item => item.id !== id)
            .slice(0, 6)
            .map(item => ({
              id: item.id,
              title: item.title,
              category: item.category || item.type,
              photo: item?.photo || null
            }))
          setRelatedNews(related)
        }
      } catch (error) {
        console.error('Error fetching news:', error)
        // Fallback to JSON data
        const newsItem = newsData.find(item => item.id === id) || newsData[0]
        setCurrentNews(newsItem)
        const related = newsData
          .filter(item => item.id !== id)
          .slice(0, 6)
          .map(item => ({
            id: item.id,
            title: item.title,
            category: item.category || item.type,
            photo: item?.photo || null
          }))
        setRelatedNews(related)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNews()
  }, [id, language])

  if (isLoading || !currentNews) {
    return (
      <div className='w-full flex justify-center items-center h-screen'>
        <Loading />
      </div>
    )
  }

  // Get image source from photo data
  const getImageSrc = () => {
    if (currentNews.photo) {
      if (typeof currentNews.photo === 'object' && currentNews.photo.path) {
        return `${currentNews.photo.path}`
      } else if (typeof currentNews.photo === 'string') {
        try {
          const parsed = JSON.parse(currentNews.photo)
          if (parsed.path) return `${parsed.path}`
        } catch (e) {
          if (currentNews.photo.startsWith('/')) return `${currentNews.photo}`
        }
      }
    }
    return null
  }

  const imageSrc = getImageSrc()

  const handleRelatedNewsClick = (newsId) => {
    navigate(`/news/${newsId}`)
  }

  const socials = [
    {icon: InstagramIcon},
    {icon: FacebookIcon},
    {icon: TwitterIcon},
    {icon: MailIcon},
    {icon: TelegramIcon},
  ]

  return (
    <div className='w-full px-2 bg-white'>
      <div className='w-full py-6'>
        {/* Back Button */}
        <button
          onClick={() => navigate('/news')}
          className='bg-[#3A3A3A] left-[1%] relative flex items-center gap-2 mb-6 font-roboto font-medium text-xs lg:text-base text-white py-2 px-2 lg:px-4 rounded-full hover:bg-[#202020] active:scale-99 transition-colors cursor-pointer'
        >
          <ArrowRight className='w-4 h-4 rotate-180' />
          <span>{t ? t.back_to_news[language] : 'Back to News'}</span>
        </button>

        <div className='w-full mx-auto flex flex-col gap-16 items-start lg:flex-row lg:gap-4'>
          {/* Main Article Content */}
          <div className='mx-auto w-full flex flex-col md:max-w-3xl lg:max-w-3xl xl:max-w-4xl'>
            {/* Article Title */}
            <h1 className='font-goldman font-bold text-2xl md:text-3xl lg:text-4xl mb-4'>
              {currentNews.title}
            </h1>

            {/* Metadata */}
            <div className='flex items-center gap-3 mb-6 font-roboto text-sm text-gray-700 flex-wrap'>
              <span className='font-medium'>{currentNews.category}</span>
              <span>•</span>
              <span>{currentNews.date}</span>
            </div>

            {/* Article Image */}
            <div className='bg-[#D9D9D9] w-full h-80 sm:h-100 lg:h-120 xl:h-130 rounded-lg mb-6 flex items-center justify-center overflow-hidden relative'>
              {imageSrc ? (
                <img 
                  src={imageSrc} 
                  alt={currentNews.title || 'News image'} 
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextElementSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className={`${imageSrc ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                <ImageIcon className='w-24 h-24 opacity-50' />
              </div>
            </div>

            {/* Article Body */}
            <div className='font-roboto text-base leading-tight space-y-4 text-gray-800'>
              {currentNews.content.map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <hr className='text-gray-300 w-full lg:hidden' />

          {/* Right Sidebar */}
          <div className='flex mx-auto flex-col gap-8 lg:max-w-sm xl:max-w-100 2xl:max-w-150 2xl:gap-16'>
            {/* Share to Section */}
            <div>
              <h2 className='font-goldman font-bold text-xl mb-4'>Share to</h2>

              <div className='flex flex-wrap gap-3'>
                {
                  socials.map((social, index) => {
                    return (
                      <button key={index} className='w-12 h-12 bg-[#3A3A3A] rounded-full flex items-center justify-center hover:bg-[#2A2A2A] transition-colors cursor-pointer hover:scale-104 transition-all'>
                        <social.icon className='w-6 h-6 text-white' />
                      </button>
                    )
                  })
                }
              </div>
            </div>

            <div className='min-w-95 sm:w-full' >
              <h2 className='font-goldman font-bold text-xl mb-4'>Related News</h2>

              <div className='space-y-3  2xl:space-y-6'>
                {
                  relatedNews.map((news) => {
                    console.log(news)
                    return <RelatedNewsItem key={news.id} title={news.title} category={news.category} path={news.photo?.path || null} onClick={() => handleRelatedNewsClick(news.id)} />
                  })
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsDetails

