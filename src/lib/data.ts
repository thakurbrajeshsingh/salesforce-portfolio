import profile from "@/data/profile.json";
import navigation from "@/data/navigation.json";
import metrics from "@/data/metrics.json";
import experience from "@/data/experience.json";
import projects from "@/data/projects.json";
import skillGroups from "@/data/skills.json";
import certifications from "@/data/certifications.json";
import lab from "@/data/lab.json";
import awards from "@/data/awards.json";
import type { PortfolioContent } from "@/types/content";

/** Aggregates modular JSON data into a single typed portfolio object. */
export function getPortfolioContent(): PortfolioContent {
  return {
    profile,
    navigation,
    metrics,
    experience,
    projects,
    skillGroups,
    certifications,
    lab,
    awards,
  } as PortfolioContent;
}
