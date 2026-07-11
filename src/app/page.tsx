"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PortfolioSite from "@/components/portfolio/PortfolioSite";
import VoiceChat from "@/components/VoiceChat";
import { getPortfolioContent } from "@/lib/data";

function ModeButton({ icon, label, onClick, variant, delay }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant: "normal" | "ai";
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`clean-mode-button ${variant}`}
    >
      <div className="clean-button-icon">
        {icon}
      </div>
      <span className="clean-button-label">{label}</span>
    </motion.button>
  );
}

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
            transition={{ duration: 0.5 }}
            className="mode-overlay"
          >
            <div className="mode-overlay-content">
              <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="clean-logo"
              >
                BK
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="clean-subtitle"
              >
                Welcome to my portfolio
              </motion.p>

              <div className="clean-buttons-container">
                <ModeButton
                  icon={
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  }
                  label="Browse Portfolio"
                  onClick={() => setMode("normal")}
                  variant="normal"
                  delay={0.6}
                />

                <ModeButton
                  icon={
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  }
                  label="Talk with AI"
                  onClick={() => setMode("ai")}
                  variant="ai"
                  delay={0.8}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mode === "ai" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="ai-mode-fullscreen"
        >
          <VoiceChat onClose={() => setMode("selection")} />
        </motion.div>
      )}

      {mode === "normal" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <PortfolioSite content={content} />
        </motion.div>
      )}
    </>
  );
}
