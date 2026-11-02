import React from 'react'

export default function ProductCard({ p, onAddToCart, onBuyNow, isWishlisted, onToggleWishlist, onOpenProductModal }) {
  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0

  const handleCardClick = () => {
    if (onOpenProductModal) {
      onOpenProductModal(p)
    }
  }

  return (
    <article className="card" id={`product-${p.id}`}>
      <div
        className="thumb"
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
        title={`Click to view ${p.name} details & gallery`}
      >
        <img
          src={p.image?.startsWith('data:') ? p.image : `/images/products/${p.image}`}
          alt={p.name}
          loading="lazy"
          width="400"
          height="400"
          onError={e => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/images/logo.png'
          }}
        />

        {/* Badges */}
        <div className="card-badge-wrap">
          {(p.badge || off > 0) && (
            <span className="badge">{p.badge || `-${off}%`}</span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          type="button"
          className={`card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={e => {
            e.stopPropagation()
            onToggleWishlist(p)
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <span className="material-icons">
            {isWishlisted ? 'favorite' : 'favorite_border'}
          </span>
        </button>
      </div>

      <div className="card-body">
        <span className="card-category">{p.category ? p.category.replace('-', ' ') : ''}</span>
        <h3
          className="card-title"
          title={`Click to view ${p.name}`}
          onClick={handleCardClick}
          style={{ cursor: 'pointer' }}
        >
          {p.name}
        </h3>
        {p.description && <p className="card-desc">{p.description}</p>}

        <div className="price-row">
          <div className="price">
            {p.oldPrice && <s>Rs&nbsp;{p.oldPrice.toLocaleString()}</s>}
            <b>Rs&nbsp;{p.price.toLocaleString()}</b>
          </div>
          {off > 0 && <span className="save-tag">Save&nbsp;{off}%</span>}
        </div>

        {/* Two distinct boxes: Add to Cart and Buy Now */}
        <div className="card-actions">
          <button
            type="button"
            className="btn-card btn-add-cart"
            id={`btn-add-cart-${p.id}`}
            onClick={e => {
              e.stopPropagation()
              onAddToCart(p)
            }}
          >
            <span className="material-icons">shopping_bag</span>
            <span>Add to Cart</span>
          </button>
          <button
            type="button"
            className="btn-card btn-buy-now"
            id={`btn-buy-now-${p.id}`}
            onClick={e => {
              e.stopPropagation()
              onBuyNow(p)
            }}
          >
            <span className="material-icons">flash_on</span>
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </article>
  )
}
