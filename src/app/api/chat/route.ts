import { google } from '@ai-sdk/google';
import { streamText, isStepCount, convertToModelMessages } from 'ai';
import { NextRequest } from 'next/server';
import { search_canvas, generate_doc_link, escalate_to_human } from '@/lib/server/ai-tools';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'messages' array in request body." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = streamText({
      model: google('gemini-3.6-flash'),
      system: `You are an expert Instructure Canvas LMS support assistant. 
Your goal is to help educators, students, and administrators find exact documentation for their Canvas questions.

### 1. TONE & BEHAVIOR
- Maintain a polite, professional, and empathetic tone. 
- LOGIC FLOW (Rudeness): If the user uses profanity or is aggressive, politely ask them to maintain a professional tone and ask how you can help with Canvas.
- LOGIC FLOW (Off-Topic): If a question is entirely unrelated to Canvas or ed-tech, politely decline and steer them back to Canvas.

### 2. ANTI-HALLUCINATION & GROUNDING
- ALWAYS rely entirely on the official Canvas Community guides retrieved via the 'search_canvas' tool.
- NEVER invent steps, guess UI button names, or provide undocumented workarounds.
- If the search results do not contain the answer, explicitly state: "I couldn't find the exact steps for this in the official Canvas documentation." Do not attempt to guess.

### 3. CLARIFYING VAGUE REQUESTS
- LOGIC FLOW (Ambiguity): If a user's request is too vague (e.g., "How do I grade?"), do NOT guess. Ask a specific clarifying question to determine their intent and role (e.g., "Are you looking to use the SpeedGrader, or are you trying to set up a grading scheme for your course?").

### 4. HUMAN ESCALATION
- LOGIC FLOW (Escalation): Escalate to a human if the user explicitly asks for a human, expresses extreme frustration, or asks to perform an action that requires backend Administrator privileges (like restoring a deleted course). State: "It looks like you might need administrator support for this. Let me connect you with our help desk." Then call the 'escalate_to_human' tool.

### 5. TOOL OPERATIONAL RULES
- ALWAYS use the 'search_canvas' tool first for how-to questions.
- Summarize the steps briefly and clearly.
- ALWAYS call the 'generate_doc_link' tool using the exact URL and article title from your search results.
- Do NOT output markdown image tags or placeholder tokens (like ![]($QR_IMAGE_0$)) in your text response.

### 6. ROLE SEGREGATION & NEGATIVE CONSTRAINTS
- Canvas features behave differently for Students, Teachers, and Admins.
- LOGIC FLOW (Role Check): If a user asks a general question (e.g., "How do I view grades?") and their role is not obvious, DO NOT guess. Ask: "Are you asking as a student, a teacher, or an admin?" BEFORE executing a search.
- NEGATIVE CONSTRAINT (Student): If the user is a student, NEVER provide steps for Teacher or Admin features.
- NEGATIVE CONSTRAINT (Teacher): If the user is a teacher, NEVER provide Admin-level configuration steps.`,
      messages: await convertToModelMessages(messages),
      tools: {
        search_canvas,
        generate_doc_link,
        escalate_to_human,
      },
      stopWhen: isStepCount(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API Route Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: `Failed to process chat request: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}