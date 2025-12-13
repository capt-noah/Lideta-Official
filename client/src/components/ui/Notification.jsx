import { useEffect } from 'react'
import CheckmarkIcon from '../../assets/icons/checkmark_icon.svg?react'

function Notification({ isOpen, onClose, message, type = 'success', duration = 3000 }) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed top-4 right-4 z-50"
      style={{
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <div className="bg-white border-2 border-[#3A3A3A] rounded-xl shadow-md shadow-gray-400 p-4 min-w-[300px] max-w-[400px] font-roboto">
        <div className="flex items-start gap-3">
          {type === 'success' && (
            <div className="flex-shrink-0 w-10 h-10 bg-[#3A3A3A] rounded-full flex items-center justify-center">
              <CheckmarkIcon className="w-5 h-5 text-white" />
            </div>
          )}
          {type === 'error' && (
            <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">×</span>
            </div>
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              type === 'success' ? 'text-[#3A3A3A]' : 'text-red-600'
            }`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-[#3A3A3A] transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <span className="text-xl font-bold leading-none">×</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default Notification
