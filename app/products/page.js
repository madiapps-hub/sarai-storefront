'use client';

// app/products/page.js
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { RETAILER_ID } from '../../lib/constants';
import ProductCard from '../ProductCard';
import { gridContainer } from '../../lib/motion';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from('product_retailer_links')
        .select('*, products(name, brand, image_url)')
        .eq('retailer_id', RETAILER_ID)
        .eq('is_active', true)
        .eq('is_orderable', true)
        .order('created_at', { ascending: false });

      if (!error) setProducts(data || []);
      setLoading(false);
    }
    loadProducts();
  }, []);

  return (
    <div>
      <h1>Shop</h1>
      {loading ? (
        <p className="hint-text">Loading…</p>
      ) : products.length === 0 ? (
        <p className="hint-text">No products available right now. Check back soon.</p>
      ) : (
        <motion.div
          className="product-grid"
          initial="hidden"
          animate="show"
          variants={gridContainer}
        >
          {products.map((link) => (
            <ProductCard link={link} key={link.id} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
