"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";
import { accentClass, handleCardMouseMove } from "@/lib/utils";
import type { LabStatus, PortfolioContent } from "@/types/content";

const FILTERS: Array<LabStatus | "All"> = ["All", "Deployed", "Prototype", "Exploring"];

export default function AILab({ content }: { content: PortfolioContent }) {
  const [filter, setFilter] = useState<LabStatus | "All">("All");
  const items =
    filter === "All" ? content.lab : content.lab.filter((item) => item.status === filter);

  return (
    <section id="ai-lab" className="page-section">
      <div className="content-wrap">
        <SectionHeading
          eyebrow="AI Lab"
          title="The next layer of Salesforce delivery."
          copy="Agentforce experiments grounded in Brajesh's existing Service Cloud and Field Service experience—not disconnected AI demos."
          action={
            <div className="filter-row">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={filter === item ? "active" : ""}
                >
                  {item}
                </button>
              ))}
            </div>
          }
        />
        <motion.div layout className="lab-grid">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.article
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                onMouseMove={handleCardMouseMove}
                whileHover={{ y: -4 }}
                className={`lab-card ${accentClass(item.accent)}`}
              >
                <div className="lab-top">
                  <span className="lab-icon">
                    <Icon name="spark" />
                  </span>
                  <span className={`status status-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <div className="tag-list">
                  {item.capabilities.map((capability) => (
                    <span key={capability}>{capability}</span>
                  ))}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
