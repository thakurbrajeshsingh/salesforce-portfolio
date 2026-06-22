# Brajesh Kumar — Salesforce Portfolio

A production-ready, recruiter-focused Salesforce career experience built with **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, and **Framer Motion**.

Premium Apple-quality UI with heavy interactive animation, JSON-driven content, and a modular architecture designed to grow with your career.

## Features

| Section | Description |
|---------|-------------|
| **Mission Control** | Parallax hero with orbital skill visualization and live metrics |
| **Career Timeline** | Interactive chapter selector with animated detail panels |
| **Project Galaxy** | Expandable project cards with impact metrics |
| **Skills Universe** | Grouped proficiency bars with evidence signals |
| **Certification Vault** | Credential ledger that auto-renders from JSON |
| **AI Lab** | Filterable Agentforce experiments by status |
| **Awards** | Recognition highlights |
| **Contact** | Email, LinkedIn, and resume CTAs |

## Folder structure

```text
brajesh-salesforce-portfolio/
├── public/
│   └── resume.pdf
├── src/
│   ├── app/
│   │   ├── globals.css          # Design system + responsive layout
│   │   ├── layout.tsx           # Fonts, metadata, SEO
│   │   ├── page.tsx             # Server entry + JSON-LD schema
│   │   ├── not-found.tsx
│   │   ├── opengraph-image.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx       # Sticky nav + mobile menu
│   │   │   └── Footer.tsx
│   │   ├── sections/
│   │   │   ├── MissionControl.tsx
│   │   │   ├── CareerTimeline.tsx
│   │   │   ├── ProjectGalaxy.tsx
│   │   │   ├── SkillsUniverse.tsx
│   │   │   ├── CertificationVault.tsx
│   │   │   ├── AILab.tsx
│   │   │   ├── Awards.tsx
│   │   │   └── Contact.tsx
│   │   ├── ui/
│   │   │   ├── AnimatedText.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── Reveal.tsx
│   │   │   ├── ScrollProgress.tsx
│   │   │   └── SectionHeading.tsx
│   │   └── portfolio/
│   │       └── PortfolioSite.tsx  # Client orchestrator
│   ├── data/                      # ← Edit content here
│   │   ├── profile.json
│   │   ├── navigation.json
│   │   ├── metrics.json
│   │   ├── experience.json
│   │   ├── projects.json
│   │   ├── skills.json
│   │   ├── certifications.json
│   │   ├── lab.json
│   │   └── awards.json
│   ├── lib/
│   │   ├── animations.ts
│   │   ├── data.ts                # Aggregates JSON → typed content
│   │   └── utils.ts
│   └── types/
│       └── content.ts             # TypeScript interfaces
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Architecture

- **JSON-first content** — All visible copy, skills, projects, and credentials live in `src/data/*.json`.
- **Dynamic UI generation** — Sections map over typed arrays; add a JSON entry and it renders automatically.
- **Server + client split** — `page.tsx` is a Server Component (SEO, JSON-LD). `PortfolioSite.tsx` is the client boundary for animation and interactivity.
- **Reusable primitives** — `Reveal`, `GlassCard`, `AnimatedText`, and shared animation tokens in `lib/animations.ts`.
- **Mobile-first** — Responsive breakpoints at 980px and 680px with reduced-motion support.

## Updating content

Edit files in `src/data/`. No component changes required for most updates.

| File | Add when you need to… |
|------|------------------------|
| `profile.json` | Change name, tagline, contact links |
| `experience.json` | Add a career chapter |
| `projects.json` | Add a project case study |
| `skills.json` | Add a skill group or individual skill |
| `certifications.json` | Add a new credential |
| `lab.json` | Add an AI Lab experiment |
| `awards.json` | Add recognition |
| `navigation.json` | Add a nav link (and matching section `id`) |

Keep new entries aligned with interfaces in `src/types/content.ts`.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production checks

```bash
npm run check
```

Runs ESLint, TypeScript validation, and an optimized production build.

## Deployment

### Vercel (recommended)

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the repository into [Vercel](https://vercel.com).
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `npm run build`
5. Output directory: `.next` (default)
6. Deploy and connect your production domain.
7. Update `metadataBase` in `src/app/layout.tsx`, plus `sitemap.ts` and `robots.ts`, if your domain is not `https://brajeshkumar.dev`.

### Node.js / Docker / VPS

```bash
npm ci
npm run build
npm run start
```

The production server listens on port `3000` by default. Set `PORT` in your hosting environment when required.

### Environment variables

No environment variables are required for the static portfolio. Add `NEXT_PUBLIC_*` vars only if you integrate analytics or a contact form API later.

## Before launch checklist

- [ ] Replace sample email and LinkedIn URL in `profile.json`
- [ ] Replace `public/resume.pdf` with your final resume
- [ ] Confirm certification names and quantified project claims
- [ ] Run Lighthouse against the production URL
- [ ] Verify Open Graph image and JSON-LD structured data
- [ ] Test mobile navigation and reduced-motion preferences

## Tech stack

- [Next.js 16](https://nextjs.org/) — App Router, static generation, SEO
- [TypeScript](https://www.typescriptlang.org/) — End-to-end type safety
- [Tailwind CSS 4](https://tailwindcss.com/) — Utility-first styling
- [Framer Motion 12](https://www.framer.com/motion/) — Scroll, layout, and interaction animation
