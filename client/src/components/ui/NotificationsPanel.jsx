import { useState, useEffect } from 'react'
import { useUser } from '../utils/UserContext'
import { useLanguage } from '../utils/LanguageContext'
import Status from './Status.jsx'
import FileIcon from '../../assets/icons/file_icon.svg?react'
import ComplaintIcon from '../../assets/icons/compliant_icon2.svg?react'

const COMPLAINT_STEPS = ['assigning', 'in progress', 'resolved']
const APP_STEPS       = ['submitted', 'reviewing', 'accepted']

const T = {
  title:        { en: 'Notifications',          am: 'ማሳወቂያዎች',          or: 'Beeksisawwan' },
  complaints:   { en: 'Complaints',             am: 'ቅሬታዎች',             or: 'Iyyatawwan' },
  applications: { en: 'Applications',           am: 'ማመልከቻዎች',           or: 'Gaaffiwwan' },
  empty:        { en: 'Nothing here yet',        am: 'እስካሁን ምንም የለም',    or: 'Ammaaf wanti tokkollee hin jiru' },
  empty_sub:    { en: 'Submit a complaint or apply for a job to see updates here.',
                  am: 'ቅሬታ ለማቅረብ ወይም ለስራ ለማመልከት ፣ ዝማኔዎችን ለማየት።',
                  or: 'Iyyata galchi yookiin hojii gaaffadhu, as irratti haaromsa ilaali.' },
  submitted:    { en: 'Submitted',              am: 'ቀርቧል',               or: 'Ergame' },
  sector:       { en: 'Sector',                 am: 'ዘርፍ',                or: 'Damee' },
  position:     { en: 'Position',               am: 'ቦታ',                 or: 'Sadarkaa' },
  view_all:     { en: 'View all in account',    am: 'ሁሉንም በመለያ ይመልከቱ',  or: 'Hunda herregaatti ilaalaa' },
}

