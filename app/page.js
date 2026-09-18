'use client';

// app/page.js
//
// Real-women photography was requested but isn't something I can safely
// source (no generation tool, and using scraped stock photos on a real
// commercial site is a genuine copyright/licensing risk to Sarai's
// business, not just a design shortcut). The hero/visual panels below
// use product imagery (from products.image_url, when set) or an elegant
// placeholder treatment instead. Swap in real licensed photography later
// by replacing HERO_IMAGE_URL below -- no layout changes needed.

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { RETAILER_ID, RETAILER_NAME } from '../lib/constants';
import ProductCard from './ProductCard';
import { fadeUp, gridContainer } from '../lib/motion';

// Replace with a real licensed hero photo URL when available.
const HERO_IMAGE_URL = null;

const CONCERNS = [
  { label: 'Acne', sub: 'Care for blemish-prone skin' },
  { label: 'Dryness', sub: 'Restore comfort and hydration' },
  { label: 'Dark spots', sub: 'Support a more even-looking complexion' },
  { label: 'Dullness', sub: 'Reveal a healthy glow' },
  { label: 'Sensitive skin', sub: 'Gentle care for your skin' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [heroImage, setHeroImage] = useState(HERO_IMAGE_URL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      const { data, error } = await supabase
        .from('product_retailer_links')
        .select('*, products(name, brand, image_url)')
        .eq('retailer_id', RETAILER_ID)
        .eq('is_active', true)
        .eq('is_orderable', true)
        .limit(8);

      if (!error) {
        setFeatured(data || []);
        // If no hero image is set above, borrow the first product's
        // photo for the hero panel rather than showing an empty gradient.
        if (!HERO_IMAGE_URL) {
          const withImage = (data || []).find((l) => l.products?.image_url);
          if (withImage) setHeroImage(withImage.products.image_url);
        }
      }
      setLoading(false);
    }
    loadFeatured();
  }, []);

  return (
    <div>
      {/* ================= HERO ================= */}
      <motion.section className="hero-split" initial="hidden" animate="show" variants={fadeUp}>
        <div className="hero-copy">
          <p className="eyebrow">Premium skincare retailer</p>
          <h1>Skincare,<br />considered.</h1>
          <p>Thoughtfully selected skincare from {RETAILER_NAME}, made easier to discover and delivered to your door.</p>
          <div className="hero-actions">
            <Link href="/products" className="btn">Shop skincare</Link>
            <Link href="/products" className="text-link">Explore the collection →</Link>
          </div>
        </div>
        <div className="hero-visual">
          {heroImage ? (
            <img src={heroImage} alt="" />
          ) : (
            <div className="hero-visual-placeholder">
              <div className="mark">SARAI</div>
              <p className="hint-text">Product photography coming soon</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* ================= SELECTED FOR YOU ================= */}
      <section>
        <div className="section-header">
          <div>
            <p className="eyebrow">Shop the edit</p>
            <h2>Selected for you</h2>
            <p>A considered selection of skincare essentials.</p>
          </div>
          <Link href="/products" className="text-link">View all →</Link>
        </div>

        {loading ? (
          <p className="hint-text">Loading…</p>
        ) : featured.length === 0 ? (
          <p className="hint-text">No products available yet.</p>
        ) : (
          <motion.div className="product-row" initial="hidden" animate="show" variants={gridContainer}>
            {featured.map((link) => (
              <ProductCard link={link} key={link.id} />
            ))}
          </motion.div>
        )}
      </section>

      {/* ================= SHOP BY CONCERN ================= */}
      {/* Concern filtering isn't wired to real product data yet -- these
          tiles all link to the general shop page for now. Adding real
          per-concern filtering needs a `concern`/category column on
          products, which doesn't exist yet. */}
      <section>
        <div className="section-header">
          <div>
            <p className="eyebrow">Browse by need</p>
            <h2>Shop by skin concern</h2>
          </div>
        </div>
        <motion.div
          className="concern-grid"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={gridContainer}
        >
          {CONCERNS.map((c) => (
            <motion.div key={c.label} variants={gridItemLocal}>
              <Link href="/products" className="concern-tile">
                <div>
                  <p className="concern-tile-label">{c.label}</p>
                  <p className="concern-tile-sub">{c.sub}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ================= BRAND STORY ================= */}
      <motion.section
        id="story"
        className="split-section"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <div className="split-visual" />
        <div>
          <p className="eyebrow">Our story</p>
          <h2>{RETAILER_NAME}, considered skincare.</h2>
          <p className="hint-text" style={{ fontSize: 15, maxWidth: 420 }}>
            We believe in quality skincare, thoughtfully selected and made
            accessible. {RETAILER_NAME} brings you trusted products, because
            your skin deserves the best.
          </p>
          <Link href="/products" className="text-link">Discover {RETAILER_NAME} →</Link>
        </div>
      </motion.section>

      {/* ================= WHY SHOP SARAI ================= */}
      <div className="trust-row">
        <div className="trust-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Z" /></svg>
          <p>Authentic products</p>
        </div>
        <div className="trust-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          <p>Thoughtfully selected</p>
        </div>
        <div className="trust-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="7" width="15" height="10" rx="1" /><path d="M16 10h4l3 3v4h-7z" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></svg>
          <p>Convenient delivery</p>
        </div>
        <div className="trust-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="11" width="16" height="9" rx="1" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          <p>Secure checkout</p>
        </div>
      </div>

      {/* ================= FINAL CTA ================= */}
      <section>
        <motion.div
          className="final-cta"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <h2>Your skincare,<br />considered.</h2>
          <p>Find something that fits your routine.</p>
          <Link href="/products" className="btn">Shop the collection</Link>
        </motion.div>
      </section>
    </div>
  );
}

const gridItemLocal = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};
