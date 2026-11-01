import React from 'react'

export default function Toast({ toast, onClose }) {
  if (!toast) return null

  return (
    <div className={`toast-container ${toast.type || 'info'}`} role="alert">
      <div className="toast-content">
        <span className="material-icons toast-icon">
          {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error_outline' : 'info'}
        </span>
        <div className="toast-message">
          <strong>{toast.title || 'Notification'}</strong>
          {toast.message && <p>{toast.message}</p>}
        </div>
        {toast.action && (
          <button className="toast-action" onClick={toast.action.onClick}>
            {toast.action.label}
          </button>
        )}
        <button className="toast-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  )
}
