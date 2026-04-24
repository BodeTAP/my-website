"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeUp({ children, delay = 0, className }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, delay = 0, className }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0, className }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.65, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({ children, delay = 0, className }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.65, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChildren({
  children,
  className,
  stagger = 0.1,
  delay = 0,
}: Props & { stagger?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HoverCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
