// components/SearchSort.jsx
// Search bar + sort dropdown — integrated into the shop's URL params.

import './SearchSort.css';

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

export default function SearchSort({ query, sort, onQueryChange, onSortChange, resultCount }) {
  return (
    <div className="search-sort">
      {/* Search input */}
      <div className="search-sort__input-wrap">
        <svg className="search-sort__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          id="product-search"
          type="search"
          className="search-sort__input"
          placeholder="Search products…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search products"
          autoComplete="off"
        />
        {query && (
          <button
            className="search-sort__clear"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Right side: result count + sort */}
      <div className="search-sort__right">
        <span className="search-sort__count">
          {resultCount} {resultCount === 1 ? 'item' : 'items'}
        </span>
        <div className="search-sort__select-wrap">
          <select
            id="product-sort"
            className="search-sort__select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <svg className="search-sort__caret" viewBox="0 0 10 6" fill="none" aria-hidden="true">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
