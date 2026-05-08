"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Smartphone, Plus, RefreshCw, Loader2, X, Wifi, WifiOff,
  QrCode, AlertTriangle, Check, Trash2, Info,
} from "lucide-react";
import { FadeUp } from "@/components/public/motion";

type Device = {
  autoread: string;
  device: string;
  expired: string;
  name: string;
  package: string;
  quota: string;
  status: "connect" | "disconnect";
  token: string;
};

// ── Add Device Modal ──────────────────────────────────────────────────────────

function AddDeviceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName]     = useState("");
  const [device, setDevice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !device.trim()) { setError("Nama dan nomor wajib diisi."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/fonnte/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), device: device.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menambahkan device.");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally { setLoading(false); }
  };

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-green-400" />
            </div>
            <h2 className="text-white font-semibold">Tambah Device Baru</h2>
          </div>
          <button onClick={onClose} className="text-blue-200/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-blue-200/70 text-xs font-medium">Nama Device *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: WA Broadcast 1"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-blue-200/30 text-sm focus:outline-none focus:border-green-500/50 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-blue-200/70 text-xs font-medium">Nomor WhatsApp *</label>
            <input
              type="text"
              required
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              placeholder="Contoh: 628123456789"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-blue-200/30 text-sm focus:outline-none focus:border-green-500/50 transition-all font-mono"
            />
            <p className="text-blue-200/30 text-[11px]">Format internasional tanpa + (contoh: 628123456789)</p>
          </div>
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-blue-200/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Tambah Device
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}

// ── QR Modal ──────────────────────────────────────────────────────────────────

