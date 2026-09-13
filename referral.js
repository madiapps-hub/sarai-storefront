// lib/referral.js
//
// Captures the ?ref= token MySkin attaches when sending a customer here,
// and persists it in localStorage so it survives browsing all the way to
// checkout. Call captureReferralFromUrl() once, high up in the app (the
// root layout), on every page load.

const STORAGE_KEY = 'myskin_referral_token';

export function captureReferralFromUrl() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    localStorage.setItem(STORAGE_KEY, ref);
  }
}

export function getStoredReferralToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function clearStoredReferralToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
