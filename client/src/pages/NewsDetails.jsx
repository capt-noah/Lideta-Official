import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import RelatedNewsItem from '../components/ui/RelatedNewsItem'
import newsData from '../data/news.json'
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

  // Find the current news item from JSON data
  const currentNews = newsData.find(item => item.id === id) || newsData[0]

  // Get related news (exclude current news and limit to 6 items)
  const relatedNews = newsData
    .filter(item => item.id !== id)
    .slice(0, 6)
    .map(item => ({
      id: item.id,
      title: item.title,
      category: item.category || item.type
    }))

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
    <div className='w-full min-h-screen bg-white'>
      <div className='max-w-7xl mx-auto px-4 py-2'>
        {/* Back Button */}
        <button onClick={() => navigate('/news')} className=' bg-[#3A3A3A] flex items-center gap-2 mb-6 font-roboto font-medium text-white py-2 px-4 rounded-full hover:bg-[#202020] active:scale-99 transition-colors cursor-pointer '>
          <ArrowRight className='w-4 h-4 rotate-180' />
          <span>Back to News</span>
        </button>

        <div className='grid grid-cols-[1fr_320px] gap-8'>
          {/* Main Article Content */}
          <div className='flex flex-col'>
            {/* Article Title */}
            <h1 className='font-goldman font-bold text-4xl mb-4'>
              {currentNews.title}
            </h1>

            {/* Metadata */}
            <div className='flex items-center gap-4 mb-6 font-roboto text-sm text-gray-600'>
              <span className='font-medium'>{currentNews.category}</span>
              <span>•</span>
              <span>{currentNews.date}</span>
            </div>

            {/* Article Image */}
            <div className='bg-[#D9D9D9] w-full h-96 rounded-lg mb-6 flex items-center justify-center'>
              <ImageIcon className='w-24 h-24 opacity-50' />
            </div>

            {/* Article Body */}
            <div className='font-roboto text-base leading-relaxed space-y-4'>
              {currentNews.content.map((paragraph, index) => (
                <p key={index} className='text-gray-800'>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className='flex flex-col gap-8'>
            {/* Share to Section */}
            <div>
              <h2 className='font-goldman font-bold text-xl mb-4'>Share to</h2>

              <div className='flex flex-wrap gap-3'>

                {
                  socials.map(social => {
                    return (
                        <button className='w-12 h-12 bg-[#3A3A3A] rounded-full flex items-center justify-center hover:bg-[#2A2A2A] transition-colors cursor-pointer hover:scale-104 transition-all '>
                          <social.icon className='w-6 h-6 text-white ' />
                        </button>
                      )
                  })

                }


              </div>

            </div>


            <div>

              <h2 className='font-goldman font-bold text-xl mb-4'>Related News</h2>

              <div className=' space-y-0'>
                {
                  relatedNews.map((news) => (

                    <RelatedNewsItem key={news.id} title={news.title} category={news.category} onClick={() => handleRelatedNewsClick(news.id)} />
                
                    )
                  )
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

