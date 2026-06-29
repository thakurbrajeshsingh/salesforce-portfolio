"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { revealTransition } from "@/lib/animations";
import { accentClass } from "@/lib/utils";
import type { PortfolioContent } from "@/types/content";

export default function ProjectGalaxy({ content }: { content: PortfolioContent }) {
  const [active, setActive] = useState(content.projects[0].id);

  return (
    <section id="projects" className="page-section project-section">
      <div className="content-wrap">
        <SectionHeading
          eyebrow="Project Galaxy"
          title="Projects That Moved The Needle."
          copy="From enterprise service operations to intelligent automation,
explore the systems, decisions, and outcomes behind the work."
        />
        <div className="project-grid">
          {content.projects.map((project, index) => {
            const expanded = active === project.id;
            return (
              <Reveal
                key={project.id}
                as="article"
                delay={index * 0.08}
                transition={{ ...revealTransition, delay: index * 0.08 }}
                className={`project-card ${accentClass(project.accent)} ${expanded ? "expanded" : ""}`}
                onClick={() => setActive(project.id)}
                whileHover={{ y: -6 }}
                layout
              >
                <div className="project-index">{String(index + 1).padStart(2, "0")}</div>
                <p className="card-label">{project.eyebrow}</p>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="project-impact">{project.impact}</div>
                <div className="project-metrics">
                  {project.metrics.map((metric) => (
                    <div key={metric.label}>
                      <strong>{metric.value}</strong>
                      <span>{metric.label}</span>
                    </div>
                  ))}
                </div>
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="project-stack"
                    >
                      {project.stack.map((technology) => (
                        <span key={technology}>{technology}</span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
