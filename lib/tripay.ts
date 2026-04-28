import { createHmac } from "crypto";

const BASE_URL  = "https://tripay.co.id/api";
const API_KEY   = () => process.env.TRIPAY_API_KEY   ?? "";
const PRIV_KEY  = () => process.env.TRIPAY_PRIVATE_KEY ?? "";
const MERCH_CODE = () => process.env.TRIPAY_MERCHANT_CODE ?? "";

export type TripayItem = { name: string; price: number; quantity: number };

export interface CreateTxPayload {
  merchantRef:   string;   // unique ref (invoice number)
  amount:        number;
  customerName:  string;
  customerEmail: string;
  customerPhone?: string;
  orderItems:    TripayItem[];
  returnUrl:     string;   // redirect after payment
  callbackUrl:   string;   // webhook URL
  expiredTime?:  number;   // unix timestamp, default 24h
}

/** HMAC-SHA256 signature for transaction creation */
function sign(merchantRef: string, amount: number): string {
  return createHmac("sha256", PRIV_KEY())
    .update(MERCH_CODE() + merchantRef + amount)
    .digest("hex");
}

/** Verify webhook signature from Tripay */
export function verifyWebhookSignature(body: string, incomingSignature: string): boolean {
  const expected = createHmac("sha256", PRIV_KEY())
    .update(body)
    .digest("hex");
  return expected === incomingSignature;
}

/** Create a closed payment transaction */
export async function createTransaction(payload: CreateTxPayload) {
  const expiredTime = payload.expiredTime ?? Math.floor(Date.now() / 1000) + 86_400; // 24h

  const body = {
    method:          "AUTO",               // show all available payment methods
    merchant_ref:    payload.merchantRef,
    amount:          payload.amount,
    customer_name:   payload.customerName,
    customer_email:  payload.customerEmail,
    customer_phone:  payload.customerPhone ?? "",
    order_items:     payload.orderItems.map(i => ({
      name:     i.name,
      price:    i.price,
      quantity: i.quantity,
    })),
    return_url:      payload.returnUrl,
    callback_url:    payload.callbackUrl,
    expired_time:    expiredTime,
    signature:       sign(payload.merchantRef, payload.amount),
  };

  const res = await fetch(`${BASE_URL}/transaction/create`, {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${API_KEY()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json() as {
    success: boolean;
    message?: string;
    data?: {
      reference:    string;
      checkout_url: string;
      status:       string;
      expired_time: number;
    };
  };

  if (!data.success) throw new Error(data.message ?? "Tripay error");
  return data.data!;
}

/** Get transaction detail by reference */
export async function getTransaction(reference: string) {
  const res = await fetch(`${BASE_URL}/transaction/detail?reference=${reference}`, {
    headers: { Authorization: `Bearer ${API_KEY()}` },
  });
  const data = await res.json() as {
    success: boolean;
    data?: { reference: string; status: string; paid_at?: number };
  };
  if (!data.success) throw new Error("Tripay: transaction not found");
  return data.data!;
}
