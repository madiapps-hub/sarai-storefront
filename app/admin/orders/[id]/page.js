'use client';

// app/admin/orders/[id]/page.js
//
// Status buttons shown here mirror the exact transitions allowed by the
// update_order_status SQL function -- but that function is the real
// enforcement, this is just showing sensible buttons. Delivery info only
// appears if RLS actually returns it (it's withheld for unpaid orders by
// the policy built in Phase 12).

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const NEXT_STATUSES = {
  PAID: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['READY_FOR_DELIVERY', 'CANCELLED'],
  READY_FOR_DELIVERY: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
};

export default function AdminOrderDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) {
      router.push('/admin/login');
      return;
    }

    const { data: orderData } = await supabase.from('orders').select('*').eq('id', id).single();
    const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', id);
    const { data: deliveryData } = await supabase.from('order_deliveries').select('*').eq('order_id', id).maybeSingle();

    setOrder(orderData);
    setItems(itemsData || []);
    setDelivery(deliveryData);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusUpdate(newStatus) {
    setUpdating(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/update-order-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ order_id: id, new_status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update status');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p className="hint-text">Loading…</p>;
  if (!order) return <p className="error-text">Order not found.</p>;

  const nextOptions = NEXT_STATUSES[order.status] || [];

  return (
    <div style={{ maxWidth: 560 }}>
      <h1>Order {order.id.slice(0, 8)}…</h1>
      <p><span className="status-badge">{order.status}</span></p>
      <p>Total: {order.currency} {order.total_amount}</p>
      <p className="hint-text">Placed {new Date(order.created_at).toLocaleString()}</p>

      <h3>Items</h3>
      {items.map((item) => (
        <div key={item.id} className="cart-row">
          <span>{item.product_name_snapshot} × {item.quantity}</span>
          <span>{item.line_total}</span>
        </div>
      ))}

      <h3>Delivery</h3>
      {delivery ? (
        <div>
          <p>{delivery.recipient_name} — {delivery.recipient_phone}</p>
          <p>{delivery.address_line}{delivery.city ? `, ${delivery.city}` : ''}</p>
          <p className="hint-text">Delivery status: {delivery.delivery_status}</p>
        </div>
      ) : (
        <p className="hint-text">Delivery details aren't available until this order is paid.</p>
      )}

      {nextOptions.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Update Status</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {nextOptions.map((status) => (
              <button
                key={status}
                className="btn btn-secondary"
                onClick={() => handleStatusUpdate(status)}
                disabled={updating}
              >
                Mark as {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          {error && <p className="error-text" style={{ marginTop: 10 }}>{error}</p>}
        </div>
      )}
    </div>
  );
}
