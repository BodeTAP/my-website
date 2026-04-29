"use client";

import { StaggerChildren, ScaleIn, CountUp } from "./motion";

type Stat = { num: string; label: string };

function parseStat(num: string): { end: number; suffix: string } {
  const m = num.match(/^(\d+)(.*)$/);
  if (m) return { end: parseInt(m[1]), suffix: m[2] };
  return { end: 0, suffix: num };
}

export default function HeroStats({ stats }: { stats: Stat[] }) {
  return (
    <StaggerChildren delay={0.4} stagger={0.1} className="grid grid-cols-3 gap-6 max-w-md mx-auto">
      {stats.map((s) => {
        const { end, suffix } = parseStat(s.num);
        return (
          <ScaleIn key={s.label} className="text-center">
            <div className="text-2xl font-bold text-white">
              {end > 0 ? (
                <CountUp from={0} to={end} suffix={suffix} />
              ) : (
                <span>{s.num}</span>
              )}
            </div>
            <div className="text-blue-200/50 text-xs mt-0.5">{s.label}</div>
          </ScaleIn>
        );
      })}
    </StaggerChildren>
  );
}
