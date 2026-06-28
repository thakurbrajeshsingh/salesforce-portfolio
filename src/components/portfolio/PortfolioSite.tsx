"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/ui/ScrollProgress";
import MissionControl from "@/components/sections/MissionControl";
import CareerTimeline from "@/components/sections/CareerTimeline";
import ProjectGalaxy from "@/components/sections/ProjectGalaxy";
import SkillsUniverse from "@/components/sections/SkillsUniverse";
import CertificationVault from "@/components/sections/CertificationVault";
import AILab from "@/components/sections/AILab";
import Awards from "@/components/sections/Awards";
import Contact from "@/components/sections/Contact";
import type { PortfolioContent } from "@/types/content";

export default function PortfolioSite({ content }: { content: PortfolioContent }) {
  return (
    <div className="portfolio-shell">
      <ScrollProgress />
      <div className="ambient-grid" aria-hidden="true" />
      <div className="ambient-orbs" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>
      <Header content={content} />
      <main>
        <MissionControl content={content} />
        <CareerTimeline content={content} />
        <ProjectGalaxy content={content} />
        <SkillsUniverse content={content} />
        <CertificationVault content={content} />
        <AILab content={content} />
        <Awards content={content} />
        <Contact content={content} />
      </main>
      <Footer content={content} />
    </div>
  );
}
