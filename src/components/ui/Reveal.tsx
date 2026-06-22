"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { revealTransition, revealViewport } from "@/lib/animations";
import { cn } from "@/lib/utils";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  as?: "div" | "article" | "section";
};

export default function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  ...props
}: RevealProps) {
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={{ ...revealTransition, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Component>
  );
}
