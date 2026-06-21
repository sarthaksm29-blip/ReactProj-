// pages/Checkout.jsx
// Simulated checkout — multiple payment methods: Card, UPI, Cash on Delivery.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatPrice';
import './Checkout.css';

const SHIPPING_THRESHOLD_USD = 24; // ~₹2,000

const UPI_APPS = [
  { name: 'Google Pay',  icon: '🟢', suffix: '@okaxis'  },
  { name: 'PhonePe',    icon: '🟣', suffix: '@ybl'     },
  { name: 'Paytm',      icon: '🔵', suffix: '@paytm'   },
  { name: 'BHIM',       icon: '🟠', suffix: '@upi'     },
];

export default function Checkout() {
  const navigate  = useNavigate();
  const { items, subtotal, discountAmount, tax, total, discountCode, applyDiscountCode, removeDiscount, clearCart } = useCart();
  const { addToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'cod'
  const [selectedUpiApp, setSelectedUpiApp] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError]  = useState('');

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', pincode: '', state: '',
    // card
    cardName: '', cardNumber: '', expiry: '', cvv: '',
    // upi
    upiId: '',
  });
  const [errors, setErrors] = useState({});

  // Shipping
  const shippingUSD  = subtotal >= SHIPPING_THRESHOLD_USD ? 0 : 2.4;
  const shippingINR  = shippingUSD * 83;
  // COD adds ₹49 handling
  const codFeeINR    = paymentMethod === 'cod' ? 49 : 0;
  const grandTotalUSD = total + shippingUSD + (paymentMethod === 'cod' ? 49/83 : 0);
  const grandTotal    = formatINR(grandTotalUSD);

  function handleField(e) {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cardNumber') v = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    if (name === 'expiry')     v = value.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');
    if (name === 'cvv')        v = value.replace(/\D/g, '').slice(0, 4);
    if (name === 'phone')      v = value.replace(/\D/g, '').slice(0, 10);
    setForm((f) => ({ ...f, [name]: v }));
    setErrors((e) => ({ ...e, [name]: '' }));
  }

  function validate() {
    const e = {};
    // Always validate delivery fields
    if (!form.name.trim())                                  e.name    = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))   e.email   = 'Valid email required';
    if (form.phone.length !== 10)                           e.phone   = '10-digit phone required';
    if (!form.address.trim())                               e.address = 'Address is required';
    if (!form.city.trim())                                  e.city    = 'City is required';
    if (!/^\d{6}$/.test(form.pincode))                      e.pincode = '6-digit pincode required';
    if (!form.state.trim())                                 e.state   = 'State is required';

    // Payment-method-specific validation
    if (paymentMethod === 'card') {
      if (!form.cardName.trim())                              e.cardName   = 'Name on card is required';
      if (form.cardNumber.replace(/\s/g, '').length !== 16)  e.cardNumber = '16-digit card number required';
      if (!/^\d{2}\/\d{2}$/.test(form.expiry))               e.expiry     = 'MM/YY format required';
      if (form.cvv.length < 3)                               e.cvv        = '3–4 digit CVV required';
    }
    if (paymentMethod === 'upi') {
      if (!/^[\w.-]+@[\w]+$/.test(form.upiId.trim()))        e.upiId = 'Enter a valid UPI ID (e.g. name@upi)';
    }
    // COD: no extra payment fields
    return e;
  }

  function handleApplyCoupon(e) {
    e.preventDefault();
    if (!codeInput.trim()) return;
    const result = applyDiscountCode(codeInput);
    if (result.ok) {
      addToast('Coupon applied!', 'success');
      setCodeError(''); setCodeInput('');
    } else {
      setCodeError('Invalid coupon code.');
    }
  }

  function handlePlaceOrder(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setPlacing(true);

    setTimeout(() => {
      const orderId = 'MG-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      clearCart();
      addToast('Order placed successfully!', 'success', 5000);
      navigate('/order-success', {
        state: {
          orderId,
          items,
          subtotal,
          discountAmount,
          discountCode: discountCode || '',
          tax,
          shippingUSD,
          codFeeINR,
          paymentMethod,
          grandTotal: grandTotalUSD,
        },
      });
    }, 1800);
  }

  if (items.length === 0 && !placing) {
    return (
      <div className="checkout__empty">
        <p>Your cart is empty.</p>
        <button className="checkout__back-btn" onClick={() => navigate('/')}>← Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="checkout">
      {/* Header */}
      <header className="checkout__header">
        <button className="checkout__back" onClick={() => navigate('/')}>← Back</button>
        <span className="checkout__brand">MarketGrid</span>
        <span />
      </header>

      <div className="checkout__body">
        {/* ── Left: Form ── */}
        <form className="checkout__form" onSubmit={handlePlaceOrder} noValidate>

          {/* Delivery */}
          <section className="checkout__section">
            <h2 className="checkout__section-title">Delivery Information</h2>
            <div className="checkout__grid-2">
              <Field label="Full Name"  name="name"    value={form.name}    onChange={handleField} error={errors.name} />
              <Field label="Email"      name="email"   type="email" value={form.email}   onChange={handleField} error={errors.email} />
              <Field label="Phone"      name="phone"   type="tel"   value={form.phone}   onChange={handleField} error={errors.phone}   placeholder="10-digit number" />
              <Field label="Pincode"    name="pincode" value={form.pincode} onChange={handleField} error={errors.pincode} />
            </div>
            <Field label="Address" name="address" value={form.address} onChange={handleField} error={errors.address} />
            <div className="checkout__grid-2">
              <Field label="City"  name="city"  value={form.city}  onChange={handleField} error={errors.city} />
              <Field label="State" name="state" value={form.state} onChange={handleField} error={errors.state} />
            </div>
          </section>

          {/* ── Payment ── */}
          <section className="checkout__section">
            <h2 className="checkout__section-title">
              Payment
              <span className="checkout__demo-badge">Demo — no real charge</span>
            </h2>

            {/* Method tabs */}
            <div className="checkout__pay-tabs">
              <PayTab
                id="card" active={paymentMethod === 'card'}
                icon="💳" label="Credit / Debit Card"
                onClick={() => setPaymentMethod('card')}
              />
              <PayTab
                id="upi" active={paymentMethod === 'upi'}
                icon="📱" label="UPI"
                onClick={() => setPaymentMethod('upi')}
              />
              <PayTab
                id="cod" active={paymentMethod === 'cod'}
                icon="💵" label="Cash on Delivery"
                onClick={() => setPaymentMethod('cod')}
              />
            </div>

            {/* ── Card panel ── */}
            {paymentMethod === 'card' && (
              <div className="checkout__pay-panel">
                {/* Card-type logos */}
                <div className="checkout__card-types">
                  {['VISA', 'MC', 'AMEX', 'RuPay'].map((t) => (
                    <span key={t} className="checkout__card-badge">{t}</span>
                  ))}
                </div>
                <Field label="Name on Card"  name="cardName"   value={form.cardName}   onChange={handleField} error={errors.cardName} />
                <Field label="Card Number"   name="cardNumber" value={form.cardNumber}  onChange={handleField} error={errors.cardNumber} placeholder="1234 5678 9012 3456" inputMode="numeric" />
                <div className="checkout__grid-2">
                  <Field label="Expiry (MM/YY)" name="expiry" value={form.expiry} onChange={handleField} error={errors.expiry} placeholder="MM/YY" inputMode="numeric" />
                  <Field label="CVV"    name="cvv"  type="password" value={form.cvv}    onChange={handleField} error={errors.cvv}    placeholder="···" inputMode="numeric" />
                </div>
              </div>
            )}

            {/* ── UPI panel ── */}
            {paymentMethod === 'upi' && (
              <div className="checkout__pay-panel">
                <Field
                  label="UPI ID"
                  name="upiId"
                  value={form.upiId}
                  onChange={(e) => { handleField(e); setSelectedUpiApp(null); }}
                  error={errors.upiId}
                  placeholder="yourname@upi"
                />
                <p className="checkout__upi-divider"><span>or pay with</span></p>
                <div className="checkout__upi-apps">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app.name}
                      type="button"
                      className={`checkout__upi-app ${selectedUpiApp === app.name ? 'checkout__upi-app--active' : ''}`}
                      onClick={() => {
                        setSelectedUpiApp(app.name);
                        setForm((f) => ({ ...f, upiId: `yourname${app.suffix}` }));
                        setErrors((e) => ({ ...e, upiId: '' }));
                      }}
                    >
                      <span className="checkout__upi-app-icon">{app.icon}</span>
                      <span className="checkout__upi-app-name">{app.name}</span>
                    </button>
                  ))}
                </div>
                <p className="checkout__upi-note">
                  A payment request will be sent to your UPI app. No transaction happens in demo mode.
                </p>
              </div>
            )}

            {/* ── COD panel ── */}
            {paymentMethod === 'cod' && (
              <div className="checkout__pay-panel checkout__cod-panel">
                <div className="checkout__cod-icon">💵</div>
                <h3 className="checkout__cod-title">Pay on Delivery</h3>
                <p className="checkout__cod-sub">
                  Our delivery partner will collect payment at your doorstep. No prepayment required.
                </p>
                <ul className="checkout__cod-features">
                  <li>✓ Pay by cash when your order arrives</li>
                  <li>✓ No online transaction needed</li>
                  <li>
                    <span className="checkout__cod-fee-note">
                      ＊ ₹49 COD handling fee added to your total
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </section>

          <button
            type="submit"
            className={`checkout__place-btn ${placing ? 'checkout__place-btn--loading' : ''}`}
            disabled={placing}
          >
            {placing
              ? <><span className="checkout__spinner" /> Processing…</>
              : `Place Order · ${grandTotal}`
            }
          </button>
        </form>

        {/* ── Right: Order summary ── */}
        <aside className="checkout__summary">
          <h2 className="checkout__section-title">Order Summary</h2>

          <ul className="checkout__items">
            {items.map((item) => (
              <li key={item.lineId} className="checkout__item">
                <img src={item.image} alt={item.title} />
                <div className="checkout__item-info">
                  <p className="checkout__item-title">{item.title}</p>
                  <p className="checkout__item-variant">
                    {item.variant.color}{item.variant.size ? ` / ${item.variant.size}` : ''} × {item.qty}
                  </p>
                </div>
                <span className="checkout__item-price">{formatINR(item.variant.price * item.qty)}</span>
              </li>
            ))}
          </ul>

          {/* Coupon */}
          <form className="checkout__coupon" onSubmit={handleApplyCoupon}>
            {discountCode ? (
              <div className="checkout__coupon-applied">
                <span>"{discountCode}" applied</span>
                <button type="button" onClick={removeDiscount}>Remove</button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Coupon (SAVE10, WELCOME15, HM20)"
                  value={codeInput}
                  onChange={(e) => { setCodeInput(e.target.value); setCodeError(''); }}
                />
                <button type="submit">Apply</button>
              </>
            )}
            {codeError && <p className="checkout__coupon-error">{codeError}</p>}
          </form>

          {/* Totals */}
          <div className="checkout__totals">
            <Row label="Subtotal"  value={formatINR(subtotal)} />
            {discountAmount > 0 && <Row label="Discount" value={`−${formatINR(discountAmount)}`} accent />}
            <Row label="GST (5%)"  value={formatINR(tax)} />
            <Row label="Shipping"  value={shippingUSD === 0 ? 'FREE' : formatINR(shippingUSD)} />
            {paymentMethod === 'cod' && <Row label="COD Handling" value="₹49" />}
            <Row label="Total"     value={grandTotal} bold />
          </div>

          <p className="checkout__trust">🔒 Secure checkout &nbsp;·&nbsp; Free returns &nbsp;·&nbsp; 100% safe</p>
        </aside>
      </div>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

function PayTab({ id, active, icon, label, onClick }) {
  return (
    <button
      type="button"
      id={`pay-tab-${id}`}
      className={`checkout__pay-tab ${active ? 'checkout__pay-tab--active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="checkout__pay-tab-icon">{icon}</span>
      <span className="checkout__pay-tab-label">{label}</span>
      {active && <span className="checkout__pay-tab-dot" />}
    </button>
  );
}

function Field({ label, name, type = 'text', value, onChange, error, placeholder, inputMode }) {
  return (
    <div className="checkout__field">
      <label htmlFor={`field-${name}`} className="checkout__label">{label}</label>
      <input
        id={`field-${name}`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        className={`checkout__input ${error ? 'checkout__input--error' : ''}`}
        autoComplete="off"
      />
      {error && <span className="checkout__field-error">{error}</span>}
    </div>
  );
}

function Row({ label, value, accent, bold }) {
  return (
    <div className={`checkout__total-row ${accent ? 'checkout__total-row--accent' : ''} ${bold ? 'checkout__total-row--bold' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
