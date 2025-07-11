/**
 * Utility to ensure API key is available for Claude SDK
 * Supports both CLAUDE_API_KEY and ANTHROPIC_API_KEY environment variables
 */
export function ensureApiKey(): string | null {
  // Check for API key - support both CLAUDE_API_KEY and ANTHROPIC_API_KEY
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('❌ API key not found in environment');
    return null;
  }
  
  // Set ANTHROPIC_API_KEY for Claude SDK if needed
  if (process.env.CLAUDE_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = process.env.CLAUDE_API_KEY;
    console.log('✅ Set ANTHROPIC_API_KEY from CLAUDE_API_KEY');
  }
  
  return apiKey;
}