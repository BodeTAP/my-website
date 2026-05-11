"use client";

import { useState } from "react";
import { Loader2, Save, Bot, Settings as SettingsIcon, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AI_FEATURE_ORDER, AI_FEATURE_SPECS, AI_MODEL_OPTIONS } from "@/lib/aiConfig";

export default function SettingsClient({ 
  initial, 
}: { 
  initial: Record<string, string>; 
}) {
  const [activeTab, setActiveTab] = useState<"umum" | "ai" | "broadcast">("umum");
  
  // Settings State
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const setText = (key: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

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
        <p className="text-blue-200/50 text-sm mt-2">Kelola konten situs, statistik hero, konfigurasi AI, dan perilaku broadcast WhatsApp.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-8">
        <button
          onClick={() => setActiveTab("umum")}
          className={`pb-3 text-sm font-medium transition-all border-b-2 ${activeTab === "umum" ? "border-blue-500 text-white" : "border-transparent text-blue-200/50 hover:text-white"}`}
        >
          Pengaturan Situs
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`pb-3 text-sm font-medium transition-all border-b-2 flex items-center gap-2 ${activeTab === "ai" ? "border-purple-500 text-white" : "border-transparent text-blue-200/50 hover:text-white"}`}
        >
          <Bot className="w-3.5 h-3.5" /> Konfigurasi AI
        </button>
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`pb-3 text-sm font-medium transition-all border-b-2 flex items-center gap-2 ${activeTab === "broadcast" ? "border-green-500 text-white" : "border-transparent text-blue-200/50 hover:text-white"}`}
        >
          <MessageCircle className="w-3.5 h-3.5" /> Broadcast WA
        </button>
      </div>

      {/* Tab: Umum */}
      {activeTab === "umum" && (
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Statistik Hero</h2>
            <p className="text-blue-200/40 text-sm mb-6">Angka yang tampil di bawah tombol &quot;Mulai Proyek&quot; di beranda situs.</p>
            
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
          </div>

          {/* Tracking & Analytics */}
          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Tracking &amp; Analytics</h2>
            <p className="text-blue-200/40 text-sm mb-6">ID pixel untuk mengukur performa dan konversi. Kosongkan untuk menonaktifkan.</p>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Facebook Pixel ID</Label>
                <Input
                  value={form.facebook_pixel_id ?? ""}
                  onChange={set("facebook_pixel_id")}
                  placeholder="Contoh: 123456789012345"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Google Analytics ID</Label>
                <Input
                  value={form.google_analytics_id ?? ""}
                  onChange={set("google_analytics_id")}
                  placeholder="Contoh: G-XXXXXXXXXX"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20"
                />
              </div>
            </div>
          </div>

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

      {/* Tab: Konfigurasi AI */}
      {activeTab === "ai" && (
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Model Selector */}
          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Model AI</h2>
            <p className="text-blue-200/40 text-sm mb-6">Model yang lebih canggih menghasilkan konten lebih baik, namun lebih mahal per-request.</p>
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
          </div>

          {/* Feature Toggles */}
          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Fitur AI Aktif</h2>
            <p className="text-blue-200/40 text-sm mb-6">Nonaktifkan fitur untuk menghentikan konsumsi token AI secara sementara.</p>
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
          </div>

          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Konfigurasi Per Fitur</h2>
            <p className="text-blue-200/40 text-sm mb-6">Atur model, token maksimum, dan rate limit untuk setiap workflow AI.</p>
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
          </div>

          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Behavior Umum</h2>
            <p className="text-blue-200/40 text-sm mb-6">Default input artikel, retry JSON, dan logging penggunaan AI.</p>
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
          </div>

          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Auto Publish & Cover</h2>
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
          </div>

          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Estimator & Portal Chat</h2>
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
          </div>

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
          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Identitas Pesan</h2>
            <p className="text-blue-200/40 text-sm mb-6">Variabel ini bisa dipakai di template: {"{brandName}"}, {"{websiteUrl}"}, {"{groupLink}"}, dan {"{footer}"}.</p>
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
          </div>

          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Template Pesan</h2>
            <p className="text-blue-200/40 text-sm mb-6">Gunakan {"{name}"}, {"{businessName}"}, {"{brandName}"}, {"{websiteUrl}"}, {"{groupLink}"}, atau {"{footer}"}.</p>
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
          </div>

          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Consent & Keyword</h2>
            <p className="text-blue-200/40 text-sm mb-6">Pisahkan keyword dengan koma. Sistem mencocokkan keyword dari awal balasan lead.</p>
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
          </div>

          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Guardrail Pengiriman</h2>
            <p className="text-blue-200/40 text-sm mb-6">Batas ini menjaga broadcast tetap pelan, terukur, dan tidak terlalu agresif.</p>
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
          </div>

          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Delay Antar Pesan</h2>
            <p className="text-blue-200/40 text-sm mb-6">Format rentang detik: <code className="text-blue-300">min-max</code>. Contoh: <code className="text-blue-300">20-50</code>.</p>
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
          </div>

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
