import { createHash } from 'crypto';

const GRAPH_API_VERSION = 'v21.0';

const ALLOWED_EVENTS = new Set([
  'PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Lead', 'Purchase', 'Search',
]);

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export interface CapiUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  clientIp?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
}

export interface CapiEventInput {
  eventName: string;
  eventId: string;
  eventSourceUrl: string;
  customData?: Record<string, unknown>;
  userData?: CapiUserData;
  /** Meta's "Test Events" tool only shows CAPI events tagged with this code. Testing only. */
  testEventCode?: string;
}

/** Send one event to Meta's Conversions API. No-ops silently if not configured. */
export async function sendCapiEvent(pixelId: string, input: CapiEventInput): Promise<void> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;
  if (!ALLOWED_EVENTS.has(input.eventName)) return;

  const ud = input.userData || {};
  const user_data: Record<string, unknown> = {};
  if (ud.email)     user_data.em = [sha256(ud.email)];
  if (ud.phone)     user_data.ph = [sha256(ud.phone.replace(/[^0-9]/g, ''))];
  if (ud.firstName) user_data.fn = [sha256(ud.firstName)];
  if (ud.lastName)  user_data.ln = [sha256(ud.lastName)];
  if (ud.clientIp)  user_data.client_ip_address = ud.clientIp;
  if (ud.userAgent) user_data.client_user_agent = ud.userAgent;
  if (ud.fbp)       user_data.fbp = ud.fbp;
  if (ud.fbc)       user_data.fbc = ud.fbc;

  const payload = {
    data: [{
      event_name:       input.eventName,
      event_time:       Math.floor(Date.now() / 1000),
      event_id:         input.eventId,
      action_source:    'website',
      event_source_url: input.eventSourceUrl,
      user_data,
      custom_data: input.customData || {},
    }],
    ...(input.testEventCode ? { test_event_code: input.testEventCode } : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[meta-capi] Facebook API error', res.status, errBody);
    }
  } catch (err) {
    console.error('[meta-capi] Failed to send event', err);
  }
}
