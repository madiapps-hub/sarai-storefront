'use client';

// app/ProductCard.js
//
// Single source of truth for how a product card looks and moves,
// replacing the duplicated markup that used to live separately in the
// homepage and catalogue pages. Hover lift + subtle image scale, nothing
// bouncy -- respects prefers-reduced-motion via Motion's own hook rather
// than just the CSS media query, since these animations are JS-driven.

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import ProductImage from './ProductImage';
import { gridItem, cardHover, imageHover } from '../lib/motion';

export default function ProductCard({ link }) {
  const prefersReducedMotion = useReducedMotion();
  const product = link.products;
  const outOfStock = link.stock_quantity != null && link.stock_quantity <= 0;

  return (
    <motion.div variants={gridItem}>
      <motion.div
        initial="rest"
        whileHover={prefersReducedMotion ? undefined : 'hover'}
        animate="rest"
        variants={cardHover}
      >
        <Link href={`/products/${link.id}`} className="product-card" style={{ display: 'block' }}>
          <div style={{ overflow: 'hidden', borderRadius: 'var(--radius)' }}>
            <motion.div variants={prefersReducedMotion ? undefined : imageHover}>
              <ProductImage src={product?.image_url} alt={product?.name} />
            </motion.div>
          </div>
          <h3>
            {product?.brand ? `${product.brand} ` : ''}
            {product?.name || 'Product'}
          </h3>
          <p className="price">
            {link.currency || 'ZMW'} {link.displayed_price}
          </p>
          {outOfStock && <p className="error-text">Out of stock</p>}
        </Link>
      </motion.div>
    </motion.div>
  );
}
