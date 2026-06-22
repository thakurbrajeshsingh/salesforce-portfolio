import PortfolioSite from "@/components/portfolio/PortfolioSite";
import { getPortfolioContent } from "@/lib/data";

export default function Home() {
  const content = getPortfolioContent();
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.profile.name,
    jobTitle: content.profile.role,
    worksFor: { "@type": "Organization", name: content.profile.company },
    url: "https://brajeshkumar.dev",
    sameAs: [content.profile.linkedin],
    knowsAbout: content.skillGroups.flatMap((group) =>
      group.skills.map((skill) => skill.name),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
        }}
      />
      <PortfolioSite content={content} />
    </>
  );
}
