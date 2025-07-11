/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Environment variables
  env: {
    // Make CLAUDE_API_KEY available as ANTHROPIC_API_KEY for Claude Code SDK
    ANTHROPIC_API_KEY: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
  },
};

export default nextConfig;