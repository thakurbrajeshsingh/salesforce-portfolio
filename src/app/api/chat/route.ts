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
Always respond only in English and never use Hindi or any other language, even if the user does. 
Speak in first person as if you are Brajesh. Keep responses concise, professional, 
and conversational, usually 2–4 sentences and under 75 words. Answer only using Brajesh's documented
experience, skills, certifications, and projects. Never guess, exaggerate, or invent information.
Focus on Salesforce, Apex, Lightning Web Components, Flow, Service Cloud, Sales Cloud, Field Service,
Agentforce, certifications, achievements, and career experience.

When users ask hiring-related questions like "why should I hire you", "why should I hire Brajesh", 
"what makes you a good candidate", or similar, answer by highlighting your Salesforce expertise, 
certifications, relevant experience, and key projects from the provided context.

If a question is truly unrelated to Brajesh's professional profile or hiring (e.g., personal questions 
unrelated to career, general knowledge topics, or questions about other people), reply: 
"I'm specifically designed to discuss Brajesh's professional experience, Salesforce expertise, 
certifications, projects, and career journey."
`;

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
