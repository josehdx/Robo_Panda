import { tool } from 'ai';
import { z } from 'zod';

import { generateQRDataURL } from './qr-encoder';
import { tavilySearch } from './tavily';

export const search_canvas = tool({
  description: 'Search the official Instructure Canvas Community documentation.',
  parameters: z.object({
    query: z.string().describe('The core search terms (e.g., "add rubric to assignment").'),
    userRole: z.string().describe("The user's role (must be exactly: 'student', 'teacher', 'admin', or 'unknown'). If 'unknown', you must ask the user before searching."),
  }),
  execute: async ({ query, userRole }: { query: string; userRole: string }) => {
    try {
      const roleFilter = userRole !== 'unknown' ? ` for \${userRole}` : '';
      const optimizedQuery = `${query}${roleFilter}`;

      const results = await tavilySearch(optimizedQuery, { include_domains: ["community.instructure.com"] });
      
      return { success: true, optimizedQuery, results, error: undefined };
    } catch (error) {
      console.error("Canvas Search Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { success: false, optimizedQuery: query, results: [], error: `Failed to search: \${errorMessage}` };
    }
  },
});

export const generate_doc_link = tool({
  description: 'Generate a QR code and actionable link for a Canvas documentation URL.',
  parameters: z.object({
    url: z.string().url().describe('The exact URL of the Canvas documentation article.'),
    title: z.string().describe('The title of the article.'),
    // Using an ENUM forces the Lite model to actively select a language from the list
    languageCode: z.enum(['en', 'es', 'pt', 'fr', 'de', 'it', 'zh', 'no'])
      .describe("You MUST detect the user's language and select the exact 2-letter code here. E.g., 'es' for Spanish."),
  }),
  execute: async ({ url, title, languageCode }: { url: string; title: string; languageCode: string }) => {
    try {
      const safeLangCode = (languageCode || 'en').toLowerCase();
      let localizedUrl = url;

      // Only rewrite the URL if the user isn't speaking English
      if (safeLangCode !== 'en') {
        if (url.includes('/en/')) {
          // If the URL has /en/, swap it (e.g. /en/kb/ -> /es/kb/)
          localizedUrl = url.replace('/en/', `/${safeLangCode}/`); } else { // If there is no language code in the URL, inject it right after .com/ localizedUrl = url.replace('.com/', `.com/${safeLangCode}/`);
        }
      }

      const qrDataUrl = await generateQRDataURL(localizedUrl);
      
      return { success: true, url: localizedUrl, title, qrDataUrl, error: undefined };
    } catch (error) {
      console.error("QR Generation Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { success: false, url, title, qrDataUrl: "", error: `Failed to generate QR code: \${errorMessage}` };
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