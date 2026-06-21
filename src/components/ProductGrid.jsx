// components/ProductGrid.jsx
//
// "Fast Product Display Wall": pure CSS Grid with auto-fill so it resizes
// cleanly at any viewport without JS-driven breakpoints. The actual
// performance work (avoiding wasted re-renders) lives in ProductCard's
// React.memo and in the useCallback-wrapped handlers passed down from
// Shop.jsx — this component just lays cards out.

import ProductCard from './ProductCard';
import './ProductGrid.css';

function ProductGrid({ products, onAddToCart, onQuickView }) {
  if (products.length === 0) {
    return (
      <div className="product-grid__empty">
        <p className="mono">No products match these filters.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
}

export default ProductGrid;