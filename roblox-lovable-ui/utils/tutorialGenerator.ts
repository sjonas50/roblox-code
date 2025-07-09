import { analyzeRobloxCode, generateHierarchy, CodeAnalysis } from './robloxCodeAnalyzer';

export interface TutorialStep {
  step: number;
  title: string;
  description: string;
  tips?: string[];
  warning?: string;
  codeSnippet?: string;
  checklist?: string[];
}

export interface Tutorial {
  title: string;
  overview: string;
  prerequisites: string[];
  steps: TutorialStep[];
  testing: string[];
  troubleshooting?: { issue: string; solution: string }[];
  hierarchy?: string;
  quickSetup?: string[];
}

export function generateTutorial(
  code: string,
  scriptType: 'server' | 'client' | 'module',
  prompt: string
): Tutorial {
  // Deep analyze the code
  const analysis = analyzeRobloxCode(code);
  
  // Generate base tutorial structure
  const tutorial: Tutorial = {
    title: `How to Implement: "${prompt}"`,
    overview: generateEnhancedOverview(prompt, scriptType, analysis),
    prerequisites: generateSpecificPrerequisites(analysis),
    steps: generateDetailedSteps(scriptType, analysis, code),
    testing: generateSpecificTestingSteps(analysis, code),
    troubleshooting: generateCodeSpecificTroubleshooting(analysis, code, scriptType),
    hierarchy: generateHierarchy(analysis),
    quickSetup: generateQuickSetup(analysis)
  };
  
  return tutorial;
}

function generateEnhancedOverview(prompt: string, scriptType: string, analysis: CodeAnalysis): string {
  let overview = `This ${getScriptTypeName(scriptType)} implements: "${prompt}".\n\n`;
  
  // Specific components overview
  if (analysis.objects.length > 0) {
    overview += `📦 **Required Objects:**\n`;
    for (const obj of analysis.objects.slice(0, 5)) {
      if (obj.name && obj.type) {
        overview += `- ${obj.name} (${obj.type})`;
        if (obj.parent) overview += ` in ${obj.parent}`;
        overview += '\n';
      }
    }
    if (analysis.objects.length > 5) {
      overview += `- ...and ${analysis.objects.length - 5} more objects\n`;
    }
    overview += '\n';
  }
  
  if (analysis.remoteEvents.length > 0) {
    overview += `🔌 **Network Communication:**\n`;
    for (const remote of analysis.remoteEvents) {
      overview += `- ${remote.name} (${remote.type}) for ${remote.usage.join(', ')}\n`;
    }
    overview += '\n';
  }
  
  if (analysis.services.length > 0) {
    overview += `⚙️ **Services Used:** ${analysis.services.join(', ')}\n\n`;
  }
  
  return overview;
}

function generateSpecificPrerequisites(analysis: CodeAnalysis): string[] {
  const prereqs: string[] = [];
  
  // Add specific object requirements
  for (const obj of analysis.objects) {
    if (obj.location === 'script.Parent') {
      prereqs.push(`✅ A ${obj.type} that will contain this script`);
      if (obj.properties) {
        const props = Object.entries(obj.properties)
          .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
          .join(', ');
        prereqs.push(`   └─ Properties: ${props}`);
      }
    } else if (obj.parent && !obj.name.includes('script')) {
      prereqs.push(`✅ ${obj.name} (${obj.type}) must exist in ${obj.parent}`);
    }
  }
  
  // Add folder structure requirements
  if (analysis.folderStructure.length > 0) {
    prereqs.push(`📁 Required folder structure:`);
    for (const folder of analysis.folderStructure) {
      prereqs.push(`   └─ ${folder.path}`);
    }
  }
  
  // Add asset requirements
  if (analysis.assets.length > 0) {
    prereqs.push(`🎨 Required assets:`);
    for (const asset of analysis.assets) {
      prereqs.push(`   └─ ${asset.name} (${asset.type}) in ${asset.location}`);
      if (asset.assetId) {
        prereqs.push(`      Asset ID: ${asset.assetId}`);
      }
    }
  }
  
  // Add RemoteEvent requirements
  if (analysis.remoteEvents.length > 0) {
    prereqs.push(`🔌 RemoteEvents/Functions to create:`);
    for (const remote of analysis.remoteEvents) {
      prereqs.push(`   └─ ${remote.name} (${remote.type}) in ${remote.location}`);
    }
  }
  
  if (prereqs.length === 0) {
    prereqs.push("✅ Roblox Studio open with a place");
  }
  
  return prereqs;
}

