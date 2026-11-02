import React, { useState, useEffect, useRef } from 'react'
import site from '../data/site.json'

export default function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onNavigate
}) {
  const [quantity, setQuantity] = useState(1)
  const [isHovered, setIsHovered] = useState(false)

  // Carousel images array
  const rawImages = (product?.images && product.images.length > 0)
    ? product.images
    : (product?.image ? [product.image] : [])

  const hasMultiple = rawImages.length > 1

  // Extended slides array for true seamless forward circular looping
  // e.g. [last, ...images, first]
  const slides = hasMultiple
    ? [rawImages[rawImages.length - 1], ...rawImages, rawImages[0]]
    : rawImages

  // Start at index 1 (which maps to rawImages[0])
  const [currentIndex, setCurrentIndex] = useState(hasMultiple ? 1 : 0)
  const [withTransition, setWithTransition] = useState(true)
  const autoPlayRef = useRef(null)

  // Reset state when a new product is opened
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1)
      setCurrentIndex(hasMultiple ? 1 : 0)
      setWithTransition(true)
    }
  }, [isOpen, product?.id, hasMultiple])

  // Real active index (0 to rawImages.length - 1)
  const activeDotIndex = hasMultiple
    ? (currentIndex === 0
        ? rawImages.length - 1
        : currentIndex === slides.length - 1
        ? 0
        : currentIndex - 1)
    : 0

  // Move Next smoothly
  const handleNext = () => {
    if (!hasMultiple) return
    setWithTransition(true)
    setCurrentIndex(prev => prev + 1)
  }

  // Move Prev smoothly
  const handlePrev = () => {
    if (!hasMultiple) return
    setWithTransition(true)
    setCurrentIndex(prev => prev - 1)
  }

  // Transition End handler to snap clone back to real index seamlessly without visual jump
  const handleTransitionEnd = () => {
    if (!hasMultiple) return
    if (currentIndex >= slides.length - 1) {
      // Reached the trailing clone of image 0 -> snap to real image 0 (index 1)
      setWithTransition(false)
      setCurrentIndex(1)
    } else if (currentIndex <= 0) {
      // Reached the leading clone of image N-1 -> snap to real image N-1 (index slides.length - 2)
      setWithTransition(false)
      setCurrentIndex(slides.length - 2)
    }
  }

  // Auto-play infinite rotation every 3.5 seconds
  useEffect(() => {
    if (!isOpen || !hasMultiple || isHovered) return

    autoPlayRef.current = setInterval(() => {
      handleNext()
    }, 3500)

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [isOpen, hasMultiple, isHovered, currentIndex])

  // Keyboard navigation & lock body scroll
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, hasMultiple])

  if (!isOpen || !product) return null

  const off = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product)
    }
    onClose()
  }

  const handleBuy = () => {
    for (let i = 0; i < quantity; i++) {
      onBuyNow(product)
    }
    onClose()
  }

  const handleShopMore = () => {
    onClose()
    if (onNavigate) {
      onNavigate('/shop')
    }
  }

  const jumpToSlide = (idx) => {
    setWithTransition(true)
    setCurrentIndex(idx + 1)
  }

  return (
    <div className="product-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="product-modal-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="product-modal-close"
          onClick={onClose}
          aria-label="Close product view"
        >
          ✕
        </button>

        <div className="product-modal-grid">
          {/* LEFT: Image Carousel with Infinite Loop & Forward/Backward Arrows */}
          <div
            className="product-modal-media"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="carousel-viewport">
              <div
                className="carousel-track"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                  transition: withTransition ? 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {slides.map((imgSrc, i) => {
                  const resolvedSrc = imgSrc.startsWith('data:') || imgSrc.startsWith('http')
                    ? imgSrc
                    : `/images/products/${imgSrc}`

                  return (
                    <div key={i} className="carousel-slide">
                      <img
                        src={resolvedSrc}
                        alt={`${product.name} slide ${i}`}
                        className="carousel-img"
                        onError={e => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/images/logo.png'
                        }}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Badges Overlay */}
              <div className="carousel-badges">
                {product.badge && <span className="modal-badge">{product.badge}</span>}
                {off > 0 && <span className="modal-badge discount-badge">SAVE {off}%</span>}
              </div>

              {/* Prev / Next Arrows (Always visible so users can manually cycle images) */}
              <button
                type="button"
                className="carousel-arrow carousel-arrow-prev"
                onClick={handlePrev}
                aria-label="Previous image"
                title="Previous Image"
              >
                <span className="material-icons">chevron_left</span>
              </button>
              <button
                type="button"
                className="carousel-arrow carousel-arrow-next"
                onClick={handleNext}
                aria-label="Next image"
                title="Next Image"
              >
                <span className="material-icons">chevron_right</span>
              </button>
            </div>

            {/* Dots Indicator */}
            {hasMultiple && (
              <div className="carousel-dots">
                {rawImages.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    className={`carousel-dot ${activeDotIndex === dotIdx ? 'active' : ''}`}
                    onClick={() => jumpToSlide(dotIdx)}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail Navigation Strip */}
            {hasMultiple && (
              <div className="carousel-thumb-strip">
                {rawImages.map((thumbSrc, thumbIdx) => {
                  const resolved = thumbSrc.startsWith('data:') || thumbSrc.startsWith('http')
                    ? thumbSrc
                    : `/images/products/${thumbSrc}`

                  return (
                    <button
                      key={thumbIdx}
                      type="button"
                      className={`carousel-thumb-btn ${activeDotIndex === thumbIdx ? 'active' : ''}`}
                      onClick={() => jumpToSlide(thumbIdx)}
                    >
                      <img src={resolved} alt={`thumb ${thumbIdx + 1}`} />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Actions */}
          <div className="product-modal-info">
            <div className="modal-info-header">
              <span className="modal-cat-tag">
                {(product.category || '').replace('-', ' ').toUpperCase()}
              </span>
              <h2 className="modal-product-title">{product.name}</h2>
            </div>

            {/* Price Box */}
            <div className="modal-price-box">
              <div className="modal-prices">
                {product.oldPrice && (
                  <s className="modal-old-price">Rs {product.oldPrice.toLocaleString()}</s>
                )}
                <span className="modal-current-price">
                  Rs {product.price.toLocaleString()}
                </span>
                {off > 0 && (
                  <span className="modal-save-pill">Save {off}% OFF</span>
                )}
              </div>
            </div>

            {/* Product Highlights / Perks */}
            <div className="modal-perks-row">
              <div className="perk-chip">
                <span className="material-icons">local_shipping</span>
                <span>Free delivery over Rs. 1999</span>
              </div>
              <div className="perk-chip online-chip">
                <span className="material-icons">savings</span>
                <span>Save Rs 200 via Online Payment</span>
              </div>
            </div>

            {/* Description */}
            <div className="modal-description-box">
              <h4 className="modal-desc-heading">Product Details & Benefits:</h4>
              <p className="modal-desc-text">
                {product.description ||
                  '100% natural, gentle and dermatologist-approved formula crafted for Pakistani skin tones and weather.'}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="modal-qty-row">
              <label className="modal-qty-label">Quantity:</label>
              <div className="modal-qty-control">
                <button
                  type="button"
                  className="modal-qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="modal-qty-val">{quantity}</span>
                <button
                  type="button"
                  className="modal-qty-btn"
                  onClick={() => setQuantity(q => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="modal-subtotal-text">
                Total: <strong>Rs {(product.price * quantity).toLocaleString()}</strong>
              </span>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-modal btn-modal-cart"
                onClick={handleAdd}
              >
                <span className="material-icons">shopping_bag</span>
                <span>Add to Cart</span>
              </button>
              <button
                type="button"
                className="btn-modal btn-modal-buynow"
                onClick={handleBuy}
              >
                <span className="material-icons">flash_on</span>
                <span>Buy Now (Instant Checkout)</span>
              </button>
            </div>

            {/* WhatsApp Direct Order & Shop More links */}
            <div className="modal-footer-links">
              <a
                href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi MS Beauty Products! I would like to order: ${product.name} (Qty: ${quantity}, Rs ${(product.price * quantity).toLocaleString()})`)}`}
                target="_blank"
                rel="noreferrer"
                className="modal-wa-btn"
                title="Order directly on WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.188 8.188 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.188 8.188 0 0 1-1.26-4.48c0-4.54 3.7-8.23 8.24-8.23m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.8 1-.15.18-.29.2-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29"/>
                </svg>
                <span>Order via WhatsApp ({site.phone})</span>
              </a>

              {/* Shop More Products button as requested for Ad deep-links */}
              <button
                type="button"
                className="modal-shop-more-btn"
                onClick={handleShopMore}
              >
                <span className="material-icons">storefront</span>
                <span>Shop More Products</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
