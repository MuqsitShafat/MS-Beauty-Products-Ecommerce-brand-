import React from 'react'
import site from '../data/site.json'

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <img
        src="/images/logo_ms.png"
        alt="MS Beauty Products"
        className="footer-logo"
        width="90"
        height="90"
        onError={e => {
          e.currentTarget.onerror = null
          e.currentTarget.src = '/images/logo.png'
        }}
      />
      <p className="brand">{site.name}</p>
      <p className="footer-tagline">{site.tagline}</p>

      {/* Customer Contact Details: Phone, WhatsApp, Email */}
      <div className="footer-contact-info">
        <a href={`tel:${site.phone}`} className="footer-contact-link" title="Call Us">
          <span className="material-icons">phone</span>
          <span>{site.phone}</span>
        </a>
        <span className="footer-contact-sep">•</span>
        <a
          href={`https://wa.me/${site.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="footer-contact-link footer-wa-link"
          title="WhatsApp Us"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.188 8.188 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.188 8.188 0 0 1-1.26-4.48c0-4.54 3.7-8.23 8.24-8.23m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.8 1-.15.18-.29.2-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29"/>
          </svg>
          <span>WhatsApp: {site.phone}</span>
        </a>
        <span className="footer-contact-sep">•</span>
        <a
          href={`mailto:${site.email || 'beautyproductsbyms@gmail.com'}`}
          className="footer-contact-link"
          title="Email Us"
        >
          <span className="material-icons">email</span>
          <span>{site.email || 'beautyproductsbyms@gmail.com'}</span>
        </a>
      </div>

      {/* Social Icons (Instagram, Facebook, TikTok, WhatsApp, Email) */}
      <nav className="social-icons-row" aria-label="Social Media Links">
        {/* Instagram Icon */}
        <a
          href={site.instagram}
          target="_blank"
          rel="noreferrer"
          className="social-icon-btn social-ig"
          aria-label="Instagram"
          title="Follow MS Beauty on Instagram"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>

        {/* Facebook Icon */}
        <a
          href={site.facebook}
          target="_blank"
          rel="noreferrer"
          className="social-icon-btn social-fb"
          aria-label="Facebook"
          title="Follow MS Beauty on Facebook"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>

        {/* TikTok Icon */}
        <a
          href={site.tiktok}
          target="_blank"
          rel="noreferrer"
          className="social-icon-btn social-tt"
          aria-label="TikTok"
          title="Follow MS Beauty on TikTok"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.55c0 1.9-.53 3.86-1.63 5.41-1.39 1.95-3.66 3.23-6.07 3.39-2.28.16-4.64-.6-6.37-2.07-2.02-1.72-3.13-4.32-3.02-6.99.1-2.48 1.34-4.85 3.35-6.31 1.76-1.28 4.01-1.77 6.19-1.41v4.18c-1.15-.35-2.44-.24-3.5.34-.99.54-1.7 1.55-1.87 2.67-.18 1.17.2 2.41 1.02 3.27.79.83 1.95 1.28 3.1 1.24 1.21-.04 2.37-.62 3.07-1.6.47-.66.71-1.47.7-2.28V.02z"/>
          </svg>
        </a>

        {/* WhatsApp Direct */}
        <a
          href={`https://wa.me/${site.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="social-icon-btn social-wa"
          aria-label="WhatsApp"
          title="Chat on WhatsApp (03284430589)"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.188 8.188 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.188 8.188 0 0 1-1.26-4.48c0-4.54 3.7-8.23 8.24-8.23m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.8 1-.15.18-.29.2-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29"/>
          </svg>
        </a>

        {/* Email Direct */}
        <a
          href={`mailto:${site.email || 'beautyproductsbyms@gmail.com'}`}
          className="social-icon-btn social-mail"
          aria-label="Email"
          title="Email MS Beauty"
        >
          <span className="material-icons" style={{ fontSize: '20px' }}>mail</span>
        </a>
      </nav>

      <small>© {new Date().getFullYear()} {site.name}. All Rights Reserved.</small>
    </footer>
  )
}