function generateDetailedSteps(scriptType: string, analysis: CodeAnalysis, code: string): TutorialStep[] {
  const steps: TutorialStep[] = [];
  let stepNum = 1;
  
  // Step 1: Open Roblox Studio
  steps.push({
    step: stepNum++,
    title: "Open Roblox Studio",
    description: "Open Roblox Studio and either create a new place or open your existing project.",
    tips: ["Use the baseplate template if starting fresh", "Make sure you're in Edit mode, not Play mode"]
  });
  
  // Step 2: Create folder structure
  if (analysis.folderStructure.length > 0) {
    steps.push({
      step: stepNum++,
      title: "Set Up Folder Structure",
      description: "Create the required folder hierarchy in your Explorer. Right-click on the service and Insert Object > Folder.",
      checklist: analysis.folderStructure.map(f => `Create folder: ${f.path}`),
      tips: [
        "Folders help organize your game assets",
        "Use exact names as shown to avoid script errors"
      ]
    });
  }
  
  // Step 3: Create specific objects
  for (const obj of analysis.objects) {
    if (obj.location === 'script.Parent' || (obj.parent && obj.parent.includes('workspace'))) {
      const step: TutorialStep = {
        step: stepNum++,
        title: `Create ${obj.name || 'Required'} ${obj.type}`,
        description: `Create a ${obj.type} ${obj.name ? `named "${obj.name}"` : ''} in ${obj.parent || 'workspace'}.`,
        tips: []
      };
      
      if (obj.properties) {
        step.checklist = [];
        for (const [prop, value] of Object.entries(obj.properties)) {
          if (typeof value === 'object' && 'x' in value) {
            step.checklist.push(`Set ${prop} to (${value.x}, ${value.y}, ${value.z})`);
          } else if (typeof value === 'object' && 'r' in value) {
            step.checklist.push(`Set ${prop} to Color3(${value.r}, ${value.g}, ${value.b})`);
          } else {
            step.checklist.push(`Set ${prop} to ${value}`);
          }
        }
      }
      
      if (obj.type === 'Part' && code.includes('.Touched:Connect')) {
        step.tips!.push("Make sure CanCollide is true for touch detection");
        step.tips!.push("Anchor the part if it shouldn't fall");
      }
      
      steps.push(step);
    }
  }
  
  // Step 4: Create RemoteEvents
  if (analysis.remoteEvents.length > 0) {
    const remoteStep: TutorialStep = {
      step: stepNum++,
      title: "Create RemoteEvents/Functions",
      description: "Create the required RemoteEvents and RemoteFunctions for client-server communication.",
      checklist: [],
      codeSnippet: generateRemoteEventCreationScript(analysis.remoteEvents),
      tips: [
        "You can run the code snippet in the command bar to create all RemoteEvents at once",
        "Make sure the names match exactly as they're case-sensitive"
      ]
    };
    
    for (const remote of analysis.remoteEvents) {
      remoteStep.checklist!.push(`Create ${remote.type} named "${remote.name}" in ${remote.location}`);
    }
    
    steps.push(remoteStep);
  }
  
  // Step 5: Prepare assets
  if (analysis.assets.length > 0) {
    steps.push({
      step: stepNum++,
      title: "Prepare Required Assets",
      description: "Ensure all required assets are in their correct locations.",
      checklist: analysis.assets.map(asset => 
        `Place ${asset.type} "${asset.name}" in ${asset.location}${asset.assetId ? ` (ID: ${asset.assetId})` : ''}`
      ),
      tips: [
        "Tools should be in ServerStorage for security",
        "Models can be imported from the toolbox or created manually"
      ]
    });
  }
  
  // Step 6: Create the script
  const scriptLocation = getSpecificScriptLocation(scriptType, analysis, code);
  steps.push({
    step: stepNum++,
    title: `Create the ${getScriptTypeName(scriptType)}`,
    description: scriptLocation.description,
    tips: scriptLocation.tips,
    warning: scriptLocation.warning,
    checklist: scriptLocation.checklist
  });
  
  // Step 7: Paste and configure the code
  steps.push({
    step: stepNum++,
    title: "Add Your Code",
    description: "Double-click the script to open it. Delete any default code, then paste your generated code.",
    checklist: [
      "Delete the default 'print(\"Hello world!\")' line",
      "Paste all of your generated code",
      "Check for any red underlines (syntax errors)",
      "Save the script (Ctrl+S or Cmd+S)"
    ],
    tips: [
      "The script editor will show syntax errors in red",
      "You can use Ctrl+A to select all before pasting"
    ]
  });
  
  // Step 8: Verify configuration
  if (analysis.variables.length > 0) {
    steps.push({
      step: stepNum++,
      title: "Verify Configuration Variables",
      description: "Check these configuration values at the top of your script and adjust if needed:",
      checklist: analysis.variables.map(v => `${v.name} = ${v.value} (${v.type})`),
      tips: [
        "These values control the behavior of your script",
        "You can change them to customize the functionality"
      ]
    });
  }
  
  // Final step: Test
  steps.push({
    step: stepNum++,
    title: "Test Your Implementation",
    description: "Click the Play button to test your script. The Output window will show any errors or debug messages.",
    checklist: [
      "Press F9 to open Developer Console",
      "Check Output window for errors (View > Output)",
      "Test all interactive features",
      "Stop play mode when done testing"
    ],
    tips: [
      "Server scripts show errors in orange/red in the Output",
      "Use print() statements to debug your code",
      "Test with multiple players using Test > Start in Studio"
    ]
  });
  
  return steps;
}

