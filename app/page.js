'use client';

// app/page.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { RETAILER_ID, RETAILER_NAME } from '../lib/constants';
import ProductImage from './ProductImage';

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
      <section className="hero">
        <h1>Skincare, considered.</h1>
        <p>Quality products from {RETAILER_NAME}, delivered to your door.</p>
        <Link href="/products" className="btn" style={{ marginTop: 24, display: 'inline-flex' }}>
          Shop the collection
        </Link>
      </section>

      <section>
        <h2>Featured</h2>
        {loading ? (
          <p className="hint-text">Loading…</p>
        ) : featured.length === 0 ? (
          <p className="hint-text">No products available yet.</p>
        ) : (
          <div className="product-grid">
            {featured.map((link) => (
              <Link href={`/products/${link.id}`} key={link.id} className="product-card">
                <ProductImage src={link.products?.image_url} alt={link.products?.name} />
                <h3>
                  {link.products?.brand ? `${link.products.brand} ` : ''}
                  {link.products?.name || 'Product'}
                </h3>
                <p className="price">
                  {link.currency || 'ZMW'} {link.displayed_price}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
