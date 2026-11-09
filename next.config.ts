import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This automatically copies traced files to .next/standalone
  // drastically reducing the Docker image size
  output: 'standalone', 
};

export default nextConfig;