function generateRemoteEventCreationScript(remoteEvents: CodeAnalysis['remoteEvents']): string {
  if (remoteEvents.length === 0) return '';
  
  let script = '-- Run this in the command bar to create all RemoteEvents:\n\n';
  
  // Group by location
  const grouped = remoteEvents.reduce((acc, remote) => {
    if (!acc[remote.location]) acc[remote.location] = [];
    acc[remote.location].push(remote);
    return acc;
  }, {} as Record<string, typeof remoteEvents>);
  
  for (const [location, remotes] of Object.entries(grouped)) {
    script += `-- Create folder structure\n`;
    const parts = location.split('.');
    if (parts.length > 1) {
      script += `local folder = Instance.new("Folder")\n`;
      script += `folder.Name = "${parts[parts.length - 1]}"\n`;
      script += `folder.Parent = ${parts.slice(0, -1).join('.')}\n\n`;
    }
    
    script += `-- Create ${location} items\n`;
    for (const remote of remotes) {
      script += `local ${remote.name} = Instance.new("${remote.type}")\n`;
      script += `${remote.name}.Name = "${remote.name}"\n`;
      script += `${remote.name}.Parent = ${location}\n\n`;
    }
  }
  
  return script;
}

function getSpecificScriptLocation(scriptType: string, analysis: CodeAnalysis, code: string): {
  description: string;
  tips: string[];
  warning?: string;
  checklist?: string[];
} {
  const hasScriptParent = code.includes('script.Parent');
  const needsPart = analysis.objects.some(obj => obj.location === 'script.Parent');
  
  switch (scriptType) {
    case 'server':
      if (hasScriptParent && needsPart) {
        const parentObj = analysis.objects.find(obj => obj.location === 'script.Parent');
        return {
          description: `This script needs to be placed inside a ${parentObj?.type || 'Part'}. In the Explorer, find your ${parentObj?.type || 'Part'}, right-click it, and select Insert Object > Script.`,
          tips: [
            "The script uses script.Parent to reference its container",
            "Make sure it's a Script, not a LocalScript"
          ],
          warning: "⚠️ This script MUST be a child of the Part for it to work correctly",
          checklist: [
            `Right-click on your ${parentObj?.type || 'Part'}`,
            "Select Insert Object > Script",
            "Rename the script to something descriptive"
          ]
        };
      }
      return {
        description: "Place this script in ServerScriptService. Right-click ServerScriptService and select Insert Object > Script.",
        tips: [
          "ServerScriptService is the recommended location for server scripts",
          "Scripts here run automatically when the game starts"
        ],
        checklist: [
          "Navigate to ServerScriptService in Explorer",
          "Right-click and Insert Object > Script",
          "Give it a descriptive name"
        ]
      };
      
    case 'client':
      const usesGui = analysis.services.includes('StarterGui');
      const usesInput = analysis.services.includes('UserInputService');
      
      if (usesGui) {
        return {
          description: "This LocalScript handles UI. Place it in StarterGui. Right-click StarterGui and select Insert Object > LocalScript.",
          tips: [
            "LocalScripts in StarterGui run for each player's UI",
            "They can access the player's GUI elements"
          ],
          warning: "⚠️ Must be a LocalScript, not a regular Script",
          checklist: [
            "Navigate to StarterGui",
            "Right-click and Insert Object > LocalScript",
            "Name it based on its UI functionality"
          ]
        };
      } else if (usesInput) {
        return {
          description: "This LocalScript handles player input. Place it in StarterPlayer > StarterPlayerScripts.",
          tips: [
            "LocalScripts here can access UserInputService",
            "They run once for each player when they join"
          ],
          checklist: [
            "Expand StarterPlayer in the Explorer",
            "Right-click StarterPlayerScripts",
            "Insert Object > LocalScript"
          ]
        };
      }
      return {
        description: "Place this LocalScript in StarterPlayer > StarterPlayerScripts for it to run on each player.",
        tips: ["LocalScripts here have access to the local player"],
        checklist: [
          "Navigate to StarterPlayer > StarterPlayerScripts",
          "Right-click and Insert Object > LocalScript"
        ]
      };
      
    case 'module':
      const isShared = code.includes('return') && !code.includes('RunService');
      return {
        description: `Place this ModuleScript in ${isShared ? 'ReplicatedStorage' : 'ServerStorage'}. Right-click and select Insert Object > ModuleScript.`,
        tips: [
          "ModuleScripts can be required by other scripts",
          isShared ? "ReplicatedStorage allows both server and client access" : "ServerStorage is only accessible by the server"
        ],
        checklist: [
          `Navigate to ${isShared ? 'ReplicatedStorage' : 'ServerStorage'}`,
          "Right-click and Insert Object > ModuleScript",
          "Name it to match what other scripts expect"
        ]
      };
      
    default:
      return {
        description: "Create a Script in ServerScriptService.",
        tips: ["Default location for server-side code"],
        checklist: ["Place in ServerScriptService"]
      };
  }
}

