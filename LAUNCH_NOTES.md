# LAUNCH_NOTES.md
# Service Hub — Digital Subscriptions Platform
# Launch Guide & Deployment Checklist

> **Version:** Phase 6 Complete  
> **Architecture:** Next.js 16 + Turbopack + Prisma 7 + Neon PostgreSQL  
> **Checkout:** Guest Checkout only (WhatsApp) — No customer accounts by design  
> **Auth:** Admin-only httpOnly cookie JWT  

---

## 1. Project Status

| Component          | Status            | Notes                              |
|--------------------|-------------------|------------------------------------|
| Public Storefront  | ✅ Ready          | EN + AR, responsive, dark/light    |
| Guest Checkout     | ✅ Ready          | Name + Phone → WhatsApp only       |
| Server-Side Pricing| ✅ Ready          | Phase 4 — no client price injection|
| Admin Dashboard    | ✅ Ready          | httpOnly cookie auth               |
| Admin Auth         | ✅ Secured        | Phases 1–5                         |
| Coupons            | ✅ Ready          | Server-validated                   |
| Orders Management  | ✅ Ready          | Admin CRUD + status change         |
| Bundles            | ✅ Ready          | Admin CRUD protected               |
| Rate Limiting      | ⚠️  In-Memory    | Resets on cold start — see §8      |
| Product Prices     | 🔴 BLOCKER        | All seed prices = 0 — set real prices before launch |
| WhatsApp Phone     | 🔴 BLOCKER        | Default is '1234567890' — must update |
| Admin Password     | 🔴 BLOCKER        | Change before production deploy    |
| JWT_SECRET         | 🔴 BLOCKER        | Must be strong random string       |
| CSP Header         | ⚠️  Missing       | Inline styles make CSP complex     |

---

## 2. Required Environment Variables

> ⚠️ **NEVER commit real values to Git. Set these in your hosting provider.**

```
DATABASE_URL          # PostgreSQL connection string (e.g. Neon)
JWT_SECRET            # Min 64-char random string — generate: openssl rand -base64 64
NODE_ENV              # Set to: production
NEXT_PUBLIC_SITE_URL  # Your domain: https://yourdomain.com
```

**How to generate JWT_SECRET:**
```bash
openssl rand -base64 64
```

---

## 3. Deployment Steps

### 3.1 Fresh Deploy (First Time)

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Create database tables (PostgreSQL)
npx prisma db push

# 4. Seed initial data (creates admin + categories + sample products)
npx prisma db seed

# 5. Build for production
npm run build

# 6. Start
npm start
```

### 3.2 Update Deploy (Subsequent)

```bash
npm install
npx prisma generate
# Only run db push if schema changed:
# npx prisma db push
npm run build
npm start
```

### 3.3 Vercel Deploy (Recommended)

1. Push code to GitHub (`.env` is in `.gitignore` — safe)
2. Import repo in Vercel
3. Add Environment Variables in Vercel Dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV` = `production`
   - `NEXT_PUBLIC_SITE_URL`
4. Set Build Command: `prisma generate && next build`
5. Set Start Command: `next start`
6. Deploy

> **Note:** Run `prisma db push` and `prisma db seed` once manually from local pointing to prod DB, or use Vercel's deploy hooks.

---

## 4. Pre-Launch Checklist

### 🔴 Blockers — Must Fix Before Launch

- [ ] **Set real product prices** — All seed prices = 0 EGP. Update via Admin → Products.
- [ ] **Set WhatsApp phone** — Admin → Settings → WhatsApp Phone (e.g., `201234567890`)
- [ ] **Change admin password** — Seed default is known. Login and change or re-seed with new password.
- [ ] **Set strong JWT_SECRET** — Min 64 chars random string, not default placeholder.
- [ ] **Set DATABASE_URL** — Point to production PostgreSQL (Neon recommended).
- [ ] **Set NODE_ENV=production** — Enables secure cookie, disables debug output.

### ⚠️ Recommended Before Launch

- [ ] **Set store name** — Admin → Settings → Store Name
- [ ] **Set SEO title/description** — Admin → Settings → SEO fields
- [ ] **Set currency** — Admin → Settings (default: EGP)
- [ ] **Set NEXT_PUBLIC_SITE_URL** — For OG tags and canonical URLs
- [ ] **Review/activate products** — Ensure all products have `isActive=true` and real prices
- [ ] **Test WhatsApp flow end-to-end** — Real order → real WhatsApp number
- [ ] **Connect custom domain** — And enable HTTPS
- [ ] **Configure database backups** — Neon has automatic backups
- [ ] **Enable Vercel Analytics** (optional) — For traffic monitoring

### ℹ️ Known by Design (Not Blockers)

- [ ] No customer login — **by design** (Guest Checkout only)
- [ ] No payment gateway — **by design** (payment via WhatsApp negotiation)
- [ ] Rate limiting is in-memory — **known limitation** (see §8)

---

## 5. Post-Launch Smoke Test

After deploying, run these checks manually:

1. **[ ] Homepage loads** — `/`
2. **[ ] Products page loads** — `/products`
3. **[ ] Product detail opens** — `/product/[any-slug]`
4. **[ ] Add to cart works** — Cart badge appears in Navbar
5. **[ ] Cart page loads** — `/cart`
6. **[ ] Coupon validation works** — Try valid and invalid code
7. **[ ] Checkout with name + phone** — Fill form → Send Order
8. **[ ] WhatsApp opens** — Real WhatsApp with order message
9. **[ ] Thank-you page shows order code** — `/thank-you?code=...`
10. **[ ] Admin login works** — `/admin/login`
11. **[ ] Order appears in Admin** — `/admin/orders`
12. **[ ] Order status change** — Admin can mark as Processing / Done
13. **[ ] Admin logout** — Cookie cleared, redirected to login
14. **[ ] Public site still works** after admin logout
15. **[ ] Language toggle** — EN ↔ AR both work
16. **[ ] Mobile layout** — Bottom nav, responsive cards

