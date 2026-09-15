// lib/motion.js
//
// Centralized animation language for the storefront -- one place for
// durations/easing/variants rather than scattered magic numbers across
// components. Deliberately restrained: Level 1-2 UI feedback and product
// interaction, per the animation hierarchy -- no cinematic scroll
// sequences or 3D, which aren't proportionate to a storefront this size.

export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
};

export const EASE = {
  standard: [0.4, 0, 0.2, 1],
  out: [0.16, 1, 0.3, 1],
};

// Product grid: short stagger, subtle movement -- products must remain
// immediately usable, never gated behind a long entrance animation.
export const gridContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
};

export const gridItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE.out },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE.out },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.normal, ease: EASE.standard } },
};

// Product card hover: lift + subtle image scale, nothing bouncy.
export const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 2px rgba(28,27,25,0.04)' },
  hover: {
    y: -4,
    boxShadow: '0 12px 28px rgba(28,27,25,0.08)',
    transition: { duration: DURATION.fast, ease: EASE.standard },
  },
};

export const imageHover = {
  rest: { scale: 1 },
  hover: { scale: 1.04, transition: { duration: DURATION.normal, ease: EASE.standard } },
};
