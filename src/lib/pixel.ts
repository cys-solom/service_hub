declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: unknown;
  }
}

export interface PixelUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

function generateEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function fbEvent(name: string, params: Record<string, unknown> | undefined, eventId: string) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', name, params, { eventID: eventId });
}

/** Mirror the same event to Meta's Conversions API (server-side), for deduplication + better match quality. */
function sendCapi(eventName: string, eventId: string, customData?: Record<string, unknown>, userData?: PixelUserData) {
  if (typeof window === 'undefined') return;
  // Temporary testing hook: visit the site with ?fbtest=TEST_CODE to make CAPI
  // events show up in Meta's "Test Events" tool. Absent for normal visitors.
  const testEventCode = new URLSearchParams(window.location.search).get('fbtest') || undefined;
  fetch('/api/meta-capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      eventId,
      url: window.location.href,
      testEventCode,
      customData: customData || {},
      userData: userData || {},
    }),
    keepalive: true,
  }).catch(() => { /* best-effort — never block the UI on this */ });
}

export function initPixel(pixelId: string) {
  if (typeof window === 'undefined' || window.fbq) return;

  const fbq: NonNullable<Window['fbq']> = function (...args: unknown[]) {
    fbq.callMethod ? fbq.callMethod(...args) : fbq.queue!.push(args);
  } as NonNullable<Window['fbq']>;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];

  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  fbq('init', pixelId);
  fbq('track', 'PageView');
}

export const pixel = {
  pageView: () => {
    const id = generateEventId();
    fbEvent('PageView', undefined, id);
    sendCapi('PageView', id);
  },

  viewContent: (name: string, id: string, price?: number, currency = 'EGP') => {
    const eventId = generateEventId();
    const customData = { content_name: name, content_ids: [id], content_type: 'product', value: price, currency };
    fbEvent('ViewContent', customData, eventId);
    sendCapi('ViewContent', eventId, customData);
  },

  addToCart: (name: string, id: string, price: number, currency = 'EGP') => {
    const eventId = generateEventId();
    const customData = { content_name: name, content_ids: [id], content_type: 'product', value: price, currency };
    fbEvent('AddToCart', customData, eventId);
    sendCapi('AddToCart', eventId, customData);
  },

  initiateCheckout: (value: number, currency = 'EGP', numItems = 1) => {
    const eventId = generateEventId();
    const customData = { value, currency, num_items: numItems };
    fbEvent('InitiateCheckout', customData, eventId);
    sendCapi('InitiateCheckout', eventId, customData);
  },

  lead: (name: string, value: number, currency = 'EGP', orderId?: string, userData?: PixelUserData) => {
    const eventId = generateEventId();
    const customData = { content_name: name, value, currency, order_id: orderId };
    fbEvent('Lead', customData, eventId);
    sendCapi('Lead', eventId, customData, userData);
  },

  purchase: (name: string, value: number, currency = 'EGP', orderId?: string, userData?: PixelUserData) => {
    const eventId = generateEventId();
    const customData = { content_name: name, value, currency, order_id: orderId };
    fbEvent('Purchase', customData, eventId);
    sendCapi('Purchase', eventId, customData, userData);
  },

  search: (query: string) => {
    const eventId = generateEventId();
    const customData = { search_string: query };
    fbEvent('Search', customData, eventId);
    sendCapi('Search', eventId, customData);
  },
};
