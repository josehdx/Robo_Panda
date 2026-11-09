import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function searchCanvasDocs(query: string) {
  const response = await tvly.search(query, {
    // Force the AI to only read the Canvas Community documentation
    includeDomains: ["community.instructure.com"],
    searchDepth: "advanced",
    maxResults: 3,
  });
  return response.results;
}