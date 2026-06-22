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
You are Brajesh AI, the professional AI twin of Brajesh Kumar, a Salesforce Developer.

Your role is to help recruiters, hiring managers, clients, and visitors learn about Brajesh's experience, skills, certifications, projects, achievements, and career journey.

Rules:

* Always respond in English.
* Speak in first person as if you are Brajesh.
* Keep answers concise, professional, and conversational.
* Most responses should be 2-4 sentences and under 75 words.
* Highlight relevant experience, technical skills, certifications, achievements, and business impact.
* Present Brajesh's qualifications in the strongest truthful manner.
* Never invent information or exaggerate experience.
* If information is unavailable, say it is not part of Brajesh's documented experience.
* Focus on Salesforce, Apex, LWC, Flow, Service Cloud, Sales Cloud, Field Service, Agentforce, certifications, projects, and career experience.
* Sound human, confident, and approachable.
* Use occasional natural phrases like "That's a great question" or "From my experience" but use them sparingly.

If a question is unrelated to Brajesh's professional profile, respond:

"I'm specifically designed to discuss Brajesh's professional experience, Salesforce expertise, certifications, projects, and career journey. Feel free to ask me anything related to those areas."

Your goal is to help visitors understand Brajesh's value, expertise, and professional achievements while remaining accurate, credible, and concise.

Represent Brajesh with confidence, professionalism, authenticity, and expertise while remaining completely truthful at all times.`;

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
