import React from 'react'
import site from '../data/site.json'

export default function NotFoundPage({ onNavigate, categories = [] }) {
  return (
    <div className="notfound-page">
      <div className="notfound-container">
        <div className="notfound-badge">404 ERROR</div>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-subtitle">
          Oops! The beauty product or page you are looking for doesn't exist or may have been moved.
        </p>

        <div className="notfound-actions">
          <button
            type="button"
            className="cta"
            onClick={() => onNavigate('/shop')}
          >
            <span className="material-icons">storefront</span>
            <span>Explore Shop Catalogue</span>
          </button>
          <button
            type="button"
            className="cta-secondary"
            onClick={() => onNavigate('/')}
          >
            <span className="material-icons">home</span>
            <span>Return to Home</span>
          </button>
        </div>

        {/* Quick Category Suggestions */}
        <div className="notfound-categories">
          <h3>Browse Popular Categories</h3>
          <div className="notfound-cat-pills">
            {categories.map(c => (
              <button
                key={c.slug}
                type="button"
                className="notfound-cat-pill"
                onClick={() => onNavigate('/shop')}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        {/* WhatsApp Customer Support Assistance */}
        <div className="notfound-support">
          <p>Need help finding an item or placing an order?</p>
          <a
            href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Hi MS Beauty Products! I need help finding a product.')}`}
            target="_blank"
            rel="noreferrer"
            className="notfound-wa-btn"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.188 8.188 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.188 8.188 0 0 1-1.26-4.48c0-4.54 3.7-8.23 8.24-8.23m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.8 1-.15.18-.29.2-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29"/>
            </svg>
            <span>Ask Us on WhatsApp ({site.phone})</span>
          </a>
        </div>
      </div>
    </div>
  )
}
