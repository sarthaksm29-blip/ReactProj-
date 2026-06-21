// pages/Shop.jsx
//
// Features: Remembered Filters (URL params), Calculation Saver (useMemo),
// Real-Time Filter Menu, Fast Product Display Wall, search + sort,
// skeleton loaders, and toast notifications.

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import FilterSidebar from '../components/FilterSidebar';
import ProductGrid from '../components/ProductGrid';
import CartDrawer from '../components/CartDrawer';
import QuickView from '../components/QuickView';
import SearchSort from '../components/SearchSort';
import SkeletonCard from '../components/SkeletonCard';
import './Shop.css';

// ── URL param helpers ────────────────────────────────────────────────────────
function parseFiltersFromParams(params) {
  return {
    categories: params.get('categories') ? params.get('categories').split(',') : [],
    colors:     params.get('colors')     ? params.get('colors').split(',')     : [],
    maxPrice:   params.get('maxPrice')   ? Number(params.get('maxPrice'))       : 500,
  };
}

function filtersToParams(filters, query, sort) {
  const params = {};
  if (filters.categories.length) params.categories = filters.categories.join(',');
  if (filters.colors.length)     params.colors     = filters.colors.join(',');
  if (filters.maxPrice < 500)    params.maxPrice   = String(filters.maxPrice);
  if (query)                     params.q          = query;
  if (sort)                      params.sort       = sort;
  return params;
}

// ── Sort helper ──────────────────────────────────────────────────────────────
function sortProducts(products, sort) {
  const arr = [...products];
  switch (sort) {
    case 'price-asc':   return arr.sort((a, b) => a.basePrice - b.basePrice);
    case 'price-desc':  return arr.sort((a, b) => b.basePrice - a.basePrice);
    case 'rating-desc': return arr.sort((a, b) => b.rating.rate - a.rating.rate);
    case 'newest':      return arr.sort((a, b) => b.id - a.id);
    default:            return arr;
  }
}

// ── Component ────────────────────────────────────────────────────────────────
function Shop() {
  const [products, setProducts]           = useState([]);
  const [status, setStatus]               = useState('loading'); // 'loading' | 'ready' | 'error'
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { addItem }    = useCart();
  const { addToast }   = useToast();
  const [filterOpen, setFilterOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => parseFiltersFromParams(searchParams));
  const [query,   setQuery]   = useState(() => searchParams.get('q')    ?? '');
  const [sort,    setSort]    = useState(() => searchParams.get('sort')  ?? '');

  // ── Fetch products ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((data) => {
        if (!cancelled) { setProducts(data); setStatus('ready'); }
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, []);

  // ── Sync filters → URL ──────────────────────────────────────────────────
  useEffect(() => {
    setSearchParams(filtersToParams(filters, query, sort), { replace: true });
  }, [filters, query, sort, setSearchParams]);

  // ── Derived filter options ──────────────────────────────────────────────
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products]
  );
  const colors = useMemo(
    () => [...new Set(products.flatMap((p) => p.variants.map((v) => v.color)))],
    [products]
  );

  // ── Filtered + searched + sorted products (Calculation Saver) ──────────
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    let result = products.filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.colors.length && !p.variants.some((v) => filters.colors.includes(v.color))) return false;
      if (p.basePrice > filters.maxPrice) return false;
      if (q && !p.title.toLowerCase().includes(q) &&
               !p.category.toLowerCase().includes(q) &&
               !p.description.toLowerCase().includes(q)) return false;
      return true;
    });

    return sortProducts(result, sort);
  }, [products, filters, query, sort]);

  // ── Stable callbacks (prevent ProductCard memo defeat) ─────────────────
  const handleAddToCart = useCallback((product, variant) => {
    addItem(product, variant);
    addToast(`${product.title.slice(0, 30)}… added to cart`, 'success');
  }, [addItem, addToast]);

  const handleRemoveFromCart = useCallback((lineId, title) => {
    addToast(`${title?.slice(0, 30) ?? 'Item'}… removed`, 'info');
  }, [addToast]);

  const handleQuickView    = useCallback((product) => setQuickViewProduct(product), []);
  const handleClearFilters = useCallback(
    () => setFilters({ categories: [], colors: [], maxPrice: 500 }),
    []
  );

  const handleFilterChange = useCallback((next) => setFilters(next), []);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="shop">
      <Header onFilterToggle={() => setFilterOpen((o) => !o)} filterOpen={filterOpen} />

      <div className="shop__layout">
        {/* Filter sidebar */}
        <FilterSidebar
          categories={categories}
          colors={colors}
          filters={filters}
          onChange={handleFilterChange}
          onClear={() => { handleClearFilters(); setFilterOpen(false); }}
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
        />

        {/* Main content */}
        <main className="shop__main">
          {/* Search + sort bar */}
          <SearchSort
            query={query}
            sort={sort}
            onQueryChange={setQuery}
            onSortChange={setSort}
            resultCount={status === 'ready' ? filteredProducts.length : 0}
          />

          {/* Loading skeleton grid */}
          {status === 'loading' && (
            <div className="shop__skeleton-grid">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <p className="shop__status shop__status--error">
              Couldn't load products. Check your connection and refresh.
            </p>
          )}

          {/* Product grid */}
          {status === 'ready' && (
            <ProductGrid
              products={filteredProducts}
              onAddToCart={handleAddToCart}
              onQuickView={handleQuickView}
            />
          )}
        </main>
      </div>

      {/* Cart + Quick View */}
      <CartDrawer onRemove={handleRemoveFromCart} />
      <QuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

export default Shop;