"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

export default function CountUp({ value }: { value: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const match = value.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
  const prefix = match ? match[1] : "";
  const num = match ? parseInt(match[2]) : NaN;
  const suffix = match ? match[3] : "";

  useEffect(() => {
    if (!isInView || isNaN(num)) {
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * num);
      
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, num]);

  if (isNaN(num)) {
    return <span ref={ref}>{value}</span>;
  }

  return (
    <span ref={ref}>
      {prefix}
      {isInView ? count : 0}
      {suffix}
    </span>
  );
}
