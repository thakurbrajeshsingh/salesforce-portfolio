"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { accentClass } from "@/lib/utils";
import type { PortfolioContent } from "@/types/content";

export default function SkillsUniverse({ content }: { content: PortfolioContent }) {
  const [active, setActive] = useState(content.skillGroups[0].id);
  const selected = content.skillGroups.find((group) => group.id === active)!;

  return (
    <section id="skills" className="page-section">
      <div className="content-wrap">
        <SectionHeading
          eyebrow="Skills Universe"
          title="Depth where it matters. Range where it counts."
          copy="Skills are grouped by the outcomes they enable, with transparent proficiency signals and delivery evidence."
        />
        <div className="skills-layout">
          <div className="skill-group-list">
            {content.skillGroups.map((group) => (
              <motion.button
                key={group.id}
                onClick={() => setActive(group.id)}
                className={`skill-group ${accentClass(group.accent)} ${active === group.id ? "active" : ""}`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span>{group.name}</span>
                <small>{group.skills.length} capabilities</small>
              </motion.button>
            ))}
          </div>
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className={`skills-panel ${accentClass(selected.accent)}`}
          >
            <p className="card-label">{selected.name}</p>
            <h3>{selected.description}</h3>
            <div className="skill-bars">
              {selected.skills.map((skill, index) => (
                <div key={skill.name} className="skill-row">
                  <div>
                    <strong>{skill.name}</strong>
                    <span>{skill.evidence}</span>
                  </div>
                  <b>{skill.level}%</b>
                  <div className="skill-track">
                    <motion.span
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: index * 0.12 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
