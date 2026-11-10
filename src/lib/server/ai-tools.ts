import { tool } from 'ai';
import { z } from 'zod';

// 1. Fixed the QR import to match your file exactly
import { generateQRDataURL } from './qr-encoder';

// 2. TAVILY IMPORT FIX: 
// If your tavily.ts file exports a function named 'search', use this:
// import { search as tavilySearch } from './tavily';
// If it exports 'tavily', use: import { tavily as tavilySearch } from './tavily';
import { tavilySearch } from './tavily'; // <--- Update this line based on what is actually inside your tavily.ts file!

export const search_canvas = tool({
  description: 'Search the official Instructure Canvas Community documentation.',
  parameters: z.object({
    query: z.string().describe('The core search terms (e.g., "add rubric to assignment").'),
    userRole: z.string().describe("The user's role (must be exactly: 'student', 'teacher', 'admin', or 'unknown'). If 'unknown', you must ask the user before searching."),
  }),
  execute: async ({ query, userRole }: { query: string; userRole: string }) => {
    try {
      const roleFilter = userRole !== 'unknown' ? ` for ${userRole}` : '';
      const optimizedQuery = `${query}${roleFilter}`;

      const results = await tavilySearch(optimizedQuery, { include_domains: ["community.instructure.com"] });
      
      // 3. Fixed Type Overload: Both try/catch now return the exact same object keys
      return { success: true, optimizedQuery, results, error: undefined };
    } catch (error) {
      console.error("Canvas Search Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { success: false, optimizedQuery: query, results: [], error: `Failed to search: ${errorMessage}` };
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
      // Used the corrected function name here
      const qrDataUrl = await generateQRDataURL(url);
      
      // 3. Fixed Type Overload: Both try/catch now return the exact same object keys
      return { success: true, url, title, qrDataUrl, error: undefined };
    } catch (error) {
      console.error("QR Generation Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { success: false, url, title, qrDataUrl: "", error: `Failed to generate QR code: ${errorMessage}` };
    }
  }
});

export const escalate_to_human = tool({
  description: 'Escalate the conversation to a human support agent when requested or when encountering severe frustration or admin-only tasks.',
  parameters: z.object({
    reason: z.string().describe('The reason for escalating to a human.'),
  }),
  execute: async ({ reason }: { reason: string }) => {
    return { success: true, escalated: true, reason };
  }
});