import { useState, useEffect } from "react"

import UploadIcon from '../../assets/icons/upload_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon2.svg?react'

function Upload({ photo, setFormData, initialFile, onFileUpload }) {
    const [dragActive, setDragActive] = useState(false)
    const [previews, setPreviews] = useState([])
    const [uploading, setUploading] = useState(false)

    // Handle initial file (when editing) - prioritize photo prop, then initialFile
    useEffect(() => {
        const fileToDisplay = photo || initialFile
        if (fileToDisplay) {
            if (Array.isArray(fileToDisplay) && fileToDisplay.length > 0) {
                // Array format - normalize each item
                const normalized = fileToDisplay.map(item => ({
                    name: item.name || 'uploaded-image',
                    path: item.path,
                    size: item.size || 0
                }))
                setPreviews(normalized)
            } else if (typeof fileToDisplay === 'object' && fileToDisplay.path) {
                // Single object format - wrap in array and normalize
                setPreviews([{
                    name: fileToDisplay.name || 'uploaded-image',
                    path: fileToDisplay.path,
                    size: fileToDisplay.size || 0
                }])
            } else {
                setPreviews([])
            }
        } else {
            setPreviews([])
        }
    }, [photo, initialFile])

    const uploadFile = async (file) => {
        const formData = new FormData()
        formData.append('image', file)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error('Failed to upload image')
            }

            const fileData = await response.json()
            return fileData
        } catch (error) {
            console.error('Error uploading file:', error)
            throw error
        }
    }

    const processFiles = async (files) => {
        setUploading(true)
        const newUploadedFiles = []

        // Process each file sequentially (or could be parallel)
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (file.type.startsWith('image/')) {
                try {
                    // Upload file to server
                    const fileData = await uploadFile(file)
                    newUploadedFiles.push(fileData)
                } catch (error) {
                     console.error(`Failed to upload ${file.name}`, error)
                     alert(`Failed to upload ${file.name}`)
                }
            }
        }

        if (newUploadedFiles.length > 0) {
            // Update form data (append new files to existing ones)
            setFormData(prev => {
                const existingPhotos = Array.isArray(prev.photo) ? prev.photo : (prev.photo ? [prev.photo] : [])
                 // Filter out duplicates if needed, or just append
                const updatedPhotos = [...existingPhotos, ...newUploadedFiles]
                return {
                    ...prev,
                    photo: updatedPhotos
                }
            })

             // Update local previews
             setPreviews(prev => [...prev, ...newUploadedFiles])

             if(onFileUpload) {
                 onFileUpload(newUploadedFiles)
             }
        }
        setUploading(false)
    }


    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length > 0) {
           await processFiles(files)
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

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files)
        await processFiles(files)
    }
  }

    const handleRemovePhoto = (indexToRemove) => {
        const updatedPreviews = previews.filter((_, index) => index !== indexToRemove)
        setPreviews(updatedPreviews)
        
        setFormData(prev => ({
            ...prev,
            photo: updatedPreviews.length > 0 ? updatedPreviews : null
        }))
    }

    return (
        <div className="w-full h-full space-y-4" >
            {/* Upload Area */}
             <div 
                onDragEnter={handleDrag} 
                onDragLeave={handleDrag} 
                onDragOver={handleDrag} 
                onDrop={handleDrop} 
                className={`border-2 border-dashed rounded-4xl py-4 text-center transition-colors min-h-[150px] flex flex-col justify-center items-center ${
                    dragActive ? 'border-gray-600 bg-gray-300' : 'border-gray-400 bg-gray-50'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {uploading ? (
                    <>
                        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3A3A3A] mx-auto mb-3'></div>
                        <p className='font-roboto text-sm text-gray-600 mb-3'>Uploading...</p>
                    </>
                ) : (
                    <>
                        <UploadIcon className='w-12 h-12 mx-auto mb-3 text-gray-700' />
                        <p className='font-roboto text-sm text-gray-600 mb-3'>Drag and Drop photos here</p>
                        <label className='inline-block px-6 py-2 bg-[#3A3A3A] text-white rounded-lg font-roboto font-medium text-sm cursor-pointer hover:bg-[#5e5e5e] transition-colors'>
                            Browse files
                            <input
                                type='file'
                                accept='image/*'
                                multiple
                                onChange={handleFileChange}
                                className='hidden'
                                disabled={uploading}
                            />
                        </label>
                    </>
                )}
            </div>

            {/* Previews Grid */}
            {previews.length > 0 && (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4'>
                    {previews.map((file, index) => (
                         <div key={index} className='border border-gray-200 rounded-lg p-3 flex items-center gap-3 bg-white shadow-sm relative group'>
                            <div className='flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden'>
                                {file.path ? (
                                    <img 
                                    src={`${file.path}`} 
                                    alt={file.name} 
                                    className='w-full h-full object-cover'
                                    />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center text-gray-400'>
                                        <UploadIcon className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                            
                            <div className='flex-1 min-w-0'>
                                <p className='font-roboto text-sm font-medium text-gray-700 truncate' title={file.name}>
                                    {file.name}
                                </p>
                                <p className='text-xs text-gray-500 truncate'>
                                    {usersReadableSize(file.size)}
                                </p>
                            </div>

                            <button 
                                type='button' 
                                onClick={() => handleRemovePhoto(index)} 
                                className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors'
                                title="Remove photo"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                         </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Helper to format file size
function usersReadableSize(size) {
    if (!size) return '';
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

export default Upload