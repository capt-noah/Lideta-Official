import BASE_URL from '../../utils/api'
import React, { useState, useRef, useEffect } from 'react'
import RecordIcon from '../../assets/icons/record_icon.svg?react'
import StopIcon   from '../../assets/icons/stop_icon.svg?react'
import TrashIcon  from '../../assets/icons/trash_icon2.svg?react'
import UploadIcon from '../../assets/icons/upload_icon.svg?react'
import { useLanguage } from '../utils/LanguageContext'

const UI = {
  click_to_record: { en: 'Click below to record', am: 'ለመቅዳት ከታች ጠቅ ያድርጉ',         or: 'Waraabuf gaditti cuqaasi' },
  start_recording: { en: 'Start Recording',        am: 'ቅዳ',                            or: 'Waraabuu Eegali' },
  recording:       { en: 'Recording...',            am: 'እየቀዳ ነው...',                   or: 'Waraabaa jira...' },
  stop_recording:  { en: 'Stop Recording',          am: 'ቅዳ አቁም',                       or: 'Waraabuu Dhaabi' },
  uploading:       { en: 'Uploading...',             am: 'እየተጫነ ነው...',                  or: "Fe'aa jira..." },
  discard:         { en: 'Discard',                  am: 'ሰርዝ',                           or: 'Haquu' },
  attach:          { en: 'Attach',                   am: 'ያያይዙ',                          or: 'Qabsiisi' },
}

