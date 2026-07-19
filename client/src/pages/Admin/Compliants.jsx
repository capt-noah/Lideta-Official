import BASE_URL from '../../utils/api'
import { useContext, useEffect, useMemo, useState } from 'react'
import EditIcon      from '../../assets/icons/edit_icon.svg?react'
import SearchIcon    from '../../assets/icons/search_icon.svg?react'
import TrashIcon     from '../../assets/icons/trash_icon.svg?react'
import SortIcon      from '../../assets/icons/sort_icon.svg?react'
import ComplaintIcon from '../../assets/icons/compliant_icon2.svg?react'
import Status        from '../../components/ui/Status.jsx'
import Upload        from '../../components/ui/Upload.jsx'
import Notification  from '../../components/ui/Notification'
import LoadingButton from '../../components/ui/LoadingButton'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import MediaRecorderComponent from '../../components/ui/MediaRecorderComponent.jsx'
import { useNavigate } from 'react-router-dom'
import { adminContext } from '../../components/utils/AdminContext.jsx'

const subcities = ['Bole','Yeka','Gullele','Lideta','Addis Ketema','Arada','Kolfe Keranio','Akaki Kality','Nifas Silk','Lemi Kura','Kirkos']
const sectorGroups = [
  'Office of Public Service and Human Resource Development','Government Property Administration Bureau',
  'Women, Children and Social Affairs Bureau','Culture, Arts and Tourism Bureau','Communication Bureau',
  'Health Bureau','Education Bureau','Main Executive Office','Justice Bureau','Peace and Security Bureau',
  'Law Enforcement Bureau','Council','Agriculture and Urban Farming Bureau','Community Affairs',
  'Trade Bureau','Finance Bureau','Renewal Coordination Bureau','Planning Commission',
  'Good Governance, Complaints and Petitions Bureau','Design and Construction Works Bureau',
  'Construction Permit and Inspection Bureau','Housing Development Administration Bureau',
  'Labor and Skills Bureau','Workplace Development Administration Bureau','Industry Development Bureau',
  'Community, Volunteer and Social Mobilization Bureau','Youth and Sports Bureau',
  "Administrator's Office",'Civil Registration and Citizenship Bureau','Local Security Bureau',
  'Urban Beautification and Green Development Bureau','Sanitation Management Bureau',
  'Land Development and Administration Bureau','Land Ownership and Information Bureau',
  'Roads and Transport Bureau','Vehicle and Transport Bureau','Food and Drug Bureau',
  'General Education Quality and Inspection Bureau','Traffic Management Bureau'
]

const EMPTY_FORM = {
  id:'', first_name:'', last_name:'', email:'', phone:'',
  address_city:'', address_subcity:'', address_woreda:'', address_house_number:'',
  complaint_subcity:'', complaint_woreda:'',
  complaint_sector_group:'', type:'', status:'', description:'',
  concerned_staff_member:'', photo:null, video:null, audio:null
}

