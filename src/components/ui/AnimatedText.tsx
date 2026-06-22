"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

export default function AnimatedText({
  text,
  className,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "p";
}) {
  const words = text.split(" ");

  return (
    <Tag className={cn("animated-text", className)} aria-label={text}>
      <motion.span
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="animated-text-inner"
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={staggerItem}
            className="animated-word"
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
