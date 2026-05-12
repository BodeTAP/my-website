"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown, Loader2, Save, Bot, Settings as SettingsIcon, MessageCircle, Mail, CreditCard, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AI_FEATURE_ORDER, AI_FEATURE_SPECS, AI_MODEL_OPTIONS } from "@/lib/aiConfig";

type SettingsTab = "umum" | "seo" | "komunikasi" | "payment" | "ai" | "broadcast";

const SECTIONS_BY_TAB: Record<SettingsTab, string[]> = {
  umum: ["brand", "homepage", "heroStats"],
  seo: ["seoDefaults", "analytics"],
  komunikasi: ["emailTemplates", "messageTemplates"],
  payment: ["paymentBehavior"],
  ai: ["aiModel", "aiFeatures", "aiFeatureConfig", "aiBehavior", "aiAutoPublish", "aiPortal"],
  broadcast: ["broadcastIdentity", "broadcastTemplates", "broadcastConsent", "broadcastGuardrail", "broadcastDelay"],
};

const DEFAULT_OPEN_SECTIONS = Object.values(SECTIONS_BY_TAB).reduce<Record<string, boolean>>((acc, sections) => {
  sections.forEach((id, index) => {
    acc[id] = index === 0;
  });
  return acc;
}, {});

function CollapsibleSection({
  id,
  title,
  description,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  open: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <section className="glass rounded-2xl border border-white/5 overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
      >
        <span>
          <span className="block text-white font-semibold text-base">{title}</span>
          {description && <span className="block text-blue-200/40 text-sm mt-1 leading-relaxed">{description}</span>}
        </span>
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <ChevronDown className={`h-4 w-4 text-blue-200/70 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div id={`${id}-panel`} className="border-t border-white/5 px-5 py-5">
          {children}
        </div>
      )}
    </section>
  );
}

export default function SettingsClient({ 
  initial, 
}: { 
  initial: Record<string, string>; 
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("umum");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(DEFAULT_OPEN_SECTIONS);
  
  // Settings State
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const setText = (key: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const activeSections = SECTIONS_BY_TAB[activeTab];
  const toggleSection = (id: string) => setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  const setActiveSectionsOpen = (open: boolean) =>
    setOpenSections((current) => ({
      ...current,
      ...Object.fromEntries(activeSections.map((id) => [id, open])),
    }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else setError("Gagal menyimpan pengaturan.");
    setLoading(false);
  };

  const stats = [
    { numKey: "hero_stat_1_num", labelKey: "hero_stat_1_label", title: "Stat 1 (Proyek)" },
    { numKey: "hero_stat_2_num", labelKey: "hero_stat_2_label", title: "Stat 2 (Kepuasan)" },
    { numKey: "hero_stat_3_num", labelKey: "hero_stat_3_label", title: "Stat 3 (Delivery)" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
            <SettingsIcon className="w-5 h-5 text-blue-400" />
          </div>
          Pengaturan & Konfigurasi
        </h1>
        <p className="text-blue-200/50 text-sm mt-2">Kelola identitas brand, konten public site, SEO, template komunikasi, payment, AI, dan broadcast WhatsApp.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-5 overflow-x-auto">
        <button
          onClick={() => setActiveTab("umum")}
          className={`pb-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === "umum" ? "border-blue-500 text-white" : "border-transparent text-blue-200/50 hover:text-white"}`}
        >
          Pengaturan Situs
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          className={`pb-3 text-sm font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === "seo" ? "border-sky-500 text-white" : "border-transparent text-blue-200/50 hover:text-white"}`}
        >
          <Search className="w-3.5 h-3.5" /> SEO & Analytics
        </button>
        <button
          onClick={() => setActiveTab("komunikasi")}
          className={`pb-3 text-sm font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === "komunikasi" ? "border-amber-500 text-white" : "border-transparent text-blue-200/50 hover:text-white"}`}
        >
          <Mail className="w-3.5 h-3.5" /> Template Komunikasi
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={`pb-3 text-sm font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === "payment" ? "border-orange-500 text-white" : "border-transparent text-blue-200/50 hover:text-white"}`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Invoice & Payment
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`pb-3 text-sm font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === "ai" ? "border-purple-500 text-white" : "border-transparent text-blue-200/50 hover:text-white"}`}
        >
          <Bot className="w-3.5 h-3.5" /> Konfigurasi AI
        </button>
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`pb-3 text-sm font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === "broadcast" ? "border-green-500 text-white" : "border-transparent text-blue-200/50 hover:text-white"}`}
        >
          <MessageCircle className="w-3.5 h-3.5" /> Broadcast WA
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
        <p className="text-blue-200/45 text-xs sm:text-sm">
          Section bisa dibuka-tutup agar halaman lebih pendek. Buka hanya bagian yang sedang diedit.
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setActiveSectionsOpen(true)} className="h-8 px-3 text-xs border-white/10 bg-white/5 text-blue-100 hover:bg-white/10">
            Buka semua
          </Button>
          <Button type="button" variant="outline" onClick={() => setActiveSectionsOpen(false)} className="h-8 px-3 text-xs border-white/10 bg-white/5 text-blue-100 hover:bg-white/10">
            Tutup semua
          </Button>
        </div>
      </div>

      {/* Tab: Umum */}
      {activeTab === "umum" && (
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CollapsibleSection
            id="brand"
            title="Identitas Brand"
            description="Identitas utama yang dipakai di public site, footer, metadata, dan template pesan."
            open={openSections.brand}
            onToggle={toggleSection}
          >
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                ["brand_name", "Nama Brand", "MFWEB"],
                ["brand_domain", "Website / Domain", "mfweb.maffisorp.id"],
                ["brand_site_url", "Base URL Website", "https://mfweb.maffisorp.id"],
                ["brand_contact_email", "Email Kontak", "hello@mfweb.id"],
                ["brand_public_whatsapp", "Nomor WhatsApp Publik", "6282221682343"],
                ["brand_consultation_url", "Link Konsultasi", "/contact"],
                ["brand_legal_name", "Nama Bisnis Legal", "MFWEB"],
                ["brand_footer_text", "Footer Text", "MFWEB. All rights reserved."],
              ].map(([key, label, placeholder]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{label}</Label>
                  <Input value={form[key] ?? ""} onChange={set(key)} placeholder={placeholder}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20" />
                </div>
              ))}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-blue-200/70 text-xs">Alamat / Bisnis Legal</Label>
                <textarea value={form.brand_business_address ?? ""} onChange={setText("brand_business_address")} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-blue-200/20 outline-none focus:border-blue-500/50 resize-y" />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="homepage"
            title="Konten Homepage"
            description="Headline, subheadline, CTA, link sosial, dan asset default public site."
            open={openSections.homepage}
            onToggle={toggleSection}
          >
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  ["home_hero_badge", "Badge Hero", "Tersedia untuk proyek baru"],
                  ["home_primary_cta_label", "Label CTA Utama", "Mulai Buat Website Saya"],
                  ["home_primary_cta_url", "Link CTA Utama", "/contact"],
                  ["home_secondary_cta_label", "Label CTA Kedua", "Lihat Hasil Kerja Kami"],
                  ["home_secondary_cta_url", "Link CTA Kedua", "/portfolio"],
                  ["brand_logo_url", "Logo URL", "/logo.png"],
                  ["brand_favicon_url", "Favicon URL", "/favicon.ico"],
                  ["brand_default_og_image", "Default OG Image", "/og-image.png"],
                  ["social_instagram_url", "Instagram URL", ""],
                  ["social_facebook_url", "Facebook URL", ""],
                  ["social_linkedin_url", "LinkedIn URL", ""],
                ].map(([key, label, placeholder]) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-blue-200/70 text-xs">{label}</Label>
                    <Input value={form[key] ?? ""} onChange={set(key)} placeholder={placeholder}
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20" />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Headline Utama</Label>
                <textarea value={form.home_hero_headline ?? ""} onChange={setText("home_hero_headline")} rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 resize-y" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Subheadline Utama</Label>
                <textarea value={form.home_hero_subheadline ?? ""} onChange={setText("home_hero_subheadline")} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 resize-y" />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="heroStats"
            title="Statistik Hero"
            description="Angka yang tampil di bawah tombol &quot;Mulai Proyek&quot; di beranda situs."
            open={openSections.heroStats}
            onToggle={toggleSection}
          >
            <div className="grid sm:grid-cols-3 gap-6">
              {stats.map((s, idx) => (
                <div key={s.numKey} className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-blue-200/50 font-medium text-xs mb-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">{idx + 1}</span>
                    {s.title}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-blue-200/70 text-xs">Nilai (Angka)</Label>
                    <Input
                      value={form[s.numKey] ?? ""}
                      onChange={set(s.numKey)}
                      placeholder="50+"
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20 text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-blue-200/70 text-xs">Label (Teks Bawah)</Label>
                    <Input
                      value={form[s.labelKey] ?? ""}
                      onChange={set(s.labelKey)}
                      placeholder="Proyek selesai"
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-11 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Pengaturan
            </Button>
            {saved && <span className="text-green-400 text-sm font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Tersimpan</span>}
          </div>
        </form>
      )}

      {activeTab === "seo" && (
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CollapsibleSection
            id="seoDefaults"
            title="SEO Default"
            description="Default metadata untuk halaman yang tidak punya override khusus."
            open={openSections.seoDefaults}
            onToggle={toggleSection}
          >
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                ["seo_default_title", "Default Meta Title", "Jasa Pembuatan Website Profesional untuk Bisnis Lokal | MFWEB"],
                ["seo_default_title_template", "Template Title", "%s | MFWEB"],
                ["seo_default_og_image", "Default OG Image", "/og-image.png"],
                ["seo_canonical_base_url", "Canonical Base URL", "https://mfweb.maffisorp.id"],
              ].map(([key, label, placeholder]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{label}</Label>
                  <Input value={form[key] ?? ""} onChange={set(key)} placeholder={placeholder}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20" />
                </div>
              ))}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-blue-200/70 text-xs">Default Meta Description</Label>
                <textarea value={form.seo_default_description ?? ""} onChange={setText("seo_default_description")} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-sky-500/50 resize-y" />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="analytics"
            title="Analytics"
            description="ID tracking untuk public site. Kosongkan untuk menonaktifkan."
            open={openSections.analytics}
            onToggle={toggleSection}
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Facebook Pixel ID</Label>
                <Input value={form.facebook_pixel_id ?? ""} onChange={set("facebook_pixel_id")} placeholder="123456789012345"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Google Analytics ID</Label>
                <Input value={form.google_analytics_id ?? ""} onChange={set("google_analytics_id")} placeholder="G-XXXXXXXXXX"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20" />
              </div>
            </div>
          </CollapsibleSection>

          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" disabled={loading} className="bg-sky-600 hover:bg-sky-500 text-white px-8 h-11 rounded-xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan SEO
            </Button>
            {saved && <span className="text-green-400 text-sm font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Tersimpan</span>}
          </div>
        </form>
      )}

      {activeTab === "komunikasi" && (
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CollapsibleSection
            id="emailTemplates"
            title="Template Email"
            description={<>Variabel umum: {"{brandName}"}, {"{clientName}"}, {"{invoiceNo}"}, {"{amount}"}, {"{dueDate}"}, {"{invoiceUrl}"}, {"{url}"}.</>}
            open={openSections.emailTemplates}
            onToggle={toggleSection}
          >
            <div className="space-y-5">
              {[
                ["template_email_invoice_subject", "Subject Email Invoice", 1],
                ["template_email_invoice_body", "Body Email Invoice", 8],
                ["template_email_magic_link_subject", "Subject Email Magic Link", 1],
                ["template_email_magic_link_body", "Body Email Magic Link", 6],
              ].map(([key, label, rows]) => (
                <div key={key as string} className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{label}</Label>
                  {rows === 1 ? (
                    <Input value={form[key as string] ?? ""} onChange={set(key as string)} className="bg-white/5 border-white/10 text-white" />
                  ) : (
                    <textarea value={form[key as string] ?? ""} onChange={setText(key as string)} rows={rows as number}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 resize-y font-mono" />
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="messageTemplates"
            title="Template WhatsApp & Admin"
            description="Variabel mengikuti konteks pesan: invoice, tiket, hosting, maintenance, dan notifikasi admin."
            open={openSections.messageTemplates}
            onToggle={toggleSection}
          >
            <div className="space-y-5">
              {[
                ["template_wa_invoice_reminder", "WhatsApp Invoice Reminder"],
                ["template_wa_ticket_reply", "WhatsApp Ticket Reply Notification"],
                ["template_wa_hosting_expiry", "Hosting Expiry Reminder"],
                ["template_wa_maintenance_billing", "Maintenance Billing Reminder"],
                ["template_admin_notification", "Admin Notification Message"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{label}</Label>
                  <textarea value={form[key] ?? ""} onChange={setText(key)} rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 resize-y font-mono" />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-500 text-white px-8 h-11 rounded-xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Template
            </Button>
            {saved && <span className="text-green-400 text-sm font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Tersimpan</span>}
          </div>
        </form>
      )}

      {activeTab === "payment" && (
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CollapsibleSection
            id="paymentBehavior"
            title="Invoice & Payment Behavior"
            description="Default pembuatan invoice, reminder, mode gateway, biaya, dan instruksi pembayaran."
            open={openSections.paymentBehavior}
            onToggle={toggleSection}
          >
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                ["invoice_prefix", "Prefix Nomor Invoice", "INV"],
                ["invoice_valid_days", "Masa Berlaku Invoice (hari)", "7"],
                ["invoice_reminder_schedule_days", "Reminder Schedule", "7,3,1,0,-3"],
              ].map(([key, label, placeholder]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{label}</Label>
                  <Input value={form[key] ?? ""} onChange={set(key)} placeholder={placeholder}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20" />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Payment Gateway Mode</Label>
                <select value={form.payment_gateway_mode ?? "live"} onChange={(e) => setForm((f) => ({ ...f, payment_gateway_mode: e.target.value }))}
                  className="w-full h-10 rounded-md px-3 bg-white/5 border border-white/10 text-white text-sm">
                  <option value="live" className="bg-[#030914]">Live</option>
                  <option value="sandbox" className="bg-[#030914]">Sandbox</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Fee Handling</Label>
                <select value={form.payment_fee_handling ?? "customer"} onChange={(e) => setForm((f) => ({ ...f, payment_fee_handling: e.target.value }))}
                  className="w-full h-10 rounded-md px-3 bg-white/5 border border-white/10 text-white text-sm">
                  <option value="customer" className="bg-[#030914]">Dibebankan ke customer</option>
                  <option value="merchant" className="bg-[#030914]">Ditanggung merchant</option>
                  <option value="split" className="bg-[#030914]">Split / sesuai gateway</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-blue-200/70 text-xs">Default Payment Instructions</Label>
                <textarea value={form.payment_default_instructions ?? ""} onChange={setText("payment_default_instructions")} rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500/50 resize-y" />
              </div>
            </div>
          </CollapsibleSection>

          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-500 text-white px-8 h-11 rounded-xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Payment
            </Button>
            {saved && <span className="text-green-400 text-sm font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Tersimpan</span>}
          </div>
        </form>
      )}

      {/* Tab: Konfigurasi AI */}
      {activeTab === "ai" && (
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Model Selector */}
          <CollapsibleSection
            id="aiModel"
            title="Model AI"
            description="Model yang lebih canggih menghasilkan konten lebih baik, namun lebih mahal per-request."
            open={openSections.aiModel}
            onToggle={toggleSection}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {AI_MODEL_OPTIONS.map((m) => (
                <button key={m.value} type="button"
                  onClick={() => setForm((f) => ({ ...f, ai_model: m.value }))}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    form.ai_model === m.value
                      ? "border-purple-500/50 bg-purple-500/10"
                      : "border-white/10 bg-black/20 hover:border-white/20"
                  }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-white font-semibold text-sm">{m.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${m.badgeColor}`}>{m.badge}</span>
                  </div>
                  <p className="text-blue-200/50 text-xs">{m.desc}</p>
                  <p className="text-blue-200/30 text-[10px] mt-1 font-mono">{m.value}</p>
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* Feature Toggles */}
          <CollapsibleSection
            id="aiFeatures"
            title="Fitur AI Aktif"
            description="Nonaktifkan fitur untuk menghentikan konsumsi token AI secara sementara."
            open={openSections.aiFeatures}
            onToggle={toggleSection}
          >
            <div className="space-y-4">
              {[
                { key: "ai_feature_article",           label: "Pembuatan & Analisis Artikel",  desc: "Draft artikel, saran topik, analisis SEO, dan draft balasan tiket." },
                { key: "ai_feature_portal_chat",       label: "Chat AI di Portal Klien",        desc: "Widget Tanya AI di dashboard portal klien." },
                { key: "ai_feature_name_generator",    label: "Generator Nama Bisnis",          desc: "Tool publik generator nama bisnis & slogan." },
                { key: "ai_feature_pricing_estimator", label: "Estimasi Harga Website",         desc: "Tool publik estimasi harga pembuatan website." },
              ].map((feat) => (
                <div key={feat.key} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-white text-sm font-medium">{feat.label}</p>
                    <p className="text-blue-200/40 text-xs mt-0.5">{feat.desc}</p>
                  </div>
                  <button type="button"
                    onClick={() => setForm((f) => ({ ...f, [feat.key]: f[feat.key] === "false" ? "true" : "false" }))}
                    className={`relative w-11 h-6 rounded-full border transition-all shrink-0 ${
                      form[feat.key] !== "false"
                        ? "bg-purple-600 border-purple-500/50"
                        : "bg-white/10 border-white/10"
                    }`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form[feat.key] !== "false" ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="aiFeatureConfig"
            title="Konfigurasi Per Fitur"
            description="Atur model, token maksimum, dan rate limit untuk setiap workflow AI."
            open={openSections.aiFeatureConfig}
            onToggle={toggleSection}
          >
            <div className="space-y-5">
              {AI_FEATURE_ORDER.map((feature) => {
                const spec = AI_FEATURE_SPECS[feature];
                return (
                  <div key={feature} className="bg-black/20 rounded-2xl border border-white/5 p-4 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-white text-sm font-semibold">{spec.label}</p>
                        <p className="text-blue-200/40 text-xs mt-0.5">{spec.desc}</p>
                      </div>
                      <button type="button"
                        onClick={() => setForm((f) => ({ ...f, [spec.featureKey]: f[spec.featureKey] === "false" ? "true" : "false" }))}
                        className={`relative w-11 h-6 rounded-full border transition-all shrink-0 ${
                          form[spec.featureKey] !== "false"
                            ? "bg-purple-600 border-purple-500/50"
                            : "bg-white/10 border-white/10"
                        }`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          form[spec.featureKey] !== "false" ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-blue-200/70 text-xs">Model</Label>
                        <select
                          value={form[spec.modelKey] ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, [spec.modelKey]: e.target.value }))}
                          className="w-full h-10 rounded-md px-3 bg-white/5 border border-white/10 text-white text-xs"
                        >
                          <option value="" className="bg-[#030914]">Ikuti global</option>
                          {AI_MODEL_OPTIONS.map((model) => (
                            <option key={model.value} value={model.value} className="bg-[#030914]">{model.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-blue-200/70 text-xs">Max Token</Label>
                        <Input type="number" value={form[spec.maxTokensKey] ?? ""} onChange={set(spec.maxTokensKey)} className="bg-white/5 border-white/10 text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-blue-200/70 text-xs">Limit</Label>
                        <Input type="number" value={form[spec.rateLimitKey] ?? ""} onChange={set(spec.rateLimitKey)} className="bg-white/5 border-white/10 text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-blue-200/70 text-xs">Window (menit)</Label>
                        <Input type="number" value={form[spec.rateWindowKey] ?? ""} onChange={set(spec.rateWindowKey)} className="bg-white/5 border-white/10 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-blue-200/70 text-xs">System Prompt</Label>
                      <textarea
                        value={form[spec.promptKey] ?? ""}
                        onChange={setText(spec.promptKey)}
                        rows={feature === "portalChat" || feature === "draftReply" || feature === "coverImage" ? 5 : 8}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder:text-blue-200/20 outline-none focus:border-purple-500/50 resize-y font-mono"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="aiBehavior"
            title="Behavior Umum"
            description="Default input artikel, retry JSON, dan logging penggunaan AI."
            open={openSections.aiBehavior}
            onToggle={toggleSection}
          >
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                ["ai_article_default_tone", "Tone Artikel Default"],
                ["ai_article_default_length", "Panjang Artikel Default"],
                ["ai_article_max_topic_chars", "Maks Karakter Topik"],
                ["ai_article_max_keywords", "Maks Keyword"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{label}</Label>
                  <Input value={form[key] ?? ""} onChange={set(key)} className="bg-white/5 border-white/10 text-white" />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Usage Logging</Label>
                <select
                  value={form.ai_usage_logging ?? "database"}
                  onChange={(e) => setForm((f) => ({ ...f, ai_usage_logging: e.target.value }))}
                  className="w-full h-10 rounded-md px-3 bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="database" className="bg-[#030914]">Database + Console</option>
                  <option value="console" className="bg-[#030914]">Console only</option>
                  <option value="off" className="bg-[#030914]">Off</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                <span className="text-white text-sm font-medium">Retry JSON invalid</span>
                <button type="button"
                  onClick={() => setForm((f) => ({ ...f, ai_json_retry_enabled: f.ai_json_retry_enabled === "false" ? "true" : "false" }))}
                  className={`relative w-11 h-6 rounded-full border transition-all shrink-0 ${
                    form.ai_json_retry_enabled !== "false" ? "bg-purple-600 border-purple-500/50" : "bg-white/10 border-white/10"
                  }`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.ai_json_retry_enabled !== "false" ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="aiAutoPublish"
            title="Auto Publish & Cover"
            description="Token topik, cover otomatis, Pexels, dan prompt topik auto publish."
            open={openSections.aiAutoPublish}
            onToggle={toggleSection}
          >
            <div className="grid sm:grid-cols-3 gap-5 mt-6">
              {[
                ["ai_auto_publish_topic_max_tokens", "Token Topik Auto Publish"],
                ["ai_auto_publish_recent_article_count", "Cek Artikel Terakhir"],
                ["ai_auto_publish_existing_topic_count", "Judul Existing di Prompt"],
                ["ai_auto_publish_blob_prefix", "Blob Prefix Auto Cover"],
                ["ai_cover_pexels_per_page", "Pexels per Page"],
                ["ai_cover_auto_pexels_per_page", "Pexels Auto Cover"],
                ["ai_cover_orientation", "Orientasi Cover"],
                ["ai_cover_blob_prefix", "Blob Prefix Cover"],
                ["ai_cover_fallback_keyword", "Fallback Keyword"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{label}</Label>
                  <Input value={form[key] ?? ""} onChange={set(key)} className="bg-white/5 border-white/10 text-white" />
                </div>
              ))}
              {[
                ["ai_auto_publish_cover_enabled", "Auto-generate cover"],
                ["ai_auto_publish_notify_wa", "Notifikasi WA"],
                ["ai_cover_translate_keywords", "Translate keyword cover"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                  <span className="text-white text-sm font-medium">{label}</span>
                  <button type="button"
                    onClick={() => setForm((f) => ({ ...f, [key]: f[key] === "false" ? "true" : "false" }))}
                    className={`relative w-11 h-6 rounded-full border transition-all shrink-0 ${
                      form[key] !== "false" ? "bg-purple-600 border-purple-500/50" : "bg-white/10 border-white/10"
                    }`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form[key] !== "false" ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 mt-5">
              <Label className="text-blue-200/70 text-xs">Prompt Topik Auto Publish</Label>
              <textarea value={form.ai_prompt_auto_publish_topic ?? ""} onChange={setText("ai_prompt_auto_publish_topic")} rows={7}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-purple-500/50 resize-y font-mono" />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="aiPortal"
            title="Estimator & Portal Chat"
            description="Batas pertanyaan, konteks portal, fallback jawaban, dan pricing guide estimator."
            open={openSections.aiPortal}
            onToggle={toggleSection}
          >
            <div className="grid sm:grid-cols-3 gap-5 mt-6">
              {[
                ["ai_portal_max_question_chars", "Maks Karakter Pertanyaan"],
                ["ai_portal_max_session_messages", "Maks Pesan Sesi"],
                ["ai_portal_fallback_answer", "Fallback Jawaban"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{label}</Label>
                  <Input value={form[key] ?? ""} onChange={set(key)} className="bg-white/5 border-white/10 text-white" />
                </div>
              ))}
              {[
                ["ai_portal_include_projects", "Context proyek"],
                ["ai_portal_include_invoices", "Context invoice"],
                ["ai_portal_include_tickets", "Context tiket"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                  <span className="text-white text-sm font-medium">{label}</span>
                  <button type="button"
                    onClick={() => setForm((f) => ({ ...f, [key]: f[key] === "false" ? "true" : "false" }))}
                    className={`relative w-11 h-6 rounded-full border transition-all shrink-0 ${
                      form[key] !== "false" ? "bg-purple-600 border-purple-500/50" : "bg-white/10 border-white/10"
                    }`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form[key] !== "false" ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 mt-5">
              <Label className="text-blue-200/70 text-xs">Pricing Guide Estimator</Label>
              <textarea value={form.ai_pricing_guide ?? ""} onChange={setText("ai_pricing_guide")} rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-purple-500/50 resize-y font-mono" />
            </div>
          </CollapsibleSection>

          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-500 text-white px-8 h-11 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Pengaturan AI
            </Button>
            {saved && <span className="text-green-400 text-sm font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Tersimpan</span>}
          </div>
        </form>
      )}

      {/* Tab: Broadcast WhatsApp */}
      {activeTab === "broadcast" && (
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CollapsibleSection
            id="broadcastIdentity"
            title="Identitas Pesan"
            description={<>Variabel ini bisa dipakai di template: {"{brandName}"}, {"{websiteUrl}"}, {"{groupLink}"}, dan {"{footer}"}.</>}
            open={openSections.broadcastIdentity}
            onToggle={toggleSection}
          >
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                ["broadcast_brand_name", "Nama Brand", "MFWEB"],
                ["broadcast_website_url", "Website", "mfweb.maffisorp.id"],
                ["broadcast_group_link", "Link Grup / Komunitas", "https://chat.whatsapp.com/..."],
                ["broadcast_footer_text", "Footer Pesan", "{brandName} - {websiteUrl}"],
              ].map(([key, label, placeholder]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{label}</Label>
                  <Input
                    value={form[key] ?? ""}
                    onChange={set(key)}
                    placeholder={placeholder}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20"
                  />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="broadcastTemplates"
            title="Template Pesan"
            description={<>Gunakan {"{name}"}, {"{businessName}"}, {"{brandName}"}, {"{websiteUrl}"}, {"{groupLink}"}, atau {"{footer}"}.</>}
            open={openSections.broadcastTemplates}
            onToggle={toggleSection}
          >
            <div className="space-y-5">
              {[
                ["broadcast_consent_template", "Template Consent Awal", 6],
                ["broadcast_opt_in_promo_template", "Template Promo Setelah Balas YA", 8],
                ["broadcast_opt_out_reply_template", "Auto-reply Setelah STOP", 4],
              ].map(([key, label, rows]) => (
                <div key={key as string} className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{label}</Label>
                  <textarea
                    value={form[key as string] ?? ""}
                    onChange={setText(key as string)}
                    rows={rows as number}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-blue-200/20 outline-none focus:border-green-500/50 resize-y font-mono"
                  />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="broadcastConsent"
            title="Consent & Keyword"
            description="Pisahkan keyword dengan koma. Sistem mencocokkan keyword dari awal balasan lead."
            open={openSections.broadcastConsent}
            onToggle={toggleSection}
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Keyword Opt-in</Label>
                <Input
                  value={form.broadcast_opt_in_keywords ?? ""}
                  onChange={set("broadcast_opt_in_keywords")}
                  placeholder="ya,setuju,boleh,info"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Keyword Opt-out</Label>
                <Input
                  value={form.broadcast_opt_out_keywords ?? ""}
                  onChange={set("broadcast_opt_out_keywords")}
                  placeholder="stop,berhenti,batal"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20"
                />
              </div>
              {[
                ["broadcast_auto_reply_opt_in", "Kirim promo otomatis setelah opt-in"],
                ["broadcast_auto_reply_opt_out", "Kirim konfirmasi setelah opt-out"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                  <span className="text-white text-sm font-medium">{label}</span>
                  <button type="button"
                    onClick={() => setForm((f) => ({ ...f, [key]: f[key] === "false" ? "true" : "false" }))}
                    className={`relative w-11 h-6 rounded-full border transition-all shrink-0 ${
                      form[key] !== "false"
                        ? "bg-green-600 border-green-500/50"
                        : "bg-white/10 border-white/10"
                    }`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form[key] !== "false" ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="broadcastGuardrail"
            title="Guardrail Pengiriman"
            description="Batas ini menjaga broadcast tetap pelan, terukur, dan tidak terlalu agresif."
            open={openSections.broadcastGuardrail}
            onToggle={toggleSection}
          >
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                ["broadcast_allowed_start_hour", "Jam Mulai WIB", "8"],
                ["broadcast_allowed_end_hour", "Jam Selesai WIB", "20"],
                ["broadcast_cooldown_hours", "Cooldown per Lead (jam)", "24"],
                ["broadcast_default_session_limit", "Default Limit per Sesi", "30"],
                ["broadcast_max_session_limit", "Maks Limit per Sesi", "100"],
                ["broadcast_daily_limit_per_device", "Limit Harian per Device", "50"],
                ["broadcast_burst_pause_every", "Pause Setiap N Pesan", "5"],
                ["broadcast_burst_pause_min_seconds", "Pause Minimum (detik)", "90"],
                ["broadcast_burst_pause_max_seconds", "Pause Maksimum (detik)", "180"],
              ].map(([key, label, placeholder]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{label}</Label>
                  <Input
                    type="number"
                    value={form[key] ?? ""}
                    onChange={set(key)}
                    placeholder={placeholder}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20"
                  />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="broadcastDelay"
            title="Delay Antar Pesan"
            description={<>Format rentang detik: <code className="text-blue-300">min-max</code>. Contoh: <code className="text-blue-300">20-50</code>.</>}
            open={openSections.broadcastDelay}
            onToggle={toggleSection}
          >
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                ["broadcast_delay_small", "1-5 Lead", "15-35"],
                ["broadcast_delay_medium", "6-10 Lead", "20-50"],
                ["broadcast_delay_large", "11+ Lead", "30-70"],
              ].map(([key, label, placeholder]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{label}</Label>
                  <Input
                    value={form[key] ?? ""}
                    onChange={set(key)}
                    placeholder={placeholder}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20"
                  />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-500 text-white px-8 h-11 rounded-xl shadow-[0_0_15px_rgba(22,163,74,0.3)]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Pengaturan Broadcast
            </Button>
            {saved && <span className="text-green-400 text-sm font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Tersimpan</span>}
          </div>
        </form>
      )}
    </div>
  );
}