function generateSpecificTestingSteps(analysis: CodeAnalysis, code: string): string[] {
  const steps: string[] = [];
  
  // Add specific interaction tests based on code analysis
  if (code.includes('.Touched:Connect')) {
    const touchPart = analysis.objects.find(obj => obj.location === 'script.Parent');
    steps.push(`Walk your character into ${touchPart?.name || 'the part'} to trigger the touch event`);
    steps.push("You should see the effect immediately (check for tools in your backpack, GUI changes, etc.)");
  }
  
  if (code.includes('ClickDetector')) {
    steps.push("Hover your mouse over the part - it should show a click cursor");
    steps.push("Click the part to trigger the action");
  }
  
  if (code.includes('ProximityPrompt')) {
    steps.push("Walk near the part until you see the interaction prompt");
    steps.push("Press the interaction key (default is E) to trigger");
  }
  
  // Add RemoteEvent testing
  for (const remote of analysis.remoteEvents) {
    if (remote.usage.includes('FireServer')) {
      steps.push(`Client action will trigger ${remote.name} to communicate with server`);
    }
    if (remote.usage.includes('FireClient')) {
      steps.push(`Server will send updates via ${remote.name} to update your UI/state`);
    }
  }
  
  // Add GUI testing
  if (analysis.services.includes('StarterGui')) {
    steps.push("Check your screen for new UI elements");
    steps.push("Interact with any buttons or input fields");
  }
  
  // Add debug steps
  steps.push("📊 Open Output window (View > Output) to see any debug messages");
  steps.push("🔍 Press F9 for Developer Console to see detailed logs");
  
  if (code.includes('print(')) {
    steps.push("💬 Look for print statements in the Output - they help debug the script");
  }
  
  return steps;
}

