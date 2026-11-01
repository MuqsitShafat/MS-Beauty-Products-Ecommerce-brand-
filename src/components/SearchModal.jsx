import React, { useState } from 'react'

export default function SearchModal({ isOpen, onClose, products, onAddToCart, onBuyNow }) {
  const [query, setQuery] = useState('')

  if (!isOpen) return null

  const filtered = query.trim() === ''
    ? []
    : products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
      )

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal-header">
          <span className="material-icons search-input-icon">search</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, facials, face washes, wax..."
            className="search-modal-input"
          />
          {query && (
            <button className="search-clear-btn" onClick={() => setQuery('')}>
              ✕
            </button>
          )}
          <button className="search-close-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="search-modal-body">
          {query.trim() === '' ? (
            <div className="search-hint">
              <span className="material-icons">travel_explore</span>
              <p>Type to search all MS Beauty skincare and cosmetics essentials</p>
              <div className="popular-tags">
                <span>Popular:</span>
                <button type="button" onClick={() => setQuery('facial')}>Facials</button>
                <button type="button" onClick={() => setQuery('face wash')}>Face Wash</button>
                <button type="button" onClick={() => setQuery('wax')}>Wax</button>
                <button type="button" onClick={() => setQuery('gold')}>Gold Kit</button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="search-empty">
              <span className="material-icons">sentiment_dissatisfied</span>
              <p>No products found matching "{query}"</p>
              <small>Try checking your spelling or search another keyword</small>
            </div>
          ) : (
            <div className="search-results-list">
              <div className="search-results-count">
                Found {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
              </div>
              {filtered.map(p => (
                <div key={p.id} className="search-result-row">
                  <img
                    src={`/images/products/${p.image}`}
                    alt={p.name}
                    className="search-result-thumb"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/logo.png' }}
                  />
                  <div className="search-result-info">
                    <span className="search-result-cat">{p.category.replace('-', ' ')}</span>
                    <h4 className="search-result-name">{p.name}</h4>
                    <div className="search-result-price">
                      {p.oldPrice && <s>Rs {p.oldPrice}</s>}
                      <b>Rs {p.price}</b>
                    </div>
                  </div>
                  <div className="search-result-actions">
                    <button
                      className="btn-sm btn-outline"
                      onClick={() => {
                        onAddToCart(p)
                      }}
                    >
                      <span className="material-icons">shopping_bag</span> Add
                    </button>
                    <button
                      className="btn-sm btn-primary"
                      onClick={() => {
                        onClose()
                        onBuyNow(p)
                      }}
                    >
                      Buy Now
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
