import { useState } from "react"

import UploadIcon from '../../assets/icons/upload_icon.svg?react'
import TrashIcon from '../../assets/icons/trash_icon2.svg?react'

function Upload({ photo, setFormData }) {

    const [dragActive, setDragActive] = useState(false)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }))
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
        setFormData(prev => ({
          ...prev,
          photo: file
        }))
      }
    }
  }

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: null
    }))
  }

    return (
        <div className="w-full h-full" >

            {photo ? 
    
                <div className='border-2 border-dashed border-gray-100 rounded-lg p-6 '>
                    <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <UploadIcon className=' w-6 h-6' />
                        <span className='font-roboto text-sm'>{photo.name}</span>
                    </div>
                    
                    <button type='button' onClick={handleRemovePhoto} className='text-red-600 hover:text-red-800 font-roboto text-sm cursor-pointer' >
                        <TrashIcon  />
                    </button>
                    </div>
                </div>

                    :       
                    
                <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={` border-2 border-dashed rounded-4xl py-4 text-center transition-colors ${ dragActive ? 'border-gray-600 bg-gray-300' : 'border-gray-400 bg-gray-200 ' }`} >
                <UploadIcon className='w-16 h-16 mx-auto mb-3 text-gray-700'  />
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