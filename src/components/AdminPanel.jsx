import React, { useState, useRef } from 'react'
import site from '../data/site.json'

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
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [productForm, setProductForm] = useState({
    name: '',
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
    setImagePreview(null)
    setSelectedImageFile(null)
    setProductForm({
      name: '',
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
    setImagePreview(p.image ? `/images/products/${p.image}` : null)
    setSelectedImageFile(null)
    setProductForm({
      name: p.name,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice || '',
      badge: p.badge || '',
      image: p.image || 'facial-1.jpg',
      description: p.description || ''
    })
    setIsProductModalOpen(true)
  }

  // Handle gallery image file selection
  const handleGalleryImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedImageFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  // Save product and automatically store image in project folder via Vite API
  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!productForm.name.trim() || !productForm.price) return

    let finalImageName = productForm.image || 'facial-1.jpg'

    // If an image was chosen from gallery, upload and store in project folder
    if (selectedImageFile && imagePreview) {
      setIsUploading(true)
      try {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: selectedImageFile.name,
            base64Data: imagePreview
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.filename) {
            finalImageName = data.filename
          }
        } else {
          // Fallback if offline: store base64 directly
          finalImageName = imagePreview
        }
      } catch (err) {
        console.warn('Direct disk upload fallback to base64 preview:', err)
        finalImageName = imagePreview
      } finally {
        setIsUploading(false)
      }
    }

    const productPayload = {
      name: productForm.name.trim(),
      category: productForm.category,
      price: Number(productForm.price),
      oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null,
      badge: productForm.badge.trim() || null,
      image: finalImageName,
      description: productForm.description.trim()
    }

    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...productPayload })
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Product Updated',
          message: `${productPayload.name} saved successfully.`
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
          message: `${productPayload.name} saved and stored in project folder.`
        })
      }
    }

    setIsProductModalOpen(false)
    setSelectedImageFile(null)
    setImagePreview(null)
  }

  // If not logged in, render the secure Login Gate
  if (!isLoggedIn) {
    return (
      <div className="admin-dark-login-screen">
        <div className="admin-dark-login-card">
          <div className="admin-dark-login-header">
            <div className="admin-logo-badge">
              <img
                src="/images/logo_update.jpg"
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
              src="/images/logo_update.jpg"
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
                          onClick={() => {
                            if (window.confirm(`Delete product "${p.name}"?`)) {
                              onDeleteProduct(p.id)
                            }
                          }}
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

          {/* VIEW: FINANCE (Payment Verification) */}
          {activeSection === 'finance' && (
            <section className="admin-table-card">
              <div className="admin-table-card-header">
                <div>
                  <h3 className="admin-card-heading">Payment Accounts & Online Verification</h3>
                  <p className="admin-card-subheading">
                    Official accounts where customers send online advance payments to save Rs. 200.
                  </p>
                </div>
              </div>

              {/* Bank Accounts Grid */}
              <div className="admin-accounts-grid">
                <div className="admin-account-card">
                  <div className="account-icon-wrap meezan">
                    <span className="material-icons">account_balance</span>
                  </div>
                  <h4>Meezan Bank</h4>
                  <div className="account-row">
                    <span>Account Title:</span>
                    <strong>Muhammad Jabir</strong>
                  </div>
                  <div className="account-row">
                    <span>Account Number:</span>
                    <strong className="copyable-text">02940108985161</strong>
                  </div>
                  <div className="account-row">
                    <span>Branch:</span>
                    <span>Allama Iqbal Town, Lahore</span>
                  </div>
                </div>

                <div className="admin-account-card">
                  <div className="account-icon-wrap easypaisa">
                    <span className="material-icons">phone_android</span>
                  </div>
                  <h4>Easypaisa</h4>
                  <div className="account-row">
                    <span>Account Title:</span>
                    <strong>Muhammad Jabir</strong>
                  </div>
                  <div className="account-row">
                    <span>Mobile Number:</span>
                    <strong className="copyable-text">03284430589</strong>
                  </div>
                  <div className="account-row">
                    <span>Status:</span>
                    <span className="status-badge-active">Active</span>
                  </div>
                </div>

                <div className="admin-account-card">
                  <div className="account-icon-wrap jazzcash">
                    <span className="material-icons">payments</span>
                  </div>
                  <h4>JazzCash</h4>
                  <div className="account-row">
                    <span>Account Title:</span>
                    <strong>Muhammad Jabir</strong>
                  </div>
                  <div className="account-row">
                    <span>Mobile Number:</span>
                    <strong className="copyable-text">03284430589</strong>
                  </div>
                  <div className="account-row">
                    <span>Status:</span>
                    <span className="status-badge-active">Active</span>
                  </div>
                </div>
              </div>

              {/* Online Payment Orders */}
              <div className="admin-online-orders-section">
                <h4 style={{ color: '#ffffff', margin: '24px 0 12px' }}>
                  Orders with Online Payment ({orders.filter(o => o.paymentMethod === 'online').length})
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
                          <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
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
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Gold Radiance Luxury Facial Kit"
                  className="dark-input"
                />
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

              {/* GALLERY IMAGE SELECTION BOX (User Request) */}
              <div className="form-group">
                <label>Product Image (Choose from Device Gallery)</label>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryImageChange}
                  style={{ display: 'none' }}
                  id="gallery-file-input"
                />

                <div className="gallery-picker-box">
                  {imagePreview ? (
                    <div className="gallery-preview-container">
                      <img
                        src={imagePreview}
                        alt="Product Preview"
                        className="gallery-preview-thumb"
                      />
                      <div className="gallery-preview-info">
                        <strong className="gallery-file-name">
                          {selectedImageFile ? selectedImageFile.name : productForm.image}
                        </strong>
                        <span className="gallery-file-badge">
                          ✓ Ready to store in projects folder (public/images/products)
                        </span>
                        <button
                          type="button"
                          className="btn-change-image"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <span className="material-icons">photo_camera</span>
                          <span>Choose Another Picture</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="gallery-dropzone"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="material-icons gallery-upload-icon">add_photo_alternate</span>
                      <strong>Click to Select Image from Gallery / Files</strong>
                      <p>Supports PNG, JPG, WebP. It will be stored in your project's folder upon saving.</p>
                      <button type="button" className="btn-browse-gallery">
                        <span className="material-icons">photo_library</span>
                        <span>Browse Device Gallery</span>
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
                  src="/images/logo_update.jpg"
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
