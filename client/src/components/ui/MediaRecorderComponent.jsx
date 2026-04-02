import React, { useState, useRef, useEffect } from 'react';
import RecordIcon from '../../assets/icons/record_icon.svg?react';
import StopIcon from '../../assets/icons/stop_icon.svg?react';
import TrashIcon from '../../assets/icons/trash_icon2.svg?react';
import UploadIcon from '../../assets/icons/upload_icon.svg?react';

function MediaRecorderComponent({ type = 'video', onMediaCaptured, initialMedia }) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState(initialMedia || null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (initialMedia) {
      // If initialMedia is an array (from DB), take the first item
      if (Array.isArray(initialMedia) && initialMedia.length > 0) {
        setUploadedMedia(initialMedia[0]);
      } else if (!Array.isArray(initialMedia) && typeof initialMedia === 'object') {
        setUploadedMedia(initialMedia);
      } else {
        setUploadedMedia(null);
      }
    } else {
      setUploadedMedia(null);
    }
  }, [initialMedia]);

  const startRecording = async () => {
    try {
      const constraints = type === 'video' ? { video: true, audio: true } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (type === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = type === 'video' ? 'video/webm' : 'audio/webm';
        const ext = type === 'video' ? 'webm' : 'webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setMediaBlobUrl(url);

        const file = new File([blob], `recorded_${type}_${Date.now()}.${ext}`, { type: mimeType });
        setMediaFile(file);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing media devices.', err);
      alert('Could not access your camera or microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const discardRecording = () => {
    setMediaBlobUrl(null);
    setMediaFile(null);
    if (videoPreviewRef.current && videoPreviewRef.current.srcObject) {
         videoPreviewRef.current.srcObject = null;
    }
  };

  const uploadMedia = async () => {
    if (!mediaFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append(type, mediaFile); // use specific type field name: "video" or "audio"

    try {
      const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
      });

      if (!response.ok) {
          throw new Error(`Failed to upload ${type}`);
      }

      const fileData = await response.json();
      setUploadedMedia(fileData);
      
      if (onMediaCaptured) {
        onMediaCaptured(fileData);
      }
      discardRecording();
      
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      alert(`Failed to upload ${type}`);
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedMedia = () => {
    setUploadedMedia(null);
    if (onMediaCaptured) {
        onMediaCaptured(null);
    }
  };

  if (uploadedMedia && uploadedMedia.path) {
    return (
      <div className="w-full h-full space-y-4 mt-4">
        <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-3 bg-white shadow-sm relative group">
           {type === 'video' ? (
                <video src={uploadedMedia.path} controls className="w-full max-h-60 rounded-md" />
           ) : (
                <audio src={uploadedMedia.path} controls className="w-full" />
           )}
           <div className="flex justify-between items-center">
             <div className="min-w-0">
               <p className="font-roboto text-sm font-medium text-gray-700 truncate" title={uploadedMedia.name || 'Recorded Media'}>
                 {uploadedMedia.name || 'Recorded Media'}
               </p>
             </div>
             <button
               type="button"
               onClick={removeUploadedMedia}
               className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
               title={`Remove ${type}`}
             >
               <TrashIcon className="w-4 h-4" />
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full"> 
        <div className="border-2 border-dashed border-gray-400 bg-gray-50 rounded-4xl py-6 text-center min-h-[150px] flex flex-col justify-center items-center">
            {/* Recording active state view preview */}
            {isRecording && type === 'video' && (
                <video ref={videoPreviewRef} autoPlay muted className="w-full max-w-sm max-h-60 rounded-lg mb-4 bg-black mx-auto" />
            )}

            {/* Blob URL view preview */}
            {!isRecording && mediaBlobUrl && type === 'video' && (
                <video src={mediaBlobUrl} controls className="w-full max-w-sm max-h-60 rounded-lg mb-4 bg-black mx-auto" />
            )}
            
            {!isRecording && mediaBlobUrl && type === 'audio' && (
                <audio src={mediaBlobUrl} controls className="w-full max-w-sm mb-4 mx-auto" />
            )}

            {/* Recording Controls */}
            {isUploading ? (
                <div className="flex flex-col items-center justify-center p-4">
                    <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#3A3A3A] mx-auto mb-3'></div>
                    <p className='font-roboto text-sm text-gray-600 mb-3'>Uploading...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center space-y-3">
                    {!isRecording && !mediaBlobUrl && (
                        <>
                             <RecordIcon className='w-10 h-10 mx-auto text-gray-700 opacity-80 mb-1' />
                             <p className='font-roboto text-sm text-gray-500'>Click below to record</p>
                             <button
                                type="button"
                                onClick={startRecording}
                                className="inline-block px-6 py-2 bg-white text-[#3A3A3A] border border-[#3A3A3A] rounded-lg font-roboto font-medium text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                             >
                                Start Recording
                             </button>
                        </>
                    )}

                    {isRecording && (
                        <>
                            <div className='flex items-center gap-2 mb-2'>
                                <div className='w-3 h-3 rounded-full bg-red-500 animate-pulse'></div>
                                <span className='font-roboto text-sm text-gray-600 font-medium'>Recording...</span>
                            </div>
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="inline-block px-6 py-2 bg-[#3A3A3A] text-white rounded-lg font-roboto font-medium text-sm cursor-pointer hover:bg-[#5e5e5e] transition-colors"
                            >
                                Stop Recording
                            </button>
                        </>
                    )}

                    {mediaBlobUrl && !isRecording && (
                        <div className="flex justify-center items-center gap-3">
                            <button
                                type="button"
                                onClick={discardRecording}
                                className="inline-flex items-center gap-1.5 px-6 py-2 bg-white text-red-500 border border-red-200 rounded-lg font-roboto font-medium text-sm cursor-pointer hover:bg-red-50 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Discard
                            </button>
                            
                            <button
                                type="button"
                                onClick={uploadMedia}
                                className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#3A3A3A] text-white rounded-lg font-roboto font-medium text-sm cursor-pointer hover:bg-[#5e5e5e] transition-colors"
                            >
                                <UploadIcon className="w-4 h-4 text-white" />
                                Attach
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
}

export default MediaRecorderComponent;