function StepTracker({ steps, current }) {
  const norm   = s => (s || '').toLowerCase().replace('cancelled', 'canceled')
  const rejected = norm(current) === 'rejected' || norm(current) === 'canceled'
  const curIdx   = rejected ? -1 : steps.findIndex(s => norm(s) === norm(current))
  return (
    <div className='flex items-center gap-0.5 mt-2'>
      {steps.map((step, i) => {
        const done   = !rejected && i <= curIdx
        const active = !rejected && i === curIdx
        return (
          <div key={step} className='flex items-center flex-1'>
            <div className='flex flex-col items-center w-full'>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-[#3A3A3A] text-white' : 'bg-gray-200 text-gray-400'} ${active ? 'ring-2 ring-offset-1 ring-[#3A3A3A]' : ''}`}>
                {done && !active ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-0.5 capitalize text-center leading-none ${done ? 'text-[#3A3A3A] font-semibold' : 'text-gray-400'}`} style={{fontSize:'9px'}}>{step}</span>
            </div>
            {i < steps.length - 1 && <div className={`h-0.5 flex-1 mb-4 ${i < curIdx && !rejected ? 'bg-[#3A3A3A]' : 'bg-gray-200'}`} />}
          </div>
        )
      })}
      {rejected && <span className='ml-1 text-xs font-bold text-red-500 capitalize'>{current}</span>}
    </div>
  )
}

function NotificationsPanel({ isOpen, onClose }) {
  const { userToken } = useUser()
  const { language }  = useLanguage()
  const [complaints,   setComplaints]   = useState([])
  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [tab,          setTab]          = useState('complaints')
  const t = k => T[k][language] || T[k].en

  useEffect(() => {
    if (!isOpen || !userToken) return
    setLoading(true)
    fetch('/api/user/dashboard', { headers: { authorization: `Bearer ${userToken}` } })
      .then(r => r.json())
      .then(d => { setComplaints(d.complaints || []); setApplications(d.applications || []) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isOpen, userToken])

  const totalCount = complaints.length + applications.length

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0'>
          <div className='flex items-center gap-2'>
            <h2 className='text-lg font-bold text-[#3A3A3A] font-jost'>{t('title')}</h2>
            {totalCount > 0 && (
              <span className='px-2 py-0.5 bg-[#3A3A3A] text-white text-xs font-bold rounded-full'>{totalCount}</span>
            )}
          </div>
          <button onClick={onClose} className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl cursor-pointer transition-colors'>×</button>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-gray-200 shrink-0'>
          {['complaints', 'applications'].map(tabId => (
            <button key={tabId} onClick={() => setTab(tabId)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all cursor-pointer relative ${tab === tabId ? 'text-[#3A3A3A] border-b-2 border-[#3A3A3A]' : 'text-gray-400 hover:text-gray-600'}`}>
              {t(tabId)}
              {tabId === 'complaints' && complaints.length > 0 && (
                <span className='ml-1.5 px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full'>{complaints.length}</span>
              )}
              {tabId === 'applications' && applications.length > 0 && (
                <span className='ml-1.5 px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full'>{applications.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto'>
          {loading ? (
            <div className='flex items-center justify-center h-40'>
              <div className='flex gap-1'>
                {[0,1,2].map(i => <div key={i} className='w-2.5 h-2.5 bg-[#3A3A3A] rounded-full animate-bounce' style={{animationDelay:`${i*100}ms`}} />)}
              </div>
            </div>
          ) : tab === 'complaints' ? (
            complaints.length === 0 ? (
              <EmptyState t={t} icon={<ComplaintIcon className='w-12 h-12 opacity-20' />} />
            ) : (
              <div className='divide-y divide-gray-50'>
                {complaints.map(c => (
                  <div key={c.id} className='px-5 py-4'>
                    <div className='flex items-start justify-between mb-1'>
                      <div className='flex-1 min-w-0 pr-2'>
                        <p className='font-semibold text-sm text-[#3A3A3A] truncate font-jost'>{c.type || '—'}</p>
                        {c.complainer_subcity && <p className='text-xs text-gray-400 mt-0.5'>{c.complainer_subcity}</p>}
                        <p className='text-xs text-gray-400 mt-0.5'>{t('submitted')}: {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                      <Status status={c.status} />
                    </div>
                    {c.description && (
                      <p className='text-xs text-gray-500 line-clamp-2 mt-1 mb-2'>{c.description}</p>
                    )}
                    <StepTracker steps={COMPLAINT_STEPS} current={c.status} />
                  </div>
                ))}
              </div>
            )
          ) : (
            applications.length === 0 ? (
              <EmptyState t={t} icon={<FileIcon className='w-12 h-12 opacity-20' />} />
            ) : (
              <div className='divide-y divide-gray-50'>
                {applications.map(a => (
                  <div key={a.id} className='px-5 py-4'>
                    <div className='flex items-start justify-between mb-1'>
                      <div className='flex-1 min-w-0 pr-2'>
                        <p className='font-semibold text-sm text-[#3A3A3A] truncate font-jost'>{a.vacancy_title || '—'}</p>
                        {a.location && <p className='text-xs text-gray-400 mt-0.5'>{a.location} · {a.job_type}</p>}
                        <p className='text-xs text-gray-400 mt-0.5'>{t('submitted')}: {new Date(a.created_at).toLocaleDateString()}</p>
                      </div>
                      <Status status={a.status} />
                    </div>
                    <StepTracker steps={APP_STEPS} current={a.status} />
                    {a.cv_path && (
                      <a href={a.cv_path} target='_blank' rel='noreferrer'
                        className='inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline'>
                        <FileIcon className='w-3 h-3' /> View CV
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        {totalCount > 0 && !loading && (
          <div className='px-5 py-3 border-t border-gray-200 shrink-0'>
            <a href='/account' onClick={onClose}
              className='block w-full text-center py-2 text-sm font-semibold text-[#3A3A3A] hover:bg-gray-50 rounded-lg transition-colors'>
              {t('view_all')} →
            </a>
          </div>
        )}
      </div>
    </>
  )
}

function EmptyState({ t, icon }) {
  return (
    <div className='flex flex-col items-center justify-center py-16 px-6 text-center text-gray-400'>
      {icon}
      <p className='font-semibold mt-3'>{t('empty')}</p>
      <p className='text-xs mt-1 leading-relaxed'>{t('empty_sub')}</p>
    </div>
  )
}

export default NotificationsPanel
