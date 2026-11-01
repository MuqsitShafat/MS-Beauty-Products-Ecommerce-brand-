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
  onSelectCategory
}) {
  const [searchFilter, setSearchFilter] = useState('')
  const isManualScrolling = useRef(false)

  // Scroll to category section
  const scrollToCategorySection = (slug) => {
    if (!slug || slug === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.getElementById(`shop-cat-${slug}`)
    if (el) {
      const navOffset = 125
      const rect = el.getBoundingClientRect()
      const targetY = rect.top + window.pageYOffset - navOffset
      window.scrollTo({ top: targetY, behavior: 'smooth' })
    }
  }

  // Handle selectedCategory change or initial mount scroll
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      isManualScrolling.current = true
      const timer = setTimeout(() => {
        scrollToCategorySection(selectedCategory)
        setTimeout(() => {
          isManualScrolling.current = false
        }, 600)
      }, 150)
      return () => clearTimeout(timer)
    } else if (selectedCategory === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [selectedCategory])

  // Scroll spy: update active category tab as user scrolls through catalogue
  useEffect(() => {
    const observerCallback = (entries) => {
      if (isManualScrolling.current) return
      const visible = entries.find(e => e.isIntersecting)
      if (visible) {
        const catSlug = visible.target.getAttribute('data-slug')
        if (catSlug && onSelectCategory && catSlug !== selectedCategory) {
          onSelectCategory(catSlug)
        }
      }
    }

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-130px 0px -50% 0px',
      threshold: 0.1
    })

    const sectionElements = document.querySelectorAll('.shop-category-section')
    sectionElements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [categories, onSelectCategory, selectedCategory])

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
    isManualScrolling.current = true
    if (onSelectCategory) {
      onSelectCategory(slug)
    }
    scrollToCategorySection(slug)
    setTimeout(() => {
      isManualScrolling.current = false
    }, 700)
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
              className={`cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
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
                  className={`cat-pill ${selectedCategory === c.slug ? 'active' : ''}`}
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