// ── Slide-over panel (create / edit) ─────────────────────────────────────────
function ComplaintPanel({ isOpen, onClose, selectedComplaint, token, onSaved }) {
  const [formData,     setFormData]     = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (selectedComplaint) {
      const parseMedia = (raw) => {
        if (!raw) return []
        if (typeof raw === 'string') { try { raw = JSON.parse(raw) } catch (_) {} }
        if (Array.isArray(raw)) return raw
        if (typeof raw === 'object' && raw !== null) return [raw]
        return []
      }
      setFormData({
        id:                     selectedComplaint.complaint_id,
        first_name:             selectedComplaint.first_name || '',
        last_name:              selectedComplaint.last_name  || '',
        email:                  selectedComplaint.email      || '',
        phone:                  selectedComplaint.phone      || '',
        address_city:           selectedComplaint.complainer_city         || '',
        address_subcity:        selectedComplaint.complainer_subcity      || '',
        address_woreda:         selectedComplaint.complainer_woreda       || '',
        address_house_number:   selectedComplaint.complainer_house_number || '',
        complaint_subcity:      selectedComplaint.complaint_subcity       || '',
        complaint_woreda:       selectedComplaint.complaint_woreda        || '',
        complaint_sector_group: selectedComplaint.type || '',
        type:                   selectedComplaint.type   || '',
        status:                 selectedComplaint.status || '',
        description:            selectedComplaint.description || '',
        concerned_staff_member: selectedComplaint.concerned_staff_member || '',
        photo: parseMedia(selectedComplaint.photos),
        video: parseMedia(selectedComplaint.videos),
        audio: parseMedia(selectedComplaint.audios),
      })
    } else {
      setFormData(EMPTY_FORM)
    }
  }, [selectedComplaint, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const fetchType = formData.id === '' ? 'create' : 'update'
      const toArr = (v) => Array.isArray(v) ? v : (v ? [v] : [])
      const submitData = { ...formData, type: formData.complaint_sector_group,
        concerned_staff_member: formData.concerned_staff_member || null,
        photo: toArr(formData.photo), video: toArr(formData.video), audio: toArr(formData.audio) }
      const res = await fetch(`/api/admin/${fetchType}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ formData: submitData })
      })
      if (!res.ok) throw new Error(fetchType === 'create' ? 'Failed to create complaint' : 'Failed to update complaint')
      onSaved(fetchType)
      onClose()
    } catch (err) {
      onSaved(null, err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'
  const sectionTitle = 'text-sm font-bold text-[#3A3A3A] mb-3 mt-1'

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0'>
          <h2 className='text-xl font-bold text-[#3A3A3A]'>{selectedComplaint ? 'Edit Complaint' : 'New Complaint'}</h2>
          <button onClick={onClose} className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl cursor-pointer transition-colors'>×</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className='flex-1 overflow-y-auto px-6 py-5 space-y-5'>
          {/* Complainant info */}
          <div>
            <p className={sectionTitle}>Complainant Information</p>
            <div className='grid grid-cols-2 gap-3'>
              <div><label className={labelCls}>First Name <span className='text-red-400'>*</span></label>
                <input required type='text' name='first_name' value={formData.first_name} onChange={handleChange} className={inputCls} /></div>
              <div><label className={labelCls}>Last Name <span className='text-red-400'>*</span></label>
                <input required type='text' name='last_name' value={formData.last_name} onChange={handleChange} className={inputCls} /></div>
              <div><label className={labelCls}>Email</label>
                <input type='email' name='email' value={formData.email} onChange={handleChange} className={inputCls} /></div>
              <div><label className={labelCls}>Phone <span className='text-red-400'>*</span></label>
                <input required type='tel' name='phone' value={formData.phone} onChange={handleChange} className={inputCls} /></div>
            </div>
          </div>

          {/* Complainant Address */}
          <div className='border-t border-gray-100 pt-4'>
            <p className={sectionTitle}>Complainant Address</p>
            <div className='grid grid-cols-2 gap-3'>
              <div><label className={labelCls}>City</label>
                <input type='text' name='address_city' value={formData.address_city} onChange={handleChange} placeholder='Addis Ababa' className={inputCls} /></div>
              <div><label className={labelCls}>Subcity</label>
                <select name='address_subcity' value={formData.address_subcity} onChange={handleChange} className={inputCls + ' bg-white'}>
                  <option value=''>Select</option>
                  {subcities.map(s => <option key={s} value={s}>{s}</option>)}
                </select></div>
              <div><label className={labelCls}>Woreda</label>
                <input type='text' name='address_woreda' value={formData.address_woreda} onChange={handleChange} placeholder='01' className={inputCls} /></div>
              <div><label className={labelCls}>House No.</label>
                <input type='text' name='address_house_number' value={formData.address_house_number} onChange={handleChange} className={inputCls} /></div>
            </div>
          </div>

          {/* Incident Location */}
          <div className='border-t border-gray-100 pt-4'>
            <p className={sectionTitle}>Incident Location</p>
            <div className='grid grid-cols-2 gap-3'>
              <div><label className={labelCls}>Subcity</label>
                <select name='complaint_subcity' value={formData.complaint_subcity} onChange={handleChange} className={inputCls + ' bg-white'}>
                  <option value=''>Select</option>
                  {subcities.map(s => <option key={s} value={s}>{s}</option>)}
                </select></div>
              <div><label className={labelCls}>Woreda</label>
                <input type='text' name='complaint_woreda' value={formData.complaint_woreda} onChange={handleChange} placeholder='01' className={inputCls} /></div>
            </div>
          </div>

          {/* Complaint Details */}
          <div className='border-t border-gray-100 pt-4'>
            <p className={sectionTitle}>Complaint Details</p>
            <div className='space-y-3'>
              <div><label className={labelCls}>Sector Group <span className='text-red-400'>*</span></label>
                <select required name='complaint_sector_group' value={formData.complaint_sector_group} onChange={handleChange} className={inputCls + ' bg-white'}>
                  <option value=''>Select sector group</option>
                  {sectorGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select></div>
              <div><label className={labelCls}>Staff Member Concerned</label>
                <input type='text' name='concerned_staff_member' value={formData.concerned_staff_member} onChange={handleChange} placeholder='Name of staff member (if any)' className={inputCls} /></div>
              <div><label className={labelCls}>Status <span className='text-red-400'>*</span></label>
                <select required name='status' value={formData.status} onChange={handleChange} className={inputCls + ' bg-white'}>
                  <option value=''>Select status</option>
                  <option value='assigning'>Assigning</option>
                  <option value='in progress'>In Progress</option>
                  <option value='resolved'>Resolved</option>
                </select></div>
              <div><label className={labelCls}>Description <span className='text-red-400'>*</span></label>
                <textarea required name='description' value={formData.description} onChange={handleChange} rows={5} placeholder='Describe the complaint…' className={inputCls + ' resize-none'} /></div>
            </div>
          </div>

          {/* Media */}
          <div className='border-t border-gray-100 pt-4'>
            <p className={sectionTitle}>Evidence</p>
            <div className='space-y-4'>
              <div><label className={labelCls}>Photos</label>
                <Upload photo={formData.photo} setFormData={setFormData} /></div>
              <div><label className={labelCls}>Video</label>
                <MediaRecorderComponent type='video' initialMedia={formData.video} onMediaCaptured={d => setFormData(p => ({ ...p, video: d }))} /></div>
              <div><label className={labelCls}>Audio</label>
                <MediaRecorderComponent type='audio' initialMedia={formData.audio} onMediaCaptured={d => setFormData(p => ({ ...p, audio: d }))} /></div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className='px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 shrink-0'>
          <button type='button' onClick={onClose} className='px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors'>Cancel</button>
          <LoadingButton isLoading={isSubmitting} onClick={handleSubmit}
            className='px-6 py-2 bg-[#3A3A3A] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors'>
            {selectedComplaint ? 'Save Changes' : 'Create Complaint'}
          </LoadingButton>
        </div>
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
function Compliants() {
  const { token } = useContext(adminContext)
  const navigate  = useNavigate()

  const [loading,          setLoading]          = useState(true)
  const [complaintsList,   setComplaintsList]    = useState([])
  const [complaintsStat,   setComplaintsStat]    = useState(null)
  const [panelOpen,        setPanelOpen]         = useState(false)
  const [editingComplaint, setEditingComplaint]  = useState(null)
  const [showDeleteDialog, setShowDeleteDialog]  = useState(false)
  const [complaintToDelete,setComplaintToDelete] = useState(null)
  const [notification,     setNotification]      = useState({ isOpen: false, message: '', type: 'success' })
  const [searchQuery,      setSearchQuery]       = useState('')
  const [statusFilter,     setStatusFilter]      = useState('All')
  const [sortConfig,       setSortConfig]        = useState({ key: 'created_at', direction: 'desc' })

  const notify = (message, type = 'success') => setNotification({ isOpen: true, message, type })

  const fetchComplaints = async () => {
    const t = token || localStorage.getItem('token')
    if (!t) return
    try {
      const res = await fetch(`${BASE_URL}/api/admin/complaints`, { headers: { authorization: `Bearer ${t}` } })
      if (!res.ok) { if (res.status === 401) { localStorage.removeItem('token'); navigate('/auth/login') } return }
      const data = await res.json()
      setComplaintsList(data.complaints || [])
      setComplaintsStat(data.counts || null)
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    fetchComplaints().finally(() => setLoading(false))
  }, [token])

  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }))

  const filteredComplaints = useMemo(() => {
    let list = [...complaintsList]
    if (statusFilter !== 'All') list = list.filter(c => c.status === statusFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.type?.toLowerCase().includes(q) ||
        c.complaint_subcity?.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      let res = 0
      if (sortConfig.key === 'full_name') res = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      else if (sortConfig.key === 'created_at') res = new Date(a.created_at||0) - new Date(b.created_at||0)
      else if (sortConfig.key === 'status') res = (a.status||'').localeCompare(b.status||'')
      else if (sortConfig.key === 'type') res = (a.type||'').localeCompare(b.type||'')
      return sortConfig.direction === 'asc' ? res : -res
    })
    return list
  }, [complaintsList, statusFilter, searchQuery, sortConfig])

  const handleOpenCreate = () => { setEditingComplaint(null); setPanelOpen(true) }
  const handleOpenEdit   = (c) => { setEditingComplaint(c); setPanelOpen(true) }

  const handleSaved = (action, errMsg) => {
    if (errMsg) { notify(errMsg, 'error'); return }
    notify(action === 'create' ? 'Complaint created!' : 'Complaint updated!')
    fetchComplaints()
  }

  const handleDeleteClick   = (c) => { setComplaintToDelete(c); setShowDeleteDialog(true) }
  const handleDeleteConfirm = async () => {
    if (!complaintToDelete) return
    try {
      const res = await fetch(`/api/admin/complaints/${complaintToDelete.complaint_id}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to delete')
      await fetchComplaints()
      notify('Complaint deleted.')
    } catch (err) { notify(err.message, 'error') }
    finally { setShowDeleteDialog(false); setComplaintToDelete(null) }
  }

  // Inline status update
  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      const complaint = complaintsList.find(c => c.complaint_id === complaintId)
      if (!complaint) return
      const res = await fetch(`${BASE_URL}/api/admin/update/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ formData: { ...complaint, id: complaintId, type: complaint.type, status: newStatus, photo: complaint.photos || [], video: complaint.videos || [], audio: complaint.audios || [] } })
      })
      if (!res.ok) throw new Error('Failed to update status')
      setComplaintsList(prev => prev.map(c => c.complaint_id === complaintId ? { ...c, status: newStatus } : c))
      notify('Status updated!')
    } catch (err) { notify(err.message, 'error') }
  }

  const SortBtn = ({ col, label }) => (
    <button type='button' onClick={() => handleSort(col)}
      className='flex items-center gap-1 hover:text-[#3A3A3A] transition-colors'>
      {label}<SortIcon className={`w-3 h-3 ${sortConfig.key === col ? 'text-[#3A3A3A]' : 'text-gray-400'}`} />
    </button>
  )

  if (loading) return (
    <div className='p-6 space-y-6 animate-pulse'>
      <div className='flex justify-between'><div className='h-8 w-40 bg-gray-200 rounded' /><div className='h-10 w-40 bg-gray-300 rounded-lg' /></div>
      <div className='grid grid-cols-3 gap-4'>{[1,2,3].map(i => <div key={i} className='h-20 bg-gray-100 rounded-xl' />)}</div>
      <div className='bg-white rounded-2xl h-96 border border-gray-200' />
    </div>
  )

  return (
    <div className='p-6 font-jost min-h-screen bg-[#F6F6F6]'>
      <Notification isOpen={notification.isOpen} message={notification.message} type={notification.type} onClose={() => setNotification(n => ({ ...n, isOpen: false }))} />

      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-[#3A3A3A]'>Complaints</h1>
          <p className='text-sm text-gray-500 mt-0.5'>{complaintsList.length} total</p>
        </div>
        <button onClick={handleOpenCreate}
          className='px-5 py-2.5 bg-[#3A3A3A] text-white text-sm font-semibold rounded-xl hover:bg-black active:scale-95 transition-all cursor-pointer shadow-sm'>
          + New Complaint
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[
          { label: 'Total',    value: complaintsStat?.total   || 0 },
          { label: 'Pending',  value: complaintsStat?.pending || 0 },
          { label: 'Resolved', value: complaintsStat?.resolved|| 0 }
        ].map(s => (
          <div key={s.label} className='bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm'>
            <p className='text-xs text-gray-400 uppercase font-semibold tracking-wide'>{s.label}</p>
            <p className='text-2xl font-bold text-[#3A3A3A] mt-1'>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-3 mb-4 items-center'>
        <div className='relative flex-1 min-w-48'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input type='text' placeholder='Search by name, type, subcity…' value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white' />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className='px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] bg-white'>
          <option value='All'>All Statuses</option>
          <option value='assigning'>Assigning</option>
          <option value='in progress'>In Progress</option>
          <option value='resolved'>Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
        {filteredComplaints.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
            <ComplaintIcon className='w-14 h-14 mb-4 opacity-30' />
            <p className='text-lg font-medium'>No complaints found</p>
            <p className='text-sm mt-1'>Try adjusting your filters or log a new complaint</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100'>
                  <th className='px-5 py-3.5 text-left'><SortBtn col='full_name' label='Name' /></th>
                  <th className='px-4 py-3.5 text-left hidden md:table-cell'>Subcity</th>
                  <th className='px-4 py-3.5 text-left hidden lg:table-cell'><SortBtn col='type' label='Sector' /></th>
                  <th className='px-4 py-3.5 text-left'><SortBtn col='status' label='Status' /></th>
                  <th className='px-4 py-3.5 text-left hidden md:table-cell'><SortBtn col='created_at' label='Date' /></th>
                  <th className='px-4 py-3.5 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {filteredComplaints.map(c => (
                  <tr key={c.complaint_id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-5 py-3.5 font-medium text-[#3A3A3A]'>{c.first_name} {c.last_name}</td>
                    <td className='px-4 py-3.5 text-gray-500 hidden md:table-cell'>{c.complaint_subcity || '—'}</td>
                    <td className='px-4 py-3.5 text-gray-500 hidden lg:table-cell max-w-48'>
                      <span className='truncate block'>{c.type || '—'}</span>
                    </td>
                    <td className='px-4 py-3.5'>
                      <select value={c.status || ''} onChange={e => handleStatusChange(c.complaint_id, e.target.value)}
                        className='text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3A3A] cursor-pointer'>
                        <option value='assigning'>Assigning</option>
                        <option value='in progress'>In Progress</option>
                        <option value='resolved'>Resolved</option>
                      </select>
                    </td>
                    <td className='px-4 py-3.5 text-gray-400 hidden md:table-cell text-xs'>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className='px-4 py-3.5'>
                      <div className='flex gap-1.5 justify-end'>
                        <button onClick={() => handleOpenEdit(c)}
                          className='w-8 h-8 flex items-center justify-center bg-[#3A3A3A] rounded-full cursor-pointer hover:bg-black transition-colors'>
                          <EditIcon className='w-3.5 h-3.5 text-white' />
                        </button>
                        <button onClick={() => handleDeleteClick(c)}
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

      <ComplaintPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} selectedComplaint={editingComplaint} token={token} onSaved={handleSaved} />

      <ConfirmationDialog
        isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={handleDeleteConfirm}
        title='Delete Complaint' message='Are you sure you want to delete this complaint? This cannot be undone.'
        confirmText='Delete' confirmButtonStyle='bg-red-600 hover:bg-red-700' />
    </div>
  )
}

export default Compliants
