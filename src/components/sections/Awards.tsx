import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { revealTransition } from "@/lib/animations";
import type { PortfolioContent } from "@/types/content";

export default function Awards({ content }: { content: PortfolioContent }) {
  return (
    <section id="awards" className="page-section awards-section">
      <div className="content-wrap">
        <SectionHeading
          eyebrow="Recognition"
          title="Impact noticed by others."
          copy="Delivery excellence, client trust, and technical growth—signals that complement the technical evidence."
        />
        <div className="awards-grid">
          {content.awards.map((award, index) => (
            <Reveal
              key={award.id}
              as="article"
              delay={index * 0.1}
              transition={{ ...revealTransition, delay: index * 0.1 }}
              className="award-card"
              whileHover={{ y: -4 }}
            >
              <span className="award-number">{String(index + 1).padStart(2, "0")}</span>
              <p className="card-label">
                {award.category} · {award.year}
              </p>
              <h3>{award.title}</h3>
              <p>{award.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
