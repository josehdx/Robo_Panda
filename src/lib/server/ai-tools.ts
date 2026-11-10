import { tool } from 'ai';
import { z } from 'zod';

// NOTE: Make sure to import your existing Tavily and QR functions here!
// import { tavilySearch } from './tavily';
// import { generateQrDataUrl } from './qr-encoder';

export const search_canvas = tool({
  description: 'Search the official Instructure Canvas Community documentation.',
  parameters: z.object({
    query: z.string().describe('The core search terms (e.g., "add rubric to assignment").'),
    userRole: z.string().describe("The user's role (must be exactly: 'student', 'teacher', 'admin', or 'unknown'). If 'unknown', you must ask the user before searching."),
  }),
  execute: async ({ query, userRole }: { query: string; userRole: string }) => {
    try {
      // Append the role to the search query to force role-specific articles
      const roleFilter = userRole !== 'unknown' ? ` for ${userRole}` : '';
      const optimizedQuery = `${query}${roleFilter}`;

      // Execute your Tavily search (Uncomment and adapt to your actual function)
      // const results = await tavilySearch(optimizedQuery, { include_domains: ["community.instructure.com"] });
      // return { success: true, optimizedQuery, results };
      
      // Temporary return to satisfy TypeScript until you plug in your tavily function
      return { success: true, optimizedQuery, results: [] }; 
    } catch (error) {
      console.error("Canvas Search Error:", error);
      return { success: false, error: "Failed to search Canvas documentation." };
    }
  },
});

export const generate_doc_link = tool({
  description: 'Generate a QR code and actionable link for a Canvas documentation URL.',
  parameters: z.object({
    url: z.string().url().describe('The exact URL of the Canvas documentation article.'),
    title: z.string().describe('The title of the article.'),
  }),
  execute: async ({ url, title }: { url: string; title: string }) => {
    try {
      // Execute your QR generation (Uncomment and adapt to your actual function)
      // const qrDataUrl = await generateQrDataUrl(url);
      // return { success: true, url, title, qrDataUrl };

      // Temporary return to satisfy TypeScript until you plug in your QR function
      return { success: true, url, title, qrDataUrl: "" }; 
    } catch (error) {
      console.error("QR Generation Error:", error);
      return { success: false, error: "Failed to generate QR code." };
    }
  }
});

export const escalate_to_human = tool({
  description: 'Escalate the conversation to a human support agent when requested or when encountering severe frustration or admin-only tasks.',
  parameters: z.object({
    reason: z.string().describe('The reason for escalating to a human.'),
  }),
  execute: async ({ reason }: { reason: string }) => {
    // This tells the UI that the escalation was successful so it can render the Live Chat UI
    return { success: true, escalated: true, reason };
  }
});