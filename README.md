# Sarai Storefront

Sarai's own e-commerce website — separate from the MySkin app, sharing the
same Supabase backend. Guest checkout (no account required), referral
attribution from MySkin, login-free order tracking.

## Before deploying — two things you must fill in

1. **`lib/constants.js`** — replace `REPLACE_WITH_SARAI_RETAILER_ID` with
   Sarai's actual `id` from the `retailers` table. Find it by running in
   Supabase SQL Editor:
   ```sql
   select id, name from retailers where name = 'Sarai';
   ```
   (If no row exists yet, insert one first.)

2. **`retailers.storefront_base_url`** — once this site has a real URL
   (even a temporary `something.vercel.app` one), update it in Supabase:
   ```sql
   update retailers set storefront_base_url = 'https://your-site.vercel.app'
   where id = '<sarai retailer id>';
   ```
   This is what MySkin's `create-referral` function uses to know where to
   send customers. Until this is set correctly, "Buy from Sarai" in the
   MySkin app will show "store not available yet."

## Getting this online (no terminal needed)

1. **Create a new GitHub repository** (github.com → "New repository").
   Don't initialize it with a README — you're uploading one.
2. On the new repo's page, click "uploading an existing file" and drag
   in every file and folder from this project, keeping the folder
   structure exactly as given (the `app/` folder, `lib/` folder,
   `package.json`, etc., all at the top level of the repo).
3. Go to **vercel.com**, click "Add New… → Project", and choose
   "Import" next to the GitHub repo you just created.
4. Before clicking Deploy, expand **Environment Variables** and add the
   two from `.env.local.example`:
   - `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key
   (Same values you'd find in Supabase → Project Settings → API.)
5. Click **Deploy**. Vercel installs dependencies and builds the site
   automatically — this is the one part that genuinely needs a build
   step, and Vercel does it for you, no local Node install required.
6. Once deployed, Vercel gives you a URL like `sarai-storefront.vercel.app`.
   Use that for step 2 above (`storefront_base_url`).

## What's built

- `/` — homepage with featured products
- `/products` — full catalogue
- `/products/[id]` — product detail + Add to Cart
- `/cart` — cart with quantity controls
- `/checkout` — delivery details → payment → confirmation with tracking link
- `/track` — login-free order status lookup (works even without the
  original guest session — that's the point of the tracking token)
- `/admin/login`, `/admin`, `/admin/orders/[id]` — Sarai staff order
  management (real login required, not guest/anonymous)

## Setting up Sarai's staff login (for the admin dashboard)

There's no self-service signup for staff accounts by design. To create one:

1. Supabase Dashboard → Authentication → Users → **Add user** (set an
   email and password directly).
2. Copy that user's `id`.
3. Run in SQL Editor:
   ```sql
   insert into retailer_users (user_id, retailer_id, role)
   values ('<the user id from step 2>', '<sarai retailer id>', 'staff');
   ```
4. That person can now log in at `/admin/login` and will see Sarai's
   orders — and only Sarai's, enforced by the RLS policies already built.

## What's deliberately NOT in this v1

- Product search/filtering, categories, reviews, ingredient lists — the
  full architecture doc's wishlist is large; this covers the functional
  core (browse → buy → track) first.
- A real payment provider — still running on the mock provider until
  Bila/MoneyUnify sandbox credentials are available. Orders will get
  stuck at "payment initiated" until a real webhook confirms them, or
  until you manually flip a payment to `paid` in SQL Editor for testing.
- Product images — none of the current schema/data includes image URLs
  that I've seen, so none are shown. Add an `image_url` column to
  `product_retailer_links` or `products` whenever real images exist, and
  I can wire it in.
- Skin quiz, AI analysis, personalized match scoring — these belong to
  MySkin's app, not a retailer's storefront. Sarai's site sells what
  MySkin sends people to buy; it doesn't itself analyze anyone's skin.

## Testing this once deployed

Same discipline as the backend: don't assume it works, check it did.

1. Visit the deployed homepage — confirms Supabase connection works.
2. Add a product to cart, go through checkout as a guest — confirms
   anonymous auth + `create-order` + `initiate-payment` all work from a
   real browser, not just SQL Editor.
3. Copy the tracking link from the confirmation screen, open it in a
   different browser (or incognito window, simulating a lost session) —
   confirms login-free tracking actually works without relying on the
   guest session persisting.
4. Log into `/admin` with a staff account — confirm you see Sarai's order
   and can move it through status updates.
5. Test the full referred flow from MySkin: tap "Buy from Sarai" in the
   app, confirm you land here with a `?ref=` token, complete checkout,
   then check in Supabase that the resulting order has
   `originating_click_id` set and a `commissions` row was created after
   payment — confirming the whole referral chain works end to end, not
   just Sarai's site in isolation.
