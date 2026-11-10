# Canvas LMS Assistant: Project Build Summary

This document outlines the architectural transition of the project from a legacy guitar preset/QR generator into a fully functional Canvas LMS documentation support assistant. 

## Prerequisites and Core Stack

To build and run this architecture, the following foundational tools and services were utilized:

*   **Node.js & npm:** The core runtime and package manager used for handling dependencies, resolving module mismatches, and running the local development server.
*   **Docker:** Supported via the repository's `Dockerfile` and `docker-compose.yml` for isolated containerization and deployment.
*   **Next.js (App Router):** The full-stack React framework driving both the frontend UI (`page.tsx`) and the backend API endpoint (`route.ts`).
*   **Vercel AI SDK (v7.x):** The library managing the LLM data stream, tool calling structures, and UI message states.
*   **Google AI Studio & Gemini:** The inference engine, specifically utilizing `gemini-3.6-flash` authenticated via the `x-goog-api-key` header to bypass previous OpenAI quota limits.
*   **Tavily API:** The search integration strictly scoped to query official documentation at `community.instructure.com`.
*   **Zod:** Used for strict schema validation when defining AI tool inputs.
*   **cURL:** The command-line HTTP client heavily utilized to diagnose API connectivity, payload formatting, and model availability.

---

## Stage 1: The Codebase Pivot & Environment Rescue
The project began by adapting a legacy repository. The initial hurdles involved clearing terminal startup errors, fixing broken symlinks by wiping and reinstalling `node_modules`, and addressing an OpenAI `insufficient_quota` block. This required modifying the `.env` file to correctly format the `GOOGLE_GENERATIVE_AI_API_KEY` to route all intelligence through a free-tier Google Gemini model.

## Stage 2: SDK Tooling & Schema Modernization
Because the legacy project used an older Vercel AI SDK, Next.js failed to compile the new Canvas tools. This stage focused on bringing the backend up to SDK 7 standards:
*   Refactored `ai-tools.ts` to replace the outdated `parameters` object with `inputSchema` for the `search_canvas` and `generate_doc_link` tools.
*   Updated `route.ts` to drop the deprecated `maxSteps` parameter in favor of `stopWhen: isStepCount(5)`.

## Stage 3: Network Diagnostics & Model Routing
When the frontend failed to receive responses, we used terminal `cURL` commands to probe Google's endpoints directly. This revealed that the originally specified `gemini-1.5-flash` model was decommissioned (returning 404 errors). We navigated through `gemini-3.8-flash` (which hit a 503 high-demand spike) before stabilizing the backend on **`gemini-3.6-flash`**.

## Stage 4: Resolving Stream Serialization (The Silent Failure)
Even with active models, the chat UI remained unresponsive due to a payload mismatch. The frontend was sending modern message objects containing a `parts` array, but the Gemini provider expected a standard `content` string. We fixed this fatal crash by importing `convertToModelMessages` into `route.ts`, which safely serialized the UI payload for the backend.

## Stage 5: Frontend Rendering & Final Polish
With the data stream flowing properly, the final stage involved binding the AI's tool execution to the browser UI:
*   Updated `page.tsx` to actively listen for `tool-generate_doc_link` rather than the legacy QR tool.
*   Added regex filtering to strip raw Markdown image placeholders (`![]($QR_IMAGE_0$)`) that the LLM occasionally leaked into the text.
*   Constructed the visual QR card to display the generated Canvas guide link, the scannable QR code, and a download button.
*   Polished the user experience by renaming the application in `layout.tsx` and `package.json`, and stripping out a broken `VERSION.txt` fetch script that was causing terminal noise.