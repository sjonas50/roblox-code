import { NextRequest, NextResponse } from 'next/server';
import { generateRobloxCode } from 'roblox-claude-codegen';

// Simple test route to debug the generator
export async function GET(request: NextRequest) {
  console.log('🧪 Test route called');
  console.log('🔑 API Key check:', {
    hasKey: !!process.env.ANTHROPIC_API_KEY,
    keyLength: process.env.ANTHROPIC_API_KEY?.length,
    firstChars: process.env.ANTHROPIC_API_KEY?.substring(0, 10) + '...'
  });

  try {
    const result = await generateRobloxCode(
      "Create a simple print statement",
      {
        scriptType: 'server',
        permissionMode: 'bypassPermissions',
        maxTurns: 1
      }
    );

    return NextResponse.json({
      success: result.success,
      errors: result.errors,
      hasFiles: result.files.length > 0,
      firstFile: result.files[0]?.content?.substring(0, 100),
      messagesCount: result.messages?.length || 0
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}