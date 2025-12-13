import { useState, useEffect } from "react"

import UploadIcon from '../../assets/icons/upload_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon2.svg?react'

function Upload({ photo, setFormData, initialFile, onFileUpload }) {
    const [dragActive, setDragActive] = useState(false)
    const [preview, setPreview] = useState(null)

    // Handle initial file (when editing)
    useEffect(() => {
        if (initialFile) {
            if (typeof initialFile === 'object' && initialFile.name) {
                // Already in JSON format
                setPreview(initialFile)
            } else if (Array.isArray(initialFile) && initialFile.length > 0) {
                // Array format
                setPreview(initialFile[0])
            }
        }
    }, [initialFile])

    const createFileJSON = (file) => {
        // Generate a relative path
        const timestamp = Date.now()
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const path = `/uploads/${timestamp}_${sanitizedName}`
        
        return {
            name: file.name,
            path: path,
            url: path // For compatibility
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file && file.type.startsWith('image/')) {
            const fileJSON = createFileJSON(file)
            
            // Create preview URL
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview({ ...fileJSON, preview: reader.result })
            }
            reader.readAsDataURL(file)
            
            // Update form data with JSON format
            setFormData(prev => ({
                ...prev,
                photo: fileJSON
            }))

            // Call optional callback
            if (onFileUpload) {
                onFileUpload(fileJSON)
            }
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (file.type.startsWith('image/')) {
                const fileJSON = createFileJSON(file)
                
                // Create preview URL
                const reader = new FileReader()
                reader.onloadend = () => {
                    setPreview({ ...fileJSON, preview: reader.result })
                }
                reader.readAsDataURL(file)
                
                setFormData(prev => ({
                    ...prev,
                    photo: fileJSON
                }))

                // Call optional callback
                if (onFileUpload) {
                    onFileUpload(fileJSON)
                }
            }
        }
    }

    const handleRemovePhoto = () => {
        setPreview(null)
        setFormData(prev => ({
            ...prev,
            photo: null
        }))
    }

    const displayPhoto = photo || preview

    return (
        <div className="w-full h-full" >
            {displayPhoto ? 
                <div className='border-2 border-dashed border-gray-100 rounded-lg p-6'>
                    {displayPhoto.preview ? (
                        <div className='space-y-3'>
                            <img 
                                src={displayPhoto.preview} 
                                alt={displayPhoto.name || 'Preview'} 
                                className='w-full h-48 object-cover rounded-lg'
                            />
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <UploadIcon className='w-6 h-6' />
                                    <div>
                                        <span className='font-roboto text-sm block'>{displayPhoto.name}</span>
                                        <span className='font-roboto text-xs text-gray-500'>{displayPhoto.path}</span>
                                    </div>
                                </div>
                                <button 
                                    type='button' 
                                    onClick={handleRemovePhoto} 
                                    className='text-red-600 hover:text-red-800 font-roboto text-sm cursor-pointer' 
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <UploadIcon className='w-6 h-6' />
                                <div>
                                    <span className='font-roboto text-sm block'>{displayPhoto.name || 'Image'}</span>
                                    {displayPhoto.path && (
                                        <span className='font-roboto text-xs text-gray-500'>{displayPhoto.path}</span>
                                    )}
                                </div>
                            </div>
                            <button 
                                type='button' 
                                onClick={handleRemovePhoto} 
                                className='text-red-600 hover:text-red-800 font-roboto text-sm cursor-pointer' 
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    )}
                </div>
                :       
                <div 
                    onDragEnter={handleDrag} 
                    onDragLeave={handleDrag} 
                    onDragOver={handleDrag} 
                    onDrop={handleDrop} 
                    className={`border-2 border-dashed rounded-4xl py-4 text-center transition-colors ${
                        dragActive ? 'border-gray-600 bg-gray-300' : 'border-gray-400 bg-gray-200'
                    }`}
                >
                    <UploadIcon className='w-16 h-16 mx-auto mb-3 text-gray-700' />
                    <p className='font-roboto text-sm text-gray-600 mb-3'>Drag and Drop</p>
                    <label className='inline-block px-6 py-2 bg-[#3A3A3A] text-white rounded-lg font-roboto font-medium text-sm cursor-pointer hover:bg-[#5e5e5e] transition-colors'>
                        Browse file
                        <input
                            type='file'
                            accept='image/*'
                            onChange={handleFileChange}
                            className='hidden'
                        />
                    </label>
                </div>
            }
        </div>
    )
}

export default Upload