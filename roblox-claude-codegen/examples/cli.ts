#!/usr/bin/env tsx

import { generateRobloxCode, writeGeneratedFiles } from '../src/index.js';
import * as readline from 'readline/promises';

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🎮 Roblox Code Generator CLI');
  console.log('Generate Roblox scripts using natural language!\n');

  try {
    // Get user input
    const prompt = await rl.question('What would you like to create? ');
    
    const scriptTypeChoice = await rl.question(
      'Script type (1=Server, 2=Client, 3=Module): '
    );
    
    const scriptTypeMap: Record<string, 'server' | 'client' | 'module'> = {
      '1': 'server',
      '2': 'client', 
      '3': 'module'
    };
    
    const scriptType = scriptTypeMap[scriptTypeChoice] || 'server';
    
    console.log('\n⏳ Generating code...\n');

    // Generate the code
    const result = await generateRobloxCode(prompt, {
      scriptType,
      useTypeChecking: true,
      includeComments: true
    });

    if (result.success && result.files.length > 0) {
      console.log('✅ Code generated successfully!\n');
      
      // Display the generated code
      result.files.forEach(file => {
        console.log(`📄 ${file.path}`);
        console.log('─'.repeat(50));
        console.log(file.content);
        console.log('─'.repeat(50));
        console.log();
      });

      // Ask if user wants to save
      const save = await rl.question('Save to disk? (y/n): ');
      
      if (save.toLowerCase() === 'y') {
        const outputDir = await rl.question('Output directory (default: ./output): ') || './output';
        
        const writeResult = await writeGeneratedFiles(result.files, {
          outputDir,
          createDirectories: true,
          overwrite: true
        });

        if (writeResult.success) {
          console.log('\n✅ Files saved successfully!');
          writeResult.writtenFiles.forEach(file => {
            console.log(`  📁 ${file}`);
          });
        } else {
          console.error('\n❌ Error saving files:', writeResult.errors);
        }
      }
    } else {
      console.error('❌ Failed to generate code:', result.errors);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
  }
}

// Run CLI
main();