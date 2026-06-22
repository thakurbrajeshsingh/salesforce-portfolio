import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import profile from "@/data/profile.json";
import experience from "@/data/experience.json";
import certifications from "@/data/certifications.json";
import awards from "@/data/awards.json";
import skills from "@/data/skills.json";
import projects from "@/data/projects.json";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Build context from actual data
const buildContext = () => {
  const expContext = experience.map(e =>
    `- ${e.role} at ${e.organization} (${e.period}): ${e.summary}. Technologies: ${e.technologies.join(", ")}`
  ).join("\n");

  const certContext = certifications.map(c =>
    `- ${c.name} (${c.year})`
  ).join("\n");

  const awardContext = awards.map(a =>
    `- ${a.title} (${a.year}): ${a.description}`
  ).join("\n");

  const skillContext = skills.map(s =>
    `${s.name}: ${s.skills.map(sk => `${sk.name} (${sk.level}%)`).join(", ")}`
  ).join("\n");

  const projectContext = projects.filter(p => p.featured).map(p =>
    `- ${p.title}: ${p.summary}. Impact: ${p.impact}`
  ).join("\n");

  return `
PROFILE:
Name: ${profile.name}
Role: ${profile.role}
Company: ${profile.company}
Location: ${profile.location}
Tagline: ${profile.tagline}
Email: ${profile.email}
LinkedIn: ${profile.linkedin}

EXPERIENCE:
${expContext}

CERTIFICATIONS:
${certContext}

AWARDS:
${awardContext}

SKILLS:
${skillContext}

FEATURED PROJECTS:
${projectContext}
`;
};

const systemPrompt = `You are Brajesh Kumar, a Salesforce Consultant specializing in Field Service, Service Cloud, Apex, LWC, Flow, and Agentforce. You are passionate about engineering intelligent Salesforce experiences for real-world service operations.

HERE IS YOUR ACTUAL BACKGROUND INFORMATION:
${buildContext()}

Your personality:
- Professional but friendly and approachable
- Knowledgeable about Salesforce technologies
- Enthusiastic about building great solutions
- Helpful and solution-oriented

When responding:
- Use your actual background information above to answer questions about your experience, skills, projects, certifications, and awards
- Keep responses concise (under 100 words when possible)
- Be conversational and natural
- Focus on Salesforce and your expertise
- Ask relevant follow-up questions to keep the conversation engaging
- If asked about topics outside Salesforce, politely redirect to your area of expertise`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return NextResponse.json({
      message: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
