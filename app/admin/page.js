'use client';

// app/admin/page.js
//
// The order list here is scoped automatically by the retailer-read RLS
// policies we already built and tested -- this query has no explicit
// retailer_id filter, RLS does that. If a logged-in user isn't linked to
// any retailer via retailer_users, this list is simply empty for them,
// not an error.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.is_anonymous) {
        router.push('/admin/login');
        return;
      }
      setCheckingAuth(false);

      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total_amount, currency, created_at')
        .order('created_at', { ascending: false });

      if (!error) setOrders(data || []);
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  if (checkingAuth) return <p className="hint-text">Checking session…</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <strong>Orders</strong>
        <Link href="/admin/products">Products</Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Orders</h1>
        <button className="btn btn-secondary" onClick={handleSignOut}>Sign Out</button>
      </div>

      {loading ? (
        <p className="hint-text">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="hint-text">No orders yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Status</th>
              <th>Total</th>
              <th>Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><Link href={`/admin/orders/${order.id}`}>{order.id.slice(0, 8)}…</Link></td>
                <td><span className="status-badge">{order.status}</span></td>
                <td>{order.currency} {order.total_amount}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
