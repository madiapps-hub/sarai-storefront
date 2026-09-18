'use client';

// app/CartBadge.js
//
// Shows the real cart item count in the header, everywhere in the site.
// Reads from the same cart lib every other page already uses -- no new
// backend logic, just surfacing existing data at the top level.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getActiveCart, getCartItems } from '../lib/cart';

export default function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const cart = await getActiveCart();
        if (!cart) return;
        const items = await getCartItems(cart.id);
        if (!cancelled) {
          setCount(items.reduce((sum, i) => sum + i.quantity, 0));
        }
      } catch {
        // Guest has no session yet / no cart yet -- 0 is correct, not an error.
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <Link href="/cart" className="icon-btn" aria-label="Cart">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      {count > 0 && <span className="cart-badge">{count}</span>}
    </Link>
  );
}
