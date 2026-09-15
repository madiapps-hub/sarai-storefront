'use client';

// app/admin/products/page.js
//
// Creates a product and a product_retailer_link for Sarai in one action.
// Requires the RLS policies added for "Retailer staff can insert
// products" / "...insert own retailer links" -- without those, every
// insert here would be silently blocked by RLS.
//
// Note: this always creates a NEW product row, even if a product with
// the same name already exists (e.g. from another retailer's listing).
// A "search existing products first" step would avoid duplicates across
// retailers, but isn't built in this v1 -- worth adding once multiple
// retailers are actually sharing the same product catalogue in practice.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { RETAILER_ID } from '../../../lib/constants';
import ProductImage from '../../ProductImage';

export default function AdminProductsPage() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [commissionRate, setCommissionRate] = useState('0.10');

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_retailer_links')
      .select('*, products(name, brand, image_url)')
      .eq('retailer_id', RETAILER_ID)
      .order('created_at', { ascending: false });

    if (!error) setListings(data || []);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.is_anonymous) {
        router.push('/admin/login');
        return;
      }
      setCheckingAuth(false);
      load();
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function handleAddProduct(e) {
    e.preventDefault();
    setError(null);

    if (!name || !price || !stock || !commissionRate) {
      setError('Name, price, stock, and commission rate are all required.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: product, error: productErr } = await supabase
        .from('products')
        .insert({ name, brand: brand || null, image_url: imageUrl || null })
        .select()
        .single();

      if (productErr) throw productErr;

      const { error: linkErr } = await supabase.from('product_retailer_links').insert({
        product_id: product.id,
        retailer_id: RETAILER_ID,
        product_url: '', // legacy field from the old affiliate-link model, unused now
        displayed_price: parseFloat(price),
        stock_quantity: parseInt(stock, 10),
        commission_rate: parseFloat(commissionRate),
        is_active: true,
        is_orderable: true,
      });

      if (linkErr) throw linkErr;

      setName('');
      setBrand('');
      setImageUrl('');
      setPrice('');
      setStock('');
      setCommissionRate('0.10');
      await load();
    } catch (err) {
      setError(err.message || 'Could not add this product.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(link) {
    await supabase
      .from('product_retailer_links')
      .update({ is_active: !link.is_active })
      .eq('id', link.id);
    load();
  }

  if (checkingAuth) return <p className="hint-text">Checking session…</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <Link href="/admin">Orders</Link>
        <strong>Products</strong>
      </div>

      <h1>Add a Product</h1>
      <form onSubmit={handleAddProduct} style={{ maxWidth: 420 }}>
        <label>Product name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <label>Brand (optional)</label>
        <input value={brand} onChange={(e) => setBrand(e.target.value)} />

        <label>Image URL (optional)</label>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />

        <label>Price (ZMW)</label>
        <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />

        <label>Stock quantity</label>
        <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />

        <label>Commission rate (e.g. 0.10 = 10%)</label>
        <input type="number" step="0.01" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} />

        {error && <p className="error-text">{error}</p>}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add Product'}
        </button>
      </form>

      <h2 style={{ marginTop: 40 }}>Sarai's Listings</h2>
      {loading ? (
        <p className="hint-text">Loading…</p>
      ) : listings.length === 0 ? (
        <p className="hint-text">No products yet — add your first one above.</p>
      ) : (
        <div className="product-grid">
          {listings.map((link) => (
            <div key={link.id} className="product-card" style={{ opacity: link.is_active ? 1 : 0.5 }}>
              <ProductImage src={link.products?.image_url} alt={link.products?.name} height={120} />
              <h3>
                {link.products?.brand ? `${link.products.brand} ` : ''}
                {link.products?.name}
              </h3>
              <p className="price">{link.currency || 'ZMW'} {link.displayed_price}</p>
              <p className="hint-text">Stock: {link.stock_quantity}</p>
              <p className="hint-text">{link.is_active ? 'Active' : 'Inactive'}</p>
              <button className="btn btn-secondary" onClick={() => toggleActive(link)} style={{ marginTop: 8 }}>
                {link.is_active ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