---

## 6. Admin Account

| Field  | Seed Default                        |
|--------|-------------------------------------|
| Email  | `owner@servicehub.com`              |
| Pass   | **Change before production!**       |
| Route  | `/admin/login`                      |

**To change admin password after seed:**
Use the Admin panel settings or re-run seed with updated hash.

> 🔴 The seed password is visible in `prisma/seed.ts`. **Change it before deploying to production.**

---

## 7. Security Notes

| Item                   | Status    | Note                                                  |
|------------------------|-----------|-------------------------------------------------------|
| httpOnly Admin Cookie  | ✅        | JWT stored in httpOnly SameSite=Lax cookie            |
| Server-Side Auth       | ✅        | All admin routes use `authenticateRequest()`          |
| Server-Side Pricing    | ✅        | `/api/orders` computes price from DB — no client trust|
| Rate Limiting (Orders) | ✅⚠️     | In-memory, 5 orders / 10 min / IP — resets on restart |
| Rate Limiting (Login)  | ✅⚠️     | In-memory, 10 attempts / 15 min / IP                  |
| X-Frame-Options        | ✅        | DENY — prevents clickjacking                          |
| X-Content-Type-Options | ✅        | nosniff                                               |
| Referrer-Policy        | ✅        | strict-origin-when-cross-origin                       |
| Permissions-Policy     | ✅        | camera/mic/geo/payment disabled                       |
| CSP                    | ⚠️ Missing | Inline styles complicate CSP — add after asset audit  |
| HTTPS                  | ⚠️ Required| Enable on hosting / Vercel handles automatically      |

---

## 8. Known Limitations

### 8.1 In-Memory Rate Limiting
- Current rate limiting uses an in-memory Map.
- Resets on every cold start / serverless restart.
- **Mitigation:** For production with high traffic, replace with Upstash Redis:
  ```bash
  npm install @upstash/ratelimit @upstash/redis
  ```
  Then update `src/lib/rate-limit.ts`.

### 8.2 No Customer Accounts (By Design)
- Customers order by name + phone only.
- No order tracking for customers after thank-you page.
- **This is intentional.** Future enhancement: Add optional Customer Portal.

### 8.3 No Payment Gateway (By Design)
- Payment is arranged manually via WhatsApp after order.
- **This is intentional.** Future enhancement: Integrate Stripe/Paymob.

### 8.4 Subscription Tracking (Future)
- No automated subscription expiry tracking.
- Admin manually tracks active subscriptions.
- **Future:** Add subscription lifecycle management.

### 8.5 Seed Prices = 0
- All seed products have `price: 0` (placeholder).
- Must set real prices via Admin → Products before launch.

### 8.6 WhatsApp Default Number
- Seed sets `whatsappPhone: '1234567890'`.
- Must update to real number via Admin → Settings.

### 8.7 CSP (Content Security Policy)
- Not implemented due to extensive inline styles in components.
- **Future:** Migrate to CSS classes and implement CSP.

### 8.8 `lang` Attribute
- HTML `lang="en"` is hardcoded in `layout.tsx`.
- Does not dynamically change when user switches to Arabic.
- Minor SEO impact — acceptable for MVP.

---

## 9. Technology Stack

| Component       | Technology           | Version  |
|-----------------|----------------------|----------|
| Framework       | Next.js              | 16.1.6   |
| Bundler         | Turbopack            | built-in |
| Database ORM    | Prisma               | 7.4.0    |
| Database        | PostgreSQL (Neon)    | —        |
| Auth            | JWT + httpOnly Cookie| —        |
| Styling         | Inline CSS + globals | —        |
| Icons           | lucide-react         | 0.564.0  |
| i18n            | Custom (EN + AR)     | —        |
| Rate Limiting   | In-memory Map        | —        |

---

## 10. File Structure (Key Files)

```
src/
├── app/
│   ├── api/
│   │   ├── admin/        # Protected admin APIs
│   │   ├── auth/         # Login / Logout / Verify
│   │   ├── orders/       # Guest order POST + Admin GET
│   │   ├── products/     # Public product APIs
│   │   ├── coupons/      # Coupon validate + admin CRUD
│   │   ├── settings/     # Public GET + Admin PUT
│   │   └── bundles/      # Public GET + Admin CRUD
│   ├── admin/            # Admin dashboard pages
│   ├── cart/             # Guest checkout page
│   ├── product/[slug]/   # Product detail + WhatsApp CTA
│   ├── thank-you/        # Order confirmation page
│   └── page.tsx          # Homepage
├── lib/
│   ├── auth.ts           # JWT sign/verify/authenticate
│   ├── prisma.ts         # Prisma client singleton
│   ├── rate-limit.ts     # In-memory rate limiter
│   ├── i18n.tsx          # EN + AR translations
│   ├── cart-context.tsx  # Cart state (localStorage)
│   ├── whatsapp.ts       # WhatsApp URL builder
│   └── types.ts          # Shared TypeScript types
prisma/
├── schema.prisma         # DB schema
└── seed.ts               # Initial data seeder
```

---

*Generated: Phase 7 — Launch Gate Verification*  
*Do not commit secrets. Do not expose DATABASE_URL or JWT_SECRET.*
