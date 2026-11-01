import React from 'react'

export default function WishlistModal({ isOpen, onClose, wishlist, onRemoveFromWishlist, onAddToCart, onBuyNow }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="wishlist-modal" onClick={e => e.stopPropagation()}>
        <div className="wishlist-modal-header">
          <div className="wishlist-title-wrap">
            <span className="material-icons wishlist-icon-header">favorite</span>
            <h3>My Saved Wishlist ({wishlist.length})</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="wishlist-modal-body">
          {wishlist.length === 0 ? (
            <div className="wishlist-empty-state">
              <span className="material-icons">favorite_border</span>
              <h4>Your wishlist is empty</h4>
              <p>Click the heart icon on any product to save it here for later.</p>
              <button className="cta" onClick={onClose}>
                Browse Products
              </button>
            </div>
          ) : (
            <div className="wishlist-items-list">
              {wishlist.map(p => (
                <div key={p.id} className="wishlist-item-row">
                  <img
                    src={`/images/products/${p.image}`}
                    alt={p.name}
                    className="wishlist-item-thumb"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/logo.png' }}
                  />
                  <div className="wishlist-item-details">
                    <span className="wishlist-item-cat">{p.category.replace('-', ' ')}</span>
                    <h4 className="wishlist-item-title">{p.name}</h4>
                    <div className="wishlist-item-price">
                      {p.oldPrice && <s>Rs {p.oldPrice}</s>}
                      <b>Rs {p.price}</b>
                    </div>
                  </div>
                  <div className="wishlist-item-actions">
                    <button
                      className="btn-sm btn-outline"
                      title="Add to Cart"
                      onClick={() => onAddToCart(p)}
                    >
                      <span className="material-icons">shopping_bag</span> Add
                    </button>
                    <button
                      className="btn-sm btn-primary"
                      title="Buy Now"
                      onClick={() => {
                        onClose()
                        onBuyNow(p)
                      }}
                    >
                      Buy Now
                    </button>
                    <button
                      className="wishlist-remove-btn"
                      title="Remove from wishlist"
                      onClick={() => onRemoveFromWishlist(p.id)}
                    >
                      <span className="material-icons">delete_outline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
