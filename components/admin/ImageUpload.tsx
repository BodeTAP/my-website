"use client";

import { useRef, useState, DragEvent } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: "video" | "square";
  label?: string;
};

export default function ImageUpload({ value, onChange, aspectRatio = "video", label = "Gambar Cover" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload gagal");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("File harus berupa gambar."); return; }
    upload(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const containerH = aspectRatio === "square" ? "h-40" : "h-48";

  return (
    <div className="space-y-1.5">
      <span className="text-slate-900 text-xs font-semibold uppercase tracking-wider">{label}</span>

      {value ? (
        /* ── Preview ── */
        <div className={`relative ${containerH} rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl transition-colors shadow-xs font-semibold"
            >
              <Upload className="w-3.5 h-3.5" />
              Ganti
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1.5 rounded-xl transition-colors shadow-xs font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`
            ${containerH} rounded-2xl border-2 border-dashed transition-all cursor-pointer
            flex flex-col items-center justify-center gap-2
            ${dragging
              ? "border-slate-900 bg-slate-100"
              : "border-slate-200 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-50"
            }
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-slate-800 animate-spin" />
              <p className="text-slate-500 text-xs font-medium">Mengupload...</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                <ImageIcon className="w-5 h-5 text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-slate-600 text-xs">
                  <span className="text-slate-900 font-semibold underline underline-offset-2">Klik</span> atau drag & drop gambar
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">JPG, PNG, WebP · Maks 5MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-rose-700 text-xs bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 font-medium">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
