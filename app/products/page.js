'use client';

// app/products/page.js
//
// useSearchParams() needs a Suspense boundary for Next.js to statically
// build this page -- caught this the hard way on /track earlier, so
// ProductsPageContent holds the real logic and the default export below
// just wraps it, same pattern.

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { RETAILER_ID } from '../../lib/constants';
import ProductCard from '../ProductCard';
import { gridContainer } from '../../lib/motion';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      let builder = supabase
        .from('product_retailer_links')
        .select('*, products(name, brand, image_url)')
        .eq('retailer_id', RETAILER_ID)
        .eq('is_active', true)
        .eq('is_orderable', true)
        .order('created_at', { ascending: false });

      const { data, error } = await builder;
      if (!error) {
        let results = data || [];
        if (query) {
          const q = query.toLowerCase();
          results = results.filter((link) =>
            link.products?.name?.toLowerCase().includes(q) ||
            link.products?.brand?.toLowerCase().includes(q)
          );
        }
        setProducts(results);
      }
      setLoading(false);
    }
    loadProducts();
  }, [query]);

  return (
    <div>
      <h1>{query ? `Results for "${query}"` : 'Shop'}</h1>
      {loading ? (
        <p className="hint-text">Loading…</p>
      ) : products.length === 0 ? (
        <p className="hint-text">
          {query ? 'No products match your search.' : 'No products available right now. Check back soon.'}
        </p>
      ) : (
        <motion.div className="product-row" initial="hidden" animate="show" variants={gridContainer}>
          {products.map((link) => (
            <ProductCard link={link} key={link.id} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="hint-text">Loading…</p>}>
      <ProductsPageContent />
    </Suspense>
  );
}
