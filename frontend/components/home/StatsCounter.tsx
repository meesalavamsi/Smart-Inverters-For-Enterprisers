"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const statValues = [
  { value: 5000, suffix: "+", key: "customers" },
  { value: 10, suffix: "+", key: "experience" },
  { value: 24, suffix: "/7", key: "support" },
  { value: 5, suffix: " Yr", key: "warranty" },
];

function CountUp({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  // Default to the final value so the real number is what's in the server-rendered
  // HTML (search engines, link-preview bots, JS-disabled visitors) instead of "0+".
  // The count-up is purely a scroll-into-view flourish layered on top, and only
  // plays once per mount.
  const [count, setCount] = useState(target);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!active || hasAnimated.current) return;
    hasAnimated.current = true;
    setCount(0);
    let frame = 0;
    const total = 80;
    const timer = setInterval(() => {
      frame++;
      const eased = 1 - Math.pow(1 - frame / total, 3);
      setCount(Math.round(eased * target));
      if (frame >= total) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [active, target]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function StatsCounter() {
  const t = useTranslations("stats");
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-10 border-y"
      style={{
        background: "linear-gradient(135deg, #0a1628 0%, #0f2044 50%, #0a1628 100%)",
        borderColor: "rgba(22,163,74,0.2)",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-green-800/60">
          {statValues.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center px-6 py-2"
            >
              <div
                className="text-3xl sm:text-4xl font-black tabular-nums mb-1"
                style={{
                  background: "linear-gradient(135deg, #86efac 0%, #22c55e 60%, #10b981 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <CountUp target={s.value} suffix={s.suffix} active={active} />
              </div>
              <p className="text-xs font-semibold text-green-400/70 tracking-widest uppercase">
                {t(s.key as any)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
