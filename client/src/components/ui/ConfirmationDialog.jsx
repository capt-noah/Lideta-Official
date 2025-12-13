import { useRef, useEffect } from 'react'

function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonStyle = ""
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed w-90 mx-auto my-auto z-50 px-4 py-2 rounded-xl shadow-xl backdrop:bg-black/50 font-roboto "
    >
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-2xl font-semibold text-[#3a3a3a] mb-4">{title}</h3>
        <p className="text-gray-400 mb-4 ">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 bg-[#3a3a3a] text-white rounded-md hover:bg-[#2a2a2a] transition-colors cursor-pointer ${confirmButtonStyle}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default ConfirmationDialog
