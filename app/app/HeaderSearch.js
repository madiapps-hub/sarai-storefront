'use client';

// app/HeaderSearch.js
//
// Real search, not decorative -- submits to /products?q=... which
// filters the actual Supabase product list by name/brand.

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form className="header-search" onSubmit={handleSubmit}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search products"
      />
    </form>
  );
}
