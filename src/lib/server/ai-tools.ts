import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { generateQRDataURL } from '@/lib/server/qr-encoder';
import { searchCanvasDocs } from '@/lib/server/tavily';

export const search_canvas = tool({
  description: "Search the official Canvas LMS documentation for answers.",
  inputSchema: z.object({
    query: z.string().describe("The search query, e.g., 'SpeedGrader rubric setup'"),
  }),
  execute: async ({ query }) => {
    try {
      const results = await searchCanvasDocs(query);
      return { success: true, query, results };
    } catch (error) {
      console.error('Canvas search failed:', error);
      return { success: false, error: 'Failed to search Canvas documentation.' };
    }
  },
});

export const generate_doc_link = tool({
  description: "Generates a QR code and returns a direct link to the Canvas documentation.",
  inputSchema: z.object({
    url: z.string().url().describe("The exact URL to the Canvas documentation page"),
    title: z.string().describe("The title of the article or guide"),
  }),
  execute: async ({ url, title }) => {
    try {
      const qrDataUrl = await generateQRDataURL(url);
      return { success: true, url, title, qrDataUrl };
    } catch (error) {
      console.error('QR generation failed:', error);
      return { success: false, error: 'Failed to generate QR code.' };
    }
  },
});