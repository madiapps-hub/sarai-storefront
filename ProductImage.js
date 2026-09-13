'use client';

// app/ProductImage.js
//
// Plain <img>, deliberately not next/image -- avoids needing to
// allowlist remote image domains in next.config.js, which would be an
// easy thing to forget/not know how to do whenever a new image URL from
// a new source gets added later. Falls back to a simple placeholder box
// if no image_url is set yet, rather than a broken image icon.

export default function ProductImage({ src, alt, height = 160 }) {
  if (!src) {
    return (
      <div
        style={{
          height,
          borderRadius: 'var(--radius)',
          background: 'var(--color-primary-deep)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-muted)',
          fontSize: 13,
        }}
      >
        No image yet
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      style={{
        width: '100%',
        height,
        objectFit: 'cover',
        borderRadius: 'var(--radius)',
        display: 'block',
      }}
    />
  );
}
