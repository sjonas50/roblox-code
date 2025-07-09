import { 
  generateRobloxCode, 
  writeGeneratedFiles,
  createRobloxProject,
  generateRojoProject
} from '../src/index.js';

async function example() {
  console.log('🎮 Roblox Claude Code Generator Example\n');

  // Example 1: Generate a simple server script
  console.log('1. Generating a server script for player joining...');
  const serverResult = await generateRobloxCode(
    "Create a script that welcomes players when they join the game and gives them 100 coins",
    {
      scriptType: 'server',
      targetService: 'ServerScriptService',
      useTypeChecking: true,
      maxTurns: 3
    },
    {
      gameType: 'rpg',
      existingServices: ['Players', 'ReplicatedStorage']
    }
  );

  if (serverResult.success) {
    console.log('✅ Server script generated successfully!');
    console.log(`Generated ${serverResult.files.length} file(s)`);
  } else {
    console.error('❌ Failed to generate server script:', serverResult.errors);
  }

  // Example 2: Generate a client-side GUI script
  console.log('\n2. Generating a client script for UI...');
  const clientResult = await generateRobloxCode(
    "Create a GUI that shows the player's coins in the top right corner",
    {
      scriptType: 'client',
      targetService: 'StarterPlayer/StarterPlayerScripts',
      includeComments: true
    }
  );

  if (clientResult.success) {
    console.log('✅ Client script generated successfully!');
  }

  // Example 3: Generate a module script
  console.log('\n3. Generating a module script for data management...');
  const moduleResult = await generateRobloxCode(
    "Create a module that handles player data with methods to get, set, and save player stats",
    {
      scriptType: 'module',
      targetService: 'ReplicatedStorage',
      useTypeChecking: true
    }
  );

  if (moduleResult.success) {
    console.log('✅ Module script generated successfully!');
  }

  // Example 4: Create a complete project structure
  console.log('\n4. Creating project structure...');
  const projectResult = await createRobloxProject('MyRobloxGame', './output');
  
  if (projectResult.success) {
    console.log('✅ Project structure created!');
    
    // Write all generated files to the project
    const allFiles = [
      ...serverResult.files,
      ...clientResult.files,
      ...moduleResult.files
    ];

    // Add Rojo project file
    const rojoProject = generateRojoProject('MyRobloxGame', allFiles);
    allFiles.push(rojoProject);

    const writeResult = await writeGeneratedFiles(allFiles, {
      outputDir: './output/MyRobloxGame',
      createDirectories: true,
      overwrite: true
    });

    if (writeResult.success) {
      console.log(`✅ Written ${writeResult.writtenFiles.length} files to disk!`);
      console.log('\nGenerated files:');
      writeResult.writtenFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    } else {
      console.error('❌ Failed to write some files:', writeResult.errors);
    }
  }

  // Example 5: Advanced usage with context
  console.log('\n5. Generating complex game mechanic...');
  const complexResult = await generateRobloxCode(
    "Create a treasure chest system where players can find chests that spawn randomly in the world, can be opened with keys, and give random rewards",
    {
      scriptType: 'server',
      maxTurns: 5
    },
    {
      gameType: 'rpg',
      existingServices: ['Workspace', 'ReplicatedStorage', 'ServerStorage'],
      dependencies: ['DataStore2'] // Assuming we're using DataStore2
    }
  );

  if (complexResult.success) {
    console.log('✅ Complex system generated successfully!');
    
    // Show a snippet of the generated code
    const firstFile = complexResult.files[0];
    if (firstFile) {
      console.log('\nGenerated code preview:');
      console.log(firstFile.content.substring(0, 200) + '...');
    }
  }

  console.log('\n🎉 Example complete!');
}

// Run the example
example().catch(console.error);