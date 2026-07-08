import { useState, useEffect, useContext, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import EditIcon from '../../assets/icons/edit_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon.svg?react'
import SearchIcon from '../../assets/icons/search_icon.svg?react'
import ImageIcon from '../../assets/icons/image_icon.svg?react'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import Notification from '../../components/ui/Notification'
import LoadingButton from '../../components/ui/LoadingButton'
import Upload from '../../components/ui/Upload.jsx'
import { adminContext } from '../../components/utils/AdminContext.jsx'

const CATEGORIES = ['Technology', 'Infrastructure', 'Health', 'Education', 'Events', 'Security', 'Environment']

// ── Slide-over panel ──────────────────────────────────────────────────────────
function NewsPanel({ isOpen, onClose, selectedNews, token, onSaved }) {
  const emptyForm = { id: '', title: '', date: '', category: '', shortDescription: '', description: '', photo: null }
  const emptyTranslations = {
    am: { title: '', shortDescription: '', description: '', category: '' },
    or: { title: '', shortDescription: '', description: '', category: '' }
  }

  const [formData,     setFormData]     = useState(emptyForm)
  const [translations, setTranslations] = useState(emptyTranslations)
  const [language,     setLanguage]     = useState('en')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const panelRef = useRef(null)

  // Populate form when editing
  useEffect(() => {
    if (selectedNews) {
      let photoData = selectedNews.photo
      if (typeof photoData === 'string') { try { photoData = JSON.parse(photoData) } catch (_) {} }

      setFormData({
        id:               selectedNews.id,
        title:            selectedNews.title || '',
        date:             selectedNews.created_at ? selectedNews.created_at.split('T')[0] : '',
        category:         selectedNews.category || '',
        shortDescription: selectedNews.short_description || '',
        description:      selectedNews.description || '',
        photo:            photoData || null
      })
      setTranslations({
        am: { title: selectedNews.amh?.title || '', shortDescription: selectedNews.amh?.short_description || '', description: selectedNews.amh?.description || '', category: selectedNews.amh?.category || '' },
        or: { title: selectedNews.orm?.title || '', shortDescription: selectedNews.orm?.short_description || '', description: selectedNews.orm?.description || '', category: selectedNews.orm?.category || '' }
      })
    } else {
      setFormData(emptyForm)
      setTranslations(emptyTranslations)
    }
    setLanguage('en')
  }, [selectedNews, isOpen])

  const getValue = (field) => language === 'en' ? formData[field] : (translations[language][field] || '')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (language === 'en') setFormData(p => ({ ...p, [name]: value }))
    else setTranslations(p => ({ ...p, [language]: { ...p[language], [name]: value } }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let photoData = null
      if (formData.photo) {
        photoData = Array.isArray(formData.photo) ? (formData.photo[0] || null) : formData.photo
      }
      const url = selectedNews ? '/api/admin/update/news' : '/api/admin/create/news'
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, photo: photoData, amh: translations.am, orm: translations.or })
      })
      if (!res.ok) throw new Error(selectedNews ? 'Failed to update news' : 'Failed to create news')
      onSaved(selectedNews ? 'updated' : 'created')
      onClose()
    } catch (err) {
      onSaved(null, err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Panel Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0'>
          <h2 className='text-xl font-bold text-[#3A3A3A]'>{selectedNews ? 'Edit Article' : 'New Article'}</h2>
          <div className='flex items-center gap-3'>
            {/* Language toggle */}
            <div className='flex bg-gray-100 p-1 rounded-lg'>
              {['en', 'am', 'or'].map(lang => (
                <button key={lang} type='button' onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${language === lang ? 'bg-white shadow-sm text-[#3A3A3A]' : 'text-gray-500 hover:text-gray-700'}`}>
                  {lang === 'en' ? 'EN' : lang === 'am' ? 'AM' : 'OR'}
                </button>
              ))}
            </div>
            <button onClick={onClose} className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl cursor-pointer transition-colors'>×</button>
          </div>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className='flex-1 overflow-y-auto px-6 py-5 space-y-5'>

          {/* Cover image */}
          <div>
            <label className={labelCls}>Cover Image {language !== 'en' && <span className='text-orange-400 normal-case font-normal'>(edit in EN mode)</span>}</label>
            <div className={language !== 'en' ? 'opacity-50 pointer-events-none' : ''}>
              <Upload photo={formData.photo} setFormData={setFormData} />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={labelCls}>Title {language === 'en' && <span className='text-red-400'>*</span>}</label>
            <input type='text' name='title' value={getValue('title')} onChange={handleChange}
              placeholder={`Title in ${language === 'en' ? 'English' : language === 'am' ? 'Amharic' : 'Oromo'}`}
              required={language === 'en'} className={inputCls} />
          </div>

          {/* Date + Category */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className={labelCls}>Date <span className='text-red-400'>*</span></label>
              <div className='relative'>
                <input type='date' name='date' value={formData.date}
                  onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                  required disabled={language !== 'en'}
                  className={inputCls + (language !== 'en' ? ' bg-gray-100 cursor-not-allowed' : '')} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Category <span className='text-red-400'>*</span></label>
              {language === 'en' ? (
                <select name='category' value={formData.category} onChange={handleChange} required className={inputCls + ' bg-white'}>
                  <option value=''>Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input type='text' name='category' value={getValue('category')} onChange={handleChange}
                  placeholder={`Category in ${language === 'am' ? 'Amharic' : 'Oromo'}`} className={inputCls} />
              )}
            </div>
          </div>

          {/* Short description */}
          <div>
            <div className='flex justify-between items-center mb-1'>
              <label className={labelCls.replace('mb-1', '')}>Short Description</label>
              <span className='text-xs text-gray-400'>{getValue('shortDescription')?.length || 0}/100</span>
            </div>
            <input type='text' name='shortDescription' value={getValue('shortDescription')} onChange={handleChange}
              maxLength={100} placeholder='Brief summary (max 100 characters)' className={inputCls} />
          </div>

          {/* Full description */}
          <div>
            <label className={labelCls}>Article Body {language === 'en' && <span className='text-red-400'>*</span>}</label>
            <textarea name='description' value={getValue('description')} onChange={handleChange}
              placeholder={`Article body in ${language === 'en' ? 'English' : language === 'am' ? 'Amharic' : 'Oromo'}`}
              rows={8} required={language === 'en'}
              className={inputCls + ' resize-none'} />
          </div>
        </form>

        {/* Sticky footer */}
        <div className='px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 shrink-0'>
          <button type='button' onClick={onClose}
            className='px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors'>
            Cancel
          </button>
          <LoadingButton isLoading={isSubmitting} onClick={handleSubmit}
            className='px-6 py-2 bg-[#3A3A3A] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors'>
            {selectedNews ? 'Save Changes' : 'Publish Article'}
          </LoadingButton>
        </div>
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
function News() {
  const { token } = useContext(adminContext)
  const navigate  = useNavigate()

  const [loading,         setLoading]         = useState(true)
  const [newsList,        setNewsList]         = useState([])
  const [panelOpen,       setPanelOpen]        = useState(false)
  const [editingNews,     setEditingNews]      = useState(null)
  const [showDeleteDialog,setShowDeleteDialog] = useState(false)
  const [newsToDelete,    setNewsToDelete]     = useState(null)
  const [notification,    setNotification]     = useState({ isOpen: false, message: '', type: 'success' })
  const [searchQuery,     setSearchQuery]      = useState('')
  const [categoryFilter,  setCategoryFilter]   = useState('All')
  const [sortOption,      setSortOption]       = useState('Latest')

  const notify = (message, type = 'success') => setNotification({ isOpen: true, message, type })

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/admin/news', { headers: { authorization: `Bearer ${token}` } })
      if (!res.ok) { if (res.status === 401) navigate('/auth/login'); throw new Error() }
      setNewsList(await res.json())
    } catch { /* handled by notify in callers */ }
  }

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetchNews().finally(() => setLoading(false))
  }, [token])

  const getImageSrc = (photo) => {
    if (!photo) return null
    if (typeof photo === 'object' && photo.path) return photo.path
    if (typeof photo === 'string') {
      try { const p = JSON.parse(photo); return p.path || null } catch { return photo.startsWith('/') ? photo : null }
    }
    return null
  }

  const filteredNews = useMemo(() => {
    let list = [...newsList]
    if (categoryFilter !== 'All') list = list.filter(n => n.category === categoryFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(n => n.title?.toLowerCase().includes(q) || n.short_description?.toLowerCase().includes(q))
    }
    list.sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime()
      const db = new Date(b.created_at || 0).getTime()
      return sortOption === 'Oldest' ? da - db : db - da
    })
    return list
  }, [newsList, categoryFilter, searchQuery, sortOption])

  // Stats
  const totalArticles = newsList.length
  const thisMonth = newsList.filter(n => {
    if (!n.created_at) return false
    const d = new Date(n.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const topCategory = (() => {
    const counts = {}
    newsList.forEach(n => { if (n.category) counts[n.category] = (counts[n.category] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
  })()

  const handleOpenCreate = () => { setEditingNews(null); setPanelOpen(true) }
  const handleOpenEdit   = (news) => { setEditingNews(news); setPanelOpen(true) }
  const handleClosePanel = () => setPanelOpen(false)

  const handleSaved = (action, errMsg) => {
    if (errMsg) { notify(errMsg, 'error'); return }
    notify(action === 'created' ? 'Article published!' : 'Article updated!')
    fetchNews()
  }

  const handleDeleteClick   = (id) => { setNewsToDelete(id); setShowDeleteDialog(true) }
  const handleDeleteConfirm = async () => {
    if (!newsToDelete) return
    try {
      const res = await fetch(`/api/admin/news/${newsToDelete}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to delete')
      await fetchNews()
      notify('Article deleted.')
    } catch (err) { notify(err.message, 'error') }
    finally { setShowDeleteDialog(false); setNewsToDelete(null) }
  }

  if (loading) return (
    <div className='p-6 space-y-6 animate-pulse'>
      <div className='flex justify-between items-center'>
        <div className='h-8 w-32 bg-gray-200 rounded' />
        <div className='h-10 w-36 bg-gray-300 rounded-lg' />
      </div>
      <div className='grid grid-cols-3 gap-4'>
        {[1,2,3].map(i => <div key={i} className='h-20 bg-gray-100 rounded-xl' />)}
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
        {[1,2,3,4,5,6].map(i => <div key={i} className='h-64 bg-gray-100 rounded-2xl' />)}
      </div>
    </div>
  )

  return (
    <div className='p-6 font-jost min-h-screen bg-[#F6F6F6]'>
      <Notification isOpen={notification.isOpen} message={notification.message} type={notification.type} onClose={() => setNotification(n => ({ ...n, isOpen: false }))} />

      {/* ── Header ── */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-[#3A3A3A]'>News</h1>
          <p className='text-sm text-gray-500 mt-0.5'>{totalArticles} article{totalArticles !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={handleOpenCreate}
          className='px-5 py-2.5 bg-[#3A3A3A] text-white text-sm font-semibold rounded-xl hover:bg-black active:scale-95 transition-all cursor-pointer shadow-sm'>
          + New Article
        </button>
      </div>

      {/* ── Stat strip ── */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[
          { label: 'Total Articles', value: totalArticles },
          { label: 'This Month',     value: thisMonth },
          { label: 'Top Category',   value: topCategory }
        ].map(s => (
          <div key={s.label} className='bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm'>
            <p className='text-xs text-gray-400 uppercase font-semibold tracking-wide'>{s.label}</p>
            <p className='text-2xl font-bold text-[#3A3A3A] mt-1'>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className='flex flex-wrap gap-3 mb-6 items-center'>
        {/* Search */}
        <div className='relative flex-1 min-w-48'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input type='text' placeholder='Search articles…' value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white' />
        </div>
        {/* Category filter */}
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className='px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white'>
          <option value='All'>All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {/* Sort */}
        <select value={sortOption} onChange={e => setSortOption(e.target.value)}
          className='px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white'>
          <option value='Latest'>Latest First</option>
          <option value='Oldest'>Oldest First</option>
        </select>
      </div>

      {/* ── Grid ── */}
      {filteredNews.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-24 text-gray-400'>
          <ImageIcon className='w-16 h-16 mb-4 opacity-30' />
          <p className='text-lg font-medium'>No articles found</p>
          <p className='text-sm mt-1'>Try adjusting your filters or create a new article</p>
          <button onClick={handleOpenCreate}
            className='mt-5 px-5 py-2 bg-[#3A3A3A] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors cursor-pointer'>
            + New Article
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {filteredNews.map(news => (
            <div key={news.id} className='bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group'>
              {/* Cover */}
              <div className='relative w-full h-44 bg-gray-100 overflow-hidden'>
                {getImageSrc(news.photo) ? (
                  <img src={getImageSrc(news.photo)} alt={news.title} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <ImageIcon className='w-10 h-10 text-gray-300' />
                  </div>
                )}
                {/* Category badge over image */}
                <span className='absolute top-3 left-3 px-2.5 py-1 bg-[#3A3A3A] text-white text-xs font-semibold rounded-full'>
                  {news.category}
                </span>
                {/* Action buttons */}
                <div className='absolute top-3 right-3 flex gap-1.5'>
                  <button onClick={() => handleOpenEdit(news)}
                    className='w-8 h-8 flex items-center justify-center bg-[#3A3A3A] hover:bg-black rounded-full shadow cursor-pointer active:scale-95 transition-all'>
                    <EditIcon className='w-4 h-4 text-white' />
                  </button>
                  <button onClick={() => handleDeleteClick(news.id)}
                    className='w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-full shadow cursor-pointer active:scale-95 transition-all'>
                    <TrashIcon className='w-4 h-4 text-white' />
                  </button>
                </div>
              </div>

              {/* Card body */}
              <div className='p-4'>
                <h3 className='font-bold text-[#3A3A3A] leading-snug mb-1.5 line-clamp-2'>{news.title}</h3>
                <p className='text-xs text-gray-500 line-clamp-2 mb-3'>{news.short_description}</p>
                <div className='flex items-center gap-2 text-xs text-gray-400'>
                  <CalenderIcon className='w-3.5 h-3.5' />
                  <span>{news.formatted_date || new Date(news.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Slide-over panel ── */}
      <NewsPanel
        isOpen={panelOpen}
        onClose={handleClosePanel}
        selectedNews={editingNews}
        token={token}
        onSaved={handleSaved}
      />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title='Delete Article'
        message='Are you sure you want to delete this article? This cannot be undone.'
        confirmText='Delete'
        confirmButtonStyle='bg-red-600 hover:bg-red-700'
      />
    </div>
  )
}

export default News
