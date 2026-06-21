// components/QuickView.jsx
//
// "Quick Look Window": rendered through a Portal straight into document.body
// so it sits above everything regardless of where in the tree it's called
// from, and the underlying grid/page never unmounts — closing it just
// returns you to the exact scroll position you were at.

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatINR } from '../utils/formatPrice';
import './QuickView.css';

function QuickView({ product, onClose, onAddToCart }) {
  const colors = useMemo(
    () => (product ? [...new Set(product.variants.map((v) => v.color))] : []),
    [product]
  );
  const hasSizes = product ? product.variants[0]?.size !== null : false;
  const sizes = useMemo(
    () => (hasSizes ? [...new Set(product.variants.map((v) => v.size))] : []),
    [product, hasSizes]
  );

  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? null);

  useEffect(() => {
    setSelectedColor(colors[0]);
    setSelectedSize(sizes[0] ?? null);
  }, [product, colors, sizes]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (product) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [product, onClose]);

  if (!product) return null;

  const currentVariant =
    product.variants.find((v) => v.color === selectedColor && v.size === selectedSize) ??
    product.variants[0];

  return createPortal(
    <div className="quickview-backdrop" onClick={onClose}>
      <div
        className="quickview"
        role="dialog"
        aria-modal="true"
        aria-label={product.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="quickview__close" onClick={onClose} aria-label="Close quick look">
          ✕
        </button>

        <div className="quickview__image">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="quickview__body">
          <p className="mono quickview__category">{product.category}</p>
          <h2 className="quickview__title">{product.title}</h2>
          <p className="quickview__description">{product.description}</p>

          <div className="quickview__options">
            <div className="quickview__swatches">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`swatch ${selectedColor === color ? 'swatch--active' : ''}`}
                  onClick={() => setSelectedColor(color)}
                  aria-pressed={selectedColor === color}
                  title={color}
                />
              ))}
            </div>
            {hasSizes && (
              <div className="quickview__sizes">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-pill ${selectedSize === size ? 'size-pill--active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="quickview__footer">
            <div className="quickview__pricing">
              <span className="quickview__price mono">{formatINR(currentVariant.price)}</span>
              <span className="quickview__member-price">
                Member price: <strong>{formatINR(currentVariant.price * 0.8)}</strong>
              </span>
            </div>
            <button
              className="quickview__add"
              onClick={() => {
                onAddToCart(product, currentVariant);
                onClose();
              }}
            >
              Add to bag
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default QuickView;