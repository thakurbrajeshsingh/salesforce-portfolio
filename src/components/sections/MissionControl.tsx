"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import AnimatedText from "@/components/ui/AnimatedText";
import GlassCard from "@/components/ui/GlassCard";
import Icon from "@/components/ui/Icon";
import type { PortfolioContent } from "@/types/content";

export default function MissionControl({ content }: { content: PortfolioContent }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.3]);

  return (
    <section id="top" ref={ref} className="hero-section">
      <div className="hero-glow hero-glow-one" />
      <div className="hero-glow hero-glow-two" />
      <motion.div
        className="hero-aurora"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      />

      <div className="content-wrap hero-grid">
        <motion.div style={{ y, opacity }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="availability-pill"
          >
            <span />
            {content.profile.availability}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="hero-kicker"
          >
            WELCOME TO THE ECOSYSTEM
          </motion.p>

          <h1>
            <AnimatedText text="Brajesh Kumar's" as="span" className="hero-line" />
            <br />
            <AnimatedText text="Salesforce Universe." as="span" className="hero-line hero-gradient" />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.35 }}
            className="hero-tagline"
          >
            {content.profile.tagline}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.45 }}
            className="hero-summary"
          >
            {content.profile.summary}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.55 }}
            className="hero-actions"
          >
            <motion.a
              href="#projects"
              className="button-primary"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore impact <Icon name="arrow" />
            </motion.a>
            <motion.a
              href={content.profile.resume}
              download
              className="button-secondary"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Download resume <Icon name="download" />
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="hero-proof"
          >
            <span>Salesforce</span>
            <i />
            <span>Agentforce</span>
            <i />
            <span>Beyond</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
        >
          <GlassCard glow className="mission-card">
            <div className="mission-card-top">
              <span>Candidate signal</span>
              <span className="live-signal">Live profile</span>
            </div>
            <div className="profile-orbit">
              <motion.div
                className="orbit-ring orbit-ring-one"
                animate={{ rotate: 360 }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="orbit-ring orbit-ring-two"
                animate={{ rotate: -360 }}
                transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
              />
              <div className="profile-core">
                <span>Brajesh Ai</span>
                {/* <small>{content.profile.role}</small> */}
              </div>
              {content.profile.orbitSkills.map((item, index) => (
                <motion.span
                  key={item}
                  className={`orbit-skill orbit-skill-${index + 1}`}
                  animate={{ y: [0, -6, 0], scale: [1, 1.04, 1] }}
                  transition={{
                    duration: 3 + index * 0.35,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {item}
                </motion.span>
              ))}
            </div>
            <div className="metric-grid">
              {content.metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
