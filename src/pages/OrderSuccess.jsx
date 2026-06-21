// pages/OrderSuccess.jsx
//
// Premium order confirmation page with:
// – Animated SVG checkmark with green glow
// – Full financial breakdown (subtotal, discount, tax, shipping, total)
// – Delivery date range (3-5 business days)
// – Expandable items list
// – localStorage persistence across refreshes
// – Dark luxury aesthetic matching the rest of MarketGrid

import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { formatINR } from '../utils/formatPrice';
import './OrderSuccess.css';

// ── helpers ─────────────────────────────────────────────────────────────────

function addBusinessDays(date, n) {
  const d = new Date(date);
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d;
}

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
}

function getDeliveryWindow() {
  const today = new Date();
  return {
    from: formatDate(addBusinessDays(today, 3)),
    to:   formatDate(addBusinessDays(today, 5)),
  };
}

const STORAGE_KEY = 'mg_last_order';

// ── component ────────────────────────────────────────────────────────────────

export default function OrderSuccess() {
  const navigate          = useNavigate();
  const { state }         = useLocation();
  const [order, setOrder] = useState(null);
  const [showItems, setShowItems] = useState(false);
  const [copied, setCopied]       = useState(false);

  /* Hydrate from location.state OR localStorage (enables refresh persistence) */
  useEffect(() => {
    if (state?.orderId) {
      const data = { ...state, savedAt: Date.now() };
      setOrder(data);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) { setOrder(JSON.parse(saved)); return; }
      } catch (_) {}
      navigate('/', { replace: true });
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  if (!order) return null;

  const {
    orderId      = 'MG-??????',
    items        = [],
    subtotal     = 0,
    discountAmount = 0,
    discountCode   = '',
    tax          = 0,
    shippingUSD  = 0,
    grandTotal   = 0,
  } = order;

  const itemCount   = items.reduce((s, i) => s + i.qty, 0);
  const delivery    = getDeliveryWindow();

  function copyOrderId() {
    navigator.clipboard.writeText(orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleContinue() {
    navigate('/');
  }

  return (
    <div className="os">

      {/* ── Breadcrumb ── */}
      <nav className="os__breadcrumb" aria-label="breadcrumb">
        <Link to="/" className="os__bc-link">Home</Link>
        <span className="os__bc-sep">›</span>
        <span className="os__bc-link">Checkout</span>
        <span className="os__bc-sep">›</span>
        <span className="os__bc-current">Order Confirmed</span>
      </nav>

      {/* ── Hero ── */}
      <div className="os__hero">
        {/* Animated check icon */}
        <div className="os__icon-wrap">
          <div className="os__icon-glow" aria-hidden="true" />
          <svg className="os__check" viewBox="0 0 52 52" fill="none" aria-hidden="true">
            <circle className="os__check-circle" cx="26" cy="26" r="24"
              stroke="#22c55e" strokeWidth="2.5" />
            <path className="os__check-tick" d="M14.5 26.5l7.5 8 15.5-16.5"
              stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="os__heading">Order Placed Successfully!</h1>
        <p className="os__sub">
          Thank you for shopping with <strong>MarketGrid</strong>.<br />
          Your order has been confirmed and is being prepared.
        </p>

        {/* Order ID pill */}
        <div className="os__order-id-wrap">
          <span className="os__order-id-label">Order ID</span>
          <span className="os__order-id">#{orderId}</span>
          <button
            className={`os__copy-btn ${copied ? 'os__copy-btn--done' : ''}`}
            onClick={copyOrderId}
            title="Copy order ID"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="os__card">

        {/* Status tracker */}
        <div className="os__tracker">
          {['Order Placed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => (
            <div key={step} className={`os__tracker-step ${i === 0 ? 'os__tracker-step--active' : ''}`}>
              <div className="os__tracker-dot">
                {i === 0 && <span className="os__tracker-pulse" />}
                <span className="os__tracker-inner" />
              </div>
              {i < 3 && <div className={`os__tracker-line ${i === 0 ? 'os__tracker-line--done' : ''}`} />}
              <span className="os__tracker-label">{step}</span>
            </div>
          ))}
        </div>

        {/* Summary + Delivery grid */}
        <div className="os__grid">

          {/* Order summary */}
          <section className="os__section">
            <h2 className="os__section-title">Order Summary</h2>
            <div className="os__summary-rows">
              <SummaryRow label={`Items (${itemCount})`} value={formatINR(subtotal)} />
              {discountAmount > 0 && (
                <SummaryRow
                  label={`Discount${discountCode ? ` (${discountCode})` : ''}`}
                  value={`−${formatINR(discountAmount)}`}
                  accent
                />
              )}
              <SummaryRow label="GST (5%)" value={formatINR(tax)} />
              <SummaryRow
                label="Shipping"
                value={shippingUSD === 0 ? 'FREE ✓' : formatINR(shippingUSD)}
                highlight={shippingUSD === 0}
              />
              <div className="os__divider" />
              <SummaryRow label="Total Paid" value={formatINR(grandTotal)} bold />
            </div>
          </section>

          {/* Delivery info */}
          <section className="os__section">
            <h2 className="os__section-title">Delivery Details</h2>
            <div className="os__delivery">
              <div className="os__delivery-badge">
                <span className="os__delivery-icon">📦</span>
                <div>
                  <p className="os__delivery-label">Estimated Delivery</p>
                  <p className="os__delivery-date">{delivery.from} – {delivery.to}</p>
                </div>
              </div>

              <div className="os__delivery-progress">
                <div className="os__delivery-progress-bar">
                  <div className="os__delivery-progress-fill" style={{ width: '12%' }} />
                </div>
                <p className="os__delivery-hint">
                  Your order will be packed and shipped within 24 hours.
                </p>
              </div>

              <ul className="os__delivery-features">
                <li>🔒 Secure packaging guaranteed</li>
                <li>📬 Real-time tracking (coming soon)</li>
                <li>↩️ Easy 30-day returns</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Expandable items list */}
        {items.length > 0 && (
          <div className="os__items-section">
            <button
              className="os__items-toggle"
              onClick={() => setShowItems((s) => !s)}
              aria-expanded={showItems}
            >
              <span>{showItems ? 'Hide' : 'View'} {itemCount} Item{itemCount !== 1 ? 's' : ''}</span>
              <span className={`os__items-arrow ${showItems ? 'os__items-arrow--open' : ''}`}>▾</span>
            </button>

            {showItems && (
              <ul className="os__items-list">
                {items.map((item) => (
                  <li key={item.lineId} className="os__item">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="os__item-img"
                      onError={(e) => { e.target.style.background = '#1e1e1e'; e.target.src = ''; }}
                    />
                    <div className="os__item-info">
                      <p className="os__item-title">{item.title}</p>
                      <p className="os__item-variant">
                        {item.variant.color}
                        {item.variant.size ? ` / ${item.variant.size}` : ''}
                        {' '}× {item.qty}
                      </p>
                    </div>
                    <span className="os__item-price">
                      {formatINR(item.variant.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="os__actions">
          <button className="os__btn os__btn--primary" onClick={handleContinue}>
            ← Continue Shopping
          </button>
          <button
            className="os__btn os__btn--secondary"
            onClick={() => setShowItems((s) => !s)}
          >
            {showItems ? 'Hide' : 'View'} Order Details
          </button>
        </div>
      </div>

      {/* Thank-you footer */}
      <p className="os__thankyou">
        Thank you for choosing <strong>MarketGrid</strong>. We hope you love your purchase! 🛍️
      </p>
    </div>
  );
}

// ── Small helper components ───────────────────────────────────────────────────

function SummaryRow({ label, value, accent, bold, highlight }) {
  return (
    <div className={[
      'os__summary-row',
      accent     ? 'os__summary-row--accent'     : '',
      bold       ? 'os__summary-row--bold'       : '',
      highlight  ? 'os__summary-row--highlight'  : '',
    ].join(' ')}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
