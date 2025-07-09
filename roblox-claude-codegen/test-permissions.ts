import { generateRobloxCode, writeGeneratedFiles } from './src/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

async function testPermissions() {
  console.log('🧪 Testing Roblox Code Generator with Automatic Permissions\n');
  
  const testDir = './test-output';
  
  // Clean up test directory
  try {
    await fs.rm(testDir, { recursive: true });
  } catch {}
  
  const tests = [
    {
      name: 'Server Script Generation',
      prompt: 'Create a spawn system that teleports players to random spawn points when they die',
      options: {
        scriptType: 'server' as const,
        useTypeChecking: true,
        permissionMode: 'bypassPermissions' as const
      }
    },
    {
      name: 'Client Script Generation',
      prompt: 'Create a sprint system that lets players run faster when holding shift',
      options: {
        scriptType: 'client' as const,
        includeComments: true
      }
    },
    {
      name: 'Module Script Generation',
      prompt: 'Create a inventory system module with methods to add, remove, and list items',
      options: {
        scriptType: 'module' as const,
        useTypeChecking: true,
        maxTurns: 5
      }
    },
    {
      name: 'Complex Game System',
      prompt: `Create a complete weapon system with:
        - Base weapon class
        - Different weapon types (sword, gun, magic staff)
        - Damage calculation
        - Cooldown system
        - Special abilities`,
      options: {
        scriptType: 'module' as const,
        useTypeChecking: true,
        maxTurns: 10,
        targetService: 'ReplicatedStorage/Weapons'
      }
    }
  ];
  
  let successCount = 0;
  const results: any[] = [];
  
  for (const test of tests) {
    console.log(`\n📝 Test: ${test.name}`);
    console.log(`Prompt: "${test.prompt.substring(0, 60)}..."`);
    
    try {
      const startTime = Date.now();
      const result = await generateRobloxCode(
        test.prompt,
        test.options,
        {
          gameType: 'rpg',
          existingServices: ['Players', 'RunService', 'ReplicatedStorage']
        }
      );
      const duration = Date.now() - startTime;
      
      if (result.success) {
        console.log(`✅ Success! Generated ${result.files.length} file(s) in ${duration}ms`);
        
        // Write files to test directory
        const writeResult = await writeGeneratedFiles(result.files, {
          outputDir: path.join(testDir, test.name.replace(/\s+/g, '_')),
          createDirectories: true,
          overwrite: true
        });
        
        if (writeResult.success) {
          console.log(`   📁 Files written: ${writeResult.writtenFiles.length}`);
          
          // Show code preview
          if (result.files[0]) {
            const preview = result.files[0].content.substring(0, 150);
            console.log(`   📄 Preview: ${preview.replace(/\n/g, ' ')}...`);
          }
        }
        
        successCount++;
        results.push({
          test: test.name,
          success: true,
          duration,
          filesGenerated: result.files.length
        });
      } else {
        console.log(`❌ Failed: ${result.errors?.join(', ')}`);
        results.push({
          test: test.name,
          success: false,
          errors: result.errors
        });
      }
    } catch (error) {
      console.log(`❌ Error: ${error}`);
      results.push({
        test: test.name,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${tests.length - successCount}`);
  console.log(`Success Rate: ${(successCount / tests.length * 100).toFixed(1)}%`);
  
  // Test permission modes
  console.log('\n🔐 Testing Different Permission Modes...');
  
  const permissionTests = [
    { mode: 'bypassPermissions', description: 'Automatic (no prompts)' },
    { mode: 'acceptEdits', description: 'Accept edits mode' },
    { mode: 'default', description: 'Default mode' }
  ];
  
  for (const pTest of permissionTests) {
    console.log(`\nTesting ${pTest.description} (${pTest.mode}):`);
    try {
      const result = await generateRobloxCode(
        'Create a simple print statement',
        {
          scriptType: 'server',
          permissionMode: pTest.mode as any,
          maxTurns: 1
        }
      );
      console.log(`✅ ${pTest.mode}: Success=${result.success}`);
    } catch (error) {
      console.log(`❌ ${pTest.mode}: Error=${error}`);
    }
  }
  
  // Verify files were created
  console.log('\n📁 Verifying file creation...');
  try {
    const files = await fs.readdir(testDir, { recursive: true, withFileTypes: true });
    const luaFiles = files.filter(f => f.isFile() && f.name.endsWith('.lua'));
    console.log(`✅ Created ${luaFiles.length} Lua files`);
    
    // List some files
    console.log('\nGenerated files:');
    luaFiles.slice(0, 5).forEach(file => {
      console.log(`  - ${file.name}`);
    });
    if (luaFiles.length > 5) {
      console.log(`  ... and ${luaFiles.length - 5} more`);
    }
  } catch (error) {
    console.log('❌ Could not verify files:', error);
  }
  
  console.log('\n✨ Test complete!');
}

// Run the test
testPermissions().catch(console.error);