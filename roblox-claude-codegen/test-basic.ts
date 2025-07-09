import { generateRobloxCode } from './src/index.js';

// Simple test to verify the function is working
async function test() {
  console.log('Testing basic Roblox code generation...\n');
  
  try {
    const result = await generateRobloxCode(
      "Create a simple part that changes color when touched",
      {
        scriptType: 'server',
        useTypeChecking: true
      }
    );
    
    console.log('Result:', {
      success: result.success,
      filesGenerated: result.files.length,
      errors: result.errors
    });
    
    if (result.success && result.files[0]) {
      console.log('\nGenerated code preview:');
      console.log(result.files[0].content.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

test();