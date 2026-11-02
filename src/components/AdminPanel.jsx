import React, { useState, useRef } from 'react'
import site from '../data/site.json'
import '../admin.css'

const ADMIN_EMAIL = 'beautyproductsbyms@gmail.com'
const ADMIN_PASS = 'Jabir#932'

export default function AdminPanel({
  orders = [],
  onUpdateOrderStatus,
  onDeleteOrder,
  products = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onNavigate,
  onShowToast
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('ms_admin_auth') === 'true'
  })
  const [emailInput, setEmailInput] = useState('')
  const [passInput, setPassInput] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [authError, setAuthError] = useState('')

  // Active admin section: 'dashboard' | 'orders' | 'products' | 'finance'
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [printingOrder, setPrintingOrder] = useState(null)

  // Product modal state & Gallery upload state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [copiedLinkSlug, setCopiedLinkSlug] = useState(null)

  const generateSlug = (text) => {
    return (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    category: 'facials',
    price: '',
    oldPrice: '',
    badge: '',
    image: 'facial-1.jpg',
    description: ''
  })

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault()
    setAuthError('')

    const cleanEmail = emailInput.trim().toLowerCase()
    if (cleanEmail === ADMIN_EMAIL.toLowerCase() && passInput === ADMIN_PASS) {
      localStorage.setItem('ms_admin_auth', 'true')
      setIsLoggedIn(true)
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Welcome Admin!',
          message: 'Signed in as ' + ADMIN_EMAIL
        })
      }
    } else {
      setAuthError('Access Denied: Invalid email address or password.')
    }
  }

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('ms_admin_auth')
    setIsLoggedIn(false)
    setEmailInput('')
    setPassInput('')
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: 'Logged Out',
        message: 'Admin session closed securely.'
      })
    }
  }

  // Open product modal for add or edit
  const openAddProduct = () => {
    setEditingProduct(null)
    setGalleryImages([])
    setProductForm({
      name: '',
      slug: '',
      category: 'facials',
      price: '',
      oldPrice: '',
      badge: '',
      image: 'facial-1.jpg',
      description: ''
    })
    setIsProductModalOpen(true)
  }

  const openEditProduct = (p) => {
    setEditingProduct(p)
    // Gather all existing images (both p.images and p.image)
    const existingList = (Array.isArray(p.images) && p.images.length > 0)
      ? p.images
      : (p.image ? [p.image] : [])

    setGalleryImages(
      existingList.map((imgName, idx) => ({
        id: `existing-${idx}-${imgName}`,
        previewUrl: (imgName.startsWith('data:') || imgName.startsWith('http'))
          ? imgName
          : `/images/products/${imgName}`,
        filename: imgName,
        isExisting: true,
        file: null
      }))
    )

    setProductForm({
      name: p.name,
      slug: p.slug || generateSlug(p.name),
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice || '',
      badge: p.badge || '',
      image: p.image || 'facial-1.jpg',
      description: p.description || ''
    })
    setIsProductModalOpen(true)
  }

  // Handle gallery image file selection (Supports multiple files at once or adding sequentially)
  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setGalleryImages(prev => [
          ...prev,
          {
            id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            previewUrl: event.target.result,
            file: file,
            filename: file.name,
            isExisting: false
          }
        ])
      }
      reader.readAsDataURL(file)
    })

    // Reset input so same file can be selected again if needed
    e.target.value = ''
  }

  // Remove a photo from gallery
  const handleRemoveGalleryImage = (idToRemove) => {
    setGalleryImages(prev => prev.filter(img => img.id !== idToRemove))
  }

  // Set selected photo as main cover (moves to first position)
  const handleSetCoverImage = (indexToMove) => {
    if (indexToMove === 0) return
    setGalleryImages(prev => {
      const copy = [...prev]
      const [item] = copy.splice(indexToMove, 1)
      copy.unshift(item)
      return copy
    })
  }

  // Shift image position left / right
  const handleMoveGalleryImage = (index, direction) => {
    setGalleryImages(prev => {
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= prev.length) return prev
      const copy = [...prev]
      const temp = copy[index]
      copy[index] = copy[targetIndex]
      copy[targetIndex] = temp
      return copy
    })
  }

  // Save product and store all images in project folder via Vite API
  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!productForm.name.trim() || !productForm.price) return

    setIsUploading(true)
    const finalImages = []

    try {
      for (const imgItem of galleryImages) {
        if (imgItem.isExisting) {
          finalImages.push(imgItem.filename)
        } else if (imgItem.file && imgItem.previewUrl) {
          // Upload new photo to project folder
          try {
            const response = await fetch('/api/upload-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: imgItem.filename,
                base64Data: imgItem.previewUrl
              })
            })

            if (response.ok) {
              const data = await response.json()
              finalImages.push(data.filename || imgItem.filename)
            } else {
              // Fallback if endpoint fails
              finalImages.push(imgItem.previewUrl)
            }
          } catch (err) {
            console.warn('Disk upload failed, using fallback:', err)
            finalImages.push(imgItem.previewUrl)
          }
        } else if (imgItem.filename) {
          finalImages.push(imgItem.filename)
        }
      }
    } finally {
      setIsUploading(false)
    }

    const primaryImage = finalImages[0] || productForm.image || 'facial-1.jpg'
    const finalImageList = finalImages.length > 0 ? finalImages : [primaryImage]

    const productPayload = {
      name: productForm.name.trim(),
      slug: (productForm.slug || '').trim() || generateSlug(productForm.name),
      category: productForm.category,
      price: Number(productForm.price),
      oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null,
      badge: productForm.badge.trim() || null,
      image: primaryImage,
      images: finalImageList,
      description: productForm.description.trim()
    }

    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...productPayload })
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Product Updated',
          message: `${productPayload.name} (${finalImageList.length} photos) saved successfully.`
        })
      }
    } else {
      onAddProduct({
        id: Date.now(),
        ...productPayload
      })
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Product Created',
          message: `${productPayload.name} (${finalImageList.length} photos) saved in project folder.`
        })
      }
    }

    setIsProductModalOpen(false)
    setGalleryImages([])
  }

  // Delete product and automatically clean up image file from public/images/products/
  const handleDeleteProductWithFile = async (p) => {
    if (window.confirm(`Delete product "${p.name}"?`)) {
      try {
        await fetch('/api/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: p.image,
            images: p.images
          })
        })
      } catch (err) {
        console.warn('Could not delete image file:', err)
      }
      onDeleteProduct(p.id)
    }
  }

  // If not logged in, render the secure Login Gate
  if (!isLoggedIn) {
    return (
      <div className="admin-dark-login-screen">
        <div className="admin-dark-login-card">
          <div className="admin-dark-login-header">
            <div className="admin-logo-badge">
              <img
                src="/images/logo_ms.png"
                alt="MS Beauty"
                className="admin-login-logo"
                onError={e => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/images/logo.png'
                }}
              />
            </div>
            <h2>MS Beauty Products</h2>
            <span className="admin-badge-pill">Admin Management Portal</span>
            <p>Please enter authorized administrator credentials to continue.</p>
          </div>

          {authError && (
            <div className="admin-dark-alert" role="alert">
              <span className="material-icons">error_outline</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="admin-dark-form">
            <div className="form-group">
              <label htmlFor="admin-email">Admin Email Address</label>
              <div className="dark-input-wrap">
                <span className="material-icons input-icon">email</span>
                <input
                  type="email"
                  id="admin-email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="beautyproductsbyms@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">Security Password</label>
              <div className="dark-input-wrap">
                <span className="material-icons input-icon">lock</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  id="admin-password"
                  value={passInput}
                  onChange={e => setPassInput(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  className="pass-toggle-btn"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Toggle password visibility"
                >
                  <span className="material-icons">
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button type="submit" className="admin-dark-btn-primary">
              <span className="material-icons">login</span>
              <span>Log In to Dashboard</span>
            </button>
          </form>

          <div className="admin-dark-login-footer">
            <button
              type="button"
              className="admin-dark-btn-return"
              onClick={() => onNavigate('/')}
            >
              ← Return to Live Website
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Compute KPIs for the 5 Stat Cards (Image reference)
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const totalOrdersCount = orders.length
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length
  const shippedOrdersCount = orders.filter(o => o.status === 'Shipped').length
  const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length

  // Search and status filtering for orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter
    const q = searchQuery.trim().toLowerCase()
    if (!q) return matchesStatus

    const matchesQuery =
      (order.id && order.id.toLowerCase().includes(q)) ||
      (order.customer?.name && order.customer.name.toLowerCase().includes(q)) ||
      (order.customer?.phone && order.customer.phone.includes(q)) ||
      (order.paymentMethod && order.paymentMethod.toLowerCase().includes(q))

    return matchesStatus && matchesQuery
  })

  // Format date helper (e.g. 27/09/2026)
  const formatDate = (isoString) => {
    if (!isoString) return 'Just now'
    try {
      const d = new Date(isoString)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return '27/09/2026'
    }
  }

  return (
    <div className="admin-dark-layout" id="admin-dashboard">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Matching reference image) */}
      <aside className={`admin-dark-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="admin-dark-sidebar-header">
          <div className="admin-brand-icon-box">
            <img
              src="/images/logo_ms.png"
              alt="MS Beauty Products"
              className="admin-brand-logo-img"
              onError={e => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/images/logo.png'
              }}
            />
          </div>
          <div className="admin-brand-text">
            <h2 className="admin-brand-title">MS Beauty Products</h2>
            <span className="admin-brand-sub">Admin Panel</span>
          </div>
          <button
            type="button"
            className="admin-sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <span className="material-icons">menu_open</span>
          </button>
        </div>

        {/* Sidebar Navigation Groups */}
        <nav className="admin-dark-nav">
          <div className="admin-nav-section-label">MAIN</div>

          <button
            type="button"
            className={`admin-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('dashboard')
              setSidebarOpen(false)
            }}
          >
            <span className="material-icons">dashboard</span>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeSection === 'orders' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('orders')
              setSidebarOpen(false)
            }}
          >
            <span className="material-icons">receipt_long</span>
            <span>Orders</span>
            {orders.length > 0 && (
              <span className="admin-nav-count-badge">{orders.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeSection === 'products' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('products')
              setSidebarOpen(false)
            }}
          >
            <span className="material-icons">inventory_2</span>
            <span>Products</span>
            {products.length > 0 && (
              <span className="admin-nav-count-badge">{products.length}</span>
            )}
          </button>

          <div className="admin-nav-section-label">FINANCE</div>

          <button
            type="button"
            className={`admin-nav-item ${activeSection === 'finance' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('finance')
              setSidebarOpen(false)
            }}
          >
            <span className="material-icons">payment</span>
            <span>Payment Verification</span>
          </button>

          <div className="admin-nav-section-label">LINKS</div>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() => onNavigate('/')}
          >
            <span className="material-icons">storefront</span>
            <span>View Store</span>
          </button>
        </nav>

        {/* Sidebar Bottom: User Profile & Logout */}
        <div className="admin-dark-sidebar-footer">
          <div className="admin-avatar-circle">A</div>
          <div className="admin-profile-info">
            <span className="admin-profile-name">Admin</span>
            <span className="admin-profile-email" title={ADMIN_EMAIL}>
              {ADMIN_EMAIL}
            </span>
          </div>
          <button
            type="button"
            className="admin-logout-icon-btn"
            onClick={handleLogout}
            title="Logout from admin panel"
          >
            <span className="material-icons">logout</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="admin-dark-main">
        {/* TOPBAR (Page title + Search + Refresh) */}
        <header className="admin-dark-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-hamburger-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <span className="material-icons">menu</span>
            </button>
            <h1 className="admin-topbar-title">
              {activeSection === 'dashboard' && 'Dashboard'}
              {activeSection === 'orders' && 'Orders Management'}
              {activeSection === 'products' && 'Product Catalogue'}
              {activeSection === 'finance' && 'Payment Verification'}
            </h1>
          </div>

          <div className="admin-topbar-right">
            {/* Search Input Box */}
            <div className="admin-search-box">
              <span className="material-icons admin-search-icon">search</span>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="admin-search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Refresh Action Button (Image reference: purple square reload button) */}
            <button
              type="button"
              className="admin-refresh-btn"
              onClick={() => {
                setSearchQuery('')
                setOrderStatusFilter('all')
                if (onShowToast) {
                  onShowToast({
                    type: 'info',
                    title: 'Dashboard Refreshed',
                    message: 'All order and sales metrics up to date.'
                  })
                }
              }}
              title="Refresh Dashboard"
            >
              <span className="material-icons">refresh</span>
            </button>
          </div>
        </header>

        {/* BODY CONTAINER */}
        <div className="admin-dark-content">
          {/* STAT CARDS ROW (5 Cards: TOTAL SALES, TOTAL ORDERS, PENDING DELIVERIES, SHIPPED TODAY, CANCELLED ORDERS) */}
          <section className="admin-stat-cards-grid">
            {/* Card 1: TOTAL SALES (Green) */}
            <div className="admin-stat-card">
              <div className="stat-icon-box stat-icon-green">
                <span className="material-icons">payments</span>
              </div>
              <div className="stat-text-box">
                <span className="stat-card-label">TOTAL SALES</span>
                <strong className="stat-card-value">
                  PKR {totalSales.toLocaleString()}
                </strong>
                <span className="stat-card-sub">All time</span>
              </div>
            </div>

            {/* Card 2: TOTAL ORDERS (Blue) */}
            <div className="admin-stat-card">
              <div className="stat-icon-box stat-icon-blue">
                <span className="material-icons">assignment</span>
              </div>
              <div className="stat-text-box">
                <span className="stat-card-label">TOTAL ORDERS</span>
                <strong className="stat-card-value">{totalOrdersCount}</strong>
                <span className="stat-card-sub">All time</span>
              </div>
            </div>

            {/* Card 3: PENDING DELIVERIES (Amber/Orange) */}
            <div className="admin-stat-card">
              <div className="stat-icon-box stat-icon-amber">
                <span className="material-icons">pending_actions</span>
              </div>
              <div className="stat-text-box">
                <span className="stat-card-label">PENDING DELIVERIES</span>
                <strong className="stat-card-value">{pendingOrdersCount}</strong>
                <span className="stat-card-sub">Needs attention</span>
              </div>
            </div>

            {/* Card 4: SHIPPED TODAY (Purple) */}
            <div className="admin-stat-card">
              <div className="stat-icon-box stat-icon-purple">
                <span className="material-icons">local_shipping</span>
              </div>
              <div className="stat-text-box">
                <span className="stat-card-label">SHIPPED TODAY</span>
                <strong className="stat-card-value">{shippedOrdersCount}</strong>
                <span className="stat-card-sub">In transit</span>
              </div>
            </div>

            {/* Card 5: CANCELLED ORDERS (Red) */}
            <div className="admin-stat-card">
              <div className="stat-icon-box stat-icon-red">
                <span className="material-icons">cancel</span>
              </div>
              <div className="stat-text-box">
                <span className="stat-card-label">CANCELLED ORDERS</span>
                <strong className="stat-card-value">{cancelledOrdersCount}</strong>
                <span className="stat-card-sub">All time</span>
              </div>
            </div>
          </section>

          {/* VIEW: DASHBOARD (Recent Orders Table) */}
          {activeSection === 'dashboard' && (
            <section className="admin-table-card">
              <div className="admin-table-card-header">
                <h3 className="admin-card-heading">Recent Orders</h3>
                <button
                  type="button"
                  className="admin-btn-view-all"
                  onClick={() => setActiveSection('orders')}
                >
                  View All
                </button>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="admin-table-empty">
                  <span className="material-icons">inbox</span>
                  <p>No orders to display.</p>
                </div>
              ) : (
                <div className="admin-table-responsive">
                  <table className="admin-dark-table">
                    <thead>
                      <tr>
                        <th>ORDER ID</th>
                        <th>CUSTOMER</th>
                        <th>PHONE</th>
                        <th>CHAT</th>
                        <th>TOTAL</th>
                        <th>PAYMENT</th>
                        <th>STATUS</th>
                        <th>DATE</th>
                        <th>PRINT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.slice(0, 10).map(order => (
                        <tr key={order.id}>
                          <td className="cell-order-id">#{order.id}</td>
                          <td className="cell-customer">
                            <strong>{order.customer?.name || 'Customer'}</strong>
                            {order.customer?.city && (
                              <span className="cell-customer-city">
                                {order.customer.city}
                              </span>
                            )}
                          </td>
                          <td className="cell-phone">
                            {order.customer?.phone || order.customer?.whatsapp || '-'}
                          </td>
                          <td className="cell-chat">
                            {order.customer?.phone ? (
                              <a
                                href={`https://wa.me/${(order.customer.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${order.customer.name}, this is MS Beauty Products regarding your order #${order.id}.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="admin-chat-wa-btn"
                                title={`Chat with ${order.customer.name} on WhatsApp`}
                              >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.188 8.188 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.188 8.188 0 0 1-1.26-4.48c0-4.54 3.7-8.23 8.24-8.23m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.8 1-.15.18-.29.2-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29"/>
                                </svg>
                              </a>
                            ) : (
                              <span className="cell-disabled">-</span>
                            )}
                          </td>
                          <td className="cell-total">
                            PKR {(order.total || 0).toLocaleString()}
                          </td>
                          <td className="cell-payment">
                            {order.paymentMethod === 'online' ? (
                              <span className="badge-payment badge-online">
                                💳 Online
                              </span>
                            ) : (
                              <span className="badge-payment badge-cod">
                                💵 COD
                              </span>
                            )}
                          </td>
                          <td className="cell-status">
                            <select
                              value={order.status || 'Pending'}
                              onChange={e => onUpdateOrderStatus(order.id, e.target.value)}
                              className={`dark-status-select status-${(order.status || 'pending').toLowerCase()}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="cell-date">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="cell-print">
                            <button
                              type="button"
                              className="admin-table-print-btn"
                              title="Print Shipping Label"
                              onClick={() => setPrintingOrder(order)}
                            >
                              <span className="material-icons">print</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* VIEW: ORDERS (Complete orders list + filtering) */}
          {activeSection === 'orders' && (
            <section className="admin-table-card">
              <div className="admin-table-card-header">
                <div>
                  <h3 className="admin-card-heading">All Customer Orders ({filteredOrders.length})</h3>
                  <p className="admin-card-subheading">
                    Manage real-time customer orders, update dispatch progress, and print official shipping labels.
                  </p>
                </div>

                <div className="admin-filter-bar">
                  <span>Filter by Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={e => setOrderStatusFilter(e.target.value)}
                    className="admin-dark-select"
                  >
                    <option value="all">All ({orders.length})</option>
                    <option value="Pending">Pending ({orders.filter(o => o.status === 'Pending').length})</option>
                    <option value="Confirmed">Confirmed ({orders.filter(o => o.status === 'Confirmed').length})</option>
                    <option value="Shipped">Shipped ({orders.filter(o => o.status === 'Shipped').length})</option>
                    <option value="Delivered">Delivered ({orders.filter(o => o.status === 'Delivered').length})</option>
                    <option value="Cancelled">Cancelled ({orders.filter(o => o.status === 'Cancelled').length})</option>
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="admin-table-empty">
                  <span className="material-icons">filter_alt_off</span>
                  <p>No orders found matching your search or status filter.</p>
                </div>
              ) : (
                <div className="admin-table-responsive">
                  <table className="admin-dark-table">
                    <thead>
                      <tr>
                        <th>ORDER ID</th>
                        <th>CUSTOMER & ADDRESS</th>
                        <th>PHONE</th>
                        <th>ITEMS</th>
                        <th>CHAT</th>
                        <th>TOTAL</th>
                        <th>PAYMENT</th>
                        <th>STATUS</th>
                        <th>DATE</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td className="cell-order-id">#{order.id}</td>
                          <td className="cell-customer">
                            <strong>{order.customer?.name}</strong>
                            <small className="cell-address-line">
                              {order.customer?.address}, {order.customer?.city}
                            </small>
                          </td>
                          <td className="cell-phone">{order.customer?.phone}</td>
                          <td className="cell-items-summary">
                            <span title={order.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}>
                              {order.items?.length || 0} {(order.items?.length === 1 ? 'item' : 'items')}
                            </span>
                          </td>
                          <td className="cell-chat">
                            {order.customer?.phone ? (
                              <a
                                href={`https://wa.me/${(order.customer.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${order.customer.name}, this is MS Beauty Products regarding your order #${order.id}.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="admin-chat-wa-btn"
                                title={`Chat with ${order.customer.name} on WhatsApp`}
                              >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.188 8.188 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.188 8.188 0 0 1-1.26-4.48c0-4.54 3.7-8.23 8.24-8.23m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.8 1-.15.18-.29.2-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29"/>
                                </svg>
                              </a>
                            ) : '-'}
                          </td>
                          <td className="cell-total">PKR {(order.total || 0).toLocaleString()}</td>
                          <td className="cell-payment">
                            {order.paymentMethod === 'online' ? (
                              <span className="badge-payment badge-online">💳 Online</span>
                            ) : (
                              <span className="badge-payment badge-cod">💵 COD</span>
                            )}
                          </td>
                          <td className="cell-status">
                            <select
                              value={order.status || 'Pending'}
                              onChange={e => onUpdateOrderStatus(order.id, e.target.value)}
                              className={`dark-status-select status-${(order.status || 'pending').toLowerCase()}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="cell-date">{formatDate(order.createdAt)}</td>
                          <td className="cell-actions">
                            <button
                              type="button"
                              className="admin-table-print-btn"
                              title="Print Shipping Label"
                              onClick={() => setPrintingOrder(order)}
                            >
                              <span className="material-icons">print</span>
                            </button>
                            <button
                              type="button"
                              className="admin-table-delete-btn"
                              title="Delete Order"
                              onClick={() => {
                                if (window.confirm(`Delete order #${order.id}?`)) {
                                  onDeleteOrder(order.id)
                                }
                              }}
                            >
                              <span className="material-icons">delete_outline</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* VIEW: PRODUCTS (Product Management + Add New with Gallery Picker) */}
          {activeSection === 'products' && (
            <section className="admin-table-card">
              <div className="admin-table-card-header">
                <div>
                  <h3 className="admin-card-heading">Active Store Products ({products.length})</h3>
                  <p className="admin-card-subheading">
                    Add new products by choosing photos directly from your device gallery or edit pricing & details.
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-btn-add-product"
                  onClick={openAddProduct}
                >
                  <span className="material-icons">add_photo_alternate</span>
                  <span>+ Add New Product</span>
                </button>
              </div>

              <div className="admin-products-grid">
                {products.map(p => (
                  <div key={p.id} className="admin-product-card">
                    <div className="admin-prod-thumb-wrap">
                      <img
                        src={p.image.startsWith('data:') ? p.image : `/images/products/${p.image}`}
                        alt={p.name}
                        className="admin-prod-thumb"
                        onError={e => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/images/logo.png'
                        }}
                      />
                      {p.badge && <span className="admin-prod-badge">{p.badge}</span>}
                    </div>

                    <div className="admin-prod-details">
                      <span className="admin-prod-cat">{(p.category || '').replace('-', ' ')}</span>
                      <h4 className="admin-prod-title">{p.name}</h4>
                      <div className="admin-prod-price-row">
                        {p.oldPrice && <s>PKR {p.oldPrice.toLocaleString()}</s>}
                        <strong>PKR {p.price.toLocaleString()}</strong>
                      </div>
                      {p.description && (
                        <p className="admin-prod-desc">{p.description}</p>
                      )}

                      <div className="admin-prod-actions">
                        <button
                          type="button"
                          className="admin-btn-edit-prod"
                          onClick={() => openEditProduct(p)}
                        >
                          <span className="material-icons">edit</span>
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn-del-prod"
                          onClick={() => handleDeleteProductWithFile(p)}
                          title="Delete Product and Remove Image from Server"
                        >
                          <span className="material-icons">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* VIEW: FINANCE (Payment Verification & Product Ad Links) */}
          {activeSection === 'finance' && (
            <section className="admin-table-card">
              <div className="admin-table-card-header">
                <div>
                  <h3 className="admin-card-heading">Online Payment Orders & Ad Campaign Links</h3>
                  <p className="admin-card-subheading">
                    Verify customer online transactions and copy direct campaign URLs for all active live products.
                  </p>
                </div>
              </div>

              {/* Online Payment Orders */}
              <div className="admin-online-orders-section" style={{ marginTop: '8px' }}>
                <h4 style={{ color: 'var(--ink, #2A2D26)', margin: '10px 0 16px', fontSize: '1.15rem' }}>
                  Orders with Online Advance Payment ({orders.filter(o => o.paymentMethod === 'online').length})
                </h4>
                <div className="admin-table-responsive">
                  <table className="admin-dark-table">
                    <thead>
                      <tr>
                        <th>ORDER ID</th>
                        <th>CUSTOMER</th>
                        <th>PHONE</th>
                        <th>AMOUNT</th>
                        <th>TXN REF</th>
                        <th>STATUS</th>
                        <th>CHAT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.filter(o => o.paymentMethod === 'online').length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#6a6e63' }}>
                            No online payment orders recorded yet.
                          </td>
                        </tr>
                      ) : (
                        orders
                          .filter(o => o.paymentMethod === 'online')
                          .map(order => (
                            <tr key={order.id}>
                              <td className="cell-order-id">#{order.id}</td>
                              <td className="cell-customer">{order.customer?.name}</td>
                              <td className="cell-phone">{order.customer?.phone}</td>
                              <td className="cell-total">PKR {order.total?.toLocaleString()}</td>
                              <td className="cell-txn">
                                {order.transactionRef ? (
                                  <span className="badge-txn">{order.transactionRef}</span>
                                ) : (
                                  <span className="text-muted">Awaiting screenshot</span>
                                )}
                              </td>
                              <td className="cell-status">
                                <select
                                  value={order.status || 'Pending'}
                                  onChange={e => onUpdateOrderStatus(order.id, e.target.value)}
                                  className={`dark-status-select status-${(order.status || 'pending').toLowerCase()}`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="cell-chat">
                                <a
                                  href={`https://wa.me/${(order.customer?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${order.customer?.name}, this is MS Beauty Products regarding your online payment for order #${order.id}.`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="admin-chat-wa-btn"
                                  title="Chat on WhatsApp"
                                >
                                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.188 8.188 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.188 8.188 0 0 1-1.26-4.48c0-4.54 3.7-8.23 8.24-8.23m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.8 1-.15.18-.29.2-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29"/>
                                  </svg>
                                </a>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LIVE PRODUCTS — AD PRODUCT LINKS GENERATOR (User Request) */}
              <div className="admin-ad-links-section">
                <div className="admin-ad-links-header">
                  <div>
                    <h4>Live Products — Ad & Video Campaign Links ({products.length})</h4>
                    <p>
                      Copy these direct URLs to paste into your Facebook, Instagram, or TikTok video ads.
                      When customers click your ad, they directly see this product modal with the "Shop More" option!
                    </p>
                  </div>
                </div>

                <div className="admin-table-responsive">
                  <table className="admin-dark-table">
                    <thead>
                      <tr>
                        <th>PRODUCT</th>
                        <th>CATEGORY</th>
                        <th>LINK SLUG (FOR ADS)</th>
                        <th>FULL CAMPAIGN URL</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => {
                        const slug = p.slug || generateSlug(p.name)
                        const fullUrl = `${window.location.origin}/shop.html?product=${slug}`
                        const isCopied = copiedLinkSlug === slug

                        return (
                          <tr key={p.id}>
                            <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img
                                src={p.image.startsWith('data:') ? p.image : `/images/products/${p.image}`}
                                alt={p.name}
                                style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                                onError={e => {
                                  e.currentTarget.onerror = null
                                  e.currentTarget.src = '/images/logo.png'
                                }}
                              />
                              <strong>{p.name}</strong>
                            </td>
                            <td>
                              <span className="admin-prod-cat">{(p.category || '').replace('-', ' ')}</span>
                            </td>
                            <td>
                              <span className="ad-slug-badge">{slug}</span>
                            </td>
                            <td>
                              <div className="ad-link-box" title={fullUrl}>
                                {fullUrl}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  className={`btn-copy-ad-link ${isCopied ? 'copied' : ''}`}
                                  onClick={() => {
                                    navigator.clipboard.writeText(fullUrl)
                                    setCopiedLinkSlug(slug)
                                    if (onShowToast) {
                                      onShowToast({
                                        type: 'success',
                                        title: 'Ad Link Copied!',
                                        message: `Copied URL for ${p.name}`
                                      })
                                    }
                                    setTimeout(() => setCopiedLinkSlug(null), 2500)
                                  }}
                                >
                                  <span className="material-icons" style={{ fontSize: '16px' }}>
                                    {isCopied ? 'check' : 'content_copy'}
                                  </span>
                                  <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
                                </button>
                                <a
                                  href={`/shop?product=${slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn-test-ad-link"
                                  title="Test Open Link"
                                >
                                  <span className="material-icons" style={{ fontSize: '16px' }}>open_in_new</span>
                                </a>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* MODAL: ADD / EDIT PRODUCT WITH GALLERY IMAGE SELECTOR */}
      {isProductModalOpen && (
        <div className="admin-dark-modal-overlay">
          <div className="admin-dark-modal-card">
            <div className="admin-dark-modal-header">
              <h3>{editingProduct ? 'Edit Product Details' : 'Add New Beauty Product'}</h3>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setIsProductModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-dark-modal-form">
              <div className="form-group">
                <label htmlFor="prod-name">Product Name *</label>
                <input
                  type="text"
                  id="prod-name"
                  required
                  value={productForm.name}
                  onChange={e => {
                    const newName = e.target.value
                    setProductForm(prev => ({
                      ...prev,
                      name: newName,
                      slug: (!editingProduct && (!prev.slug || prev.slug === generateSlug(prev.name)))
                        ? generateSlug(newName)
                        : prev.slug
                    }))
                  }}
                  placeholder="e.g. Gold Radiance Luxury Facial Kit"
                  className="dark-input"
                />
              </div>

              {/* Product Link Name / Slug for Social & Video Ads (User Request) */}
              <div className="form-group">
                <label htmlFor="prod-slug">Product Link Name / Slug (For Ads & Direct Links)</label>
                <div className="slug-input-wrapper">
                  <span className="slug-prefix">shop.html?product=</span>
                  <input
                    type="text"
                    id="prod-slug"
                    value={productForm.slug || ''}
                    onChange={e => setProductForm({ ...productForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
                    placeholder="e.g. gold-facial-kit or sp-handheld-fan"
                    className="dark-input slug-input"
                  />
                </div>
                <small className="slug-hint">
                  Customize this name for ad links. You can copy the complete live link from the Payment Verification tab.
                </small>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="prod-cat">Category *</label>
                  <select
                    id="prod-cat"
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="dark-input"
                  >
                    <option value="facials">Facials</option>
                    <option value="face-washes">Face Washes</option>
                    <option value="wax-hair-removal">Wax & Hair Removal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="prod-badge">Badge (Optional)</label>
                  <input
                    type="text"
                    id="prod-badge"
                    value={productForm.badge}
                    onChange={e => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="e.g. B1G1 FREE, Popular, 20% Off"
                    className="dark-input"
                  />
                </div>
              </div>

              {/* MULTI-IMAGE GALLERY SELECTION BOX */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ margin: 0 }}>Product Images (Choose from Device Gallery)</label>
                  {galleryImages.length > 0 && (
                    <button
                      type="button"
                      className="btn-add-more-photos"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="material-icons" style={{ fontSize: '16px' }}>add_photo_alternate</span>
                      <span>+ Add More Photos</span>
                    </button>
                  )}
                </div>

                {/* Hidden File Input supporting multiple file selection */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImagesChange}
                  style={{ display: 'none' }}
                  id="gallery-file-input"
                />

                <div className="gallery-picker-box">
                  {galleryImages.length > 0 ? (
                    <div className="gallery-multi-preview-wrap">
                      <div className="gallery-multi-header">
                        <div className="gallery-multi-title">
                          <span className="material-icons">photo_library</span>
                          <span>Gallery Photos ({galleryImages.length})</span>
                        </div>
                        <p className="gallery-multi-subtitle">
                          ★ 1st photo is Main Cover. Click "Set as Main" or use arrows to rearrange.
                        </p>
                      </div>

                      <div className="gallery-multi-grid">
                        {galleryImages.map((img, idx) => {
                          const isCover = idx === 0
                          return (
                            <div
                              key={img.id || idx}
                              className={`gallery-multi-card ${isCover ? 'is-cover' : ''}`}
                            >
                              <div className="gallery-card-thumb-wrap">
                                <img
                                  src={img.previewUrl}
                                  alt={`Product image ${idx + 1}`}
                                  className="gallery-card-thumb"
                                  onError={e => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = '/images/logo.png'
                                  }}
                                />

                                {isCover ? (
                                  <span className="gallery-cover-badge">
                                    ★ Cover
                                  </span>
                                ) : (
                                  <span className="gallery-order-badge">
                                    #{idx + 1}
                                  </span>
                                )}

                                <button
                                  type="button"
                                  className="gallery-btn-remove"
                                  onClick={() => handleRemoveGalleryImage(img.id)}
                                  title="Remove this photo"
                                  aria-label="Remove image"
                                >
                                  ✕
                                </button>
                              </div>

                              <div className="gallery-card-info">
                                <span className="gallery-card-name" title={img.filename}>
                                  {img.filename}
                                </span>

                                <div className="gallery-card-actions">
                                  {!isCover && (
                                    <button
                                      type="button"
                                      className="btn-set-cover"
                                      onClick={() => handleSetCoverImage(idx)}
                                      title="Set this as product cover image"
                                    >
                                      ★ Make Cover
                                    </button>
                                  )}

                                  <div className="gallery-order-btns">
                                    <button
                                      type="button"
                                      className="gallery-order-btn"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveGalleryImage(idx, -1)}
                                      title="Move Left"
                                    >
                                      ‹
                                    </button>
                                    <button
                                      type="button"
                                      className="gallery-order-btn"
                                      disabled={idx === galleryImages.length - 1}
                                      onClick={() => handleMoveGalleryImage(idx, 1)}
                                      title="Move Right"
                                    >
                                      ›
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {/* Add More Tile */}
                        <div
                          className="gallery-add-more-tile"
                          onClick={() => fileInputRef.current?.click()}
                          title="Click to add more photos"
                        >
                          <span className="material-icons">add_a_photo</span>
                          <span>Add More</span>
                        </div>
                      </div>

                      <div className="gallery-bottom-status">
                        <span className="gallery-file-badge">
                          ✓ All {galleryImages.length} photo{galleryImages.length > 1 ? 's' : ''} will be stored in projects folder & cycle in the customer modal carousel.
                        </span>
                        <button
                          type="button"
                          className="btn-change-image"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <span className="material-icons">photo_camera</span>
                          <span>Upload More Photos</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="gallery-dropzone"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="material-icons gallery-upload-icon">add_photo_alternate</span>
                      <strong>Click to Select Photos from Device Gallery</strong>
                      <p>
                        You can select multiple photos at once! They will be stored in your project folder and loop in the customer modal.
                      </p>
                      <button type="button" className="btn-browse-gallery">
                        <span className="material-icons">photo_library</span>
                        <span>Browse Device Gallery (Multi-Select)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="prod-price">Sale Price (PKR) *</label>
                  <input
                    type="number"
                    id="prod-price"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="e.g. 550"
                    className="dark-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-old-price">Original Price (PKR, Optional)</label>
                  <input
                    type="number"
                    id="prod-old-price"
                    value={productForm.oldPrice}
                    onChange={e => setProductForm({ ...productForm, oldPrice: e.target.value })}
                    placeholder="e.g. 750"
                    className="dark-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prod-desc">Product Description</label>
                <textarea
                  id="prod-desc"
                  rows={3}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Enriched with gentle botanicals and organic glow-boosting formula..."
                  className="dark-input"
                />
              </div>

              <div className="admin-dark-modal-actions">
                <button
                  type="button"
                  className="dark-btn-cancel"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="dark-btn-submit"
                >
                  {isUploading ? (
                    <>
                      <span className="material-icons spin">autorenew</span>
                      <span>Saving & Storing...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-icons">save</span>
                      <span>{editingProduct ? 'Save Product Details' : 'Publish Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE SHIPPING LABEL MODAL (Preserved with MS Beauty branding) */}
      {printingOrder && (
        <div className="label-modal-overlay">
          <div className="label-modal-content">
            <div className="label-modal-header print-hide">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-icons" style={{ color: '#4F46E5' }}>local_shipping</span>
                <h3 style={{ margin: 0 }}>Print Shipping Label - #{printingOrder.id}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPrintingOrder(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Dashed Border Shipping Label Card */}
            <div id="printable-shipping-label" className="shipping-label-card">
              <div className="label-header-center">
                <img
                  src="/images/logo_ms.png"
                  alt="MS Beauty Products"
                  className="label-logo-img"
                  onError={e => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/images/logo.png'
                  }}
                />
                <h2 className="label-shop-heading">THANKS FOR SHOPPING AT</h2>
                <h1 className="label-shop-brand">MS BEAUTY PRODUCTS</h1>
                <p className="label-order-id">Order #{printingOrder.id}</p>
              </div>

              <hr className="label-solid-divider" />

              <div className="label-details-table">
                <div className="label-row">
                  <span className="label-row-title">Customer:</span>
                  <span className="label-row-value">{printingOrder.customer?.name}</span>
                </div>
                <div className="label-row">
                  <span className="label-row-title">Phone:</span>
                  <span className="label-row-value">
                    {printingOrder.customer?.phone || printingOrder.customer?.whatsapp}
                  </span>
                </div>
                <div className="label-row">
                  <span className="label-row-title">Address:</span>
                  <span className="label-row-value">{printingOrder.customer?.address}</span>
                </div>
                <div className="label-row">
                  <span className="label-row-title">City/Province:</span>
                  <span className="label-row-value">
                    {printingOrder.customer?.city || 'Lahore'} / {printingOrder.customer?.province || 'Punjab'}
                  </span>
                </div>

                <div className="label-row" style={{ marginTop: '8px' }}>
                  <span className="label-row-title">Items:</span>
                  <div className="label-row-value">
                    <ul className="label-items-list">
                      {printingOrder.items?.map((item, idx) => (
                        <li key={idx}>
                          • <strong>{item.name}</strong> (x{item.quantity})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <hr className="label-solid-divider" />

              <div className="label-amount-row">
                <span className="label-row-title">Collect Amount:</span>
                <span className="label-amount-value">
                  PKR {printingOrder.paymentMethod === 'online' ? '0 (PAID ONLINE)' : (printingOrder.total?.toLocaleString() || printingOrder.total)}
                </span>
              </div>

              <div className="label-row" style={{ marginBottom: '14px' }}>
                <span className="label-row-title">Payment Type:</span>
                <span className="label-row-value" style={{ fontWeight: 700 }}>
                  {printingOrder.paymentMethod === 'online' ? 'Online Payment (PAID)' : 'Cash on Delivery'}
                </span>
              </div>

              <div className="label-footer-social">
                <p>Follow on Instagram for more interesting products :</p>
                <strong>@msbeautyproducts_</strong>
              </div>
            </div>

            {/* Print Action Buttons (Hidden when printing on paper) */}
            <div className="label-actions-bar print-hide">
              <button
                type="button"
                className="btn-print-trigger"
                onClick={() => window.print()}
              >
                <span className="material-icons">print</span>
                <span>Print Label</span>
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setPrintingOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
