# Public Catalog API — Documentation

## Overview

The **Public Catalog API** allows any external website to fetch active products, active bundles, and safe store metadata from this platform.

This API is:
- **Read-only** — no authentication required for GET requests
- **CORS-enabled** — usable from any external domain
- **Cached** — responses are cached at the CDN edge for fast delivery
- **Safe** — returns only public data; no admin data, orders, coupons, or secrets are exposed

---

## Endpoint

```
GET https://your-domain.com/api/public/catalog
```

### Method
`GET`

### CORS
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

Cross-origin requests from any domain are allowed because this endpoint only returns public product data. Admin APIs and the orders API do **not** have CORS enabled.

### Cache
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

- Responses are cached at the CDN/edge for **60 seconds**.
- Stale content may be served for up to **5 minutes** while a fresh fetch happens in the background.
- Price updates in the admin will be visible on this API within ~1 minute.

> **Important:** This cache applies to the catalog display API only. The checkout/order submission process (`POST /api/orders`) is always dynamic and fetches prices directly from the database — the cached catalog cannot be used to manipulate checkout prices.

---

## Example Response

```json
{
  "store": {
    "name": "Service Hub",
    "currency": "EGP",
    "siteUrl": "https://your-domain.com"
  },
  "products": [
    {
      "id": "clxyz123",
      "slug": "chatgpt-plus",
      "name": "ChatGPT Plus",
      "nameAr": "شات جي بي تي بلس",
      "description": "Access GPT-4 with no limits",
      "descriptionAr": "وصول كامل لـ GPT-4 بلا قيود",
      "category": "AI Tools",
      "categorySlug": "ai-tools",
      "logo": "https://cdn.example.com/chatgpt.png",
      "isOutOfStock": false,
      "variants": [
        {
          "id": "var_001",
          "title": "1 Month",
          "duration": "1 Month",
          "price": 250
        },
        {
          "id": "var_002",
          "title": "3 Months",
          "duration": "3 Months",
          "price": 680
        }
      ],
      "url": "https://your-domain.com/product/chatgpt-plus"
    }
  ],
  "bundles": [
    {
      "id": "bun_001",
      "title": "Productivity Bundle",
      "titleAr": "باقة الإنتاجية",
      "description": "ChatGPT + Notion + Grammarly",
      "price": 500,
      "originalPrice": 700,
      "isActive": true,
      "url": "https://your-domain.com"
    }
  ],
  "meta": {
    "version": "1.0",
    "generatedAt": "2026-06-02T03:00:00.000Z",
    "totalProducts": 12,
    "totalBundles": 3
  }
}
```

---

## Field Reference

### `store` object

| Field | Type | Description |
|---|---|---|
| `name` | string | Store name configured in admin settings |
| `currency` | string | Currency code, e.g. `"EGP"`, `"USD"` |
| `siteUrl` | string \| null | Base URL of the store (from `NEXT_PUBLIC_SITE_URL` env var) |

### `products[]` items

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique product ID |
| `slug` | string | URL-friendly identifier |
| `name` | string | Product name (English) |
| `nameAr` | string | Product name (Arabic) |
| `description` | string | Product description (English) |
| `descriptionAr` | string | Product description (Arabic) |
| `category` | string | Category name |
| `categorySlug` | string | Category slug |
| `logo` | string \| null | First image URL for the product logo |
| `isOutOfStock` | boolean | Whether the product is currently unavailable for purchase |
| `variants[]` | array | List of available pricing plans |
| `variants[].id` | string | Variant ID |
| `variants[].title` | string | Plan title, e.g. `"1 Month"` |
| `variants[].duration` | string | Duration label |
| `variants[].price` | number | Price in the store currency |
| `url` | string | Direct link to the product page on this store |

### `bundles[]` items

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique bundle ID |
| `title` | string | Bundle title (English) |
| `titleAr` | string | Bundle title (Arabic) |
| `description` | string | Bundle description |
| `price` | number | Bundle price |
| `originalPrice` | number \| null | Original price before discount (if applicable) |
| `isActive` | boolean | Always `true` (inactive bundles are filtered out) |
| `url` | string | Link to the store homepage |

### `meta` object

| Field | Type | Description |
|---|---|---|
| `version` | string | API version (`"1.0"`) |
| `generatedAt` | ISO date string | Timestamp of when the response was generated |
| `totalProducts` | number | Number of active products returned |
| `totalBundles` | number | Number of active bundles returned |

---

## Usage from an External Website

### Basic JavaScript Fetch

```javascript
async function loadCatalog() {
  const response = await fetch('https://your-domain.com/api/public/catalog');
  if (!response.ok) {
    console.error('Failed to load catalog');
    return;
  }
  const catalog = await response.json();

  // Access store info
  console.log('Store:', catalog.store.name);
  console.log('Currency:', catalog.store.currency);

  // List all products
  catalog.products.forEach(product => {
    console.log(`${product.name} — starting from ${product.variants[0]?.price} ${catalog.store.currency}`);
    console.log('Buy here:', product.url);
  });

  // List all bundles
  catalog.bundles.forEach(bundle => {
    console.log(`Bundle: ${bundle.title} — ${bundle.price} ${catalog.store.currency}`);
  });
}

loadCatalog();
```

### React / Next.js Example

```jsx
import { useEffect, useState } from 'react';

export default function ProductList() {
  const [catalog, setCatalog] = useState(null);

  useEffect(() => {
    fetch('https://your-domain.com/api/public/catalog')
      .then(r => r.json())
      .then(setCatalog)
      .catch(console.error);
  }, []);

  if (!catalog) return <p>Loading...</p>;

  return (
    <ul>
      {catalog.products.map(p => (
        <li key={p.id}>
          <strong>{p.name}</strong>
          {p.isOutOfStock && <span> (Out of Stock)</span>}
          <br />
          Starting from {p.variants[0]?.price} {catalog.store.currency}
          <br />
          <a href={p.url} target="_blank" rel="noopener noreferrer">
            View & Buy →
          </a>
        </li>
      ))}
    </ul>
  );
}
```

---

## Important Notices

> **⚠️ Prices are for display purposes only**
>
> The prices returned by this API are for displaying product information on external sites. The actual purchase price is always computed server-side at checkout from the live database. Displaying a different price on an external site does not affect what the customer pays — the server validates and computes the final price independently.

> **ℹ️ Only active products are returned**
>
> Products marked as "Hidden" (`isActive: false`) in the admin panel are not returned by this API. Out-of-stock products are included but have `isOutOfStock: true`, allowing you to show them as unavailable.

> **ℹ️ Only active variants are returned**
>
> Inactive variants (e.g., discontinued plans) are excluded from the `variants` array.

> **ℹ️ Purchases happen on the main store**
>
> This API is for catalog display only. All purchases are handled through the main store at `siteUrl` via the Guest Checkout + WhatsApp flow. No payment processing happens through this API.

> **🔒 No sensitive data**
>
> This API never exposes: orders, coupons, admin credentials, JWT tokens, database connection strings, or any internal system information.

---

## Error Responses

| Status | Meaning |
|---|---|
| `200` | Success |
| `500` | Server error — returns `{ "error": "Failed to fetch catalog" }` |

On error, the `Access-Control-Allow-Origin: *` header is still included so your external site can read the error message.

---

## Rate Limiting

No explicit rate limiting is implemented. The CDN cache (`s-maxage=60`) naturally reduces load on the database. For high-traffic external sites, consider caching the response on your own server.

---

## Versioning

The current API version is `1.0` (visible in `meta.version`). Breaking changes will be versioned with a new path (e.g., `/api/public/v2/catalog`).
