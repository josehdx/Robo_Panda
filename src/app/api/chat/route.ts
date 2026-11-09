import { google } from '@ai-sdk/google';
import { streamText, isStepCount, convertToModelMessages } from 'ai';
import { NextRequest } from 'next/server';
import { search_canvas, generate_doc_link } from '@/lib/server/ai-tools';

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
Your goal is to help educators and students find exact documentation for their Canvas questions.

OPERATIONAL RULES:
1. When a user asks a how-to question, ALWAYS use the 'search_canvas' tool first to find the exact official guide.
2. Summarize the steps briefly in your response.
3. ALWAYS call the 'generate_doc_link' tool using the URL and article title from your search results.
4. Do NOT output markdown image tags or placeholder tokens (such as ![]($QR_IMAGE_0$)) in your text response. The UI will automatically render the QR code card directly from the tool output.
5. If a question is entirely unrelated to Canvas or education technology, politely decline and steer them back to Canvas.`,
      messages: await convertToModelMessages(messages),
      tools: {
        search_canvas,
        generate_doc_link,
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