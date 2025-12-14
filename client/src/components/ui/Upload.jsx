import { useState, useEffect } from "react"

import UploadIcon from '../../assets/icons/upload_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon2.svg?react'

function Upload({ photo, setFormData, initialFile, onFileUpload }) {
    const [dragActive, setDragActive] = useState(false)
    const [preview, setPreview] = useState(null)
    const [uploading, setUploading] = useState(false)

    // Handle initial file (when editing) - prioritize photo prop, then initialFile
    useEffect(() => {
        const fileToDisplay = photo || initialFile
        if (fileToDisplay) {
            if (typeof fileToDisplay === 'object' && fileToDisplay.name) {
                // Already in JSON format
                setPreview(fileToDisplay)
            } else if (Array.isArray(fileToDisplay) && fileToDisplay.length > 0) {
                // Array format
                setPreview(fileToDisplay[0])
            }
        } else {
            setPreview(null)
        }
    }, [photo, initialFile])

    const uploadFile = async (file) => {
        const formData = new FormData()
        formData.append('image', file)

        try {
            const response = await fetch('http://localhost:3000/api/upload', {
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

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (file && file.type.startsWith('image/')) {
            setUploading(true)
            
            // Create preview URL immediately
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview({ name: file.name, path: '', preview: reader.result })
            }
            reader.readAsDataURL(file)

            try {
                // Upload file to server
                const fileData = await uploadFile(file)
                
                // Update preview with server response
                setPreview({ ...fileData, preview: reader.result })
                
                // Update form data with JSON format from server
                setFormData(prev => ({
                    ...prev,
                    photo: fileData
                }))

                // Call optional callback
                if (onFileUpload) {
                    onFileUpload(fileData)
                }
            } catch (error) {
                console.error('Upload error:', error)
                alert('Failed to upload image. Please try again.')
                setPreview(null)
            } finally {
                setUploading(false)
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

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        setUploading(true)
        
        // Create preview URL immediately
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview({ name: file.name, path: '', preview: reader.result })
        }
        reader.readAsDataURL(file)

        try {
          // Upload file to server
          const fileData = await uploadFile(file)
          
          // Update preview with server response
          setPreview({ ...fileData, preview: reader.result })
          
          setFormData(prev => ({
            ...prev,
            photo: fileData
          }))

          // Call optional callback
          if (onFileUpload) {
            onFileUpload(fileData)
          }
        } catch (error) {
          console.error('Upload error:', error)
          alert('Failed to upload image. Please try again.')
          setPreview(null)
        } finally {
          setUploading(false)
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

    // Use photo from props if available, otherwise use preview
    const displayPhoto = photo || preview

    return (
        <div className="w-full h-full" >
            {displayPhoto ? 
                <div className='border-2 border-dashed border-gray-100 rounded-lg p-4'>
                    {(displayPhoto.preview || displayPhoto.path) ? (
                        <div className='flex items-start gap-4'>
                            <div className='flex-shrink-0'>
                                <img 
                                    src={displayPhoto.path ? `http://localhost:3000${displayPhoto.path}` : displayPhoto.preview} 
                                    alt={displayPhoto.name || 'Preview'} 
                                    className='w-24 h-24 object-cover rounded-lg border border-gray-200'
                                    onError={(e) => {
                                        // Fallback to preview if server image fails to load
                                        if (displayPhoto.preview) {
                                            e.target.src = displayPhoto.preview
                                        }
                                    }}
                                />
                            </div>
                            <div className='flex-1 flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <UploadIcon className='w-5 h-5 text-gray-400' />
                                    <div>
                                        <span className='font-roboto text-sm block text-gray-700'>{displayPhoto.name}</span>
                                        {displayPhoto.path && (
                                            <span className='font-roboto text-xs text-gray-500'>{displayPhoto.path}</span>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    type='button' 
                                    onClick={handleRemovePhoto} 
                                    className='text-red-600 hover:text-red-800 font-roboto text-sm cursor-pointer flex-shrink-0' 
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <UploadIcon className='w-5 h-5 text-gray-400' />
                                <div>
                                    <span className='font-roboto text-sm block text-gray-700'>{displayPhoto.name || 'Image'}</span>
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
                    } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {uploading ? (
                        <>
                            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3A3A3A] mx-auto mb-3'></div>
                            <p className='font-roboto text-sm text-gray-600 mb-3'>Uploading...</p>
                        </>
                    ) : (
                        <>
                            <UploadIcon className='w-16 h-16 mx-auto mb-3 text-gray-700' />
                            <p className='font-roboto text-sm text-gray-600 mb-3'>Drag and Drop</p>
                            <label className='inline-block px-6 py-2 bg-[#3A3A3A] text-white rounded-lg font-roboto font-medium text-sm cursor-pointer hover:bg-[#5e5e5e] transition-colors'>
                                Browse file
                                <input
                                    type='file'
                                    accept='image/*'
                                    onChange={handleFileChange}
                                    className='hidden'
                                    disabled={uploading}
                                />
                            </label>
                        </>
                    )}
                </div>
            }
        </div>
    )
}

export default Upload