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
