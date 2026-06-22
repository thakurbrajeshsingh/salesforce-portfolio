export type Accent = "blue" | "cyan" | "violet" | "green" | "orange" | "pink";

export interface Profile {
  name: string;
  role: string;
  company: string;
  location: string;
  tagline: string;
  summary: string;
  email: string;
  linkedin: string;
  resume: string;
  availability: string;
  orbitSkills: string[];
}

export interface Metric {
  value: string;
  label: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Experience {
  id: string;
  period: string;
  role: string;
  organization: string;
  summary: string;
  highlights: string[];
  technologies: string[];
  accent: Accent;
}

export interface Project {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  impact: string;
  metrics: Metric[];
  stack: string[];
  accent: Accent;
  featured: boolean;
}

export interface Skill {
  name: string;
  level: number;
  evidence: string;
}

export interface SkillGroup {
  id: string;
  name: string;
  description: string;
  accent: Accent;
  skills: Skill[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  level: string;
  accent: Accent;
}

export type LabStatus = "Deployed" | "Prototype" | "Exploring";

export interface LabItem {
  id: string;
  title: string;
  status: LabStatus;
  summary: string;
  capabilities: string[];
  accent: Accent;
}

export interface Award {
  id: string;
  title: string;
  year: string;
  category: string;
  description: string;
}

export interface PortfolioContent {
  profile: Profile;
  metrics: Metric[];
  navigation: NavItem[];
  experience: Experience[];
  projects: Project[];
  skillGroups: SkillGroup[];
  certifications: Certification[];
  lab: LabItem[];
  awards: Award[];
}
