import BASE_URL from '../../utils/api'
import { useState, useEffect, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import LocationIcon from '../../assets/icons/location_icon.svg?react'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import EditIcon     from '../../assets/icons/edit_icon.svg?react'
import TrashIcon    from '../../assets/icons/trash_icon2.svg?react'
import SearchIcon   from '../../assets/icons/search_icon.svg?react'
import SortIcon     from '../../assets/icons/sort_icon.svg?react'
import FileIcon     from '../../assets/icons/file_icon.svg?react'
import CoinsIcon    from '../../assets/icons/coins_icon.svg?react'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import Notification from '../../components/ui/Notification'
import Status       from '../../components/ui/Status.jsx'
import LoadingButton from '../../components/ui/LoadingButton'
import { adminContext } from '../../components/utils/AdminContext.jsx'

const VACANCY_TYPES = ['Full Time','Part Time','Contract','Internship','Remote']
const VACANCY_CATS  = ['Technology','Finance','Health','Education','Engineering','Administration','Legal','Marketing','Other']

const EMPTY_VACANCY = {
  id:'', title:'', location:'', salary:'', startDate:'', endDate:'',
  type:'Full Time', category:'Technology', shortDescription:'',
  skills:[], description:'', responsibilities:[], qualifications:[]
}
const EMPTY_TRANS = {
  am:{ title:'', location:'', shortDescription:'', description:'', category:'', skills:[], responsibilities:[], qualifications:[] },
  or:{ title:'', location:'', shortDescription:'', description:'', category:'', skills:[], responsibilities:[], qualifications:[] }
}

const isoToInput = (s) => { if (!s) return ''; try { return s.split('T')[0] } catch { return '' } }
const convertDateToISO = (s) => {
  if (!s) return ''
  try {
    const parts = s.split('-').map(p => p.trim())
    if (parts.length !== 3) return s
    const year = parts[2].length === 2 ? '20' + parts[2] : parts[2]
    return `${year}-${parts[1]}-${parts[0]}`
  } catch { return s }
}

// ── Vacancy Panel ─────────────────────────────────────────────────────────────
function VacancyPanel({ isOpen, onClose, selectedVacancy, token, onSaved }) {
  const [formData,     setFormData]     = useState(EMPTY_VACANCY)
  const [translations, setTranslations] = useState(EMPTY_TRANS)
  const [language,     setLanguage]     = useState('en')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newSkill,     setNewSkill]     = useState('')
  const [newResp,      setNewResp]      = useState('')
  const [newQual,      setNewQual]      = useState('')

  useEffect(() => {
    if (selectedVacancy) {
      setFormData({
        id:               selectedVacancy.id,
        title:            selectedVacancy.title || '',
        location:         selectedVacancy.location || '',
        salary:           selectedVacancy.salary || '',
        startDate:        isoToInput(selectedVacancy.start_date),
        endDate:          isoToInput(selectedVacancy.end_date),
        type:             selectedVacancy.type || 'Full Time',
        category:         selectedVacancy.category || 'Technology',
        shortDescription: selectedVacancy.short_description || '',
        skills:           selectedVacancy.skills || [],
        description:      selectedVacancy.description || '',
        responsibilities: Array.isArray(selectedVacancy.responsibilities) ? selectedVacancy.responsibilities : [],
        qualifications:   Array.isArray(selectedVacancy.qualifications)   ? selectedVacancy.qualifications   : []
      })
      setTranslations({
        am: { title: selectedVacancy.amh?.title||'', location: selectedVacancy.amh?.location||'', shortDescription: selectedVacancy.amh?.short_description||'', description: selectedVacancy.amh?.description||'', category: selectedVacancy.amh?.category||'', skills: selectedVacancy.amh?.skills||[], responsibilities: selectedVacancy.amh?.responsibilities||[], qualifications: selectedVacancy.amh?.qualifications||[] },
        or: { title: selectedVacancy.orm?.title||'', location: selectedVacancy.orm?.location||'', shortDescription: selectedVacancy.orm?.short_description||'', description: selectedVacancy.orm?.description||'', category: selectedVacancy.orm?.category||'', skills: selectedVacancy.orm?.skills||[], responsibilities: selectedVacancy.orm?.responsibilities||[], qualifications: selectedVacancy.orm?.qualifications||[] }
      })
    } else {
      setFormData(EMPTY_VACANCY)
      setTranslations(EMPTY_TRANS)
    }
    setLanguage('en')
    setNewSkill(''); setNewResp(''); setNewQual('')
  }, [selectedVacancy, isOpen])

  const getValue = (field) => language === 'en' ? formData[field] : (translations[language][field] ?? (Array.isArray(formData[field]) ? [] : ''))
  const handleChange = (e) => {
    const { name, value } = e.target
    if (language === 'en') setFormData(p => ({ ...p, [name]: value }))
    else setTranslations(p => ({ ...p, [language]: { ...p[language], [name]: value } }))
  }

  const addToList = (field, val, setter) => {
    if (!val.trim()) return
    if (language === 'en') setFormData(p => ({ ...p, [field]: [...(p[field]||[]), val.trim()] }))
    else setTranslations(p => ({ ...p, [language]: { ...p[language], [field]: [...(p[language][field]||[]), val.trim()] } }))
    setter('')
  }
  const removeFromList = (field, item) => {
    if (language === 'en') setFormData(p => ({ ...p, [field]: p[field].filter(x => x !== item) }))
    else setTranslations(p => ({ ...p, [language]: { ...p[language], [field]: p[language][field].filter(x => x !== item) } }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const fetchType = formData.id === '' ? 'create' : 'update'
      const submitData = { ...formData, startDate: formData.startDate, endDate: formData.endDate, amh: translations.am, orm: translations.or }
      const res = await fetch(`/api/admin/${fetchType}/vacancy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify(submitData)
      })
      if (!res.ok) throw new Error(selectedVacancy ? 'Failed to update vacancy' : 'Failed to create vacancy')
      onSaved(fetchType)
      onClose()
    } catch (err) { onSaved(null, err.message) }
    finally { setIsSubmitting(false) }
  }

  const inputCls  = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
  const labelCls  = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'
  const sectionHd = 'text-sm font-bold text-[#3A3A3A] mb-3 mt-1'
  const tagCls    = 'flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700'

  const TagList = ({ field, items, inputVal, setInput }) => (
    <div>
      <div className='flex gap-2 mb-2'>
        <input type='text' value={inputVal} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList(field, inputVal, setInput) } }}
          placeholder='Type and press Enter' className={inputCls} />
        <button type='button' onClick={() => addToList(field, inputVal, setInput)}
          className='px-3 py-2 bg-[#3A3A3A] text-white text-xs rounded-lg cursor-pointer hover:bg-black shrink-0'>Add</button>
      </div>
      {(getValue(field)||[]).length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {(getValue(field)||[]).map((item, i) => (
            <span key={i} className={tagCls}>
              {item}
              <button type='button' onClick={() => removeFromList(field, item)} className='text-gray-400 hover:text-red-500 cursor-pointer leading-none'>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0'>
          <h2 className='text-xl font-bold text-[#3A3A3A]'>{selectedVacancy ? 'Edit Vacancy' : 'Post Vacancy'}</h2>
          <div className='flex items-center gap-3'>
            <div className='flex bg-gray-100 p-1 rounded-lg'>
              {['en','am','or'].map(lang => (
                <button key={lang} type='button' onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${language === lang ? 'bg-white shadow-sm text-[#3A3A3A]' : 'text-gray-500 hover:text-gray-700'}`}>
                  {lang === 'en' ? 'EN' : lang === 'am' ? 'AM' : 'OR'}
                </button>
              ))}
            </div>
            <button onClick={onClose} className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl cursor-pointer transition-colors'>×</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='flex-1 overflow-y-auto px-6 py-5 space-y-5'>
          {/* Core fields */}
          <div>
            <label className={labelCls}>Title <span className='text-red-400'>*</span></label>
            <input type='text' name='title' value={getValue('title')} onChange={handleChange} required={language==='en'} className={inputCls} placeholder={`Title in ${language==='en'?'English':language==='am'?'Amharic':'Oromo'}`} />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className={labelCls}>Location <span className='text-red-400'>*</span></label>
              <div className='relative'><input type='text' name='location' value={getValue('location')} onChange={handleChange} required={language==='en'} className={inputCls+' pr-9'} /><LocationIcon className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' /></div>
            </div>
            <div>
              <label className={labelCls}>Salary <span className='text-red-400'>*</span></label>
              <input type='text' name='salary' value={formData.salary} onChange={e => setFormData(p=>({...p, salary:e.target.value}))} required disabled={language!=='en'} placeholder='e.g. 12,000' className={inputCls+(language!=='en'?' bg-gray-100 cursor-not-allowed':'')} />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className={labelCls}>Start Date <span className='text-red-400'>*</span></label>
              <div className='relative'><input type='date' value={formData.startDate} onChange={e=>setFormData(p=>({...p,startDate:e.target.value}))} required disabled={language!=='en'} className={inputCls+' pr-9'+(language!=='en'?' bg-gray-100 cursor-not-allowed':'')} /><CalenderIcon className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' /></div>
            </div>
            <div>
              <label className={labelCls}>End Date <span className='text-red-400'>*</span></label>
              <div className='relative'><input type='date' value={formData.endDate} onChange={e=>setFormData(p=>({...p,endDate:e.target.value}))} required disabled={language!=='en'} className={inputCls+' pr-9'+(language!=='en'?' bg-gray-100 cursor-not-allowed':'')} /><CalenderIcon className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' /></div>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className={labelCls}>Type</label>
              <select name='type' value={formData.type} onChange={e=>setFormData(p=>({...p,type:e.target.value}))} disabled={language!=='en'} className={inputCls+' bg-white'+(language!=='en'?' opacity-60 cursor-not-allowed':'')}>
                {VACANCY_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              {language==='en'
                ? <select name='category' value={formData.category} onChange={handleChange} className={inputCls+' bg-white'}>{VACANCY_CATS.map(c=><option key={c} value={c}>{c}</option>)}</select>
                : <input type='text' name='category' value={getValue('category')} onChange={handleChange} placeholder={`Category in ${language==='am'?'Amharic':'Oromo'}`} className={inputCls} />
              }
            </div>
          </div>
          <div>
            <div className='flex justify-between items-center mb-1'>
              <label className={labelCls.replace('mb-1','')}>Short Description</label>
              <span className='text-xs text-gray-400'>{getValue('shortDescription')?.length||0}/150</span>
            </div>
            <textarea name='shortDescription' value={getValue('shortDescription')} onChange={handleChange} maxLength={150} rows={2} placeholder='Brief role summary…' className={inputCls+' resize-none'} />
          </div>
          <div>
            <label className={labelCls}>Full Description <span className='text-red-400'>*</span></label>
            <textarea name='description' value={getValue('description')} onChange={handleChange} required={language==='en'} rows={6} placeholder='Full job description…' className={inputCls+' resize-none'} />
          </div>

          {/* Lists */}
          <div className='border-t border-gray-100 pt-4'>
            <p className={sectionHd}>Skills Required</p>
            <TagList field='skills' items={getValue('skills')} inputVal={newSkill} setInput={setNewSkill} />
          </div>
          <div className='border-t border-gray-100 pt-4'>
            <p className={sectionHd}>Responsibilities</p>
            <TagList field='responsibilities' items={getValue('responsibilities')} inputVal={newResp} setInput={setNewResp} />
          </div>
          <div className='border-t border-gray-100 pt-4'>
            <p className={sectionHd}>Qualifications</p>
            <TagList field='qualifications' items={getValue('qualifications')} inputVal={newQual} setInput={setNewQual} />
          </div>
        </form>

        <div className='px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 shrink-0'>
          <button type='button' onClick={onClose} className='px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors'>Cancel</button>
          <LoadingButton isLoading={isSubmitting} onClick={handleSubmit}
            className='px-6 py-2 bg-[#3A3A3A] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors'>
            {selectedVacancy ? 'Save Changes' : 'Post Vacancy'}
          </LoadingButton>
        </div>
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
function Vaccancy() {
  const { token } = useContext(adminContext)
  const navigate  = useNavigate()

  const [activeTab,        setActiveTab]        = useState('vacancies')
  const [loading,          setLoading]          = useState(true)
  const [vacanciesList,    setVacanciesList]     = useState([])
  const [applicantsList,   setApplicantsList]    = useState([])
  const [panelOpen,        setPanelOpen]         = useState(false)
  const [editingVacancy,   setEditingVacancy]    = useState(null)
  const [showDeleteDialog, setShowDeleteDialog]  = useState(false)
  const [vacancyToDelete,  setVacancyToDelete]   = useState(null)
  const [notification,     setNotification]      = useState({ isOpen: false, message: '', type: 'success' })
  const [vacancySearch,    setVacancySearch]     = useState('')
  const [applicantSearch,  setApplicantSearch]   = useState('')
  const [applicantStatus,  setApplicantStatus]   = useState('All')
  const [applicantVacancy, setApplicantVacancy]  = useState('All')
  const [sortConfig,       setSortConfig]        = useState({ key: 'date', direction: 'desc' })

  const notify = (msg, type = 'success') => setNotification({ isOpen: true, message: msg, type })

  const fetchVacancies = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/vacancies`, { headers: { authorization: `Bearer ${localStorage.getItem('token')}` } })
      if (!res.ok) { if (res.status === 401) { localStorage.removeItem('token'); navigate('/auth/login') }; return }
      setVacanciesList(await res.json())
    } catch (err) { console.error(err) }
  }

  const fetchApplicants = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/applicants`, { headers: { authorization: `Bearer ${localStorage.getItem('token')}` } })
      if (!res.ok) return
      setApplicantsList(await res.json())
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    if (!token) { setLoading(false); return }
    Promise.all([fetchVacancies(), fetchApplicants()]).finally(() => setLoading(false))
  }, [token])

  // Stats
  const totalVacancies  = vacanciesList.length
  const totalApplicants = applicantsList.length
  const pendingReview   = applicantsList.filter(a => a.status === 'submitted' || a.status === 'reviewing').length


  const filteredVacancies = useMemo(() => {
    let list = [...vacanciesList]
    if (vacancySearch.trim()) {
      const q = vacancySearch.toLowerCase()
      list = list.filter(v => v.title?.toLowerCase().includes(q) || v.location?.toLowerCase().includes(q) || v.category?.toLowerCase().includes(q))
    }
    list.sort((a, b) => {
      let res = 0
      if (sortConfig.key === 'title')  res = (a.title||'').localeCompare(b.title||'')
      else if (sortConfig.key === 'date') res = new Date(a.start_date||0) - new Date(b.start_date||0)
      else if (sortConfig.key === 'salary') res = parseInt(String(a.salary||'0').replace(/\D/g,'')) - parseInt(String(b.salary||'0').replace(/\D/g,''))
      return sortConfig.direction === 'asc' ? res : -res
    })
    return list
  }, [vacanciesList, vacancySearch, sortConfig])

  const filteredApplicants = useMemo(() => {
    let list = [...applicantsList]
    if (applicantStatus !== 'All') list = list.filter(a => a.status === applicantStatus)
    if (applicantVacancy !== 'All') list = list.filter(a => String(a.vacancy_id) === applicantVacancy)
    if (applicantSearch.trim()) {
      const q = applicantSearch.toLowerCase()
      list = list.filter(a => `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q))
    }
    return list
  }, [applicantsList, applicantStatus, applicantVacancy, applicantSearch])

  const handleSaved = (action, errMsg) => {
    if (errMsg) { notify(errMsg, 'error'); return }
    notify(action === 'create' ? 'Vacancy posted!' : 'Vacancy updated!')
    fetchVacancies()
  }

  const handleDeleteConfirm = async () => {
    if (!vacancyToDelete) return
    try {
      const res = await fetch(`/api/admin/vacancy/${vacancyToDelete.id}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to delete')
      await fetchVacancies()
      notify('Vacancy deleted.')
    } catch (err) { notify(err.message, 'error') }
    finally { setShowDeleteDialog(false); setVacancyToDelete(null) }
  }

  const handleApplicantStatusChange = async (applicantId, newStatus) => {
    try {
      const formPayload = new FormData()
      formPayload.append('status', newStatus)
      const res = await fetch(`/api/admin/applicants/${applicantId}`, { method: 'PUT', headers: { authorization: `Bearer ${token}` }, body: formPayload })
      if (!res.ok) throw new Error('Failed to update')
      setApplicantsList(prev => prev.map(a => a.id === applicantId ? { ...a, status: newStatus } : a))
      notify('Status updated!')
    } catch (err) { notify(err.message, 'error') }
  }

  const SortBtn = ({ col, label }) => (
    <button type='button' onClick={() => setSortConfig(p => ({ key: col, direction: p.key === col && p.direction === 'asc' ? 'desc' : 'asc' }))}
      className='flex items-center gap-1 hover:text-[#3A3A3A] transition-colors'>
      {label}<SortIcon className={`w-3 h-3 ${sortConfig.key === col ? 'text-[#3A3A3A]' : 'text-gray-400'}`} />
    </button>
  )

  if (loading) return (
    <div className='p-6 space-y-6 animate-pulse'>
      <div className='flex justify-between'><div className='h-8 w-36 bg-gray-200 rounded' /><div className='h-10 w-36 bg-gray-300 rounded-lg' /></div>
      <div className='grid grid-cols-3 gap-4'>{[1,2,3].map(i=><div key={i} className='h-20 bg-gray-100 rounded-xl'/>)}</div>
      <div className='bg-white rounded-2xl h-96 border border-gray-200' />
    </div>
  )

  const tabCls = (t) => `px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all cursor-pointer relative ${activeTab===t ? 'bg-white text-[#3A3A3A] border border-b-white border-gray-200 shadow-sm -mb-px' : 'text-gray-500 hover:text-gray-700'}`

  return (
    <div className='p-6 font-jost min-h-screen bg-[#F6F6F6]'>
      <Notification isOpen={notification.isOpen} message={notification.message} type={notification.type} onClose={() => setNotification(n=>({...n,isOpen:false}))} />

      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-[#3A3A3A]'>Vacancy</h1>
          <p className='text-sm text-gray-500 mt-0.5'>{totalVacancies} open position{totalVacancies!==1?'s':''}</p>
        </div>
        {activeTab === 'vacancies' && (
          <button onClick={() => { setEditingVacancy(null); setPanelOpen(true) }}
            className='px-5 py-2.5 bg-[#3A3A3A] text-white text-sm font-semibold rounded-xl hover:bg-black active:scale-95 transition-all cursor-pointer shadow-sm'>
            + Post Vacancy
          </button>
        )}
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[
          { label:'Total Vacancies', value: totalVacancies },
          { label:'Total Applicants', value: totalApplicants },
          { label:'Pending Review',  value: pendingReview }
        ].map(s=>(
          <div key={s.label} className='bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm'>
            <p className='text-xs text-gray-400 uppercase font-semibold tracking-wide'>{s.label}</p>
            <p className='text-2xl font-bold text-[#3A3A3A] mt-1'>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className='flex gap-1 border-b border-gray-200 mb-6'>
        <button className={tabCls('vacancies')} onClick={() => setActiveTab('vacancies')}>Vacancies</button>
        <button className={tabCls('applicants')} onClick={() => setActiveTab('applicants')}>
          Applicants {totalApplicants > 0 && <span className='ml-1.5 px-1.5 py-0.5 bg-[#3A3A3A] text-white text-xs rounded-full'>{totalApplicants}</span>}
        </button>
      </div>

      {/* ── VACANCIES TAB ── */}
      {activeTab === 'vacancies' && (
        <>
          <div className='flex gap-3 mb-4'>
            <div className='relative flex-1'>
              <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input type='text' placeholder='Search vacancies…' value={vacancySearch} onChange={e=>setVacancySearch(e.target.value)}
                className='w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white' />
            </div>
          </div>
          <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
            {filteredVacancies.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
                <FileIcon className='w-14 h-14 mb-4 opacity-30' />
                <p className='text-lg font-medium'>No vacancies found</p>
                <button onClick={() => { setEditingVacancy(null); setPanelOpen(true) }} className='mt-4 px-5 py-2 bg-[#3A3A3A] text-white text-sm font-semibold rounded-lg hover:bg-black cursor-pointer'>+ Post Vacancy</button>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100'>
                      <th className='px-5 py-3.5 text-left'><SortBtn col='title' label='Title' /></th>
                      <th className='px-4 py-3.5 text-left hidden md:table-cell'>Type</th>
                      <th className='px-4 py-3.5 text-left hidden lg:table-cell'>Category</th>
                      <th className='px-4 py-3.5 text-left hidden md:table-cell'><SortBtn col='salary' label='Salary' /></th>
                      <th className='px-4 py-3.5 text-left hidden lg:table-cell'><SortBtn col='date' label='Closes' /></th>
                      <th className='px-4 py-3.5 text-right'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50'>
                    {filteredVacancies.map(v => (
                      <tr key={v.id} className='hover:bg-gray-50 transition-colors'>
                        <td className='px-5 py-3.5'>
                          <p className='font-semibold text-[#3A3A3A]'>{v.title}</p>
                          <div className='flex items-center gap-1 text-xs text-gray-400 mt-0.5'>
                            <LocationIcon className='w-3 h-3' /><span>{v.location}</span>
                          </div>
                        </td>
                        <td className='px-4 py-3.5 hidden md:table-cell'><span className='px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs'>{v.type}</span></td>
                        <td className='px-4 py-3.5 text-gray-500 hidden lg:table-cell text-xs'>{v.category}</td>
                        <td className='px-4 py-3.5 text-gray-500 hidden md:table-cell text-xs'>{v.salary ? `${v.salary} ETB` : '—'}</td>
                        <td className='px-4 py-3.5 text-gray-400 hidden lg:table-cell text-xs'>{v.end_date ? new Date(v.end_date).toLocaleDateString() : '—'}</td>
                        <td className='px-4 py-3.5'>
                          <div className='flex gap-1.5 justify-end'>
                            <button onClick={() => { setEditingVacancy(v); setPanelOpen(true) }}
                              className='w-8 h-8 flex items-center justify-center bg-[#3A3A3A] rounded-full cursor-pointer hover:bg-black transition-colors'>
                              <EditIcon className='w-3.5 h-3.5 text-white' />
                            </button>
                            <button onClick={() => { setVacancyToDelete(v); setShowDeleteDialog(true) }}
                              className='w-8 h-8 flex items-center justify-center bg-red-100 rounded-full cursor-pointer hover:bg-red-200 transition-colors'>
                              <TrashIcon className='w-3.5 h-3.5 text-red-600' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── APPLICANTS TAB ── */}
      {activeTab === 'applicants' && (
        <>
          <div className='flex flex-wrap gap-3 mb-4'>
            <div className='relative flex-1 min-w-48'>
              <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input type='text' placeholder='Search applicants…' value={applicantSearch} onChange={e=>setApplicantSearch(e.target.value)}
                className='w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white' />
            </div>
            <select value={applicantStatus} onChange={e=>setApplicantStatus(e.target.value)}
              className='px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white'>
              <option value='All'>All Statuses</option>
              <option value='submitted'>Submitted</option>
              <option value='reviewing'>Reviewing</option>
              <option value='accepted'>Accepted</option>
              <option value='rejected'>Rejected</option>
            </select>
            <select value={applicantVacancy} onChange={e=>setApplicantVacancy(e.target.value)}
              className='px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white'>
              <option value='All'>All Vacancies</option>
              {vacanciesList.map(v => <option key={v.id} value={String(v.id)}>{v.title}</option>)}
            </select>
          </div>
          <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
            {filteredApplicants.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
                <FileIcon className='w-14 h-14 mb-4 opacity-30' />
                <p className='text-lg font-medium'>No applicants found</p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100'>
                      <th className='px-5 py-3.5 text-left'>Applicant</th>
                      <th className='px-4 py-3.5 text-left hidden md:table-cell'>Vacancy</th>
                      <th className='px-4 py-3.5 text-left hidden lg:table-cell'>Applied</th>
                      <th className='px-4 py-3.5 text-left'>Status</th>
                      <th className='px-4 py-3.5 text-left'>CV</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50'>
                    {filteredApplicants.map(a => (
                      <tr key={a.id} className='hover:bg-gray-50 transition-colors'>
                        <td className='px-5 py-3.5'>
                          <p className='font-semibold text-[#3A3A3A]'>{a.first_name} {a.last_name}</p>
                          <p className='text-xs text-gray-400 mt-0.5'>{a.email}</p>
                        </td>
                        <td className='px-4 py-3.5 text-gray-500 hidden md:table-cell text-xs max-w-40'>
                          <span className='truncate block'>{a.vacancy_title || vacanciesList.find(v=>v.id===a.vacancy_id)?.title || '—'}</span>
                        </td>
                        <td className='px-4 py-3.5 text-gray-400 hidden lg:table-cell text-xs'>
                          {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className='px-4 py-3.5'>
                          <select value={a.status||'submitted'} onChange={e=>handleApplicantStatusChange(a.id, e.target.value)}
                            className='text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3A3A] cursor-pointer'>
                            <option value='submitted'>Submitted</option>
                            <option value='reviewing'>Reviewing</option>
                            <option value='accepted'>Accepted</option>
                            <option value='rejected'>Rejected</option>
                          </select>
                        </td>
                        <td className='px-4 py-3.5'>
                          {a.cv_path ? (
                            <a href={a.cv_path} target='_blank' rel='noreferrer'
                              className='flex items-center gap-1 text-xs text-blue-600 hover:underline'>
                              <FileIcon className='w-3.5 h-3.5' /> View CV
                            </a>
                          ) : <span className='text-xs text-gray-400'>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <VacancyPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} selectedVacancy={editingVacancy} token={token} onSaved={handleSaved} />

      <ConfirmationDialog
        isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={handleDeleteConfirm}
        title='Delete Vacancy' message='Are you sure? All associated applicants will remain but the vacancy will be removed.'
        confirmText='Delete' confirmButtonStyle='bg-red-600 hover:bg-red-700' />
    </div>
  )
}

export default Vaccancy
