import { createHmac } from "crypto";

const SANDBOX    = process.env.TRIPAY_SANDBOX === "true";
const DIRECT_URL = SANDBOX ? "https://tripay.co.id/api-sandbox" : "https://tripay.co.id/api";
// Sandbox bypasses the Cloudflare proxy (no IP whitelist restriction in sandbox)
const BASE_URL   = (!SANDBOX && process.env.TRIPAY_PROXY_URL)
  ? process.env.TRIPAY_PROXY_URL
  : DIRECT_URL;
const API_KEY    = () => process.env.TRIPAY_API_KEY       ?? "";
const PRIV_KEY   = () => process.env.TRIPAY_PRIVATE_KEY   ?? "";
const MERCH_CODE = () => process.env.TRIPAY_MERCHANT_CODE ?? "";
const PROXY_SEC  = () => process.env.TRIPAY_PROXY_SECRET  ?? "";

function extraHeaders(): Record<string, string> {
  const s = PROXY_SEC();
  return s ? { "x-proxy-secret": s } : {};
}

// ── Types ────────────────────────────────────────────────────────────────────

export type TripayItem = { name: string; price: number; quantity: number };

export type PaymentChannel = {
  group:    string;
  code:     string;
  name:     string;
  type:     string;
  fee_merchant: { flat: number; percent: string };
  total_fee:    { flat: number; percent: string };
  icon_url: string;
  active:   boolean;
};

export interface CreateTxPayload {
  method:        string;   // payment channel code, e.g. "BRIVA", "QRIS2"
  merchantRef:   string;
  amount:        number;
  customerName:  string;
  customerEmail: string;
  customerPhone?: string;
  orderItems:    TripayItem[];
  returnUrl:     string;
  callbackUrl:   string;
  expiredTime?:  number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sign(merchantRef: string, amount: number): string {
  return createHmac("sha256", PRIV_KEY())
    .update(MERCH_CODE() + merchantRef + amount)
    .digest("hex");
}

export function verifyWebhookSignature(body: string, sig: string): boolean {
  const expected = createHmac("sha256", PRIV_KEY()).update(body).digest("hex");
  return expected === sig;
}

// ── API calls ─────────────────────────────────────────────────────────────────

/** Fetch available payment channels for this merchant */
export async function fetchPaymentChannels(): Promise<PaymentChannel[]> {
  try {
    const res = await fetch(`${BASE_URL}/merchant/payment-channel`, {
      headers: { Authorization: `Bearer ${API_KEY()}`, ...extraHeaders() },
      next: { revalidate: 300 }, // cache 5 minutes
    });
    const data = await res.json() as { success: boolean; data?: PaymentChannel[] };
    if (!data.success || !data.data) return [];
    return data.data.filter(c => c.active);
  } catch {
    return [];
  }
}

/** Create a closed payment transaction with a specific payment method */
export async function createTransaction(payload: CreateTxPayload) {
  const expiredTime = payload.expiredTime ?? Math.floor(Date.now() / 1000) + 86_400;

  const body = {
    method:        payload.method,
    merchant_ref:  payload.merchantRef,
    amount:        payload.amount,
    customer_name: payload.customerName,
    customer_email:payload.customerEmail,
    customer_phone:payload.customerPhone ?? "",
    order_items:   payload.orderItems.map(i => ({
      name: i.name, price: i.price, quantity: i.quantity,
    })),
    return_url:    payload.returnUrl,
    callback_url:  payload.callbackUrl,
    expired_time:  expiredTime,
    signature:     sign(payload.merchantRef, payload.amount),
  };

  const res = await fetch(`${BASE_URL}/transaction/create`, {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${API_KEY()}`,
      "Content-Type": "application/json",
      ...extraHeaders(),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json() as {
    success: boolean;
    message?: string;
    data?: { reference: string; checkout_url: string; status: string; expired_time: number };
  };

  if (!data.success) throw new Error(data.message ?? "Tripay error");
  return data.data!;
}

/** Get transaction detail by reference */
export async function getTransaction(reference: string) {
  const res = await fetch(`${BASE_URL}/transaction/detail?reference=${reference}`, {
    headers: { Authorization: `Bearer ${API_KEY()}`, ...extraHeaders() },
  });
  const data = await res.json() as {
    success: boolean;
    data?: { reference: string; status: string; paid_at?: number };
  };
  if (!data.success) throw new Error("Tripay: transaction not found");
  return data.data!;
}
