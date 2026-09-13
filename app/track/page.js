'use client';

// app/track/page.js
//
// Works without any login/session -- the tracking_token itself is the
// credential, matched exactly by get_order_status_by_tracking_token. If
// arriving via the confirmation link, order_id and token are pre-filled
// from the URL; otherwise the customer can type them in manually.
//
// useSearchParams() requires a Suspense boundary for Next.js to be able
// to statically build this page -- TrackOrderForm holds all the real
// logic, and the default export below just wraps it.

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [token, setToken] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlOrderId = searchParams.get('order_id');
    const urlToken = searchParams.get('token');
    if (urlOrderId && urlToken) {
      setOrderId(urlOrderId);
      setToken(urlToken);
      lookup(urlOrderId, urlToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookup(id, trackingToken) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, error } = await supabase.rpc('get_order_status_by_tracking_token', {
        p_order_id: id,
        p_tracking_token: trackingToken,
      });
      if (error) throw error;
      if (!data || data.length === 0) {
        setError('Order not found. Double check your order ID and tracking code.');
      } else {
        setResult(data[0]);
      }
    } catch (err) {
      setError('Something went wrong looking up that order.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    lookup(orderId, token);
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1>Track Your Order</h1>
      <form onSubmit={handleSubmit}>
        <label>Order ID</label>
        <input value={orderId} onChange={(e) => setOrderId(e.target.value)} />

        <label>Tracking code</label>
        <input value={token} onChange={(e) => setToken(e.target.value)} />

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Looking up…' : 'Check Status'}
        </button>
      </form>

      {error && <p className="error-text" style={{ marginTop: 16 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <p><span className="status-badge">{result.status}</span></p>
          <p>Retailer: {result.retailer_name}</p>
          <p>Total: {result.currency} {result.total_amount}</p>
          {result.delivery_status && <p>Delivery: {result.delivery_status}</p>}
          <p className="hint-text">Placed on {new Date(result.created_at).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<p className="hint-text">Loading…</p>}>
      <TrackOrderForm />
    </Suspense>
  );
}
