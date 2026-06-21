// components/FilterSidebar.jsx
//
// "Real-Time Filter Menu": every checkbox is controlled and writes straight
// into the filters object owned by Shop.jsx, which re-filters the product
// list on every change.
// On mobile it's an overlay panel toggled by the Header.

import './FilterSidebar.css';

function FilterSidebar({ categories, colors, filters, onChange, onClear, isOpen, onClose }) {
  const toggleInArray = (key, value) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const activeCount =
    filters.categories.length +
    filters.colors.length +
    (filters.maxPrice < 500 ? 1 : 0);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="filter-sidebar__backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`filter-sidebar ${isOpen ? 'filter-sidebar--open' : ''}`}>
        <div className="filter-sidebar__head">
          <h2 className="filter-sidebar__title">
            Filter
            {activeCount > 0 && (
              <span className="filter-sidebar__active-count">{activeCount}</span>
            )}
          </h2>
          <div className="filter-sidebar__head-actions">
            {activeCount > 0 && (
              <button className="filter-sidebar__clear" onClick={onClear}>
                Clear all
              </button>
            )}
            {/* Mobile close button */}
            <button
              className="filter-sidebar__close-btn"
              onClick={onClose}
              aria-label="Close filters"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Category */}
        <fieldset className="filter-sidebar__group">
          <legend>Category</legend>
          {categories.map((category) => (
            <label key={category} className="filter-sidebar__option">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => toggleInArray('categories', category)}
              />
              <span>{category}</span>
            </label>
          ))}
        </fieldset>

        {/* Color */}
        <fieldset className="filter-sidebar__group">
          <legend>Color</legend>
          {colors.map((color) => (
            <label key={color} className="filter-sidebar__option">
              <input
                type="checkbox"
                checked={filters.colors.includes(color)}
                onChange={() => toggleInArray('colors', color)}
              />
              <span>{color}</span>
            </label>
          ))}
        </fieldset>

        {/* Max price */}
        <fieldset className="filter-sidebar__group">
          <legend>Max price: <strong>₹{Math.round(filters.maxPrice * 83).toLocaleString('en-IN')}</strong></legend>
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          />
          <div className="filter-sidebar__range-label">
            <span>₹0</span>
            <span>₹{(500 * 83).toLocaleString('en-IN')}</span>
          </div>
        </fieldset>

        {/* Mobile apply button */}
        <button className="filter-sidebar__apply-btn" onClick={onClose}>
          Show Results {activeCount > 0 ? `(${activeCount} filters)` : ''}
        </button>
      </aside>
    </>
  );
}

export default FilterSidebar;