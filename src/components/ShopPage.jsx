import React, { useState, useEffect, useRef } from 'react'
import ProductCard from './ProductCard.jsx'

export default function ShopPage({
  categories = [],
  products = [],
  onAddToCart,
  onBuyNow,
  wishlist = [],
  onToggleWishlist,
  onNavigate,
  selectedCategory = 'all',
  onSelectCategory,
  onOpenProductModal
}) {
  const [searchFilter, setSearchFilter] = useState('')
  const [activeCategoryPill, setActiveCategoryPill] = useState(selectedCategory || 'all')
  const initialScrollDone = useRef(false)

  // Scroll to category section
  const scrollToCategorySection = (slug) => {
    if (!slug || slug === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.getElementById(`shop-cat-${slug}`)
    if (el) {
      const navOffset = 130
      const rect = el.getBoundingClientRect()
      const targetY = rect.top + window.pageYOffset - navOffset
      window.scrollTo({ top: targetY, behavior: 'smooth' })
    }
  }

  // Handle selectedCategory change ONLY when navigated into from navbar or link initially
  useEffect(() => {
    if (!initialScrollDone.current && selectedCategory && selectedCategory !== 'all') {
      initialScrollDone.current = true
      setActiveCategoryPill(selectedCategory)
      const timer = setTimeout(() => {
        scrollToCategorySection(selectedCategory)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [selectedCategory])

  // Passive observer: updates the active pill ONLY, never auto-scrolls or pushes the page!
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const slug = entry.target.getAttribute('data-slug')
          if (slug) {
            setActiveCategoryPill(slug)
          }
        }
      })
    }, {
      root: null,
      rootMargin: '-100px 0px -60% 0px',
      threshold: 0
    })

    const sections = document.querySelectorAll('.shop-category-section')
    sections.forEach(s => observer.observe(s))

    return () => observer.disconnect()
  }, [categories])

  // Filter products by search text
  const matchSearch = (p) => {
    if (!searchFilter.trim()) return true
    const q = searchFilter.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    )
  }

  // Always display all categories in the catalogue so sections are directly scrollable
  const categoriesToDisplay = categories

  const isWishlisted = (id) => wishlist.some(w => w.id === id)

  const handleCategoryClick = (slug) => {
    setActiveCategoryPill(slug)
    if (onSelectCategory) {
      onSelectCategory(slug)
    }
    scrollToCategorySection(slug)
  }

  return (
    <div className="shop-page" id="shop-page">
      {/* Shop Hero Banner */}
      <section className="shop-hero">
        <div className="shop-hero-inner">
          <nav className="breadcrumb" aria-label="Breadcrumbs">
            <button type="button" className="breadcrumb-link" onClick={() => onNavigate('/')}>
              Home
            </button>
            <span className="material-icons breadcrumb-sep">chevron_right</span>
            <span className="breadcrumb-current">Shop Catalogue</span>
          </nav>

          <h1 className="shop-title">Our Complete Collection</h1>
          <p className="shop-subtitle">
            Premium skincare, organic facials, and waxing essentials designed for your natural radiance.
          </p>

          {/* Quick Search in Shop */}
          <div className="shop-search-bar">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Search products in catalogue..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="shop-search-input"
            />
            {searchFilter && (
              <button
                type="button"
                className="shop-search-clear"
                onClick={() => setSearchFilter('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Quick Jump Pills with Active Tab Color Changes */}
          <div className="shop-category-filters">
            <button
              type="button"
              className={`cat-pill ${activeCategoryPill === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('all')}
            >
              All Products ({products.length})
            </button>
            {categories.map(c => {
              const count = products.filter(p => p.category === c.slug).length
              return (
                <button
                  key={c.slug}
                  type="button"
                  className={`cat-pill ${activeCategoryPill === c.slug ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(c.slug)}
                >
                  {c.title} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Catalogue Grid Area with all category headings */}
      <main className="shop-main-content">
        {categoriesToDisplay.map(cat => {
          const catProducts = products
            .filter(p => p.category === cat.slug)
            .filter(matchSearch)

          if (catProducts.length === 0 && searchFilter.trim()) {
            return null
          }

          return (
            <section
              key={cat.slug}
              id={`shop-cat-${cat.slug}`}
              data-slug={cat.slug}
              className="shop-category-section"
            >
              <div className="shop-category-header">
                <div className="cat-header-left">
                  <span className="cat-eyebrow">MS Beauty Essentials</span>
                  <h2 className="cat-heading">{cat.title}</h2>
                  {cat.description && <p className="cat-desc">{cat.description}</p>}
                </div>
                <div className="cat-count-badge">
                  {catProducts.length} {catProducts.length === 1 ? 'Product' : 'Products'}
                </div>
              </div>

              {catProducts.length === 0 ? (
                <div className="cat-no-items">
                  <p>No products currently available in this category.</p>
                </div>
              ) : (
                <div className="grid">
                  {catProducts.map(p => (
                    <ProductCard
                      key={p.id}
                      p={p}
                      onAddToCart={onAddToCart}
                      onBuyNow={onBuyNow}
                      isWishlisted={isWishlisted(p.id)}
                      onToggleWishlist={onToggleWishlist}
                      onOpenProductModal={onOpenProductModal}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })}

        {/* If search active and nothing matches anywhere */}
        {searchFilter.trim() &&
          products.filter(matchSearch).length === 0 && (
            <div className="shop-empty-state">
              <span className="material-icons">sentiment_dissatisfied</span>
              <h3>No products matching "{searchFilter}"</h3>
              <p>Try searching for a different keyword or reset filters.</p>
              <button
                type="button"
                className="cta"
                onClick={() => setSearchFilter('')}
              >
                Clear Search
              </button>
            </div>
          )}
      </main>
    </div>
  )
}
