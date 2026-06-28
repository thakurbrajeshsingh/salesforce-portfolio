"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import AnimatedText from "@/components/ui/AnimatedText";
import GlassCard from "@/components/ui/GlassCard";
import Icon from "@/components/ui/Icon";
import VoiceChat from "@/components/VoiceChat";
import CountUp from "@/components/ui/CountUp";
import type { PortfolioContent } from "@/types/content";

const TAGLINES = [
  "Engineering intelligent Salesforce experiences for real-world operations.",
  "Integrating Agentforce AI to supercharge enterprise service workflows.",
  "Developing scalable Apex, LWC, and Flow systems on the Core platform.",
  "Architecting FSL field operational strategies for global teams."
];

export default function MissionControl({ content }: { content: PortfolioContent }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.3]);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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

          <div style={{ minHeight: "4.5rem", marginTop: "1.55rem" }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="hero-tagline"
                style={{ margin: 0 }}
              >
                {TAGLINES[taglineIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

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
              <span>Agent Mode</span>
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
              <motion.div
                className="profile-core"
                onTap={() => setShowVoiceChat(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ cursor: "pointer" }}
              >
                <motion.div
                  className="pulse-ring"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.3, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>Brajesh AI</span>
                <small>Click To Chat</small>
              </motion.div>
              {content.profile.orbitSkills.map((item, index) => {
                const radiusX = 8 + (index % 3) * 2;
                const radiusY = 6 + (index % 2) * 3;
                
                const phases = [
                  { x: [0, radiusX, 0, -radiusX, 0], y: [-radiusY, 0, radiusY, 0, -radiusY] },
                  { x: [radiusX, 0, -radiusX, 0, radiusX], y: [0, radiusY, 0, -radiusY, 0] },
                  { x: [0, -radiusX, 0, radiusX, 0], y: [radiusY, 0, -radiusY, 0, radiusY] },
                  { x: [-radiusX, 0, radiusX, 0, -radiusX], y: [0, -radiusY, 0, radiusY, 0] },
                  { x: [radiusX * 0.7, -radiusX * 0.7, -radiusX * 0.7, radiusX * 0.7, radiusX * 0.7], y: [-radiusY * 0.7, -radiusY * 0.7, radiusY * 0.7, radiusY * 0.7, -radiusY * 0.7] }
                ];
                
                const motionPath = phases[index % phases.length];

                return (
                  <motion.span
                    key={item}
                    className={`orbit-skill orbit-skill-${index + 1}`}
                    animate={{
                      x: motionPath.x,
                      y: motionPath.y,
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 8 + index * 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {item}
                  </motion.span>
                );
              })}
            </div>
            <div className="metric-grid">
              {content.metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <strong>
                    <CountUp value={metric.value} />
                  </strong>
                  <span>{metric.label}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <AnimatePresence>
        {showVoiceChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="voice-chat-overlay"
            onClick={() => setShowVoiceChat(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <VoiceChat onClose={() => setShowVoiceChat(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0.9, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        aria-hidden="true"
      >
        <span className="scroll-indicator-mouse">
          <span className="scroll-indicator-wheel" />
        </span>
        <span className="scroll-indicator-arrow" />
      </motion.div>
    </section>
  );
}
