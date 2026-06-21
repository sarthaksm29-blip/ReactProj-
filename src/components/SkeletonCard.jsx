// components/SkeletonCard.jsx
// Placeholder card shown while products are loading.
import './SkeletonCard.css';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card__image skeleton-pulse" />
      <div className="skeleton-card__body">
        <div className="skeleton-pulse skeleton-card__line skeleton-card__line--short" />
        <div className="skeleton-pulse skeleton-card__line" />
        <div className="skeleton-pulse skeleton-card__line skeleton-card__line--medium" />
        <div className="skeleton-card__swatches">
          <div className="skeleton-pulse skeleton-card__swatch" />
          <div className="skeleton-pulse skeleton-card__swatch" />
          <div className="skeleton-pulse skeleton-card__swatch" />
        </div>
        <div className="skeleton-pulse skeleton-card__price" />
      </div>
    </div>
  );
}
