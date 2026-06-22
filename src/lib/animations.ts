import type { Transition, Variants } from "framer-motion";

export const EASE_OUT_EXPO: Transition["ease"] = [0.22, 1, 0.36, 1];

export const revealTransition: Transition = {
  duration: 0.65,
  ease: EASE_OUT_EXPO,
};

export const revealVariants: Variants = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
};

export const revealViewport = { once: true, margin: "-80px" as const };

export const staggerContainer: Variants = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0, transition: revealTransition },
};

export const slidePanel: Variants = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0, transition: revealTransition },
  exit: { opacity: 0, x: -12, transition: { duration: 0.35 } },
};
