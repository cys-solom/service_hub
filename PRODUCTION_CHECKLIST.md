# Production Deployment Checklist

Complete every item before going live. Mark items with ✅ as you go.

---

## 🔐 Secrets & Environment

- [ ] `DATABASE_URL` is set correctly in the hosting environment (not `.env`)
- [ ] `JWT_SECRET` is set to a long, random string (≥ 64 chars) — never reuse the dev value
- [ ] `.env` file is NOT committed to Git (verify with `git status`)
- [ ] All secrets are stored in hosting provider's env config (Vercel, Railway, etc.)
- [ ] No sensitive values are hard-coded in source code

## 🗄️ Database

- [ ] Production database is provisioned (PostgreSQL recommended for production)
- [ ] `DATABASE_URL` points to the production database
- [ ] Run `npx prisma db push` (or `npx prisma migrate deploy`) to apply schema
- [ ] Confirm admin account exists: `npx prisma studio` or seed script
- [ ] Database backups are configured and tested

## 🏗️ Build

- [ ] `npm run build` completes with zero errors
- [ ] All 33 pages compile successfully
- [ ] TypeScript has zero errors

## 🔒 Security

- [ ] Admin login tested — only correct credentials work
- [ ] Admin panel protected — unauthenticated access to `/admin` redirects to `/admin/login`
- [ ] Admin JWT stored in `httpOnly` cookie only (no `localStorage` token)
- [ ] Public store APIs (products, categories, bundles) work without authentication
- [ ] `POST /api/orders` does NOT accept client-supplied prices — server computes from DB
- [ ] Rate limiting on orders and coupon endpoints is active (in-memory; consider Upstash for serverless)
- [ ] Security headers active: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

## 🛒 Guest Checkout

- [ ] Customer can browse products without login
- [ ] Customer can add to cart without login
- [ ] Checkout works with name + phone only (no account required)
- [ ] WhatsApp link opens correctly after order
- [ ] Thank-you page shows correct order code

## 📱 WhatsApp Flow

- [ ] `whatsappPhone` is set in Admin → Settings
- [ ] WhatsApp link opens with pre-filled message in Arabic/English
- [ ] Message contains: order code, customer name, item list, total price

## 🛍️ Admin Dashboard

- [ ] Admin login works (email + password)
- [ ] Page refresh after login does NOT log out (cookie-based session)
- [ ] Admin logout clears the session correctly
- [ ] Dashboard shows correct order/product/revenue stats
- [ ] Products: create, edit, toggle active, toggle out-of-stock
- [ ] Variants: add, edit, delete, reorder
- [ ] Orders: view, change status
- [ ] Coupons: create, toggle active, delete
- [ ] Bundles: create, edit, toggle active, delete
- [ ] Settings: save WhatsApp phone, currency, SEO fields
- [ ] Content: save hero text and other editable sections

## 🎟️ Coupons

- [ ] Valid coupon applies discount correctly
- [ ] Expired coupon is rejected with a clear error
- [ ] Coupon with reached `maxUses` is rejected
- [ ] Server re-validates coupon at order creation (client cannot bypass)

## 🌐 Domain & HTTPS

- [ ] Custom domain is configured and DNS propagated
- [ ] HTTPS/SSL is active (auto via Vercel/Cloudflare or manual cert)
- [ ] `NEXT_PUBLIC_SITE_URL` is set to the production URL

## 📊 Monitoring (Recommended)

- [ ] Error tracking configured (Sentry or similar)
- [ ] Upstash Redis connected for persistent rate limiting (avoids serverless cold-start reset)
- [ ] Logs available in hosting dashboard

---

## ⚠️ Known Limitations (Intentional)

| Item | Status | Notes |
|---|---|---|
| Payment Gateway | Not implemented | Orders go via WhatsApp — manual payment |
| Customer Accounts | Not implemented | Intentionally Guest Checkout only |
| Subscription Tracking | Not implemented | Manual tracking via orders |
| Persistent Rate Limiting | In-memory only | Resets on serverless cold start — add Upstash for production |
| CSP Headers | Not configured | Inline styles prevent strict CSP — configure after audit |
