// services/api.js
//
// Electronics & jewellery come straight from FakeStoreAPI (unchanged).
// Men's & women's clothing are replaced with curated H&M-style products
// that have proper fashion images, realistic INR-equivalent pricing,
// and H&M-style product names.

const BASE_URL = 'https://fakestoreapi.com';

// ── Color pools ──────────────────────────────────────────────────────────────
const CLOTHING_COLORS = [
  'Black', 'White', 'Navy', 'Beige', 'Grey',
  'Dusty Rose', 'Sage Green', 'Brown', 'Rust', 'Dark Blue',
];
const ACCESSORY_COLORS = ['Black', 'Stone', 'Navy', 'Olive', 'Rust'];
const SIZE_POOL  = ['S', 'M', 'L', 'XL'];
const SIZED_CATEGORIES = new Set(["men's clothing", "women's clothing"]);

// ── Deterministic helpers ─────────────────────────────────────────────────────
function seedFromId(id, salt = 0) {
  return (id * 9301 + salt * 49297) % 233280;
}
function pick(pool, id, salt) {
  return pool[seedFromId(id, salt) % pool.length];
}

function buildVariants(product) {
  const pool       = SIZED_CATEGORIES.has(product.category) ? CLOTHING_COLORS : ACCESSORY_COLORS;
  const colorCount = 2 + (product.id % 3); // 2–4 colors
  const colors     = Array.from(
    new Set(Array.from({ length: colorCount }, (_, i) => pick(pool, product.id, i + 1)))
  );

  const hasSizes = SIZED_CATEGORIES.has(product.category);
  const sizes    = hasSizes ? SIZE_POOL : [null];

  const variants = [];
  colors.forEach((color, ci) => {
    sizes.forEach((size, si) => {
      const sizeDelta  = size === 'XL' ? 2 : size === 'L' ? 1 : 0;
      const colorDelta = ci === 0 ? 0 : Math.round((ci * 1.5 + si * 0.3) * 100) / 100;
      variants.push({
        key   : `${color}-${size ?? 'one-size'}`,
        color,
        size,
        price : Math.round((product.price + sizeDelta + colorDelta) * 100) / 100,
      });
    });
  });

  return variants;
}

function normalizeProduct(raw) {
  const variants = buildVariants(raw);
  return {
    id         : raw.id,
    title      : raw.title,
    description: raw.description,
    category   : raw.category,
    image      : raw.image,
    rating     : raw.rating,
    basePrice  : raw.price,
    variants,
  };
}

// ── H&M-style clothing catalogue ─────────────────────────────────────────────
// Prices are in USD so the existing formatINR (×83) gives realistic INR figures.
// IDs start at 101 to never clash with FakeStoreAPI IDs (1-20).

const HM_MENS = [
  {
    id: 101,
    title: 'Regular Fit Crew-Neck T-Shirt',
    price: 4.81,        // ₹399
    description: 'Soft cotton jersey T-shirt in a regular fit. Features a ribbed crew neck and short sleeves. An everyday essential.',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.3, count: 1284 },
  },
  {
    id: 102,
    title: 'Slim Fit Oxford Shirt',
    price: 12.04,       // ₹999
    description: 'Shirt in a woven cotton fabric with a slim fit. Features a turn-down collar, button placket, and long sleeves with button cuffs.',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.1, count: 748 },
  },
  {
    id: 103,
    title: 'Oversized Fit Hoodie',
    price: 18.06,       // ₹1,499
    description: 'Hoodie in a soft cotton blend with an oversized fit. Features a large hood, a kangaroo pocket at the front, and ribbed hems.',
    category: "men's clothing",
    image: '/img_hoodie.png',
    rating: { rate: 4.5, count: 2103 },
  },
  {
    id: 104,
    title: 'Slim Fit Stretch Jeans',
    price: 24.09,       // ₹1,999
    description: 'Jeans in a washed denim with a slim fit. Features a zip fly, coin pocket and two back pockets. Slight stretch for added comfort.',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.2, count: 936 },
  },
  {
    id: 105,
    title: 'Regular Fit Polo Shirt',
    price: 15.66,       // ₹1,299
    description: 'Polo shirt in a piqué fabric with a regular fit. Features a small stand-up collar, a button placket, and short sleeves.',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.0, count: 567 },
  },
  {
    id: 106,
    title: 'Relaxed Fit Cargo Trousers',
    price: 21.69,       // ₹1,799
    description: 'Trousers in a cotton twill with a relaxed fit. Features a zip fly, side pockets, cargo pockets on the thighs, and wide legs.',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.1, count: 412 },
  },
  {
    id: 107,
    title: 'Regular Fit Harrington Jacket',
    price: 36.14,       // ₹2,999
    description: 'Harrington jacket in a woven fabric. Features a stand-up collar, zip fastening, side pockets with flap, and ribbed hem and cuffs.',
    category: "men's clothing",
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.4, count: 683 },
  },
  {
    id: 108,
    title: 'Regular Fit Joggers',
    price: 15.66,       // ₹1,299
    description: 'Joggers in a soft sweatshirt fabric with a regular fit. Features a drawstring waist, side pockets, and ribbed hems.',
    category: "men's clothing",
    image: '/img_joggers.png',
    rating: { rate: 4.2, count: 891 },
  },
];

