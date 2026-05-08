/**
 * lib/fonnte.ts — Fonnte API client
 *
 * Covers all Fonnte API endpoints:
 * - Device management (get, add, profile, disconnect, delete)
 * - QR code for connecting device
 * - Number validation
 * - Rotator list
 *
 * Two token types:
 * - ACCOUNT TOKEN: used for account-level operations (get-devices, add-device, rotator)
 * - DEVICE TOKEN:  used for device-level operations (send, validate, qr, disconnect, device profile)
 */

import "server-only";

const FONNTE_BASE = "https://api.fonnte.com";

// ── Types ─────────────────────────────────────────────────────────────────────

export type FonnteDevice = {
  autoread: string;
  device: string;       // phone number
  expired: string;      // unix timestamp string
  name: string;
  package: string;
  quota: string;
  status: "connect" | "disconnect";
  token: string;
};

export type FonnteDeviceProfile = {
  device: string;
  device_status: "connect" | "disconnect";
  expired: string;
  messages: number;
  name: string;
  package: string;
  quota: string;
  status: boolean;
};

export type FonnteAddDeviceResult = {
  autoread: string;
  device: string;
  group: string;
  name: string;
  personal: string;
  status: boolean;
  token: string;
};

export type FonnteValidateResult = {
  registered: string[];
  not_registered: string[];
  status: boolean;
};

export type FonnteQRResult =
  | { status: true; url: string }           // base64 QR image
  | { status: true; code: string }          // pairing code
  | { status: false; reason: string };

export type FonnteRotator = {
  id: string;
  name: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fonntePost<T>(
  endpoint: string,
  token: string,
  body?: Record<string, string>,
): Promise<T> {
  const formData = new URLSearchParams(body ?? {});
  const res = await fetch(`${FONNTE_BASE}${endpoint}`, {
    method: "POST",
    headers: { Authorization: token },
    body: formData,
  });
  const data = await res.json().catch(() => ({ status: false, reason: "Invalid JSON response" }));
  return data as T;
}

// ── Account-level APIs (require ACCOUNT token) ────────────────────────────────

/**
 * Get all devices on the account.
 * Requires: account token
 */
export async function fonnteGetDevices(accountToken: string): Promise<{
  connected: number;
  devices: number;
  messages: number;
  data: FonnteDevice[];
  status: boolean;
  reason?: string;
}> {
  return fonntePost("/get-devices", accountToken);
}

/**
 * Add a new device to the account.
 * Requires: account token
 */
export async function fonnteAddDevice(
  accountToken: string,
  params: {
    name: string;
    device: string;   // phone number
    autoread?: boolean;
    personal?: boolean;
    group?: boolean;
  },
): Promise<FonnteAddDeviceResult & { reason?: string }> {
  return fonntePost("/add-device", accountToken, {
    name:     params.name,
    device:   params.device,
    autoread: String(params.autoread ?? false),
    personal: String(params.personal ?? false),
    group:    String(params.group ?? false),
  });
}

/**
 * Get rotator list for the account.
 * Requires: account token
 */
export async function fonnteGetRotators(accountToken: string): Promise<{
  data: FonnteRotator[];
  status: boolean;
  detail?: string;
}> {
  return fonntePost("/rotator", accountToken);
}

// ── Device-level APIs (require DEVICE token) ──────────────────────────────────

/**
 * Get profile/status of a specific device.
 * Requires: device token
 */
export async function fonnteGetDeviceProfile(deviceToken: string): Promise<FonnteDeviceProfile> {
  return fonntePost("/device", deviceToken);
}

/**
 * Disconnect a connected device.
 * Requires: device token
 */
export async function fonnteDisconnectDevice(deviceToken: string): Promise<{
  detail: string;
  status: boolean;
}> {
  return fonntePost("/disconnect", deviceToken);
}

/**
 * Delete a device from the account permanently.
 * Requires: device token
 */
export async function fonnteDeleteDevice(deviceToken: string): Promise<{
  detail: string;
  status: boolean;
  reason?: string;
}> {
  return fonntePost("/delete-device", deviceToken);
}

/**
 * Update device settings (name, webhook URLs, autoread, etc.)
 * Requires: device token
 */
export async function fonnteUpdateDevice(
  deviceToken: string,
  params: {
    name: string;
    device: string;
    webhook?: string;
    webhookconnect?: string;
    webhookstatus?: string;
    webhookchaining?: string;
    autoread?: boolean;
    personal?: boolean;
    group?: boolean;
    quick?: boolean;
    resend?: boolean;
    target?: string;
    countryCode?: string;
  },
): Promise<{ detail: string; status: boolean; reason?: string }> {
  const body: Record<string, string> = {
    name:   params.name,
    device: params.device,
  };
  if (params.webhook)         body.webhook         = params.webhook;
  if (params.webhookconnect)  body.webhookconnect  = params.webhookconnect;
  if (params.webhookstatus)   body.webhookstatus   = params.webhookstatus;
  if (params.webhookchaining) body.webhookchaining = params.webhookchaining;
  if (params.autoread  !== undefined) body.autoread  = String(params.autoread);
  if (params.personal  !== undefined) body.personal  = String(params.personal);
  if (params.group     !== undefined) body.group     = String(params.group);
  if (params.quick     !== undefined) body.quick     = String(params.quick);
  if (params.resend    !== undefined) body.resend    = String(params.resend);
  if (params.target)      body.target      = params.target;
  if (params.countryCode) body.countryCode = params.countryCode;
  return fonntePost("/update-device", deviceToken, body);
}

/**
 * Order a Fonnte package for a device.
 * Requires: device token
 * plan: 1=Lite, 2=Regular, 3=Regular Pro, 4=Master, 5=Super, 6=Advanced, 7=Ultra
 * duration: 1=Month, 10=Year
 */
export async function fonnteOrderPackage(
  deviceToken: string,
  params: {
    plan?: number;
    duration?: number;
    durationValue?: number;
    aiQuota?: number;
    aiData?: number;
  },
): Promise<{ status: boolean; detail?: string; reason?: string }> {
  const body: Record<string, string> = {};
  if (params.plan          !== undefined) body.plan             = String(params.plan);
  if (params.duration      !== undefined) body.duration         = String(params.duration);
  if (params.durationValue !== undefined) body["duration-value"] = String(params.durationValue);
  if (params.aiQuota       !== undefined) body["ai-quota"]      = String(params.aiQuota);
  if (params.aiData        !== undefined) body["ai-data"]       = String(params.aiData);
  return fonntePost("/order", deviceToken, body);
}

/**
 * Get QR code or pairing code to connect a device.
 * Requires: device token
 * type: "qr" (default) | "code"
 */
export async function fonnteGetQR(
  deviceToken: string,
  type: "qr" | "code" = "qr",
  whatsapp?: string,
): Promise<FonnteQRResult> {
  const body: Record<string, string> = { type };
  if (type === "code" && whatsapp) body.whatsapp = whatsapp;
  return fonntePost("/qr", deviceToken, body);
}

/**
 * Validate whether phone numbers are registered on WhatsApp.
 * Requires: device token
 * target: comma-separated phone numbers (max 500)
 */
export async function fonnteValidateNumbers(
  deviceToken: string,
  numbers: string[],
): Promise<FonnteValidateResult> {
  return fonntePost("/validate", deviceToken, {
    target:      numbers.join(","),
    countryCode: "62",
  });
}
