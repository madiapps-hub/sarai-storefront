'use client';

// app/cart/page.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveCart, getCartItems, updateCartItemQuantity, removeCartItem } from '../../lib/cart';
import ProductImage from '../ProductImage';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const activeCart = await getActiveCart();
    setCart(activeCart);
    if (activeCart) {
      const cartItems = await getCartItems(activeCart.id);
      setItems(cartItems);
    } else {
      setItems([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleQtyChange(itemId, quantity) {
    if (quantity < 1) return;
    await updateCartItemQuantity(itemId, quantity);
    load();
  }

  async function handleRemove(itemId) {
    await removeCartItem(itemId);
    load();
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.product_retailer_links?.displayed_price ?? item.price_at_add ?? 0;
    return sum + price * item.quantity;
  }, 0);

  if (loading) return <p className="hint-text">Loading…</p>;

  if (items.length === 0) {
    return (
      <div>
        <h1>Your Cart</h1>
        <p className="hint-text">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Your Cart</h1>
      {items.map((item) => {
        const link = item.product_retailer_links;
        const product = link?.products;
        const price = link?.displayed_price ?? item.price_at_add ?? 0;
        return (
          <div className="cart-row" key={item.id}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 64, flexShrink: 0 }}>
                <ProductImage src={product?.image_url} alt={product?.name} height={64} />
              </div>
              <div>
                <strong>
                  {product?.brand ? `${product.brand} ` : ''}
                  {product?.name || 'Product'}
                </strong>
                <div className="hint-text">
                  {link?.currency || 'ZMW'} {price} each
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button className="btn btn-secondary" onClick={() => handleQtyChange(item.id, item.quantity - 1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button className="btn btn-secondary" onClick={() => handleQtyChange(item.id, item.quantity + 1)}>
                    +
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleRemove(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
            <div className="price">{(price * item.quantity).toFixed(2)}</div>
          </div>
        );
      })}

      <div style={{ marginTop: 20, textAlign: 'right' }}>
        <p>Subtotal: <strong>{subtotal.toFixed(2)}</strong></p>
        <p className="hint-text">Delivery fee calculated at checkout.</p>
        <button className="btn" onClick={() => router.push('/checkout')}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
