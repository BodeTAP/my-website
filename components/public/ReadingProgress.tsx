"use client";

import { useState, useEffect } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0);
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (progress <= 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-[3px] bg-white/5 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400"
        style={{ width: `${progress}%`, boxShadow: "0 0 8px rgba(59,130,246,0.6)" }}
      />
    </div>
  );
}
