'use client';

// app/ProductCard.js
//
// The wishlist heart is LOCAL-ONLY -- a decorative toggle with no
// backend, since there's no wishlists table. It resets on page reload
// and doesn't sync across devices. If real wishlists are wanted later,
// that needs a new table + RLS policy, not just UI.

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import ProductImage from './ProductImage';
import { addToCart } from '../lib/cart';
import { gridItem, cardHover, imageHover } from '../lib/motion';

export default function ProductCard({ link }) {
  const prefersReducedMotion = useReducedMotion();
  const product = link.products;
  const outOfStock = link.stock_quantity != null && link.stock_quantity <= 0;
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAddToBag(e) {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(link.id, link.displayed_price, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    } catch {
      // Silent -- the full product page's Add to Cart still works if this
      // quick-add fails for some reason (e.g. session hiccup).
    } finally {
      setAdding(false);
    }
  }

  return (
    <motion.div variants={gridItem}>
      <motion.div initial="rest" whileHover={prefersReducedMotion ? undefined : 'hover'} animate="rest" variants={cardHover}>
        <Link href={`/products/${link.id}`} className="product-card">
          <div className="product-card-image-wrap">
            <button
              className="wishlist-btn"
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted((w) => !w); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'var(--color-secondary)' : 'none'} stroke="var(--color-secondary)" strokeWidth="1.5">
                <path d="M12 21s-7-4.6-9.5-9C.7 8.1 2.4 4 6.3 4c2 0 3.6 1.2 4.7 3 1.1-1.8 2.7-3 4.7-3 3.9 0 5.6 4.1 3.8 8-2.5 4.4-9.5 9-9.5 9Z" />
              </svg>
            </button>
            <motion.div variants={prefersReducedMotion ? undefined : imageHover}>
              <ProductImage src={product?.image_url} alt={product?.name} />
            </motion.div>
          </div>

          {product?.brand && <p className="eyebrow-category">{product.brand}</p>}
          <h3>{product?.name || 'Product'}</h3>
          <p className="price">{link.currency || 'ZMW'} {link.displayed_price}</p>

          {outOfStock ? (
            <p className="error-text" style={{ marginTop: 8 }}>Out of stock</p>
          ) : (
            <button className="add-to-bag-btn" onClick={handleAddToBag} disabled={adding}>
              {added ? 'Added' : adding ? 'Adding…' : 'Add to bag'}
            </button>
          )}
        </Link>
      </motion.div>
    </motion.div>
  );
}