function QRModal({ device, onClose }: { device: Device; onClose: () => void }) {
  const [qr, setQr]         = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  const fetchQR = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/admin/fonnte/devices/${encodeURIComponent(device.token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "qr" }),
      });
      const data = await res.json();
      if (data.status === false) throw new Error(data.reason ?? "Gagal mengambil QR.");
      setQr(data.url ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil QR.");
    } finally { setLoading(false); }
  }, [device.token]);

  useEffect(() => { fetchQR(); }, [fetchQR]);

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-sm border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <QrCode className="w-4 h-4 text-blue-400" />
            <h2 className="text-white font-semibold text-sm">Scan QR — {device.name}</h2>
          </div>
          <button onClick={onClose} className="text-blue-200/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 flex flex-col items-center gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : error ? (
            <div className="text-center space-y-3">
              <p className="text-red-400 text-sm">{error}</p>
              {error.includes("already connect") && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  Device sudah terhubung
                </div>
              )}
            </div>
          ) : qr ? (
            <>
              <img
                src={`data:image/png;base64,${qr}`}
                alt="QR Code"
                className="w-56 h-56 rounded-xl border border-white/10"
              />
              <p className="text-blue-200/50 text-xs text-center">
                Buka WhatsApp → Perangkat Tertaut → Tautkan Perangkat → Scan QR ini
              </p>
              <button onClick={fetchQR}
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <RefreshCw className="w-3 h-3" /> Refresh QR
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DevicesClient({ hasAccountToken }: { hasAccountToken: boolean }) {
  const [devices, setDevices]     = useState<Device[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState("");
  const [showAdd, setShowAdd]     = useState(false);
  const [qrDevice, setQrDevice]   = useState<Device | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<{ connected: number; devices: number; messages: number } | null>(null);

  const fetchDevices = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/fonnte/devices");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengambil data device.");
      setDevices(data.data ?? []);
      setAccountInfo({ connected: data.connected, devices: data.devices, messages: data.messages });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { if (hasAccountToken) fetchDevices(); else setLoading(false); }, [fetchDevices, hasAccountToken]);

  const handleDisconnect = async (device: Device) => {
    if (!confirm(`Disconnect device "${device.name}" (${device.device})?`)) return;
    setDisconnecting(device.token);
    try {
      const res = await fetch(`/api/admin/fonnte/devices/${encodeURIComponent(device.token)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal disconnect.");
      fetchDevices(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal disconnect device.");
    } finally { setDisconnecting(null); }
  };

  const formatExpiry = (unixStr: string) => {
    const ts = parseInt(unixStr, 10);
    if (!ts) return "—";
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(ts * 1000));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <FadeUp>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center ring-1 ring-green-500/20">
                <Smartphone className="w-5 h-5 text-green-400" />
              </div>
              Device WhatsApp
            </h1>
            <p className="text-blue-200/50 text-sm mt-2">
              Kelola device Fonnte untuk broadcast WhatsApp.
            </p>
          </div>
          {hasAccountToken && (
            <div className="flex items-center gap-2">
              <button onClick={() => fetchDevices(true)} disabled={refreshing}
                className="p-2.5 rounded-xl border border-white/10 text-blue-200/50 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(22,163,74,0.3)]">
                <Plus className="w-4 h-4" />
                Tambah Device
              </button>
            </div>
          )}
        </div>
      </FadeUp>

      {!hasAccountToken && (
        <FadeUp delay={0.05}>
          <div className="glass rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-amber-300 text-sm font-medium">FONNTE_ACCOUNT_TOKEN belum dikonfigurasi</p>
              <p className="text-amber-200/60 text-xs leading-relaxed">
                Tambahkan <code className="bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-300">FONNTE_ACCOUNT_TOKEN</code> ke environment variables Vercel.
                Token ini berbeda dari device token — dapatkan dari dashboard Fonnte → Profile → Account Token.
              </p>
            </div>
          </div>
        </FadeUp>
      )}

      {/* Account stats */}
      {accountInfo && (
        <FadeUp delay={0.05}>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Device Terdaftar", value: accountInfo.devices, color: "text-white" },
              { label: "Sedang Connect", value: accountInfo.connected, color: "text-green-400" },
              { label: "Total Pesan", value: accountInfo.messages.toLocaleString("id-ID"), color: "text-blue-300" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-5 border border-white/5">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-blue-200/50 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeUp>
      )}

      {/* Device list */}
      <FadeUp delay={0.1}>
        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 gap-3 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Smartphone className="w-10 h-10 text-blue-200/20" />
              <p className="text-blue-200/40 text-sm">Belum ada device terdaftar.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider">Device</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Paket / Quota</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Expired</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {devices.map((dev) => (
                  <tr key={dev.token} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          dev.status === "connect" ? "bg-green-500/20 border border-green-500/20" : "bg-white/5 border border-white/10"
                        }`}>
                          <Smartphone className={`w-4 h-4 ${dev.status === "connect" ? "text-green-400" : "text-blue-200/30"}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{dev.name}</p>
                          <p className="text-blue-200/40 text-xs font-mono">{dev.device}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="space-y-0.5">
                        <span className="text-blue-200/60 text-xs">{dev.package}</span>
                        <p className="text-white/70 text-xs font-mono">{dev.quota} quota</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-blue-200/50 text-xs hidden md:table-cell">
                      {formatExpiry(dev.expired)}
                    </td>
                    <td className="px-6 py-4">
                      {dev.status === "connect" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                          <Wifi className="w-3 h-3" /> Connect
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-blue-200/40 text-xs font-medium">
                          <WifiOff className="w-3 h-3" /> Disconnect
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {dev.status === "disconnect" && (
                          <button onClick={() => setQrDevice(dev)}
                            className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
                            title="Scan QR untuk connect">
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {dev.status === "connect" && (
                          <button
                            onClick={() => handleDisconnect(dev)}
                            disabled={disconnecting === dev.token}
                            className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all disabled:opacity-50"
                            title="Disconnect device">
                            {disconnecting === dev.token
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </FadeUp>

      {/* Info note */}
      <FadeUp delay={0.15}>
        <div className="glass rounded-2xl p-5 border border-blue-500/10 bg-blue-500/5 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400/70 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-blue-300/80 text-sm font-medium">Tentang Device Fonnte</p>
            <p className="text-blue-200/50 text-xs leading-relaxed">
              Setiap device memiliki token unik yang digunakan untuk broadcast. Token device disimpan di pengaturan Fonnte API Keys.
              Webhook device status dikonfigurasi di Fonnte Dashboard → Webhook → Device Status →
              URL: <code className="bg-blue-500/10 px-1 rounded text-blue-300/70">{process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/fonnte/device-status</code>
            </p>
          </div>
        </div>
      </FadeUp>

      {showAdd && <AddDeviceModal onClose={() => setShowAdd(false)} onSuccess={() => fetchDevices(true)} />}
      {qrDevice && <QRModal device={qrDevice} onClose={() => setQrDevice(null)} />}
    </div>
  );
}
