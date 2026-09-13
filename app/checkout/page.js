'use client';

// app/checkout/page.js
//
// One page, three steps: delivery details -> payment -> confirmation.
// Calls the already-deployed create-order and initiate-payment Edge
// Functions directly -- all the real validation, pricing, stock locking,
// and referral attribution happens there and in the SQL functions behind
// them, not here.

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { getActiveCart, ensureSession } from '../../lib/cart';
import { getStoredReferralToken, clearStoredReferralToken } from '../../lib/referral';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function CheckoutPage() {
  const [step, setStep] = useState('delivery'); // delivery | payment | confirmation
  const [cart, setCart] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [idempotencyKey] = useState(() => `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [order, setOrder] = useState(null);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      await ensureSession();
      const activeCart = await getActiveCart();
      setCart(activeCart);
    }
    init();
  }, []);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!recipientName || !recipientPhone || !addressLine) {
      setError('Please fill in your name, phone, and address.');
      return;
    }
    if (!cart) {
      setError('Your cart could not be found. Please go back and add items again.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const referralToken = getStoredReferralToken();

      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          cart_id: cart.id,
          idempotency_key: idempotencyKey,
          recipient_name: recipientName,
          recipient_phone: recipientPhone,
          address_line: addressLine,
          city: city || null,
          referral_token: referralToken || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not place order');
      }

      setOrder(data.order);
      clearStoredReferralToken(); // one-time use, attribution is now attached to the order
      setStep('payment');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePay(e) {
    e.preventDefault();
    if (!paymentPhone) {
      setError('Enter the mobile money number to pay from.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          order_id: order.order_id,
          phone_number: paymentPhone,
          payment_method: 'mtn_momo',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not start payment');
      }
      setPaymentResult(data);
      setStep('confirmation');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'confirmation') {
    const trackingUrl = `/track?order_id=${order.order_id}&token=${order.tracking_token}`;
    return (
      <div style={{ maxWidth: 480 }}>
        <h1>Order placed</h1>
        <p>Thank you! Your order total was {order.currency} {order.total_amount}.</p>
        <p>We've initiated your payment. Please check your phone to approve it.</p>
        <p className="hint-text">
          Save this link to check your order status any time, even without an account:
        </p>
        <p><a href={trackingUrl}>{typeof window !== 'undefined' ? window.location.origin : ''}{trackingUrl}</a></p>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div style={{ maxWidth: 480 }}>
        <h1>Pay for your order</h1>
        <p>Total: {order.currency} {order.total_amount}</p>
        <form onSubmit={handlePay}>
          <label>Mobile money number</label>
          <input
            type="tel"
            placeholder="e.g. 0977000000"
            value={paymentPhone}
            onChange={(e) => setPaymentPhone(e.target.value)}
          />
          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Processing…' : 'Pay Now'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1>Delivery Details</h1>
      <form onSubmit={handlePlaceOrder}>
        <label>Full name</label>
        <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />

        <label>Phone number</label>
        <input
          type="tel"
          placeholder="e.g. 0977000000"
          value={recipientPhone}
          onChange={(e) => setRecipientPhone(e.target.value)}
        />

        <label>Delivery address</label>
        <input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />

        <label>City (optional)</label>
        <input value={city} onChange={(e) => setCity(e.target.value)} />

        {error && <p className="error-text">{error}</p>}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Placing order…' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
