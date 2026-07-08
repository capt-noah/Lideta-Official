import { useState, useEffect } from "react"
import UploadIcon from '../../assets/icons/upload_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon2.svg?react'
import { useLanguage } from '../utils/LanguageContext'

const UI = {
  drag:      { en: 'Drag and Drop photos here', am: 'ፎቶዎችን እዚህ ጎትተው ይተው', or: 'Suurawwan asii arraabiifi dhiisi' },
  browse:    { en: 'Browse files',              am: 'ፋይሎችን ይመልከቱ',        or: 'Faayilota ilaali' },
  uploading: { en: 'Uploading...',              am: 'እየተጫነ ነው...',           or: 'Fe\'aa jira...' },
}

function Upload({ photo, setFormData, initialFile, onFileUpload }) {
    const { language } = useLanguage()
    const [dragActive, setDragActive] = useState(false)
    const [previews,   setPreviews]   = useState([])
    const [uploading,  setUploading]  = useState(false)

    const t = (key) => UI[key][language] || UI[key].en

    useEffect(() => {
        const fileToDisplay = photo || initialFile
        if (fileToDisplay) {
            if (Array.isArray(fileToDisplay) && fileToDisplay.length > 0) {
                setPreviews(fileToDisplay.map(item => ({ name: item.name || 'uploaded-image', path: item.path, size: item.size || 0 })))
            } else if (typeof fileToDisplay === 'object' && fileToDisplay.path) {
                setPreviews([{ name: fileToDisplay.name || 'uploaded-image', path: fileToDisplay.path, size: fileToDisplay.size || 0 }])
            } else {
                setPreviews([])
            }
        } else {
            setPreviews([])
        }
    }, [photo, initialFile])

    const uploadFile = async (file) => {
        const fd = new FormData()
        fd.append('photo', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) throw new Error('Failed to upload image')
        return await res.json()
    }

    const processFiles = async (files) => {
        setUploading(true)
        const uploaded = []
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                try {
                    uploaded.push(await uploadFile(file))
                } catch (err) {
                    console.error(`Failed to upload ${file.name}`, err)
                    alert(`Failed to upload ${file.name}`)
                }
            }
        }
        if (uploaded.length > 0) {
            setFormData(prev => {
                const existing = Array.isArray(prev.photo) ? prev.photo : (prev.photo ? [prev.photo] : [])
                return { ...prev, photo: [...existing, ...uploaded] }
            })
            setPreviews(prev => [...prev, ...uploaded])
            if (onFileUpload) onFileUpload(uploaded)
        }
        setUploading(false)
    }

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length > 0) await processFiles(files)
    }

    const handleDrag = (e) => {
        e.preventDefault(); e.stopPropagation()
        setDragActive(e.type === 'dragenter' || e.type === 'dragover')
    }

    const handleDrop = async (e) => {
        e.preventDefault(); e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files?.length > 0) await processFiles(Array.from(e.dataTransfer.files))
    }

    const handleRemovePhoto = (idx) => {
        const updated = previews.filter((_, i) => i !== idx)
        setPreviews(updated)
        setFormData(prev => ({ ...prev, photo: updated.length > 0 ? updated : null }))
    }

    return (
        <div className="w-full h-full space-y-4">
            <div
                onDragEnter={handleDrag} onDragLeave={handleDrag}
                onDragOver={handleDrag} onDrop={handleDrop}
                className={`border-2 border-dashed rounded-4xl py-4 text-center transition-colors min-h-[150px] flex flex-col justify-center items-center ${dragActive ? 'border-gray-600 bg-gray-300' : 'border-gray-400 bg-gray-50'} ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {uploading ? (
                    <>
                        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3A3A3A] mx-auto mb-3' />
                        <p className='font-roboto text-sm text-gray-600 mb-3'>{t('uploading')}</p>
                    </>
                ) : (
                    <>
                        <UploadIcon className='w-12 h-12 mx-auto mb-3 text-gray-700' />
                        <p className='font-roboto text-sm text-gray-600 mb-3'>{t('drag')}</p>
                        <label className='inline-block px-6 py-2 bg-[#3A3A3A] text-white rounded-lg font-roboto font-medium text-sm cursor-pointer hover:bg-[#5e5e5e] transition-colors'>
                            {t('browse')}
                            <input type='file' accept='image/*' multiple onChange={handleFileChange} className='hidden' disabled={uploading} />
                        </label>
                    </>
                )}
            </div>

            {previews.length > 0 && (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4'>
                    {previews.map((file, i) => (
                        <div key={i} className='border border-gray-200 rounded-lg p-3 flex items-center gap-3 bg-white shadow-sm'>
                            <div className='flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden'>
                                {file.path
                                    ? <img src={file.path} alt={file.name} className='w-full h-full object-cover' />
                                    : <div className='w-full h-full flex items-center justify-center text-gray-400'><UploadIcon className="w-6 h-6" /></div>
                                }
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='font-roboto text-sm font-medium text-gray-700 truncate'>{file.name}</p>
                                <p className='text-xs text-gray-500'>{readableSize(file.size)}</p>
                            </div>
                            <button type='button' onClick={() => handleRemovePhoto(i)} className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors'>
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function readableSize(size) {
    if (!size) return ''
    const i = Math.floor(Math.log(size) / Math.log(1024))
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
}

export default Upload
