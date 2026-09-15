'use client';

// app/page.js
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { RETAILER_ID, RETAILER_NAME } from '../lib/constants';
import ProductCard from './ProductCard';
import { fadeUp, gridContainer } from '../lib/motion';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      const { data, error } = await supabase
        .from('product_retailer_links')
        .select('*, products(name, brand, image_url)')
        .eq('retailer_id', RETAILER_ID)
        .eq('is_active', true)
        .eq('is_orderable', true)
        .limit(4);

      if (!error) setFeatured(data || []);
      setLoading(false);
    }
    loadFeatured();
  }, []);

  return (
    <div>
      <motion.section
        className="hero"
        initial="hidden"
        animate="show"
        variants={fadeUp}
      >
        <h1>Skincare, considered.</h1>
        <p>Quality products from {RETAILER_NAME}, delivered to your door.</p>
        <Link href="/products" className="btn" style={{ marginTop: 24, display: 'inline-flex' }}>
          Shop the collection
        </Link>
      </motion.section>

      <section>
        <h2>Featured</h2>
        {loading ? (
          <p className="hint-text">Loading…</p>
        ) : featured.length === 0 ? (
          <p className="hint-text">No products available yet.</p>
        ) : (
          <motion.div
            className="product-grid"
            initial="hidden"
            animate="show"
            variants={gridContainer}
          >
            {featured.map((link) => (
              <ProductCard link={link} key={link.id} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