function generateCodeSpecificTroubleshooting(analysis: CodeAnalysis, code: string, scriptType?: string): { issue: string; solution: string }[] {
  const troubleshooting = [];
  
  // Basic troubleshooting
  troubleshooting.push({
    issue: "Script doesn't run at all",
    solution: `Check that the script is ${code.includes('script.Parent') ? 'inside the correct parent object' : 'in the correct service'} and is enabled`
  });
  
  // Object-specific issues
  for (const obj of analysis.objects) {
    if (obj.parent) {
      troubleshooting.push({
        issue: `Error: attempt to index nil with '${obj.name}'`,
        solution: `Create an object named "${obj.name}" in ${obj.parent}. Names are case-sensitive!`
      });
    }
  }
  
  // RemoteEvent issues
  for (const remote of analysis.remoteEvents) {
    troubleshooting.push({
      issue: `${remote.name} is not a valid member`,
      solution: `Create a ${remote.type} named "${remote.name}" in ${remote.location}`
    });
    
    if (remote.usage.includes('FireServer') && remote.usage.includes('OnServerEvent')) {
      troubleshooting.push({
        issue: `${remote.name} not receiving data`,
        solution: "Ensure both client FireServer and server OnServerEvent are set up correctly"
      });
    }
  }
  
  // Touch detection issues
  if (code.includes('.Touched:Connect')) {
    troubleshooting.push({
      issue: "Touch event not firing",
      solution: "Ensure the part has CanCollide = true and isn't inside another part"
    });
    troubleshooting.push({
      issue: "Touch event fires multiple times",
      solution: "Add a debounce (cooldown) to prevent multiple triggers"
    });
  }
  
  // Tool issues
  if (analysis.assets.some(a => a.type === 'Tool')) {
    troubleshooting.push({
      issue: "Tool not appearing in backpack",
      solution: "Make sure the tool is being cloned (not moved) and parented to player.Backpack"
    });
    troubleshooting.push({
      issue: "Tool has no handle",
      solution: "Every tool needs a Part named 'Handle' as a child"
    });
  }
  
  // Service access issues
  if (code.includes('ServerStorage') && scriptType === 'client') {
    troubleshooting.push({
      issue: "Cannot access ServerStorage from LocalScript",
      solution: "ServerStorage is server-only. Use ReplicatedStorage for shared assets"
    });
  }
  
  return troubleshooting;
}

function generateQuickSetup(analysis: CodeAnalysis): string[] {
  const setup: string[] = [];
  
  // Generate a quick checklist
  setup.push("⚡ Quick Setup Checklist:");
  
  if (analysis.folderStructure.length > 0) {
    setup.push("1️⃣ Create folders: " + analysis.folderStructure.map(f => f.path).join(", "));
  }
  
  if (analysis.remoteEvents.length > 0) {
    setup.push("2️⃣ Create RemoteEvents: " + analysis.remoteEvents.map(r => r.name).join(", "));
  }
  
  if (analysis.objects.filter(o => o.parent?.includes('workspace')).length > 0) {
    setup.push("3️⃣ Create Parts: " + analysis.objects.filter(o => o.parent?.includes('workspace')).map(o => o.name).join(", "));
  }
  
  if (analysis.assets.length > 0) {
    setup.push("4️⃣ Add assets: " + analysis.assets.map(a => `${a.name} (${a.type})`).join(", "));
  }
  
  setup.push("5️⃣ Create script and paste code");
  setup.push("6️⃣ Test in Play mode");
  
  return setup;
}

function getScriptTypeName(scriptType: string): string {
  switch (scriptType) {
    case 'server': return 'Server Script';
    case 'client': return 'Local Script';
    case 'module': return 'Module Script';
    default: return 'Script';
  }
}