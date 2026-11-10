import { tavily } from "@tavily/core";

// Initialize the official Tavily SDK
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY! });

export async function tavilySearch(
  query: string,
  options?: { include_domains?: string[] }
) {
  try {
    const response = await tvly.search(query, {
      // The Hard Network Guardrail: Force the AI to only read the Canvas Community documentation
      // We use options?.include_domains as a fallback if passed from ai-tools, otherwise default to Canvas
      includeDomains: options?.include_domains || ["community.instructure.com"],
      searchDepth: "advanced",
      maxResults: 3,
    });
    
    return response.results;
  } catch (error) {
    console.error("Tavily SDK Search Error:", error);
    throw error;
  }
}