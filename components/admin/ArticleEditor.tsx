"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, List, ListOrdered, Quote, Code,
  Heading2, Heading3, Link2, Image as ImageIcon, Save, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/admin/ImageUpload";

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
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function ArticleEditor({ article }: { article?: Article }) {
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
  });
  const [loading, setLoading] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [error, setError] = useState("");
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
        class: "min-h-[400px] outline-none prose prose-invert prose-blue max-w-none prose-p:text-blue-100/80 prose-headings:text-white",
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

  const handleSave = async (status: "DRAFT" | "PUBLISHED") => {
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Judul dan slug wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    const body = {
      ...form,
      status,
      content: editor?.getHTML() ?? "",
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

  const ToolbarBtn = ({
    onClick,
    active,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-blue-200/50 hover:text-white hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Main info */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-blue-200 text-sm">Judul Artikel *</Label>
          <Input
            value={form.title}
            onChange={handleTitleChange}
            placeholder="Mengapa Klinik Gigi di Kota X Perlu Website Sendiri"
            className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 text-lg font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-blue-200 text-sm">Slug URL *</Label>
          <Input
            value={form.slug}
            onChange={set("slug")}
            placeholder="mengapa-klinik-gigi-butuh-website"
            className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 font-mono text-sm"
          />
        </div>

        <ImageUpload
          value={form.coverImage}
          onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
          label="Gambar Cover Artikel"
        />

        <div className="space-y-1.5">
          <Label className="text-blue-200 text-sm">Ringkasan Artikel</Label>
          <Textarea
            value={form.excerpt}
            onChange={set("excerpt")}
            rows={2}
            placeholder="Deskripsi singkat yang muncul di daftar artikel..."
            className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-3 border-b border-white/5">
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")}>
            <Bold className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")}>
            <Italic className="w-4 h-4" />
          </ToolbarBtn>
          <div className="w-px bg-white/10 mx-1" />
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })}>
            <Heading2 className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })}>
            <Heading3 className="w-4 h-4" />
          </ToolbarBtn>
          <div className="w-px bg-white/10 mx-1" />
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
          <div className="w-px bg-white/10 mx-1" />
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
      <div className="glass rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSeo(!showSeo)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-white/2 transition-colors"
        >
          <span className="text-white font-semibold text-sm">Pengaturan SEO</span>
          {showSeo ? (
            <EyeOff className="w-4 h-4 text-blue-400/50" />
          ) : (
            <Eye className="w-4 h-4 text-blue-400/50" />
          )}
        </button>

        {showSeo && (
          <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
            <div className="space-y-1.5">
              <Label className="text-blue-200 text-sm">Meta Title (maks 60 karakter)</Label>
              <Input
                value={form.metaTitle}
                onChange={set("metaTitle")}
                maxLength={60}
                placeholder={form.title}
                className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
              />
              <p className="text-blue-200/30 text-xs">{form.metaTitle.length}/60</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-blue-200 text-sm">Meta Description (maks 160 karakter)</Label>
              <Textarea
                value={form.metaDesc}
                onChange={set("metaDesc")}
                maxLength={160}
                rows={2}
                placeholder="Deskripsi singkat yang muncul di hasil pencarian Google..."
                className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none"
              />
              <p className="text-blue-200/30 text-xs">{form.metaDesc.length}/160</p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => handleSave("DRAFT")}
          className="border-white/10 text-white hover:bg-white/5"
        >
          <Save className="w-4 h-4 mr-2" />
          Simpan Draft
        </Button>
        <Button
          type="button"
          disabled={loading}
          onClick={() => handleSave("PUBLISHED")}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          {loading ? "Menyimpan..." : "Tayangkan Artikel"}
        </Button>
      </div>
    </div>
  );
}
