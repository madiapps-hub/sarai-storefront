// app/layout.js
import './globals.css';
import ReferralCapture from './ReferralCapture';

export const metadata = {
  title: 'Sarai',
  description: 'Sarai online store',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Captures ?ref= from the URL on every page load, client-side. */}
        <ReferralCapture />
        <header className="site-header">
          <a href="/" className="brand">SARAI</a>
          <nav>
            <a href="/products">Shop</a>
            <a href="/cart">Cart</a>
            <a href="/track">Track Order</a>
          </nav>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <p>&copy; {new Date().getFullYear()} Sarai. Powered by MySkin.</p>
        </footer>
      </body>
    </html>
  );
}
