"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

type Testimonial = {
  name: string;
  business: string;
  text: string;
  rating: number;
  avatar?: string;
};

export default function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback(
    (next: number, dir: "left" | "right") => {
      if (animating) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setCurrent((next + testimonials.length) % testimonials.length);
        setAnimating(false);
      }, 300);
    },
    [animating, testimonials.length]
  );

  const prev = useCallback(() => go(current - 1, "left"), [current, go]);
  const next = useCallback(() => go(current + 1, "right"), [current, go]);

  // Auto-play
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => next(), 5000);
  }, [next]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [resetTimer, current]);

  const t = testimonials[current];

  return (
    <div className="relative max-w-3xl mx-auto select-none">
      {/* Main card */}
      <div
        className={`glass rounded-3xl p-8 sm:p-12 transition-all duration-300 ${
          animating
            ? direction === "right"
              ? "-translate-x-4 opacity-0"
              : "translate-x-4 opacity-0"
            : "translate-x-0 opacity-100"
        }`}
      >
        {/* Quote icon */}
        <div className="absolute -top-4 left-10 w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Quote className="w-5 h-5 text-white fill-white" />
        </div>

        {/* Stars */}
        <div className="flex gap-1 mb-6">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          ))}
        </div>

        {/* Text */}
        <p className="text-blue-100/80 text-lg sm:text-xl leading-relaxed mb-8 italic">
          &ldquo;{t.text}&rdquo;
        </p>

        {/* Author */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center shrink-0 overflow-hidden">
            {t.avatar ? (
              <Image src={t.avatar} alt={t.name} width={48} height={48} className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-300 text-lg font-bold">{t.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <p className="text-white font-semibold">{t.name}</p>
            <p className="text-blue-300/60 text-sm">{t.business}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-8">
        {/* Prev */}
        <button
          onClick={() => { prev(); resetTimer(); }}
          className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-blue-300 hover:text-white hover:border-blue-500/40 hover:bg-blue-600/20 transition-all"
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { go(i, i > current ? "right" : "left"); resetTimer(); }}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 h-2 bg-blue-500"
                  : "w-2 h-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Testimoni ${i + 1}`}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => { next(); resetTimer(); }}
          className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-blue-300 hover:text-white hover:border-blue-500/40 hover:bg-blue-600/20 transition-all"
          aria-label="Berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Counter */}
      <p className="text-center text-blue-200/30 text-xs mt-3">
        {current + 1} / {testimonials.length}
      </p>
    </div>
  );
}
