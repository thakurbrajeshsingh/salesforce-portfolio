import type { PortfolioContent } from "@/types/content";

export default function Footer({ content }: { content: PortfolioContent }) {
  return (
    <footer className="site-footer">
      <div className="content-wrap">
        <span>© {new Date().getFullYear()} {content.profile.name}</span>
        {/* <span>Built with Next.js · TypeScript · Tailwind CSS · Framer Motion</span> */}
      </div>
    </footer>
  );
}
