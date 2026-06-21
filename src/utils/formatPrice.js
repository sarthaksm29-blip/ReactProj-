// utils/formatPrice.js
// Converts USD prices from FakeStoreAPI → INR and formats as ₹X,XXX

const USD_TO_INR = 83;

/**
 * Formats a USD price into Indian Rupee display string.
 * e.g. 29.99 → "₹2,489"
 */
export function formatINR(usdPrice) {
  const inr = Math.round(usdPrice * USD_TO_INR);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(inr);
}
