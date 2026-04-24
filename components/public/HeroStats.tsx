"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import AnimatedCounter from "./AnimatedCounter";

const stats = [
  { end: 50, suffix: "+", label: "Proyek selesai" },
  { end: 95, suffix: "%", label: "Klien puas" },
  { end: 3, suffix: " hari", label: "Rata-rata delivery" },
];

export default function HeroStats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
      }}
      className="grid grid-cols-3 gap-6 max-w-md mx-auto"
    >
      {stats.map((s) => (
        <motion.div
          key={s.label}
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.9 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            },
          }}
          className="text-center"
        >
          <div className="text-2xl font-bold text-white">
            <AnimatedCounter end={s.end} suffix={s.suffix} />
          </div>
          <div className="text-blue-200/50 text-xs mt-0.5">{s.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}
