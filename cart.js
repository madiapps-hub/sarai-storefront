// lib/cart.js
//
// Guest checkout works via Supabase Anonymous Auth: a visitor gets a real
// auth.uid() the moment they take their first cart action, with zero
// changes needed to the RLS policies already built and tested for
// authenticated users. See ensureSession() below.

import { supabase } from './supabaseClient';
import { RETAILER_ID } from './constants';

// Ensures the visitor has a session (anonymous or real) before any cart
// action. Safe to call repeatedly -- if a session already exists, this
// does nothing.
export async function ensureSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

export async function getActiveCart() {
  const { data, error } = await supabase
    .from('carts')
    .select('*')
    .eq('retailer_id', RETAILER_ID)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createCart() {
  const { data, error } = await supabase
    .from('carts')
    .insert({ retailer_id: RETAILER_ID, status: 'active' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrCreateCart() {
  const existing = await getActiveCart();
  if (existing) return existing;
  return createCart();
}

export async function getCartItems(cartId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, product_retailer_links(*, products(name, brand, image_url))')
    .eq('cart_id', cartId);

  if (error) throw error;
  return data || [];
}

export async function addToCart(productRetailerLinkId, priceAtAdd, quantity = 1) {
  await ensureSession();
  const cart = await getOrCreateCart();

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cart.id)
    .eq('product_retailer_link_id', productRetailerLinkId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('cart_items').insert({
      cart_id: cart.id,
      product_retailer_link_id: productRetailerLinkId,
      quantity,
      price_at_add: priceAtAdd,
    });
    if (error) throw error;
  }

  return cart;
}

export async function updateCartItemQuantity(cartItemId, quantity) {
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);
  if (error) throw error;
}

export async function removeCartItem(cartItemId) {
  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
  if (error) throw error;
}
