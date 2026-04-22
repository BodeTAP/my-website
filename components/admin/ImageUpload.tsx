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
      <span className="text-blue-200/70 text-xs">{label}</span>

      {value ? (
        /* ── Preview ── */
        <div className={`relative ${containerH} rounded-xl overflow-hidden border border-white/10 group`}>
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Ganti
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs px-3 py-1.5 rounded-lg transition-colors"
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
            ${containerH} rounded-xl border-2 border-dashed transition-all cursor-pointer
            flex flex-col items-center justify-center gap-2
            ${dragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-white/10 hover:border-white/20 hover:bg-white/3"
            }
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-blue-200/50 text-xs">Mengupload...</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-blue-400/60" />
              </div>
              <div className="text-center">
                <p className="text-blue-200/60 text-xs">
                  <span className="text-blue-400 font-medium">Klik</span> atau drag & drop gambar
                </p>
                <p className="text-blue-200/30 text-xs mt-0.5">JPG, PNG, WebP · Maks 5MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

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
