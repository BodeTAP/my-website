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
              className="w-[320px] sm:w-[400px] glass bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shrink-0 hover:border-blue-500/40 hover:bg-[#0d1b35]/80 transition-all duration-300 flex flex-col relative shadow-xl"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-500/10" />
              
              {/* Stars */}
              <div className="flex gap-1.5 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                ))}
              </div>

              {/* Text */}
              <p className="text-blue-100/90 text-sm sm:text-[15px] leading-relaxed mb-8 italic flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-600/40 to-blue-800/20 border border-blue-500/30 flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
                  {t.avatar ? (
                    <Image src={t.avatar} alt={t.name} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-blue-300 text-sm font-bold">{t.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm sm:text-base">{t.name}</p>
                  <p className="text-blue-300/60 text-xs sm:text-sm">{t.business}</p>
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
              className="w-[320px] sm:w-[400px] glass bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shrink-0 hover:border-blue-500/40 hover:bg-[#0d1b35]/80 transition-all duration-300 flex flex-col relative shadow-xl"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-500/10" />
              
              {/* Stars */}
              <div className="flex gap-1.5 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                ))}
              </div>

              {/* Text */}
              <p className="text-blue-100/90 text-sm sm:text-[15px] leading-relaxed mb-8 italic flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-600/40 to-blue-800/20 border border-blue-500/30 flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
                  {t.avatar ? (
                    <Image src={t.avatar} alt={t.name} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-blue-300 text-sm font-bold">{t.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm sm:text-base">{t.name}</p>
                  <p className="text-blue-300/60 text-xs sm:text-sm">{t.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
