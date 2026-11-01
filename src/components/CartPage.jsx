import React, { useState } from 'react'
import site from '../data/site.json'

export default function CartPage({
  cart = [],
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onNavigate,
  onPlaceOrder,
  onShowToast
}) {
  const [paymentMethod, setPaymentMethod] = useState('cod') // 'cod' or 'online'
  const [copiedField, setCopiedField] = useState('')
  const [orderSuccess, setOrderSuccess] = useState(null)

  // Address form fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    province: 'Punjab',
    notes: '',
    transactionRef: ''
  })
  const [formErrors, setFormErrors] = useState({})

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const isFreeDelivery = subtotal >= 1999
  const deliveryFee = isFreeDelivery ? 0 : 199
  const codFee = paymentMethod === 'cod' ? 99 : 0
  const onlineDiscount = paymentMethod === 'online' ? 200 : 0
  const total = Math.max(0, subtotal + deliveryFee + codFee - onlineDiscount)

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Copied to Clipboard!',
        message: `${label}: ${text}`
      })
    }
    setTimeout(() => setCopiedField(''), 2500)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const copyPhoneToWhatsapp = () => {
    if (formData.phone) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }))
    }
  }

  const handleSubmitOrder = (e) => {
    e.preventDefault()

    const errors = {}
    if (!formData.name.trim()) errors.name = 'Please enter your full name'
    if (!formData.phone.trim()) errors.phone = 'Please enter your contact phone number'
    if (!formData.address.trim()) errors.address = 'Please enter complete delivery street address'
    if (!formData.city.trim()) errors.city = 'Please enter your city'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      const firstKey = Object.keys(errors)[0]
      const el = document.getElementById(`addr-${firstKey}`)
      if (el) el.focus()
      return
    }

    // Generate Order ID
    const orderId = `MS-${Date.now().toString().slice(-5)}`
    const orderRecord = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer: { ...formData },
      items: [...cart],
      subtotal,
      deliveryFee,
      codFee,
      shippingFee: deliveryFee + codFee,
      discount: onlineDiscount,
      total,
      paymentMethod,
      transactionRef: formData.transactionRef || '',
      status: 'Pending'
    }

    // Call onPlaceOrder to persist in localStorage and clear cart
    onPlaceOrder(orderRecord)
    setOrderSuccess(orderRecord)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Pre-formatted WhatsApp order confirmation message (Clean & Professional)
  const buildWhatsAppMsg = (order) => {
    const itemsList = order.items
      .map(item => `* ${item.name} (x${item.quantity}) - Rs ${(item.price * item.quantity).toLocaleString()}`)
      .join('\n')

    const payMethodText = order.paymentMethod === 'online'
      ? 'Online Payment'
      : 'Cash on Delivery'

    const msg = `🛍️ New Order: #${order.id}\n` +
      `Name: ${order.customer.name}\n` +
      `Phone: ${order.customer.phone}\n` +
      (order.customer.whatsapp && order.customer.whatsapp !== order.customer.phone ? `WhatsApp: ${order.customer.whatsapp}\n` : '') +
      `Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.province}\n` +
      (order.customer.notes ? `Notes: ${order.customer.notes}\n` : '') +
      `\nItems Ordered:\n${itemsList}\n\n` +
      `Payment Method: ${payMethodText}\n` +
      `Total Price: Rs ${order.total.toLocaleString()}\n\n` +
      `Kindly confirm my order. Thank you!`

    return encodeURIComponent(msg)
  }

  // If order was successfully placed, display confirmation view
  if (orderSuccess) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="order-success-card">
            <div className="order-success-icon-wrap">
              <span className="material-icons success-check-icon">verified</span>
            </div>
            <span className="order-success-eyebrow">Thank You For Your Order!</span>
            <h1 className="order-success-title">Order Placed Successfully</h1>
            <div className="order-id-badge">
              Order ID: <strong>#{orderSuccess.id}</strong>
            </div>

            <p className="order-success-desc">
              Your order has been recorded. Our team will verify and dispatch your parcel shortly.
            </p>

            <div className="order-success-summary">
              <h3>Order Details</h3>
              <div className="order-summary-row">
                <span>Customer:</span>
                <strong>{orderSuccess.customer.name} ({orderSuccess.customer.phone})</strong>
              </div>
              <div className="order-summary-row">
                <span>Delivery To:</span>
                <span>{orderSuccess.customer.address}, {orderSuccess.customer.city}</span>
              </div>
              <div className="order-summary-row">
                <span>Payment Method:</span>
                <strong>
                  {orderSuccess.paymentMethod === 'online' ? 'Online Payment (Rs 200 Discount Applied)' : 'Cash on Delivery (+Rs 99 COD Fee)'}
                </strong>
              </div>
              <div className="order-summary-row order-total-highlight">
                <span>Total Amount:</span>
                <span className="grand-price">Rs {orderSuccess.total.toLocaleString()}</span>
              </div>
            </div>

            {orderSuccess.paymentMethod === 'online' && (
              <div className="order-online-proof-callout">
                <span className="material-icons">info</span>
                <div>
                  <strong>Online Payment Reminder:</strong>
                  <p>
                    Please send your payment screenshot to <strong>03284430589</strong> on WhatsApp mentioning Order #{orderSuccess.id} for quick dispatch.
                  </p>
                </div>
              </div>
            )}

            <div className="order-success-actions">
              <a
                href={`https://wa.me/${site.whatsapp}?text=${buildWhatsAppMsg(orderSuccess)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp-confirm"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.188 8.188 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.188 8.188 0 0 1-1.26-4.48c0-4.54 3.7-8.23 8.24-8.23m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.8 1-.15.18-.29.2-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29"/>
                </svg>
                <span>Confirm Order via WhatsApp</span>
              </a>

              <button
                type="button"
                className="btn-shop-more"
                onClick={() => {
                  setOrderSuccess(null)
                  onNavigate('/shop')
                }}
              >
                <span className="material-icons">storefront</span>
                <span>Shop More Products</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="cart-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <button type="button" className="breadcrumb-link" onClick={() => onNavigate('/')}>
            Home
          </button>
          <span className="material-icons">chevron_right</span>
          <button type="button" className="breadcrumb-link" onClick={() => onNavigate('/shop')}>
            Shop
          </button>
          <span className="material-icons">chevron_right</span>
          <span className="breadcrumb-current">Cart</span>
        </nav>

        <div className="cart-header-row">
          <h1 className="cart-title">
            Your Cart
            <span className="cart-title-count">
              ({cart.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
          </h1>

          {/* Shop more products option in cart */}
          <button
            type="button"
            className="btn-shop-more-header"
            onClick={() => onNavigate('/shop')}
            title="Browse catalogue"
          >
            <span className="material-icons">storefront</span>
            Shop More Products
          </button>
        </div>

        {/* Empty Cart State */}
        {cart.length === 0 ? (
          <div className="cart-empty" id="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Your cart is currently empty</h2>
            <p>Looks like you haven't added anything yet. Discover our skincare and beauty essentials!</p>
            <button
              type="button"
              className="cta"
              onClick={() => onNavigate('/shop')}
            >
              Browse Shop Catalogue
            </button>
          </div>
        ) : (
          /* Cart Content Layout: inspired by shopsnest.xyz/cart.html */
          <form className="cart-content" onSubmit={handleSubmitOrder}>
            <div className="cart-main">
              {/* 1. Cart Items Table */}
              <div className="cart-section-card">
                <div className="cart-items-section-header">
                  <div className="cart-section-title">
                    <span className="material-icons">shopping_bag</span>
                    <h2>Cart Items ({cart.length})</h2>
                  </div>
                  <button
                    type="button"
                    className="clear-cart-link"
                    onClick={onClearCart}
                  >
                    Clear All
                  </button>
                </div>

                <div className="cart-items-list" id="cart-items-list">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item-row">
                      <img
                        src={`/images/products/${item.image}`}
                        alt={item.name}
                        className="cart-item-thumb"
                        onError={e => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/images/logo.png'
                        }}
                      />

                      <div className="cart-item-info">
                        <span className="cart-item-cat">{item.category?.replace('-', ' ')}</span>
                        <h3 className="cart-item-name">{item.name}</h3>
                        <div className="cart-item-unit-price">
                          Rs {item.price.toLocaleString()} each
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="cart-item-qty-wrap">
                        <button
                          type="button"
                          className="qty-btn"
                          aria-label="Decrease quantity"
                          onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          aria-label="Increase quantity"
                          onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      {/* Total for this item */}
                      <div className="cart-item-total">
                        Rs {(item.price * item.quantity).toLocaleString()}
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        className="cart-item-remove"
                        aria-label="Remove item"
                        title="Remove item"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <span className="material-icons">delete_outline</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Delivery Address Section (matching fields from reference) */}
              <div className="cart-section-card" id="address-section">
                <div className="cart-section-title">
                  <span className="material-icons">location_on</span>
                  <h2>Delivery Address</h2>
                </div>

                <div className="address-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="addr-name">Full Name *</label>
                      <input
                        type="text"
                        id="addr-name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Fatima Ali"
                        className={formErrors.name ? 'input-error' : ''}
                      />
                      {formErrors.name && <span className="field-error-text">{formErrors.name}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="addr-phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="addr-phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. 0300-1234567"
                        className={formErrors.phone ? 'input-error' : ''}
                      />
                      {formErrors.phone && <span className="field-error-text">{formErrors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <div className="label-with-action">
                        <label htmlFor="addr-whatsapp">WhatsApp Number</label>
                        {formData.phone && (
                          <button
                            type="button"
                            className="btn-text-action"
                            onClick={copyPhoneToWhatsapp}
                          >
                            Same as phone
                          </button>
                        )}
                      </div>
                      <input
                        type="tel"
                        id="addr-whatsapp"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="e.g. 0321-7654321"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="addr-city">City *</label>
                      <input
                        type="text"
                        id="addr-city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Lahore, Karachi, Islamabad"
                        className={formErrors.city ? 'input-error' : ''}
                      />
                      {formErrors.city && <span className="field-error-text">{formErrors.city}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="addr-street">Complete Delivery Address *</label>
                    <input
                      type="text"
                      id="addr-address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="House / Flat #, Street name, Block / Sector, Area"
                      className={formErrors.address ? 'input-error' : ''}
                    />
                    {formErrors.address && <span className="field-error-text">{formErrors.address}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="addr-province">Province / Region</label>
                      <select
                        id="addr-province"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                      >
                        <option value="Punjab">Punjab</option>
                        <option value="Sindh">Sindh</option>
                        <option value="KPK">Khyber Pakhtunkhwa (KPK)</option>
                        <option value="Balochistan">Balochistan</option>
                        <option value="Islamabad">Islamabad Capital Territory</option>
                        <option value="Azad Kashmir">Azad Kashmir</option>
                        <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="addr-notes">Delivery Instructions / Notes (Optional)</label>
                      <input
                        type="text"
                        id="addr-notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="e.g. Call before delivery, deliver in afternoon"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Payment Method Section */}
              <div className="cart-section-card" id="payment-section">
                <div className="cart-section-title">
                  <span className="material-icons">payment</span>
                  <h2>Payment Method</h2>
                </div>

                <div className="payment-options-grid">
                  {/* COD Option */}
                  <label
                    className={`payment-option-label ${paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <div className="payment-option-body">
                      <div className="pay-icon-circle cod-icon">
                        <span className="material-icons">local_shipping</span>
                      </div>
                      <div className="pay-option-text">
                        <div className="pay-option-title-row">
                          <strong>Cash on Delivery (COD)</strong>
                          <span className="cod-fee-badge">+ Rs 99 COD Fee</span>
                        </div>
                        <p>Pay cash upon delivery. Fast delivery all over Pakistan (FREE delivery on orders Rs 1999+).</p>
                      </div>
                    </div>
                  </label>

                  {/* Online Payment Option with Rs 200 Discount */}
                  <label
                    className={`payment-option-label ${paymentMethod === 'online' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('online')}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                    />
                    <div className="payment-option-body">
                      <div className="pay-icon-circle online-icon">
                        <span className="material-icons">account_balance_wallet</span>
                      </div>
                      <div className="pay-option-text">
                        <div className="pay-option-title-row">
                          <strong>Online Payment (Bank / JazzCash)</strong>
                          <span className="online-discount-badge">
                            GET RS 200 OFF
                          </span>
                        </div>
                        <p>Save Rs 200! Pay directly via JazzCash, MCB Bank, or Meezan Bank.</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* When Online Payment is selected: Display Bank Accounts specified by user */}
                {paymentMethod === 'online' && (
                  <div className="online-payment-details-box">
                    <div className="online-save-banner">
                      <span className="material-icons">savings</span>
                      <div>
                        <strong>RS 200 DISCOUNT APPLIED!</strong>
                        <p>Transfer to any of the accounts below and send screenshot on WhatsApp.</p>
                      </div>
                    </div>

                    <div className="payment-accounts-grid">
                      {/* Account 1: JazzCash */}
                      <div className="bank-card jazzcash-card">
                        <div className="bank-card-header">
                          <span className="bank-tag jazzcash-tag">Jazzcash</span>
                          <span className="bank-badge">Mobile Wallet</span>
                        </div>
                        <div className="bank-field">
                          <span className="bank-field-label">Account Title</span>
                          <strong className="bank-field-val">Muqsit Shafat Hussain</strong>
                        </div>
                        <div className="bank-field">
                          <span className="bank-field-label">Mobile Number</span>
                          <div className="bank-copy-row">
                            <span className="bank-number">03284430589</span>
                            <button
                              type="button"
                              className="btn-copy"
                              onClick={() => handleCopy('03284430589', 'Jazzcash Number')}
                            >
                              {copiedField === 'Jazzcash Number' ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Account 2: MCB Bank */}
                      <div className="bank-card mcb-card">
                        <div className="bank-card-header">
                          <span className="bank-tag mcb-tag">MCB BANK Limited</span>
                          <span className="bank-badge">Bank Transfer</span>
                        </div>
                        <div className="bank-field">
                          <span className="bank-field-label">Account Title</span>
                          <strong className="bank-field-val">MUQSIT SHAFAT HUSSAIN</strong>
                        </div>
                        <div className="bank-field">
                          <span className="bank-field-label">Account Number</span>
                          <div className="bank-copy-row">
                            <span className="bank-number">1651641191006729</span>
                            <button
                              type="button"
                              className="btn-copy"
                              onClick={() => handleCopy('1651641191006729', 'MCB Account')}
                            >
                              {copiedField === 'MCB Account' ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                        <div className="bank-field">
                          <span className="bank-field-label">IBAN</span>
                          <div className="bank-copy-row">
                            <span className="bank-number iban-font">PK58MUCB1651641191006729</span>
                            <button
                              type="button"
                              className="btn-copy"
                              onClick={() => handleCopy('PK58MUCB1651641191006729', 'MCB IBAN')}
                            >
                              {copiedField === 'MCB IBAN' ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Account 3: Meezan Bank */}
                      <div className="bank-card meezan-card">
                        <div className="bank-card-header">
                          <span className="bank-tag meezan-tag">Meezan Bank</span>
                          <span className="bank-badge">Islamic Banking</span>
                        </div>
                        <div className="bank-field">
                          <span className="bank-field-label">Account Title</span>
                          <strong className="bank-field-val">MUQSIT SHAFAT HUSSAIN</strong>
                        </div>
                        <div className="bank-field">
                          <span className="bank-field-label">Account Number</span>
                          <div className="bank-copy-row">
                            <span className="bank-number">11390111920101</span>
                            <button
                              type="button"
                              className="btn-copy"
                              onClick={() => handleCopy('11390111920101', 'Meezan Account')}
                            >
                              {copiedField === 'Meezan Account' ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                        <div className="bank-field">
                          <span className="bank-field-label">IBAN</span>
                          <div className="bank-copy-row">
                            <span className="bank-number iban-font">PK67MEZN0011390111920101</span>
                            <button
                              type="button"
                              className="btn-copy"
                              onClick={() => handleCopy('PK67MEZN0011390111920101', 'Meezan IBAN')}
                            >
                              {copiedField === 'Meezan IBAN' ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Screenshot Reminder Box */}
                    <div className="whatsapp-screenshot-box">
                      <div className="wa-screenshot-header">
                        <span className="material-icons wa-green-icon">campaign</span>
                        <div>
                          <strong>Send Screenshot on WhatsApp for Instant Dispatch</strong>
                          <p>
                            After transferring, send the transaction screenshot or receipt on WhatsApp to{' '}
                            <a
                              href="https://wa.me/923284430589"
                              target="_blank"
                              rel="noreferrer"
                              className="wa-highlight-num"
                            >
                              📱 03284430589
                            </a>{' '}
                            for immediate verification.
                          </p>
                        </div>
                      </div>

                      <a
                        href="https://wa.me/923284430589?text=Hi%20MS%20Beauty,%20I%20have%20made%20the%20online%20payment%20transfer."
                        target="_blank"
                        rel="noreferrer"
                        className="btn-wa-send-proof"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.188 8.188 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.188 8.188 0 0 1-1.26-4.48c0-4.54 3.7-8.23 8.24-8.23m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.65.81-.8 1-.15.18-.29.2-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29"/>
                        </svg>
                        <span>WhatsApp Payment Screenshot (03284430589)</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary Sticky Sidebar */}
            <aside className="cart-sidebar">
              <div className="order-summary-card">
                <h2 className="order-summary-title">Order Summary</h2>

                <div className="order-summary-rows">
                  <div className="summary-row">
                    <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>Rs {subtotal.toLocaleString()}</span>
                  </div>

                  <div className="summary-row">
                    <span>Delivery All Over Pakistan</span>
                    {isFreeDelivery ? (
                      <span className="free-tag">FREE</span>
                    ) : (
                      <span className="fee-plus">+ Rs 199</span>
                    )}
                  </div>

                  {paymentMethod === 'cod' && (
                    <div className="summary-row">
                      <span>Cash on Delivery (COD) Fee</span>
                      <span className="fee-plus">+ Rs 99</span>
                    </div>
                  )}

                  {paymentMethod === 'online' && (
                    <div className="summary-row discount-row">
                      <span>
                        <span className="material-icons discount-icon">redeem</span>
                        Online Payment Discount
                      </span>
                      <span className="discount-minus">− Rs 200</span>
                    </div>
                  )}

                  <hr className="summary-divider" />

                  <div className="summary-row total-row">
                    <span>Grand Total</span>
                    <span className="grand-total-amount">Rs {total.toLocaleString()}</span>
                  </div>
                </div>

                {subtotal >= 1999 ? (
                  <div className="free-shipping-qualify">
                    <span className="material-icons">local_shipping</span>
                    <span>🎉 You have qualified for Free Home Delivery All Over Pakistan!</span>
                  </div>
                ) : (
                  <div className="free-shipping-progress-hint">
                    Add Rs {(1999 - subtotal).toLocaleString()} more for Free Home Delivery All Over Pakistan
                  </div>
                )}

                {/* Big Place Order Button */}
                <button
                  type="submit"
                  className="btn-place-order"
                  id="place-order-btn"
                >
                  <span className="material-icons">check_circle</span>
                  <span>Place Order (Rs {total.toLocaleString()})</span>
                </button>

                {/* Shop More Products Option */}
                <button
                  type="button"
                  className="btn-continue-shopping"
                  onClick={() => onNavigate('/shop')}
                >
                  <span className="material-icons">arrow_back</span>
                  <span>Shop More Products</span>
                </button>

                {/* Security and Trust Badges */}
                <div className="checkout-trust-badges">
                  <div className="trust-item">
                    <span className="material-icons">verified_user</span>
                    <span>100% Authentic Products</span>
                  </div>
                  <div className="trust-item">
                    <span className="material-icons">support_agent</span>
                    <span>Customer Support on WhatsApp</span>
                  </div>
                  <div className="trust-item">
                    <span className="material-icons">lock</span>
                    <span>Safe & Encrypted Checkout</span>
                  </div>
                </div>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  )
}
