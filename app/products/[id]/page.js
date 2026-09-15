'use client';

// app/products/[id]/page.js
//
// [id] here is the product_retailer_link's id -- the specific listing for
// this retailer, not a generic product id. That's deliberate: price,
// stock, and orderability are all listing-specific, not product-specific.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabaseClient';
import { addToCart } from '../../../lib/cart';
import ProductImage from '../../ProductImage';
import { fadeUp } from '../../../lib/motion';

export default function ProductDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadListing() {
      const { data, error } = await supabase
        .from('product_retailer_links')
        .select('*, products(name, brand, image_url)')
        .eq('id', id)
        .single();

      if (error) {
        setError('Could not load this product.');
      } else {
        setLink(data);
      }
      setLoading(false);
    }
    loadListing();
  }, [id]);

  async function handleAddToCart() {
    setAdding(true);
    setError(null);
    try {
      await addToCart(link.id, link.displayed_price, 1);
      router.push('/cart');
    } catch (err) {
      setError(err.message || 'Could not add this item to your cart.');
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <p className="hint-text">Loading…</p>;
  if (error && !link) return <p className="error-text">{error}</p>;
  if (!link) return <p className="hint-text">Product not found.</p>;

  const outOfStock = link.stock_quantity != null && link.stock_quantity <= 0;

  return (
    <motion.div
      style={{ maxWidth: 480 }}
      initial="hidden"
      animate="show"
      variants={fadeUp}
    >
      <ProductImage src={link.products?.image_url} alt={link.products?.name} height={280} />
      <h1 style={{ marginTop: 16 }}>
        {link.products?.brand ? `${link.products.brand} ` : ''}
        {link.products?.name || 'Product'}
      </h1>
      <p className="price" style={{ fontSize: 20 }}>
        {link.currency || 'ZMW'} {link.displayed_price}
      </p>

      {outOfStock ? (
        <p className="error-text">Out of stock</p>
      ) : (
        <motion.button
          className="btn"
          onClick={handleAddToCart}
          disabled={adding}
          whileTap={{ scale: 0.96 }}
        >
          {adding ? 'Adding…' : 'Add to Cart'}
        </motion.button>
      )}

      {error && <p className="error-text" style={{ marginTop: 10 }}>{error}</p>}
    </motion.div>
  );
}
