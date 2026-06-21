// context/CartContext.jsx
//
// This is the "Checkout Details Hub" feature: one provider owns the cart
// items, the applied discount code, and the tax calculation, and exposes
// computed totals so no other component has to re-derive them.

import { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { DISCOUNT_CODES, TAX_RATE } from '../services/api';

const CartContext = createContext(null);

function lineId(productId, variantKey) {
  return `${productId}::${variantKey}`;
}

const initialState = {
  items: [],          // { lineId, productId, title, image, variant, qty }
  discountCode: null,
  isOpen: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, variant, qty } = action.payload;
      const id = lineId(product.id, variant.key);
      const existing = state.items.find((item) => item.lineId === id);

      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.lineId === id ? { ...item, qty: item.qty + qty } : item
          ),
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            lineId: id,
            productId: product.id,
            title: product.title,
            image: product.image,
            variant,
            qty,
          },
        ],
      };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.lineId !== action.payload) };

    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.lineId === action.payload.lineId
              ? { ...item, qty: Math.max(1, action.payload.qty) }
              : item
          ),
      };

    case 'APPLY_DISCOUNT':
      return { ...state, discountCode: action.payload };

    case 'REMOVE_DISCOUNT':
      return { ...state, discountCode: null };

    case 'CLEAR_CART':
      return { ...state, items: [], discountCode: null };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = useCallback((product, variant, qty = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, variant, qty } });
  }, []);

  const removeItem = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const updateQty = useCallback((id, qty) => {
    dispatch({ type: 'UPDATE_QTY', payload: { lineId: id, qty } });
  }, []);

  const applyDiscountCode = useCallback((code) => {
    const normalized = code.trim().toUpperCase();
    if (DISCOUNT_CODES[normalized]) {
      dispatch({ type: 'APPLY_DISCOUNT', payload: normalized });
      return { ok: true };
    }
    return { ok: false, message: 'That code is not valid.' };
  }, []);

  const removeDiscount = useCallback(() => dispatch({ type: 'REMOVE_DISCOUNT' }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), []);
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), []);

  // Everything below only recomputes when items or discountCode actually
  // change — this is the "Calculation Saver": adding/removing a filter
  // elsewhere in the app never touches this memo.
  const totals = useMemo(() => {
    const subtotal = state.items.reduce((sum, item) => sum + item.variant.price * item.qty, 0);
    const discountRate = state.discountCode ? DISCOUNT_CODES[state.discountCode] : 0;
    const discountAmount = subtotal * discountRate;
    const taxableAmount = subtotal - discountAmount;
    const tax = taxableAmount * TAX_RATE;
    const total = taxableAmount + tax;
    const itemCount = state.items.reduce((sum, item) => sum + item.qty, 0);

    return {
      subtotal,
      discountAmount,
      tax,
      total,
      itemCount,
    };
  }, [state.items, state.discountCode]);

  const value = useMemo(
    () => ({
      items: state.items,
      discountCode: state.discountCode,
      isOpen: state.isOpen,
      ...totals,
      addItem,
      removeItem,
      updateQty,
      applyDiscountCode,
      removeDiscount,
      clearCart,
      openCart,
      closeCart,
    }),
    [state.items, state.discountCode, state.isOpen, totals, addItem, removeItem, updateQty, applyDiscountCode, removeDiscount, clearCart, openCart, closeCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return ctx;
}