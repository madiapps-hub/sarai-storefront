'use client';

// app/ReferralCapture.js
//
// Runs once per page load, invisibly. Root layouts in the App Router are
// server components by default, so this small piece is split out as its
// own client component just to run the localStorage-writing effect.

import { useEffect } from 'react';
import { captureReferralFromUrl } from '../lib/referral';

export default function ReferralCapture() {
  useEffect(() => {
    captureReferralFromUrl();
  }, []);

  return null;
}
