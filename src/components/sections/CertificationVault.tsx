import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import { revealTransition } from "@/lib/animations";
import { accentClass } from "@/lib/utils";
import type { PortfolioContent } from "@/types/content";

export default function CertificationVault({ content }: { content: PortfolioContent }) {
  return (
    <section id="certifications" className="page-section vault-section">
      <div className="content-wrap">
        <SectionHeading
          eyebrow="Certification Vault"
          title="Certified across clouds. Proven in delivery."
          copy="From platform foundations to AI-powered experiences, each certification represents a step toward the future of enterprise technology."
        />
        <div className="vault-grid">
          {content.certifications.map((certification, index) => (
            <Reveal
              key={certification.id}
              as="article"
              delay={index * 0.08}
              transition={{ ...revealTransition, delay: index * 0.08 }}
              className={`vault-card ${accentClass(certification.accent)}`}
              whileHover={{ y: -4 }}
            >
              <div className="vault-seal">
                <Icon name="check" />
              </div>
              <p className="card-label">
                {certification.issuer} · {certification.year}
              </p>
              <h3>{certification.name}</h3>
              <span>{certification.level}</span>
              <div className="vault-code">SFDC / {certification.id.toUpperCase()}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
