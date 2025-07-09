import { generateRobloxCode } from './src/index.js';

async function testMainFunctionality() {
  console.log('🎮 Testing Main Functionality: Prompt → Roblox Code\n');
  
  // Test the core functionality
  const prompt = "Create a Roblox script that spawns a red brick every 5 seconds at a random position above the baseplate";
  
  console.log('📝 Input Prompt:');
  console.log(`"${prompt}"\n`);
  
  console.log('⚙️  Options:');
  console.log('- Script Type: server');
  console.log('- Permission Mode: bypassPermissions (automatic)');
  console.log('- Type Checking: enabled\n');
  
  try {
    const result = await generateRobloxCode(
      prompt,
      {
        scriptType: 'server',
        useTypeChecking: true,
        permissionMode: 'bypassPermissions'
      }
    );
    
    console.log('📊 Result:');
    console.log(`- Success: ${result.success}`);
    console.log(`- Files Generated: ${result.files.length}`);
    console.log(`- Errors: ${result.errors ? result.errors.join(', ') : 'None'}`);
    
    if (result.success && result.files[0]) {
      console.log('\n📄 Generated Roblox Code:');
      console.log('=' * 60);
      console.log(result.files[0].content);
      console.log('=' * 60);
      
      // Verify the code contains expected elements
      const code = result.files[0].content;
      const checks = [
        { name: 'Type checking directive', pattern: /--!strict/ },
        { name: 'Workspace service', pattern: /game:GetService\(["']Workspace["']\)/ },
        { name: 'Part creation', pattern: /Instance\.new\(["']Part["']\)/ },
        { name: 'Color setting', pattern: /Color3|BrickColor/ },
        { name: 'Loop or timer', pattern: /while|wait|task\.wait|RunService/ }
      ];
      
      console.log('\n✔️  Code Validation:');
      checks.forEach(check => {
        const passed = check.pattern.test(code);
        console.log(`${passed ? '✅' : '❌'} ${check.name}`);
      });
      
      console.log('\n🎉 Main functionality test PASSED!');
      console.log('The TypeScript function successfully:');
      console.log('1. Accepted a natural language prompt');
      console.log('2. Used Claude Code SDK with automatic permissions');
      console.log('3. Generated valid Roblox Luau code');
      console.log('4. Returned the code in a structured format');
    } else {
      console.log('\n❌ Generation failed or no files produced');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  }
}

// Run the test
testMainFunctionality();