"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { Send, Download, Loader2, Bot, User, ExternalLink, Headset } from "lucide-react";

export default function Home() {
  // 1. Revert to empty useChat() to fix the Type Error
  const { messages, sendMessage, status } = useChat();
  
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDownload = (dataUrl: string, filename: string = "canvas-guide-qr.png") => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const content = input;
    setInput("");
    await sendMessage({
      role: "user",
      parts: [{ type: "text", text: content }],
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* 2. Render the Welcome Message manually when chat is empty */}
        {messages.length === 0 && (
          <div className="flex items-start gap-3 flex-row">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <Bot size={16} />
            </div>
            <div className="flex flex-col max-w-[80%] items-start">
              <div className="px-4 py-3 rounded-2xl mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  Hello! I am your Instructure Canvas LMS support assistant.{"\n\n"}
                  I am here to help educators, students, and administrators with anything related to Canvas LMS. Here is what I can do for you:{"\n\n"}
                  - **Answer How-To Questions:** Provide step-by-step guidance on setting up courses, using SpeedGrader, managing assignments, configuring rubrics, handling quizzes, managing grades, and more.{"\n"}
                  - **Find Official Documentation:** Search the official Canvas Community guides to ensure you get accurate, up-to-date instructions.{"\n"}
                  - **Provide Direct Links & QR Codes:** Generate direct links and QR codes to Canvas documentation so you can easily access full guides on any device.{"\n\n"}
                  How can I help you with Canvas today?
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div
              className={`flex flex-col max-w-[80%] ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {m.parts?.map((part: any, index: number) => {
                if (part.type === "text") {
                  const cleanedText = part.text
                    .replace(/!\[\]\(\$QR_IMAGE_\d+\$\)/g, "")
                    .trim();

                  if (!cleanedText) return null;

                  return (
                    <div
                      key={index}
                      className={`px-4 py-3 rounded-2xl mb-2 ${
                        m.role === "user"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {cleanedText}
                      </p>
                    </div>
                  );
                }

                // Handle generate_doc_link
                const isDocLinkTool =
                  part.type === "tool-generate_doc_link" ||
                  (part.type === "tool-invocation" &&
                    part.toolInvocation?.toolName === "generate_doc_link");

                if (isDocLinkTool) {
                  const state = part.state ?? part.toolInvocation?.state;
                  const output = part.output ?? part.toolInvocation?.result;
                  const isPending =
                    state === "input-streaming" ||
                    state === "input-available" ||
                    state === "call";

                  return (
                    <div key={index} className="mt-2 w-full">
                      {isPending ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          Generating documentation link & QR code...
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm max-w-sm">
                          {output?.success ? (
                            <>
                              <a
                                href={output.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline break-words text-center"
                              >
                                {output.title || "Official Canvas Documentation"}
                                <ExternalLink size={14} className="shrink-0" />
                              </a>

                              <img
                                src={output.qrDataUrl}
                                alt="Canvas Documentation QR Code"
                                className="w-44 h-44 rounded-lg bg-white p-2 shadow-inner border border-gray-200"
                              />

                              <button
                                onClick={() =>
                                  handleDownload(
                                    output.qrDataUrl,
                                    `${(output.title || "canvas-guide").replace(/\s+/g, "_")}.png`
                                  )
                                }
                                className="flex items-center gap-2 px-4 py-2 w-full justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                              >
                                <Download size={14} />
                                Download QR Code
                              </button>
                            </>
                          ) : (
                            <div className="text-red-500 text-xs">
                              Unable to generate documentation link and QR code.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                // Handle escalate_to_human
                const isEscalateTool =
                  part.type === "tool-escalate_to_human" ||
                  (part.type === "tool-invocation" &&
                    part.toolInvocation?.toolName === "escalate_to_human");
                    
                if (isEscalateTool) {
                  const state = part.state ?? part.toolInvocation?.state;
                  const isPending =
                    state === "input-streaming" ||
                    state === "input-available" ||
                    state === "call";

                  if (isPending) return null;

                  return (
                    <div key={index} className="mt-2 w-full max-w-sm">
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/50 flex flex-col gap-3 items-center text-center shadow-sm">
                        <Headset className="w-6 h-6 text-red-600 dark:text-red-400" />
                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">Connecting you to a human agent...</p>
                        <button 
                          onClick={() => window.open('https://help.instructure.com', '_blank')} 
                          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Open Live Support
                        </button>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="p-4 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800"
      >
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a Canvas question (e.g. 'How do I add a rubric to an assignment?')..."
            className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-900 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 rounded-xl outline-none transition-all text-sm text-gray-900 dark:text-gray-100"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}