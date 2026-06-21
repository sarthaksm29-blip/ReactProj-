// components/CartDrawer.jsx
//
// "Sliding Cart Panel": always mounted, slid off-screen with a transform
// and toggled by the isOpen flag from CartContext.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatPrice';
import './CartDrawer.css';

function CartDrawer({ onRemove }) {
  const navigate = useNavigate();
  const {
    items, isOpen, closeCart,
    removeItem, updateQty,
    discountCode, applyDiscountCode, removeDiscount,
    subtotal, discountAmount, tax, total,
  } = useCart();
  const { addToast } = useToast();

  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleApplyCode = (e) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    const result = applyDiscountCode(codeInput);
    if (!result.ok) {
      setCodeError(result.message);
    } else {
      setCodeError('');
      setCodeInput('');
      addToast('Coupon applied!', 'success');
    }
  };

  const handleRemove = (lineId, title) => {
    removeItem(lineId);
    onRemove?.(lineId, title);
    addToast(`Removed from cart`, 'info');
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  // Shipping: free if subtotal USD >= 24 (~₹2000), else ₹199 = ~$2.40
  const shippingUSD = subtotal >= 24 ? 0 : 2.4;

  return (
    <>
      <div
        className={`cart-backdrop ${isOpen ? 'cart-backdrop--visible' : ''}`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside
        className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`}
        aria-hidden={!isOpen}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="cart-drawer__head">
          <h2>Your Bag</h2>
          <button className="cart-drawer__close" onClick={closeCart} aria-label="Close cart">✕</button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Your bag is empty.</p>
            <button className="cart-drawer__empty-cta" onClick={closeCart}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <ul className="cart-drawer__list">
            {items.map((item) => (
              <li key={item.lineId} className="cart-line">
                <img src={item.image} alt={item.title} />
                <div className="cart-line__info">
                  <p className="cart-line__title">{item.title}</p>
                  <p className="cart-line__variant mono">
                    {item.variant.color}
                    {item.variant.size ? ` / ${item.variant.size}` : ''}
                  </p>
                  <div className="cart-line__qty">
                    <button onClick={() => updateQty(item.lineId, item.qty - 1)}>−</button>
                    <span className="mono">{item.qty}</span>
                    <button onClick={() => updateQty(item.lineId, item.qty + 1)}>+</button>
                  </div>
                </div>
                <div className="cart-line__right">
                  <span className="mono">{formatINR(item.variant.price * item.qty)}</span>
                  <button
                    className="cart-line__remove"
                    onClick={() => handleRemove(item.lineId, item.title)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Discount code */}
        <form className="cart-drawer__discount" onSubmit={handleApplyCode}>
          {discountCode ? (
            <div className="cart-drawer__discount-applied">
              <span className="mono">{discountCode} applied</span>
              <button type="button" onClick={removeDiscount}>Remove</button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Coupon code (SAVE10, WELCOME15)"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
              />
              <button type="submit">Apply</button>
            </>
          )}
        </form>
        {codeError && <p className="cart-drawer__error mono">{codeError}</p>}

        {/* Totals */}
        {items.length > 0 && (
          <div className="cart-drawer__receipt">
            <div className="receipt-row">
              <span>Subtotal</span>
              <span className="mono">{formatINR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="receipt-row receipt-row--discount">
                <span>Discount</span>
                <span className="mono">−{formatINR(discountAmount)}</span>
              </div>
            )}
            <div className="receipt-row">
              <span>Tax (8%)</span>
              <span className="mono">{formatINR(tax)}</span>
            </div>
            <div className="receipt-row">
              <span>Shipping</span>
              <span className="mono">{shippingUSD === 0 ? 'FREE' : formatINR(shippingUSD)}</span>
            </div>
            <div className="receipt-row receipt-row--total">
              <span>Estimated Total</span>
              <span className="mono">{formatINR(total + shippingUSD)}</span>
            </div>
          </div>
        )}

        {/* Checkout CTA */}
        <button
          className="cart-drawer__checkout"
          disabled={items.length === 0}
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </button>
      </aside>
    </>
  );
}

export default CartDrawer;