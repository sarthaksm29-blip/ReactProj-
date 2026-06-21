// components/ProductCard.jsx
//
// H&M-inspired card — white background throughout, product image uses
// object-fit: contain so nothing is cropped, info section below the image
// with discount %, crossed-out original price, and red sale price.

import { memo, useMemo, useState } from 'react';
import { formatINR } from '../utils/formatPrice';
import './ProductCard.css';

// Deterministic "original" MRP = sale price + 20–45% markup
// so the discount badge is meaningful and consistent per product.
function getMRP(price, id) {
  const pct = [0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.60][(id * 3) % 7];
  return price * (1 + pct);
}

function ProductCard({ product, onAddToCart, onQuickView }) {
  const variants = product?.variants ?? [];

  const colors = useMemo(
    () => [...new Set(variants.map((v) => v.color))],
    [variants]
  );

  const hasSizes = variants[0]?.size != null;

  const sizes = useMemo(
    () => (hasSizes ? [...new Set(variants.map((v) => v.size))] : []),
    [variants, hasSizes]
  );

  const [selectedColor, setSelectedColor] = useState(colors[0] ?? null);
  const [selectedSize,  setSelectedSize]  = useState(sizes[0]  ?? null);
  const [wishlisted,    setWishlisted]    = useState(false);

  const currentVariant = useMemo(
    () =>
      variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      ) ?? variants[0] ?? null,
    [variants, selectedColor, selectedSize]
  );

  if (!product || variants.length === 0 || !currentVariant) return null;

  const salePrice = currentVariant.price;
  const mrp       = getMRP(salePrice, product.id);
  const discount   = Math.round((1 - salePrice / mrp) * 100);

  return (
    <article className="product-card">

      {/* ── Image area ── */}
      <div className="product-card__image-wrap">
        {/* Discount badge */}
        <span className="product-card__discount-badge">-{discount}%</span>

        {/* Wishlist */}
        <button
          className={`product-card__wishlist ${wishlisted ? 'product-card__wishlist--active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setWishlisted((w) => !w); }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlisted}
        >
          {wishlisted ? '♥' : '♡'}
        </button>

        <button
          className="product-card__image-btn"
          onClick={() => onQuickView(product)}
          aria-label={`Quick look: ${product.title}`}
          tabIndex={0}
        >
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='600' viewBox='0 0 500 600'%3E%3Crect width='500' height='600' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23aaa'%3EImage unavailable%3C/text%3E%3C/svg%3E";
            }}
          />
          <span className="product-card__quick-look">Quick look</span>
        </button>
      </div>

      {/* ── Info section (white, below image) ── */}
      <div className="product-card__body">
        {/* Category */}
        <p className="product-card__category">{product.category}</p>

        {/* Title */}
        <h3 className="product-card__title">{product.title}</h3>

        {/* Prices */}
        <div className="product-card__pricing">
          <span className="product-card__sale-price">{formatINR(salePrice)}</span>
          <span className="product-card__original-price">{formatINR(mrp)}</span>
        </div>

        {/* Color swatches */}
        <div className="product-card__swatches">
          {colors.map((color) => (
            <button
              key={color}
              className={`swatch ${selectedColor === color ? 'swatch--active' : ''}`}
              onClick={() => setSelectedColor(color)}
              aria-pressed={selectedColor === color}
              aria-label={color}
              title={color}
            />
          ))}
        </div>

        {/* Sizes + Add row */}
        <div className="product-card__footer">
          {hasSizes && (
            <div className="product-card__sizes">
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
          <button
            className="product-card__add"
            onClick={() => onAddToCart(product, currentVariant)}
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);