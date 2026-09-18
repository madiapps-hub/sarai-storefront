// app/layout.js
import './globals.css';
import ReferralCapture from './ReferralCapture';
import CartBadge from './CartBadge';
import HeaderSearch from './HeaderSearch';

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

          <div className="header-nav">
            <nav className="header-nav-links">
              <a href="/products">Shop</a>
              <a href="/#story">About</a>
              <a href="/track">Track Order</a>
            </nav>
            <HeaderSearch />
            <div className="header-icons">
              <CartBadge />
            </div>
          </div>
        </header>

        <main className="site-main">{children}</main>

        <footer className="site-footer">
          <div className="site-main" style={{ padding: 0 }}>
            <div className="footer-grid">
              <div className="footer-col">
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 2, color: 'var(--color-foreground)', textTransform: 'none' }}>
                  SARAI
                </h4>
                <span className="hint-text" style={{ maxWidth: 220 }}>
                  Considered skincare, delivered.
                </span>
              </div>

              <div className="footer-col">
                <h4>Shop</h4>
                <a href="/products">All products</a>
              </div>

              <div className="footer-col">
                <h4>Help</h4>
                <a href="/track">Track order</a>
              </div>

              <div className="footer-col">
                <h4>About</h4>
                <a href="/#story">About Sarai</a>
              </div>

              <div className="footer-col">
                <h4>Social</h4>
                {/* No confirmed social links yet -- swap these spans for
                    real <a href> tags once Sarai's accounts are set up. */}
                <span style={{ opacity: 0.5 }}>Instagram</span>
                <span style={{ opacity: 0.5 }}>Facebook</span>
              </div>
            </div>

            <div className="footer-bottom">
              <span>&copy; {new Date().getFullYear()} Sarai.</span>
              <span>Powered by MySkin.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