function MediaRecorderComponent({ type = 'video', onMediaCaptured, initialMedia }) {
  const { language } = useLanguage()
  const [isRecording,   setIsRecording]   = useState(false)
  const [mediaBlobUrl,  setMediaBlobUrl]  = useState(null)
  const [mediaFile,     setMediaFile]     = useState(null)
  const [isUploading,   setIsUploading]   = useState(false)
  const [uploadedMedia, setUploadedMedia] = useState(initialMedia || null)

  const mediaRecorderRef = useRef(null)
  const streamRef        = useRef(null)
  const videoPreviewRef  = useRef(null)
  const chunksRef        = useRef([])

  const t = (key) => UI[key][language] || UI[key].en

  useEffect(() => {
    if (initialMedia) {
      if (Array.isArray(initialMedia) && initialMedia.length > 0) setUploadedMedia(initialMedia[0])
      else if (!Array.isArray(initialMedia) && typeof initialMedia === 'object') setUploadedMedia(initialMedia)
      else setUploadedMedia(null)
    } else {
      setUploadedMedia(null)
    }
  }, [initialMedia])

  // Reset local recording state when language changes so stale button labels don't linger
  useEffect(() => {
    if (!uploadedMedia) {
      setMediaBlobUrl(null)
      setMediaFile(null)
      setIsRecording(false)
    }
  }, [language])

  const startRecording = async () => {
    try {
      const constraints = type === 'video' ? { video: true, audio: true } : { audio: true }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (type === 'video' && videoPreviewRef.current) videoPreviewRef.current.srcObject = stream

      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const mimeType = type === 'video' ? 'video/webm' : 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setMediaBlobUrl(URL.createObjectURL(blob))
        setMediaFile(new File([blob], `recorded_${type}_${Date.now()}.webm`, { type: mimeType }))
        streamRef.current?.getTracks().forEach(t => t.stop())
      }
      mr.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Error accessing media devices.', err)
      alert('Could not access your camera or microphone.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const discardRecording = () => {
    setMediaBlobUrl(null)
    setMediaFile(null)
    if (videoPreviewRef.current?.srcObject) videoPreviewRef.current.srcObject = null
  }

  const uploadMedia = async () => {
    if (!mediaFile) return
    setIsUploading(true)
    const fd = new FormData()
    fd.append(type, mediaFile)
    try {
      const res = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error(`Failed to upload ${type}`)
      const fileData = await res.json()
      setUploadedMedia(fileData)
      if (onMediaCaptured) onMediaCaptured(fileData)
      discardRecording()
    } catch (err) {
      console.error(`Error uploading ${type}:`, err)
      alert(`Failed to upload ${type}`)
    } finally {
      setIsUploading(false)
    }
  }

  const removeUploadedMedia = () => {
    setUploadedMedia(null)
    if (onMediaCaptured) onMediaCaptured(null)
  }

  if (uploadedMedia?.path) {
    return (
      <div className="w-full h-full space-y-4 mt-4">
        <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-3 bg-white shadow-sm">
          {type === 'video'
            ? <video src={uploadedMedia.path} controls className="w-full max-h-60 rounded-md" />
            : <audio src={uploadedMedia.path} controls className="w-full" />
          }
          <div className="flex justify-between items-center">
            <p className="font-roboto text-sm font-medium text-gray-700 truncate">{uploadedMedia.name || 'Recorded Media'}</p>
            <button type="button" onClick={removeUploadedMedia} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="border-2 border-dashed border-gray-400 bg-gray-50 rounded-4xl py-6 text-center min-h-[150px] flex flex-col justify-center items-center">
        {isRecording && type === 'video' && (
          <video ref={videoPreviewRef} autoPlay muted className="w-full max-w-sm max-h-60 rounded-lg mb-4 bg-black mx-auto" />
        )}
        {!isRecording && mediaBlobUrl && type === 'video' && (
          <video src={mediaBlobUrl} controls className="w-full max-w-sm max-h-60 rounded-lg mb-4 bg-black mx-auto" />
        )}
        {!isRecording && mediaBlobUrl && type === 'audio' && (
          <audio src={mediaBlobUrl} controls className="w-full max-w-sm mb-4 mx-auto" />
        )}

        {isUploading ? (
          <div className="flex flex-col items-center justify-center p-4">
            <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#3A3A3A] mx-auto mb-3' />
            <p className='font-roboto text-sm text-gray-600'>{t('uploading')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3">
            {!isRecording && !mediaBlobUrl && (
              <>
                <RecordIcon className='w-10 h-10 mx-auto text-gray-700 opacity-80 mb-1' />
                <p className='font-roboto text-sm text-gray-500'>{t('click_to_record')}</p>
                <button type="button" onClick={startRecording}
                  className="inline-block px-6 py-2 bg-white text-[#3A3A3A] border border-[#3A3A3A] rounded-lg font-roboto font-medium text-sm cursor-pointer hover:bg-gray-50 transition-colors">
                  {t('start_recording')}
                </button>
              </>
            )}

            {isRecording && (
              <>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-3 h-3 rounded-full bg-red-500 animate-pulse' />
                  <span className='font-roboto text-sm text-gray-600 font-medium'>{t('recording')}</span>
                </div>
                <button type="button" onClick={stopRecording}
                  className="inline-block px-6 py-2 bg-[#3A3A3A] text-white rounded-lg font-roboto font-medium text-sm cursor-pointer hover:bg-[#5e5e5e] transition-colors">
                  {t('stop_recording')}
                </button>
              </>
            )}

            {mediaBlobUrl && !isRecording && (
              <div className="flex justify-center items-center gap-3">
                <button type="button" onClick={discardRecording}
                  className="inline-flex items-center gap-1.5 px-6 py-2 bg-white text-red-500 border border-red-200 rounded-lg font-roboto font-medium text-sm cursor-pointer hover:bg-red-50 transition-colors">
                  <TrashIcon className="w-4 h-4" />
                  {t('discard')}
                </button>
                <button type="button" onClick={uploadMedia}
                  className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#3A3A3A] text-white rounded-lg font-roboto font-medium text-sm cursor-pointer hover:bg-[#5e5e5e] transition-colors">
                  <UploadIcon className="w-4 h-4 text-white" />
                  {t('attach')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaRecorderComponent
