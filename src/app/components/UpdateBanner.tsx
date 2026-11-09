"use client";

import { useEffect, useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

export function UpdateBanner() {
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    let currentVersion: string | null = null;

    const checkVersion = async () => {
      try {
        // Append a timestamp to prevent the browser from serving a cached response
        const response = await fetch(`/VERSION.txt?t=${Date.now()}`);
        if (!response.ok) return;

        const latestVersion = (await response.text()).trim();

        if (currentVersion === null) {
          // First check on initial load: record the baseline version
          currentVersion = latestVersion;
        } else if (currentVersion !== latestVersion) {
          // Subsequent check: the version on the server has changed
          setHasUpdate(true);
        }
      } catch (error) {
        console.error("Failed to check for updates:", error);
      }
    };

    // Check immediately, then poll every 60 seconds
    checkVersion();
    const interval = setInterval(checkVersion, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!hasUpdate) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-blue-600 text-white px-4 py-3 shadow-lg flex items-center justify-center sm:justify-between flex-wrap gap-3 animate-in slide-in-from-top">
      <div className="flex items-center gap-2 font-medium text-sm sm:text-base">
        <AlertCircle className="w-5 h-5" />
        <span>A new version of Robo_Panda is available.</span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors shadow-sm"
      >
        <RefreshCw className="w-4 h-4" />
        Update Now
      </button>
    </div>
  );
}