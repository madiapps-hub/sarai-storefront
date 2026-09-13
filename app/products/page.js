'use client';

// app/products/page.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { RETAILER_ID } from '../../lib/constants';
import ProductImage from '../ProductImage';

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
        <div className="product-grid">
          {products.map((link) => (
            <Link href={`/products/${link.id}`} key={link.id} className="product-card">
              <ProductImage src={link.products?.image_url} alt={link.products?.name} />
              <h3>
                {link.products?.brand ? `${link.products.brand} ` : ''}
                {link.products?.name || 'Product'}
              </h3>
              <p className="price">
                {link.currency || 'ZMW'} {link.displayed_price}
              </p>
              {link.stock_quantity != null && link.stock_quantity <= 0 && (
                <p className="error-text">Out of stock</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
