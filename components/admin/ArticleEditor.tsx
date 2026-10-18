"use client";

import { useState, useCallback, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, List, ListOrdered, Quote, Code,
  Heading2, Heading3, Link2, Image as ImageIcon, Save, Eye, EyeOff, X, Calendar, Clock,
  Sparkles, Search, AlertCircle, Loader2, Wand2, BarChart3, ImagePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/admin/ImageUpload";

type Category = { id: string; name: string };

type Article = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  status?: "DRAFT" | "PUBLISHED";
  scheduledAt?: string | Date | null;
  categoryId?: string | null;
  tags?: string[];
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function ToolbarBtn({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors text-sm ${
        active
          ? "bg-[#1E242E] text-white shadow-xs"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
      }`}
    >
      {children}
    </button>
  );
}

export default function ArticleEditor({
  article,
  categories = [],
}: {
  article?: Article;
  categories?: Category[];
}) {
  const router = useRouter();
  const isEdit = !!article?.id;

  const [form, setForm] = useState({
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    excerpt: article?.excerpt ?? "",
    coverImage: article?.coverImage ?? "",
    metaTitle: article?.metaTitle ?? "",
    metaDesc: article?.metaDesc ?? "",
    status: (article?.status ?? "DRAFT") as "DRAFT" | "PUBLISHED",
    categoryId: article?.categoryId ?? "",
  });
  const [tags, setTags] = useState<string[]>(article?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  // Scheduling state
  const existingSchedule = article?.scheduledAt
    ? new Date(article.scheduledAt as string).toISOString().slice(0, 16)
    : "";
  const [schedMode, setSchedMode]   = useState(!!existingSchedule);
  const [schedDate, setSchedDate]   = useState(existingSchedule);
  const [minScheduleDate] = useState(() => new Date(Date.now() + 60_000).toISOString().slice(0, 16));
  const [error, setError] = useState("");

  // AI Panel State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTab, setAiTab] = useState<"draft" | "seo" | "cover">("draft");
  const [aiLoading, setAiLoading] = useState(false);
  
  // Tab 1: Draft
  const [draftTopic, setDraftTopic] = useState("");
  const [draftKeywords, setDraftKeywords] = useState("");
  const [draftTone, setDraftTone] = useState("Informatif");
  const [aiDraftResult, setAiDraftResult] = useState<{ title: string; content: string; metaTitle: string; metaDescription: string; suggestedTags: string[] } | null>(null);

  // Tab 2: SEO
  const [seoResult, setSeoResult] = useState<{ overallScore: number; titleScore: number; metaScore: number; readabilityScore: number; keywordScore: number; suggestions: string[] } | null>(null);

  // Tab 3: Cover
  const [coverQuery, setCoverQuery] = useState("");
  const [pexelsPhotos, setPexelsPhotos] = useState<{ id: number; url: string; photographer: string; pexelsUrl: string }[]>([]);

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
      if (val && !tags.includes(val)) setTags((t) => [...t, val]);
      setTagInput("");
    }
  };

  // AI Functions
  const generateDraft = async () => {
    if (!draftTopic) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai/draft-article", {
        method: "POST",
        body: JSON.stringify({
          topic: draftTopic,
          keywords: draftKeywords.split(",").map(k => k.trim()),
          tone: draftTone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiDraftResult(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal generate artikel");
    } finally {
      setAiLoading(false);
    }
  };

  const useAiDraft = () => {
    if (!aiDraftResult) return;
    setForm(f => ({
      ...f,
      title:     aiDraftResult.title,
      slug:      slugify(aiDraftResult.title),
      excerpt:   (aiDraftResult as { excerpt?: string }).excerpt ?? aiDraftResult.metaDescription,
      metaTitle: aiDraftResult.metaTitle,
      metaDesc:  aiDraftResult.metaDescription,
    }));
    editor?.commands.setContent(aiDraftResult.content);
    setTags(aiDraftResult.suggestedTags);
    setAiDraftResult(null);
    setAiOpen(false);
  };

  const analyzeSeo = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai/seo-analyze", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          content: editor?.getHTML() || "",
          metaTitle: form.metaTitle,
          metaDescription: form.metaDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSeoResult(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal analisis SEO");
    } finally {
      setAiLoading(false);
    }
  };

  const searchCover = async () => {
    const q = coverQuery || form.title;
    if (!q) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai/cover-image", {
        method: "POST",
        body: JSON.stringify({ title: form.title, query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPexelsPhotos(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal cari foto");
    } finally {
      setAiLoading(false);
    }
  };

  const uploadCover = async (photoUrl: string) => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai/cover-image", {
        method: "POST",
        body: JSON.stringify({ photoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm(f => ({ ...f, coverImage: data.url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal upload cover");
    } finally {
      setAiLoading(false);
    }
  };

  const removeTag = (tag: string) => setTags((t) => t.filter((x) => x !== tag));
  const inlineImageRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: "Mulai menulis artikel Anda di sini..." }),
    ],
    content: article?.content ?? "",
    editorProps: {
      attributes: {
        class: "min-h-[400px] outline-none prose prose-slate max-w-none prose-p:text-slate-700 prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-slate-900 focus:outline-none",
      },
    },
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((f) => ({
      ...f,
      title,
      slug: isEdit ? f.slug : slugify(title),
      metaTitle: isEdit ? f.metaTitle : title,
    }));
  };

  const addLink = useCallback(() => {
    const url = window.prompt("Masukkan URL:");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    inlineImageRef.current?.click();
  }, []);

  const handleInlineImage = async (file: File | undefined) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      editor?.chain().focus().setImage({ src: data.url }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gambar gagal");
    }
  };

  const handleSave = async (status: "DRAFT" | "PUBLISHED", scheduledAt?: string) => {
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Judul dan slug wajib diisi");
      return;
    }
    if (scheduledAt && new Date(scheduledAt) <= new Date()) {
      setError("Waktu jadwal harus di masa depan.");
      return;
    }

    setLoading(true);
    setError("");

    const body = {
      ...form,
      status,
      content: editor?.getHTML() ?? "",
      categoryId: form.categoryId || null,
      tags,
      scheduledAt: scheduledAt ?? null,
    };

    const url = isEdit ? `/api/admin/articles/${article.id}` : "/api/admin/articles";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");
      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col lg:flex-row gap-6">
      {/* Main Column */}
      <div className={`flex-1 space-y-6 transition-all duration-300 ${aiOpen ? "lg:mr-88" : ""}`}>
        {/* Header with AI Toggle */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Editor Artikel</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Tulis, format konten, dan optimasi artikel untuk SEO</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setAiOpen(!aiOpen)}
            className={`rounded-xl border transition-all text-xs font-semibold h-9 px-3.5 ${
              aiOpen
                ? "bg-[#1E242E] text-white border-slate-800 hover:bg-slate-800 hover:text-white"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500" />
            AI Tools
          </Button>
        </div>

        {/* Main info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">Judul Artikel *</Label>
            <Input
              value={form.title}
              onChange={handleTitleChange}
              placeholder="Mengapa Klinik Gigi di Kota X Perlu Website Sendiri"
              className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all text-base font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">Slug URL *</Label>
            <Input
              value={form.slug}
              onChange={set("slug")}
              placeholder="mengapa-klinik-gigi-butuh-website"
              className="h-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono text-sm transition-all"
            />
          </div>

          {/* Category & Tags row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">Kategori</Label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="w-full h-10 rounded-xl px-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-mono"
              >
                <option value="">— Tanpa kategori —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">
                Tags <span className="text-slate-400 text-xs normal-case">(Tekan Enter untuk menambah)</span>
              </Label>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="seo, tips, website..."
                className="w-full h-10 rounded-xl px-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-full border border-slate-200 font-medium">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-rose-600 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <ImageUpload
            value={form.coverImage}
            onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
            label="Gambar Cover Artikel"
          />

          <div className="space-y-1.5">
            <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">Ringkasan Artikel</Label>
            <Textarea
              value={form.excerpt}
              onChange={set("excerpt")}
              rows={2}
              placeholder="Deskripsi singkat yang muncul di daftar artikel..."
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Editor */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2.5 bg-slate-50/70 border-b border-slate-200">
            <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")}>
              <Bold className="w-4 h-4" />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")}>
              <Italic className="w-4 h-4" />
            </ToolbarBtn>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })}>
              <Heading2 className="w-4 h-4" />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })}>
              <Heading3 className="w-4 h-4" />
            </ToolbarBtn>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")}>
              <List className="w-4 h-4" />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")}>
              <ListOrdered className="w-4 h-4" />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")}>
              <Quote className="w-4 h-4" />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive("code")}>
              <Code className="w-4 h-4" />
            </ToolbarBtn>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <ToolbarBtn onClick={addLink} active={editor?.isActive("link")}>
              <Link2 className="w-4 h-4" />
            </ToolbarBtn>
            <ToolbarBtn onClick={addImage}>
              <ImageIcon className="w-4 h-4" />
            </ToolbarBtn>
          </div>
          <input
            ref={inlineImageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleInlineImage(e.target.files?.[0])}
          />

          {/* Editor content */}
          <div className="p-6">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* SEO Settings */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setShowSeo(!showSeo)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="text-slate-900 font-semibold text-sm">Pengaturan SEO (Meta Title & Description)</span>
            {showSeo ? (
              <EyeOff className="w-4 h-4 text-slate-400" />
            ) : (
              <Eye className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showSeo && (
            <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4 bg-slate-50/30">
              <div className="space-y-1.5">
                <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">Meta Title (maks 60 karakter)</Label>
                <Input
                  value={form.metaTitle}
                  onChange={set("metaTitle")}
                  maxLength={60}
                  placeholder={form.title}
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:ring-1 focus:ring-slate-900 font-mono text-sm"
                />
                <p className="text-slate-400 text-xs font-mono">{form.metaTitle.length}/60</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">Meta Description (maks 160 karakter)</Label>
                <Textarea
                  value={form.metaDesc}
                  onChange={set("metaDesc")}
                  maxLength={160}
                  rows={2}
                  placeholder="Deskripsi singkat yang muncul di hasil pencarian Google..."
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 resize-none rounded-xl focus:ring-1 focus:ring-slate-900 text-sm font-mono"
                />
                <p className="text-slate-400 text-xs font-mono">{form.metaDesc.length}/160</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {/* Schedule row */}
          {schedMode && (
            <div className="flex items-center gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex-wrap">
              <Clock className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="text-slate-700 text-sm font-medium whitespace-nowrap">Jadwalkan publish:</span>
              <input
                type="datetime-local"
                value={schedDate}
                onChange={e => setSchedDate(e.target.value)}
                min={minScheduleDate}
                className="flex-1 min-w-40 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <Button
                type="button"
                size="sm"
                disabled={loading || !schedDate}
                onClick={() => handleSave("DRAFT", new Date(schedDate).toISOString())}
                className="bg-[#1E242E] hover:bg-slate-800 text-white rounded-lg text-xs font-medium whitespace-nowrap"
              >
                {loading ? "Menyimpan..." : "Simpan Jadwal"}
              </Button>
              <button
                type="button"
                onClick={() => { setSchedMode(false); setSchedDate(""); }}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 flex-wrap">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleSave("DRAFT")}
              className="rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs text-xs font-semibold h-10 px-4"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Draft
            </Button>
            {!schedMode && (
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setSchedMode(true)}
                className="rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs text-xs font-semibold h-10 px-4"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Jadwalkan
              </Button>
            )}
            <Button
              type="button"
              disabled={loading}
              onClick={() => handleSave("PUBLISHED")}
              className="rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white shadow-xs text-xs font-semibold h-10 px-5"
            >
              {loading ? "Menyimpan..." : "Tayangkan Artikel"}
            </Button>
          </div>
        </div>
      </div>

      {/* AI Sidebar */}
      {aiOpen && (
        <div className="lg:fixed lg:right-6 lg:top-20 lg:bottom-6 w-full lg:w-88 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col z-40 animate-in slide-in-from-right duration-300 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-900 text-sm">AI Assistant</span>
            </div>
            <button onClick={() => setAiOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/30">
            {(["draft", "seo", "cover"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setAiTab(t)}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  aiTab === t
                    ? "text-slate-900 border-b-2 border-slate-900 bg-white"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiTab === "draft" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono uppercase text-slate-700">Topik Artikel</Label>
                  <Textarea
                    value={draftTopic}
                    onChange={(e) => setDraftTopic(e.target.value)}
                    placeholder="Contoh: Pentingnya SEO untuk klinik gigi..."
                    className="bg-slate-50 border-slate-200 text-slate-900 text-sm rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono uppercase text-slate-700">Keywords (pisahkan koma)</Label>
                  <Input
                    value={draftKeywords}
                    onChange={(e) => setDraftKeywords(e.target.value)}
                    placeholder="klinik gigi, seo lokal, website klinik"
                    className="bg-slate-50 border-slate-200 text-slate-900 text-sm rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono uppercase text-slate-700">Tone</Label>
                  <select
                    value={draftTone}
                    onChange={(e) => setDraftTone(e.target.value)}
                    className="w-full h-10 rounded-xl px-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all font-mono"
                  >
                    <option value="Informatif">Informatif</option>
                    <option value="Persuasif">Persuasif</option>
                    <option value="Casual">Casual</option>
                  </select>
                </div>
                <Button
                  onClick={generateDraft}
                  disabled={aiLoading || !draftTopic}
                  className="w-full bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl shadow-xs text-xs font-semibold h-10"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                  Generate Artikel
                </Button>

                {aiDraftResult && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <p className="text-xs font-bold text-slate-900">Preview: {aiDraftResult.title}</p>
                    <Button onClick={useAiDraft} size="sm" className="w-full bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold">
                      Gunakan Konten Ini
                    </Button>
                  </div>
                )}
              </div>
            )}

            {aiTab === "seo" && (
              <div className="space-y-4">
                <Button
                  onClick={analyzeSeo}
                  disabled={aiLoading}
                  className="w-full bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl shadow-xs text-xs font-semibold h-10"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                  Analisis SEO
                </Button>

                {seoResult && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className={`text-4xl font-extrabold font-mono tracking-tight ${
                        seoResult.overallScore >= 80 ? "text-emerald-600" : 
                        seoResult.overallScore >= 60 ? "text-amber-600" : "text-rose-600"
                      }`}>
                        {seoResult.overallScore}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">SEO Overall Score</div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-900 mb-2">Saran Perbaikan:</p>
                      {seoResult.suggestions.map((s, i) => (
                        <div key={i} className="flex gap-2 text-xs text-slate-700 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {aiTab === "cover" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono uppercase text-slate-700">Cari Foto</Label>
                  <div className="flex gap-2">
                    <Input
                      value={coverQuery}
                      onChange={(e) => setCoverQuery(e.target.value)}
                      placeholder="Cari gambar..."
                      className="bg-slate-50 border-slate-200 text-slate-900 text-sm rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900"
                    />
                    <Button onClick={searchCover} size="icon" disabled={aiLoading} className="bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl shrink-0 h-10 w-10">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {pexelsPhotos.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => uploadCover(p.url)}
                      disabled={aiLoading}
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-slate-900 group transition-all"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt="Pexels" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ImagePlus className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
                {pexelsPhotos.length > 0 && (
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Foto dari Pexels. Klik untuk gunakan.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