const HM_WOMENS = [
  {
    id: 201,
    title: 'Fitted Ribbed Tank Top',
    price: 6.02,        // ₹499
    description: 'Tank top in a fitted silhouette made from soft ribbed jersey. Features a scoop neckline and a cropped length. Perfect for layering.',
    category: "women's clothing",
    image: '/img_tank_top.png',
    rating: { rate: 4.3, count: 1567 },
  },
  {
    id: 202,
    title: 'Flared Mini Skirt',
    price: 15.66,       // ₹1,299
    description: 'Short skirt in a woven fabric with a flared silhouette. Features a wide elasticated waistband and a straight, flared hem.',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.0, count: 783 },
  },
  {
    id: 203,
    title: 'Wrap-Front Midi Dress',
    price: 30.11,       // ₹2,499
    description: 'Midi dress with a wrap-front and a V-neck. Adjustable tie belt at the waist. Wide skirt with a flared hem that falls below the knees.',
    category: "women's clothing",
    image: '/img_midi_dress.png',
    rating: { rate: 4.6, count: 2341 },
  },
  {
    id: 204,
    title: 'Oversized Fit Sweatshirt',
    price: 18.06,       // ₹1,499
    description: 'Sweatshirt in a soft cotton blend with an oversized fit. Features a crew neck, dropped shoulders, and ribbed neckline, cuffs, and hem.',
    category: "women's clothing",
    image: '/img_sweatshirt.png',
    rating: { rate: 4.4, count: 1102 },
  },
  {
    id: 205,
    title: 'Wide-Leg Linen-Blend Trousers',
    price: 24.09,       // ₹1,999
    description: 'Trousers in a linen blend with wide legs. Features a high waist with pleats, side pockets, a zip fly, and hook-and-eye fastening.',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.2, count: 634 },
  },
  {
    id: 206,
    title: 'Single-Breasted Blazer',
    price: 42.17,       // ₹3,499
    description: 'Blazer in a woven fabric with a regular fit. Features notch lapels, long sleeves, padded shoulders, and welt pockets at the front.',
    category: "women's clothing",
    image: '/img_blazer.png',
    rating: { rate: 4.5, count: 892 },
  },
  {
    id: 207,
    title: 'High-Rise Skinny Jeans',
    price: 27.10,       // ₹2,249
    description: 'Jeans in a stretch denim with a high rise and a very slim, tapered fit. Features five pockets and a zip fly with a button.',
    category: "women's clothing",
    image: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=600&q=80',
    rating: { rate: 4.3, count: 1789 },
  },
  {
    id: 208,
    title: 'Floral-Print Chiffon Blouse',
    price: 18.06,       // ₹1,499
    description: 'Blouse in a woven chiffon fabric with a regular fit. Features a V-neck, a gathered section at the back, and long sleeves with cuffs.',
    category: "women's clothing",
    image: '/img_blouse.png',
    rating: { rate: 4.1, count: 456 },
  },
];

// All custom clothing combined
const CUSTOM_CLOTHING = [...HM_MENS, ...HM_WOMENS];
const CLOTHING_CATEGORIES = new Set(["men's clothing", "women's clothing"]);

// ── Main fetch ────────────────────────────────────────────────────────────────
export async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);

  const data = await res.json();

  // Keep only electronics + jewellery from FakeStoreAPI
  const nonClothing = data
    .filter((p) => !CLOTHING_CATEGORIES.has(p.category))
    .map(normalizeProduct);

  // Use our curated H&M-style clothing instead
  const clothing = CUSTOM_CLOTHING.map(normalizeProduct);

  // Clothing first (H&M puts apparel front and centre), then accessories/electronics
  return [...clothing, ...nonClothing];
}

export const DISCOUNT_CODES = {
  SAVE10   : 0.10,
  WELCOME15: 0.15,
  HM20     : 0.20,
};

export const TAX_RATE = 0.05; // GST 5% on clothing