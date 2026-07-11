"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PortfolioSite from "@/components/portfolio/PortfolioSite";
import VoiceChat from "@/components/VoiceChat";
import { getPortfolioContent } from "@/lib/data";

export default function Home() {
  const [mode, setMode] = useState<"selection" | "normal" | "ai">("selection");
  const content = getPortfolioContent();

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.profile.name,
    jobTitle: content.profile.role,
    worksFor: { "@type": "Organization", name: content.profile.company },
    url: "https://brajeshkumar.dev",
    sameAs: [content.profile.linkedin],
    knowsAbout: content.skillGroups.flatMap((group) =>
      group.skills.map((skill) => skill.name),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
        }}
      />
      
      <AnimatePresence>
        {mode === "selection" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mode-overlay"
          >
            <div className="mode-overlay-content">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mode-overlay-title"
              >
                Welcome to Brajesh's Portfolio
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mode-overlay-subtitle"
              >
                Choose how you'd like to explore
              </motion.p>

              <div className="mode-buttons-grid">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode("normal")}
                  className="mode-button normal-mode"
                >
                  <span className="mode-button-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </span>
                  <div className="mode-button-content">
                    <h3>Normal Mode</h3>
                    <p>Browse the traditional portfolio</p>
                  </div>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode("ai")}
                  className="mode-button ai-mode"
                >
                  <span className="mode-button-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </span>
                  <div className="mode-button-content">
                    <h3>AI Mode</h3>
                    <p>Talk with Brajesh AI</p>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mode === "ai" && (
        <div className="ai-mode-fullscreen">
          <VoiceChat onClose={() => setMode("selection")} />
        </div>
      )}

      {mode === "normal" && <PortfolioSite content={content} />}
    </>
  );
}
