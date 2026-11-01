import React, { useState, useEffect, useMemo } from 'react'
import './app.css'
import data from './data/products.json'
import site from './data/site.json'
import Navbar from './components/Navbar.jsx'
import ProductCard from './components/ProductCard.jsx'
import ShopPage from './components/ShopPage.jsx'
import CartPage from './components/CartPage.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import SearchModal from './components/SearchModal.jsx'
import WishlistModal from './components/WishlistModal.jsx'
import Toast from './components/Toast.jsx'
import Footer from './components/Footer.jsx'
import NotFoundPage from './components/NotFoundPage.jsx'

// Helper to determine route from current window.location
function getRouteFromLocation() {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/'
  const hash = window.location.hash.toLowerCase()

  if (path.startsWith('/admin') || hash.startsWith('#admin')) return '/admin'
  if (path.startsWith('/cart') || hash.startsWith('#cart')) return '/cart'
  if (path.startsWith('/shop') || hash.startsWith('#shop')) return '/shop'
  if (path === '/' || path === '/index.html' || path === '') return '/'
  return '/404'
}

export default function App() {
  // Current Route: '/' | '/shop' | '/cart' | '/admin'
  const [currentRoute, setCurrentRoute] = useState(getRouteFromLocation)

  // Initial category for shop page (e.g. from query or anchor)
  const [shopCategory, setShopCategory] = useState('all')

  // Products state (loads from default JSON + any custom admin products saved in localStorage)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('ms_custom_products')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.error('Error loading custom products:', e)
    }
    return data.products
  })

  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ms_cart')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Error loading cart:', e)
    }
    return []
  })

  // Wishlist state persisted in localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('ms_wishlist')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Error loading wishlist:', e)
    }
    return []
  })

  // Orders state persisted in localStorage (accessible in Admin Panel)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('ms_orders')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Error loading orders:', e)
    }
    // Default initial sample order for demo
    return [
      {
        id: 'MS-36307',
        createdAt: '2026-09-27T14:20:00.000Z',
        customer: {
          name: 'Zara Sarfraz',
          phone: '03164652884',
          whatsapp: '03164652884',
          address: 'House #42, Block B, Model Town',
          city: 'Lahore',
          province: 'Punjab',
          notes: ''
        },
        items: [
          { id: 1, name: 'Gentle Botanical Foaming Face Wash', price: 450, quantity: 1, category: 'face-washes' },
          { id: 5, name: 'Natural Apricot & Walnut Exfoliating Scrub', price: 550, quantity: 1, category: 'facials' }
        ],
        subtotal: 1000,
        shippingFee: 50,
        discount: 0,
        total: 1050,
        paymentMethod: 'cod',
        transactionRef: '',
        status: 'Delivered'
      },
      {
        id: 'MS-45997',
        createdAt: '2026-09-10T11:15:00.000Z',
        customer: {
          name: 'Waqar Ahmad',
          phone: '03219178797',
          whatsapp: '03219178797',
          address: 'Street 9, Sector G-11/2',
          city: 'Islamabad',
          province: 'Federal',
          notes: ''
        },
        items: [
          { id: 2, name: 'Vitamin C Brightening Facial Cleanser', price: 650, quantity: 1, category: 'face-washes' }
        ],
        subtotal: 650,
        shippingFee: 400,
        discount: 0,
        total: 1050,
        paymentMethod: 'cod',
        transactionRef: '',
        status: 'Cancelled'
      },
      {
        id: 'MS-38853',
        createdAt: '2026-08-24T18:40:00.000Z',
        customer: {
          name: 'Muhammad Saad',
          phone: '03103210505',
          whatsapp: '03103210505',
          address: 'Plot 18, Block 6, Gulshan-e-Iqbal',
          city: 'Karachi',
          province: 'Sindh',
          notes: 'Paid via Easypaisa'
        },
        items: [
          { id: 4, name: 'Honey & Almond Nourishing Facial Cream', price: 750, quantity: 1, category: 'facials' }
        ],
        subtotal: 750,
        shippingFee: 0,
        discount: 0,
        total: 750,
        paymentMethod: 'online',
        transactionRef: 'EP-9842103',
        status: 'Cancelled'
      },
      {
        id: 'MS-48265',
        createdAt: '2026-08-14T09:30:00.000Z',
        customer: {
          name: 'Tanveer Aslam',
          phone: '03392325238',
          whatsapp: '03392325238',
          address: 'Chak 214 RB, Faisalabad Road',
          city: 'Faisalabad',
          province: 'Punjab',
          notes: ''
        },
        items: [
          { id: 6, name: 'Organic Cold Wax Strips Ready-To-Use', price: 850, quantity: 1, category: 'wax-hair-removal' }
        ],
        subtotal: 850,
        shippingFee: 0,
        discount: 0,
        total: 850,
        paymentMethod: 'cod',
        transactionRef: '',
        status: 'Delivered'
      },
      {
        id: 'MS-91706',
        createdAt: '2026-08-14T16:05:00.000Z',
        customer: {
          name: 'Tanveer Aslam',
          phone: '03032325238',
          whatsapp: '03032325238',
          address: 'Chak 214 RB, Faisalabad Road',
          city: 'Faisalabad',
          province: 'Punjab',
          notes: ''
        },
        items: [
          { id: 6, name: 'Organic Cold Wax Strips Ready-To-Use', price: 850, quantity: 1, category: 'wax-hair-removal' }
        ],
        subtotal: 850,
        shippingFee: 0,
        discount: 0,
        total: 850,
        paymentMethod: 'cod',
        transactionRef: '',
        status: 'Cancelled'
      },
      {
        id: 'MS-98214',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        customer: {
          name: 'Ayesha Khan',
          phone: '0328-4430589',
          whatsapp: '0328-4430589',
          address: 'House #24, Street 7, Phase 5, DHA',
          city: 'Lahore',
          province: 'Punjab',
          notes: 'Please call before delivering.'
        },
        items: [
          { id: 3, name: 'Gold Radiance 6-Step Luxury Facial Kit', price: 1200, quantity: 1, category: 'facials' },
          { id: 1, name: 'Gentle Botanical Foaming Face Wash', price: 450, quantity: 2, category: 'face-washes' }
        ],
        subtotal: 2100,
        shippingFee: 0,
        discount: 0,
        total: 2100,
        paymentMethod: 'cod',
        transactionRef: '',
        status: 'Pending'
      }
    ]
  })

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // Save Cart whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('ms_cart', JSON.stringify(cart))
    } catch (e) {
      console.error('Failed to save cart:', e)
    }
  }, [cart])

  // Save Wishlist whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('ms_wishlist', JSON.stringify(wishlist))
    } catch (e) {
      console.error('Failed to save wishlist:', e)
    }
  }, [wishlist])

  // Save Orders whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('ms_orders', JSON.stringify(orders))
    } catch (e) {
      console.error('Failed to save orders:', e)
    }
  }, [orders])

  // Save Products whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('ms_custom_products', JSON.stringify(products))
    } catch (e) {
      console.error('Failed to save products:', e)
    }
  }, [products])

  // Browser navigation popstate listener
  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = getRouteFromLocation()
      setCurrentRoute(nextRoute)

      // Handle category query if present
      const params = new URLSearchParams(window.location.search)
      const cat = params.get('cat')
      if (cat) setShopCategory(cat)
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('hashchange', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('hashchange', handlePopState)
    }
  }, [])

  // Navigation handler
  const navigate = (path) => {
    let cleanPath = path
    let cat = 'all'

    if (path.includes('?cat=')) {
      const [p, query] = path.split('?cat=')
      cleanPath = p
      cat = query || 'all'
      setShopCategory(cat)
    }

    window.history.pushState({}, '', cleanPath)
    setCurrentRoute(cleanPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Category select handler (synchronized between Navbar and ShopPage)
  const handleCategorySelect = (cat) => {
    setShopCategory(cat)
    if (currentRoute !== '/shop') {
      window.history.pushState({}, '', '/shop')
      setCurrentRoute('/shop')
    }
  }

  // Toast trigger helper
  const showToast = (toastObj) => {
    setToast(toastObj)
    setTimeout(() => {
      setToast(prev => (prev === toastObj ? null : prev))
    }, 4000)
  }

  // Cart calculations
  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cart])

  // Cart actions
  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })

    showToast({
      type: 'success',
      title: 'Added to Cart!',
      message: `${product.name} (Rs ${product.price.toLocaleString()})`,
      action: {
        label: 'View Cart',
        onClick: () => {
          setToast(null)
          navigate('/cart')
        }
      }
    })
  }

  // Buy Now: adds product to cart and immediately navigates to Cart page
  // All existing cart items are preserved (synchronized system)
  const handleBuyNow = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })

    navigate('/cart')
  }

  const handleUpdateQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId)
    } else {
      setCart(prev =>
        prev.map(item => (item.id === productId ? { ...item, quantity: newQty } : item))
      )
    }
  }

  const handleRemoveItem = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId))
    showToast({
      type: 'info',
      title: 'Item Removed',
      message: 'Product removed from your cart.'
    })
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setCart([])
      showToast({
        type: 'info',
        title: 'Cart Cleared',
        message: 'All items removed.'
      })
    }
  }

  // Place Order handler
  const handlePlaceOrder = (orderRecord) => {
    setOrders(prev => [orderRecord, ...prev])
    setCart([])
    showToast({
      type: 'success',
      title: 'Order Received!',
      message: `Your order #${orderRecord.id} has been recorded.`
    })
  }

  // Wishlist actions
  const handleToggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id)
      if (exists) {
        showToast({
          type: 'info',
          title: 'Removed from Wishlist',
          message: product.name
        })
        return prev.filter(item => item.id !== product.id)
      } else {
        showToast({
          type: 'success',
          title: 'Saved to Wishlist!',
          message: product.name
        })
        return [...prev, product]
      }
    })
  }

  // Admin Order Actions
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
    showToast({
      type: 'success',
      title: 'Order Status Updated',
      message: `Order #${orderId} is now "${newStatus}"`
    })
  }

  const handleDeleteOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId))
    showToast({
      type: 'info',
      title: 'Order Deleted',
      message: `Order #${orderId} removed.`
    })
  }

  // Admin Product Actions
  const handleAddProduct = (newProduct) => {
    setProducts(prev => [newProduct, ...prev])
  }

  const handleUpdateProduct = (updatedProduct) => {
    setProducts(prev =>
      prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    )
  }

  const handleDeleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId))
    showToast({
      type: 'info',
      title: 'Product Deleted',
      message: 'Product removed from catalogue.'
    })
  }

  // If on Admin route, render Admin Panel directly
  if (currentRoute === '/admin') {
    return (
      <>
        <AdminPanel
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onNavigate={navigate}
          onShowToast={showToast}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    )
  }

  return (
    <div className="site-wrapper">
      {/* Navbar with updated logo, 03284430589, prominent Cart, and active category tabs */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        cartCount={cartCount}
        cartTotal={cartTotal}
        wishlistCount={wishlist.length}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        categories={data.categories}
        selectedCategory={shopCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* Main Page Content based on Route */}
      {currentRoute === '/shop' ? (
        <ShopPage
          categories={data.categories}
          products={products}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onNavigate={navigate}
          selectedCategory={shopCategory}
          onSelectCategory={handleCategorySelect}
        />
      ) : currentRoute === '/cart' ? (
        <CartPage
          cart={cart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onNavigate={navigate}
          onPlaceOrder={handlePlaceOrder}
          onShowToast={showToast}
        />
      ) : currentRoute === '/404' ? (
        <NotFoundPage onNavigate={navigate} categories={data.categories} />
      ) : (
        /* HOME PAGE */
        <>
          {/* Hero Section with user's Background Image adjusted for mobile & desktop */}
          <section className="hero" id="top">
            <div className="hero-banner-wrap">
              <img
                src="/images/Background_image_hero.jpg"
                alt="MS Beauty Products - Your Beauty, Your Glow. Facials, Facewash, Skincare - Discounts Live Now"
                className="hero-banner-image"
                width="1920"
                height="1080"
              />
              <div className="hero-banner-cta-bar">
                <button
                  type="button"
                  className="cta hero-main-cta"
                  onClick={() => handleCategorySelect('all')}
                >
                  <span className="material-icons">storefront</span>
                  <span>Explore Full Shop</span>
                </button>
                <button
                  type="button"
                  className="cta-secondary hero-sec-cta"
                  onClick={() => {
                    const el = document.getElementById('featured-section')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  View Best Sellers
                </button>
              </div>
            </div>
          </section>

          {/* Value Props Ribbon */}
          <section className="value-ribbon">
            <div className="value-item">
              <span className="material-icons">local_shipping</span>
              <div>
                <strong>Free Delivery Above Rs. 1999</strong>
                <p>Fast delivery all over Pakistan</p>
              </div>
            </div>
            <div className="value-item">
              <span className="material-icons">payments</span>
              <div>
                <strong>Online Payment Discount</strong>
                <p>Save Rs. 200 on digital transfer</p>
              </div>
            </div>
            <div className="value-item">
              <span className="material-icons">spa</span>
              <div>
                <strong>100% Herbal & Organic</strong>
                <p>Gentle formulas for glowing skin</p>
              </div>
            </div>
            <div className="value-item">
              <span className="material-icons">support_agent</span>
              <div>
                <strong>Customer Support</strong>
                <p>WhatsApp: {site.phone}</p>
              </div>
            </div>
          </section>

          {/* Featured Catalogue Grids with Category Headings (Category Tiles removed as requested) */}
          <main id="featured-section">
            {data.categories.map(c => {
              const items = products.filter(p => p.category === c.slug)
              if (!items.length) return null

              return (
                <section key={c.slug} id={c.slug} className="cat">
                  <div className="cat-section-header">
                    <div>
                      <h2>{c.title}</h2>
                      {c.description && <p className="cat-sub">{c.description}</p>}
                    </div>
                    <button
                      type="button"
                      className="cat-view-all-btn"
                      onClick={() => handleCategorySelect(c.slug)}
                    >
                      View All {c.title} →
                    </button>
                  </div>

                  <div className="grid">
                    {items.map(p => (
                      <ProductCard
                        key={p.id}
                        p={p}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        isWishlisted={wishlist.some(w => w.id === p.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </main>
        </>
      )}

      {/* Footer with updated logo, social icons, and contact */}
      <Footer />

      {/* Floating WhatsApp Action Button with 03284430589 */}
      <a
        className="wa"
        href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Hi MS Beauty Products! I would like some assistance.')}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        title={`Chat on WhatsApp (${site.phone})`}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.188 8.188 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.188 8.188 0 0 1-1.26-4.48c0-4.54 3.7-8.23 8.24-8.23m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.8 1-.15.18-.29.2-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29"/>
        </svg>
        <span>Chat on WhatsApp</span>
      </a>

      {/* Instant Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={id => handleToggleWishlist({ id })}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Notification Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
