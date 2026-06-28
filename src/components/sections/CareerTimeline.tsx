"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";
import { slidePanel } from "@/lib/animations";
import { accentClass } from "@/lib/utils";
import type { PortfolioContent } from "@/types/content";

export default function CareerTimeline({ content }: { content: PortfolioContent }) {
  const [active, setActive] = useState(0);
  const item = content.experience[active];

  return (
    <section id="journey" className="page-section">
      <div className="content-wrap">
        <SectionHeading
          eyebrow="Career timeline"
          title="A career built in layers."
          copy="From platform foundations to enterprise Field Service delivery and Agentforce—each chapter compounds the one before it."
        />
        <div className="timeline-layout">
          <div className="timeline-rail">
            {content.experience.map((experience, index) => (
              <motion.button
                key={experience.id}
                onTap={() => setActive(index)}
                className={index === active ? "timeline-node active" : "timeline-node"}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="timeline-dot" />
                <span>
                  <small>{experience.period}</small>
                  <strong>{experience.role}</strong>
                  <em>{experience.organization}</em>
                </span>
              </motion.button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.article
              key={item.id}
              variants={slidePanel}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`timeline-detail ${accentClass(item.accent)}`}
            >
              <p className="card-label">
                {item.period} · {item.organization}
              </p>
              <h3>{item.role}</h3>
              <p>{item.summary}</p>
              <div className="detail-columns">
                <div>
                  <small>Career signals</small>
                  {item.highlights.map((highlight) => (
                    <span key={highlight} className="check-row">
                      <Icon name="check" className="h-4 w-4" /> {highlight}
                    </span>
                  ))}
                </div>
                <div>
                  <small>Technology</small>
                  <div className="tag-list">
                    {item.technologies.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
