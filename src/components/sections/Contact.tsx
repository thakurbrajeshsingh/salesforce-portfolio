"use client";

import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import type { PortfolioContent } from "@/types/content";

export default function Contact({ content }: { content: PortfolioContent }) {
  return (
    <section id="contact" className="contact-section">
      <div className="content-wrap">
        <Reveal className="contact-card">
          <div>
            <p className="section-eyebrow">Contact · Next mission</p>
            <h2>Let&apos;s build what service teams need next.</h2>
            <p>{content.profile.summary}</p>
          </div>
          <div className="contact-actions">
            <a href={`mailto:${content.profile.email}`} className="button-light">
              <Icon name="mail" /> Email Brajesh
            </a>
            <a
              href={content.profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="button-outline-light"
            >
              <Icon name="linkedin" /> LinkedIn
            </a>
            <a href={content.profile.resume} download className="text-link">
              Download resume <Icon name="download" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
