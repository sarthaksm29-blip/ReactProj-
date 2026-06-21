// components/Header.jsx
import { useCart } from '../context/CartContext';
import './Header.css';

function Header({ onFilterToggle, filterOpen }) {
  const { itemCount, openCart } = useCart();

  return (
    <header className="header">
      {/* Mobile: filter toggle */}
      <button
        className="header__filter-btn"
        onClick={onFilterToggle}
        aria-label={filterOpen ? 'Close filters' : 'Open filters'}
        aria-expanded={!!filterOpen}
      >
        <svg viewBox="0 0 18 14" fill="none" width="18" height="14">
          <rect x="0" y="0" width="18" height="2" rx="1" fill="currentColor"/>
          <rect x="3" y="6" width="12" height="2" rx="1" fill="currentColor"/>
          <rect x="6" y="12" width="6" height="2" rx="1" fill="currentColor"/>
        </svg>
        <span>Filter</span>
      </button>

      <span className="header__logo">MarketGrid</span>

      <button className="header__cart" onClick={openCart} aria-label="Open cart">
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
          <path d="M2 2h2l2.5 10h9l1.5-7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="17" r="1" fill="currentColor"/>
          <circle cx="15" cy="17" r="1" fill="currentColor"/>
        </svg>
        Bag
        {itemCount > 0 && <span className="header__badge mono">{itemCount}</span>}
      </button>
    </header>
  );
}

export default Header;