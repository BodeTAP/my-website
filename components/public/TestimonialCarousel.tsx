"use client";

import Image from "next/image";
import { Star, Quote } from "lucide-react";

type Testimonial = {
  name: string;
  business: string;
  text: string;
  rating: number;
  avatar?: string;
};

export default function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  // Duplicate the testimonials to ensure the row is wider than the screen
  const displayItems = testimonials.length < 4 ? [...testimonials, ...testimonials, ...testimonials] : [...testimonials, ...testimonials];

  return (
    <div 
      className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-4 sm:py-10"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
      }}
    >
      <div className="flex group w-max">
        {/* First Marquee Track */}
        <div className="flex shrink-0 animate-marquee group-hover:[animation-play-state:paused] gap-4 sm:gap-6 px-2 sm:px-3">
          {displayItems.map((t, idx) => (
            <div
              key={`track1-${idx}`}
              className="relative flex w-[320px] shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-md sm:w-[380px]"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-100" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-slate-700 text-sm sm:text-[14px] leading-relaxed mb-6 flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3.5 mt-auto pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {t.avatar ? (
                    <Image src={t.avatar} alt={t.name} width={40} height={40} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-800 text-xs font-bold">{t.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-sm leading-tight">{t.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{t.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Second Marquee Track (identical duplicate for seamless loop) */}
        <div className="flex shrink-0 animate-marquee group-hover:[animation-play-state:paused] gap-4 sm:gap-6 px-2 sm:px-3" aria-hidden="true">
          {displayItems.map((t, idx) => (
            <div
              key={`track2-${idx}`}
              className="relative flex w-[320px] shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-md sm:w-[380px]"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-100" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-slate-700 text-sm sm:text-[14px] leading-relaxed mb-6 flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3.5 mt-auto pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {t.avatar ? (
                    <Image src={t.avatar} alt={t.name} width={40} height={40} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-800 text-xs font-bold">{t.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-sm leading-tight">{t.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{t.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
