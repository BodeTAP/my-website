/**
 * Cloudflare Worker — Tripay API Proxy
 *
 * Deploy di: https://dash.cloudflare.com/ → Workers & Pages → Create
 * Set environment variable: PROXY_SECRET = [string acak yang sama dgn TRIPAY_PROXY_SECRET di Vercel]
 *
 * Setelah deploy, tambahkan IP Cloudflare ke whitelist Tripay:
 *   https://www.cloudflare.com/ips-v4
 *
 * Cara deploy via CLI (gratis):
 *   npx wrangler deploy cloudflare-worker/tripay-proxy.js --name tripay-proxy
 */

const TRIPAY_BASE = "https://tripay.co.id/api";

export default {
  async fetch(request, env) {
    // Verifikasi request dari server Vercel kita
    const proxySecret = request.headers.get("x-proxy-secret");
    if (!proxySecret || proxySecret !== env.PROXY_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Bangun URL target Tripay
    const incoming = new URL(request.url);
    // Path: /api/transaction/create → /transaction/create
    const tripayPath = incoming.pathname.replace(/^\/api/, "");
    const targetUrl  = TRIPAY_BASE + tripayPath + incoming.search;

    // Clone headers, hapus header proxy kita
    const headers = new Headers(request.headers);
    headers.delete("x-proxy-secret");
    headers.delete("host");

    // Forward ke Tripay
    const tripayReq = new Request(targetUrl, {
      method:  request.method,
      headers,
      body:    request.method !== "GET" && request.method !== "HEAD"
               ? request.body
               : null,
    });

    const tripayRes = await fetch(tripayReq);

    // Return response dari Tripay ke Vercel
    return new Response(tripayRes.body, {
      status:  tripayRes.status,
      headers: tripayRes.headers,
    });
  },
};
