import React, { useState } from 'react'
import site from '../data/site.json'

export default function Navbar({
  currentRoute,
  onNavigate,
  cartCount,
  cartTotal,
  wishlistCount,
  onOpenSearch,
  onOpenWishlist,
  categories = [],
  selectedCategory = 'all',
  onSelectCategory
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bannerClosed, setBannerClosed] = useState(false)

  const handleNav = (route) => {
    setMobileMenuOpen(false)
    onNavigate(route)
  }

  const handleCategoryNav = (slug) => {
    setMobileMenuOpen(false)
    if (onSelectCategory) {
      onSelectCategory(slug)
    }
    if (currentRoute !== '/shop') {
      onNavigate('/shop')
    } else {
      if (slug === 'all') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        const el = document.getElementById(`shop-cat-${slug}`)
        if (el) {
          const navOffset = 125
          const rect = el.getBoundingClientRect()
          const targetY = rect.top + window.pageYOffset - navOffset
          window.scrollTo({ top: targetY, behavior: 'smooth' })
        }
      }
    }
  }

  return (
    <>
      {/* Top Announcement Bar - 03284430589 */}
      {!bannerClosed && (
        <div className="announcement-bar" id="announcement-bar">
          <div className="announcement-content">
            <span className="announcement-text">
              Free Home Delivery All Over Pakistan on Orders Above Rs. 1999/- | For Queries WhatsApp{' '}
              <a
                href={`https://wa.me/${site.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="announcement-wa-link"
              >
                {site.phone}
              </a>
            </span>
          </div>
          <button
            type="button"
            className="announcement-close"
            onClick={() => setBannerClosed(true)}
            aria-label="Close Announcement"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header / Navbar */}
      <header className="header" id="header">
        <div className="header-inner">
          {/* Left: WhatsApp Icon and (on mobile) Wishlist Icon */}
          <div className="header-left">
            <div className="wa-icon-tooltip-wrap">
              <a
                href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Hi MS Beauty Products! I have a query.')}`}
                target="_blank"
                rel="noreferrer"
                className="header-icon-btn header-wa-btn"
                aria-label="Chat on WhatsApp"
              >
                <svg className="wa-nav-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.188 8.188 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.188 8.188 0 0 1-1.26-4.48c0-4.54 3.7-8.23 8.24-8.23m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.8 1-.15.18-.29.2-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29"/>
                </svg>
              </a>
              <span className="wa-custom-tooltip">
                Chat on WhatsApp ({site.phone})
              </span>
            </div>

            {/* Mobile-only Wishlist Button (placed with WhatsApp on mobile) */}
            <button
              type="button"
              className="header-icon-btn wishlist-nav-btn wishlist-mobile-only"
              onClick={onOpenWishlist}
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <span className="material-icons">favorite_border</span>
              <span className="nav-badge wishlist-badge">
                {wishlistCount}
              </span>
            </button>
          </div>

          {/* Center: Updated Brand Logo & Title */}
          <div className="header-center">
            <button
              type="button"
              className="logo-btn"
              onClick={() => handleNav('/')}
              aria-label="MS Beauty Home"
            >
              <img
                src="/images/logo_ms.png"
                alt="MS Beauty Logo"
                className="nav-logo-img"
                width="42"
                height="42"
                onError={e => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/images/logo.png'
                }}
              />
              <div className="brand-text-wrap">
                <span className="brand-title">MS Beauty Products</span>
                <span className="brand-slogan">YOUR BEAUTY, YOUR GLOW</span>
              </div>
            </button>
          </div>

          {/* Right: Search, Cart Icon, Wishlist, and Cart Amount Pill */}
          <div className="header-right">
            {/* Search Icon */}
            <button
              type="button"
              className="header-icon-btn"
              onClick={onOpenSearch}
              title="Search products"
              aria-label="Search products"
            >
              <span className="material-icons">search</span>
            </button>

            {/* Wishlist Icon with Red Badge (Desktop & Tablet only) */}
            <button
              type="button"
              className="header-icon-btn wishlist-nav-btn wishlist-desktop-only"
              onClick={onOpenWishlist}
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <span className="material-icons">favorite_border</span>
              <span className="nav-badge wishlist-badge" id="wishlist-badge">
                {wishlistCount}
              </span>
            </button>

            {/* Cart Button with Cart Icon, Offset Badge, and Price (visible on both mobile and desktop) */}
            <button
              type="button"
              className="header-cart-btn"
              onClick={() => handleNav('/cart')}
              title="Click to view Cart & Checkout"
              aria-label="Shopping Cart"
            >
              <div className="cart-icon-wrap">
                <span className="material-icons cart-main-icon">shopping_cart</span>
                {cartCount > 0 && (
                  <span className="cart-badge" id="cart-badge">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="cart-total-text">
                Rs {cartTotal.toLocaleString()}
              </span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              className={`hamburger-btn ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>

        {/* Navigation Bar (Desktop & Tablet) */}
        <nav className="nav-links-bar" aria-label="Main Navigation">
          <div className="nav-links-inner">
            <button
              type="button"
              className={`nav-link ${currentRoute === '/' ? 'active' : ''}`}
              onClick={() => handleNav('/')}
            >
              Home
            </button>

            {/* Shop Catalogue Button */}
            <button
              type="button"
              className={`nav-link nav-link--shop ${
                currentRoute === '/shop' && selectedCategory === 'all' ? 'active' : ''
              }`}
              onClick={() => handleCategoryNav('all')}
            >
              <span className="material-icons nav-link-icon">storefront</span>
              Shop Catalogue
            </button>

            {/* Category tabs: Facials, Face Washes, Wax & Hair Removal with active tab color changes */}
            {categories.map(c => {
              const isCatActive = currentRoute === '/shop' && selectedCategory === c.slug
              return (
                <button
                  key={c.slug}
                  type="button"
                  className={`nav-link ${isCatActive ? 'active' : ''}`}
                  onClick={() => handleCategoryNav(c.slug)}
                >
                  {c.title}
                </button>
              )
            })}

            {/* Big, Large & Bold Cart Option (Image 2) */}
            <button
              type="button"
              className={`nav-link nav-link--cart-prominent ${
                currentRoute === '/cart' ? 'active' : ''
              }`}
              onClick={() => handleNav('/cart')}
              title="Go to Cart & Checkout"
            >
              <span className="material-icons cart-pill-icon">shopping_bag</span>
              <span className="cart-bold-label">CART</span>
              <span className="cart-pill-count">({cartCount})</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Navigation */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-logo">
            <img
              src="/images/logo_ms.png"
              alt="MS Beauty"
              width="36"
              height="36"
              onError={e => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/images/logo.png'
              }}
            />
            <span>MS Beauty</span>
          </div>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="mobile-drawer-body">
          <button
            type="button"
            className={`mobile-nav-link ${currentRoute === '/' ? 'active' : ''}`}
            onClick={() => handleNav('/')}
          >
            <span className="material-icons">home</span> Home
          </button>

          <button
            type="button"
            className={`mobile-nav-link mobile-shop-highlight ${
              currentRoute === '/shop' && selectedCategory === 'all' ? 'active' : ''
            }`}
            onClick={() => handleCategoryNav('all')}
          >
            <span className="material-icons">storefront</span> Shop All Products
          </button>

          <div className="mobile-nav-section-title">Categories</div>
          {categories.map(c => (
            <button
              key={c.slug}
              type="button"
              className={`mobile-nav-link mobile-sub-link ${
                currentRoute === '/shop' && selectedCategory === c.slug ? 'active' : ''
              }`}
              onClick={() => handleCategoryNav(c.slug)}
            >
              <span className="material-icons">spa</span> {c.title}
            </button>
          ))}

          <hr className="mobile-drawer-divider" />

          {/* Big Bold Cart in Mobile Drawer */}
          <button
            type="button"
            className={`mobile-nav-link mobile-cart-highlight ${
              currentRoute === '/cart' ? 'active' : ''
            }`}
            onClick={() => handleNav('/cart')}
          >
            <span className="material-icons">shopping_bag</span>
            <strong>VIEW CART ({cartCount} items · Rs {cartTotal.toLocaleString()})</strong>
          </button>

          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => {
              setMobileMenuOpen(false)
              onOpenWishlist()
            }}
          >
            <span className="material-icons">favorite_border</span>
            Wishlist ({wishlistCount})
          </button>

          <a
            href={`https://wa.me/${site.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="mobile-wa-banner"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.188 8.188 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.188 8.188 0 0 1-1.26-4.48c0-4.54 3.7-8.23 8.24-8.23m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.8 1-.15.18-.29.2-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29"/>
            </svg>
            <span>WhatsApp: {site.phone}</span>
          </a>
        </div>
      </div>
    </>
  )
}
