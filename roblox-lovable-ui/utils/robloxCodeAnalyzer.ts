/**
 * Deep code analyzer for Roblox Luau scripts
 * Extracts specific names, paths, and requirements from generated code
 */

export interface ExtractedObject {
  name: string;
  type: string;
  parent?: string;
  properties?: Record<string, any>;
  location?: string;
}

export interface ExtractedRemoteEvent {
  name: string;
  type: 'RemoteEvent' | 'RemoteFunction' | 'BindableEvent' | 'BindableFunction';
  location: string;
  usage: ('FireServer' | 'FireClient' | 'OnServerEvent' | 'OnClientEvent' | 'InvokeServer' | 'InvokeClient')[];
}

export interface ExtractedAsset {
  name: string;
  type: 'Tool' | 'Model' | 'Sound' | 'Animation' | 'Decal' | 'Texture';
  location: string;
  assetId?: string;
}

export interface CodeAnalysis {
  objects: ExtractedObject[];
  remoteEvents: ExtractedRemoteEvent[];
  assets: ExtractedAsset[];
  services: string[];
  folderStructure: FolderStructure[];
  variables: VariableInfo[];
  requiredProperties: PropertyRequirement[];
}

export interface FolderStructure {
  path: string;
  type: 'Folder' | 'Model' | 'Configuration';
  children?: string[];
}

export interface VariableInfo {
  name: string;
  value: string;
  type: string;
}

export interface PropertyRequirement {
  object: string;
  property: string;
  value: any;
  required: boolean;
}

export function analyzeRobloxCode(code: string): CodeAnalysis {
  const analysis: CodeAnalysis = {
    objects: extractObjects(code),
    remoteEvents: extractRemoteEvents(code),
    assets: extractAssets(code),
    services: extractServices(code),
    folderStructure: extractFolderStructure(code),
    variables: extractVariables(code),
    requiredProperties: extractPropertyRequirements(code)
  };
  
  return analysis;
}

function extractObjects(code: string): ExtractedObject[] {
  const objects: ExtractedObject[] = [];
  
  // Extract Instance.new objects with variable assignments
  const instanceMatches = code.matchAll(/local\s+(\w+)\s*=\s*Instance\.new\s*\(\s*["']([^"']+)["']\s*\)/g);
  for (const match of instanceMatches) {
    const obj: ExtractedObject = {
      name: match[1],
      type: match[2]
    };
    
    // Look for parent assignment
    const parentMatch = code.match(new RegExp(`${match[1]}\\.Parent\\s*=\\s*([\\w.]+)`));
    if (parentMatch) {
      obj.parent = parentMatch[1];
    }
    
    // Look for property assignments
    const properties: Record<string, any> = {};
    const propMatches = code.matchAll(new RegExp(`${match[1]}\\.([\\w]+)\\s*=\\s*(.+)`, 'g'));
    for (const propMatch of propMatches) {
      const propName = propMatch[1];
      let propValue: any = propMatch[2].trim();
      
      // Parse property values
      if (propValue.startsWith('"') || propValue.startsWith("'")) {
        propValue = propValue.slice(1, -1);
      } else if (propValue === 'true' || propValue === 'false') {
        propValue = propValue === 'true';
      } else if (!isNaN(Number(propValue))) {
        propValue = Number(propValue);
      } else if (propValue.includes('Vector3.new')) {
        const vecMatch = propValue.match(/Vector3\.new\s*\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/);
        if (vecMatch) {
          propValue = { x: Number(vecMatch[1]), y: Number(vecMatch[2]), z: Number(vecMatch[3]) };
        }
      } else if (propValue.includes('Color3.new')) {
        const colorMatch = propValue.match(/Color3\.new\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
        if (colorMatch) {
          propValue = { r: Number(colorMatch[1]), g: Number(colorMatch[2]), b: Number(colorMatch[3]) };
        }
      }
      
      if (propName !== 'Parent') {
        properties[propName] = propValue;
      }
    }
    
    if (Object.keys(properties).length > 0) {
      obj.properties = properties;
    }
    
    objects.push(obj);
  }
  
  // Extract script.Parent references
  const scriptParentMatch = code.match(/local\s+(\w+)\s*=\s*script\.Parent/);
  if (scriptParentMatch) {
    // Find what type this parent should be
    const touchedMatch = code.match(new RegExp(`${scriptParentMatch[1]}\\.Touched:Connect`));
    const clickMatch = code.match(new RegExp(`${scriptParentMatch[1]}\\.ClickDetector`));
    
    objects.push({
      name: scriptParentMatch[1],
      type: touchedMatch ? 'Part' : clickMatch ? 'Part with ClickDetector' : 'Unknown',
      location: 'script.Parent'
    });
  }
  
  // Extract FindFirstChild references
  const findMatches = code.matchAll(/(\w+):FindFirstChild\s*\(\s*["']([^"']+)["']\s*\)/g);
  for (const match of findMatches) {
    objects.push({
      name: match[2],
      type: 'Object',
      parent: match[1]
    });
  }
  
  // Extract WaitForChild references
  const waitMatches = code.matchAll(/(\w+):WaitForChild\s*\(\s*["']([^"']+)["']\s*\)/g);
  for (const match of waitMatches) {
    objects.push({
      name: match[2],
      type: 'Object',
      parent: match[1]
    });
  }
  
  return objects;
}

function extractRemoteEvents(code: string): ExtractedRemoteEvent[] {
  const remoteEvents: ExtractedRemoteEvent[] = [];
  const processedNames = new Set<string>();
  
  // Extract RemoteEvent/RemoteFunction creation and references
  const patterns = [
    // Variable assignments
    /local\s+(\w+)\s*=\s*(\w+):WaitForChild\s*\(\s*["']([^"']+)["']\s*\)/g,
    /local\s+(\w+)\s*=\s*Instance\.new\s*\(\s*["'](RemoteEvent|RemoteFunction|BindableEvent|BindableFunction)["']\s*\)/g,
    /local\s+(\w+)\s*=\s*game\.ReplicatedStorage\.(\w+)\.(\w+)/g,
    /local\s+(\w+)\s*=\s*ReplicatedStorage\.(\w+)\.(\w+)/g,
  ];
  
  // First, find all remote event variables
  const remoteVars = new Map<string, ExtractedRemoteEvent>();
  
  for (const pattern of patterns) {
    const matches = [...code.matchAll(pattern)];
    for (const match of matches) {
      if (match[2] === 'RemoteEvent' || match[2] === 'RemoteFunction' || 
          match[2] === 'BindableEvent' || match[2] === 'BindableFunction') {
        // Instance.new pattern
        const varName = match[1];
        const type = match[2] as ExtractedRemoteEvent['type'];
        
        // Look for name assignment
        const nameMatch = code.match(new RegExp(`${varName}\\.Name\\s*=\\s*["']([^"']+)["']`));
        const name = nameMatch ? nameMatch[1] : varName;
        
        // Look for parent assignment
        const parentMatch = code.match(new RegExp(`${varName}\\.Parent\\s*=\\s*([\\w.]+)`));
        const location = parentMatch ? parentMatch[1] : 'ReplicatedStorage';
        
        remoteVars.set(varName, {
          name,
          type,
          location,
          usage: []
        });
      } else if (match[3]) {
        // WaitForChild pattern
        const varName = match[1];
        const name = match[3];
        const parent = match[2];
        
        // Determine type by usage
        let type: ExtractedRemoteEvent['type'] = 'RemoteEvent';
        if (code.includes(`${varName}:InvokeServer`) || code.includes(`${varName}:InvokeClient`)) {
          type = 'RemoteFunction';
        } else if (code.includes(`${varName}.Event:Connect`)) {
          type = 'BindableEvent';
        } else if (code.includes(`${varName}:Invoke`)) {
          type = 'BindableFunction';
        }
        
        remoteVars.set(varName, {
          name,
          type,
          location: parent,
          usage: []
        });
      }
    }
  }
  
  // Extract direct path references
  const pathPatterns = [
    /ReplicatedStorage\.RemoteEvents\.(\w+)/g,
    /ReplicatedStorage\.RemoteFunctions\.(\w+)/g,
    /game\.ReplicatedStorage\.RemoteEvents\.(\w+)/g,
    /game\.ReplicatedStorage\.RemoteFunctions\.(\w+)/g,
    /ReplicatedStorage:WaitForChild\s*\(\s*["']RemoteEvents["']\s*\):WaitForChild\s*\(\s*["'](\w+)["']\s*\)/g,
  ];
  
  for (const pattern of pathPatterns) {
    const matches = [...code.matchAll(pattern)];
    for (const match of matches) {
      const name = match[1];
      if (!processedNames.has(name)) {
        processedNames.add(name);
        
        let type: ExtractedRemoteEvent['type'] = 'RemoteEvent';
        let location = 'ReplicatedStorage.RemoteEvents';
        
        if (pattern.source.includes('RemoteFunctions')) {
          type = 'RemoteFunction';
          location = 'ReplicatedStorage.RemoteFunctions';
        }
        
        remoteEvents.push({
          name,
          type,
          location,
          usage: []
        });
      }
    }
  }
  
  // Now find usage patterns for each remote event
  for (const [varName, remoteEvent] of remoteVars) {
    const usage: ExtractedRemoteEvent['usage'] = [];
    
    // Check for different usage patterns
    if (code.includes(`${varName}:FireServer`)) usage.push('FireServer');
    if (code.includes(`${varName}:FireClient`)) usage.push('FireClient');
    if (code.includes(`${varName}:FireAllClients`)) usage.push('FireClient');
    if (code.includes(`${varName}.OnServerEvent`)) usage.push('OnServerEvent');
    if (code.includes(`${varName}.OnClientEvent`)) usage.push('OnClientEvent');
    if (code.includes(`${varName}:InvokeServer`)) usage.push('InvokeServer');
    if (code.includes(`${varName}:InvokeClient`)) usage.push('InvokeClient');
    
    remoteEvent.usage = usage;
    
    if (!processedNames.has(remoteEvent.name)) {
      processedNames.add(remoteEvent.name);
      remoteEvents.push(remoteEvent);
    }
  }
  
  return remoteEvents;
}

function extractAssets(code: string): ExtractedAsset[] {
  const assets: ExtractedAsset[] = [];
  const processedAssets = new Set<string>();
  
  // Extract tool references
  const toolPatterns = [
    /local\s+(\w+)\s*=\s*ServerStorage:WaitForChild\s*\(\s*["']([^"']+)["']\s*\)/g,
    /local\s+(\w+)\s*=\s*game\.ServerStorage\.Tools\.(\w+)/g,
    /Instance\.new\s*\(\s*["']Tool["']\s*\)/g,
    /:Clone\s*\(\s*\).*Tool/g,
  ];
  
  for (const pattern of toolPatterns) {
    const matches = [...code.matchAll(pattern)];
    for (const match of matches) {
      const name = match[2] || 'Tool';
      if (!processedAssets.has(name)) {
        processedAssets.add(name);
        assets.push({
          name,
          type: 'Tool',
          location: 'ServerStorage'
        });
      }
    }
  }
  
  // Extract sound references
  const soundPatterns = [
    /Instance\.new\s*\(\s*["']Sound["']\s*\)/g,
    /local\s+(\w+)\s*=\s*workspace:WaitForChild\s*\(\s*["']([^"']+Sound[^"']*)["']\s*\)/g,
    /SoundId\s*=\s*["']rbxassetid:\/\/(\d+)["']/g,
  ];
  
  for (const pattern of soundPatterns) {
    const matches = [...code.matchAll(pattern)];
    for (const match of matches) {
      if (match[1] && /\d+/.test(match[1])) {
        // Asset ID found
        assets.push({
          name: 'Sound',
          type: 'Sound',
          location: 'workspace',
          assetId: match[1]
        });
      } else {
        const name = match[2] || 'Sound';
        if (!processedAssets.has(name)) {
          processedAssets.add(name);
          assets.push({
            name,
            type: 'Sound',
            location: 'workspace'
          });
        }
      }
    }
  }
  
  // Extract model references
  const modelPatterns = [
    /local\s+(\w+)\s*=\s*workspace:WaitForChild\s*\(\s*["']([^"']+)["']\s*\).*Model/g,
    /local\s+(\w+)\s*=\s*game\.Workspace\.Models\.(\w+)/g,
    /ServerStorage\.Models:FindFirstChild\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  
  for (const pattern of modelPatterns) {
    const matches = [...code.matchAll(pattern)];
    for (const match of matches) {
      const name = match[2] || match[3] || match[1];
      if (!processedAssets.has(name)) {
        processedAssets.add(name);
        assets.push({
          name,
          type: 'Model',
          location: pattern.source.includes('ServerStorage') ? 'ServerStorage.Models' : 'workspace'
        });
      }
    }
  }
  
  return assets;
}

function extractServices(code: string): string[] {
  const services = new Set<string>();
  
  // Extract GetService calls
  const serviceMatches = code.matchAll(/game:GetService\s*\(\s*["']([^"']+)["']\s*\)/g);
  for (const match of serviceMatches) {
    services.add(match[1]);
  }
  
  // Extract common service shortcuts
  const shortcuts: Record<string, string> = {
    'workspace': 'Workspace',
    'Players': 'Players',
    'ReplicatedStorage': 'ReplicatedStorage',
    'ServerStorage': 'ServerStorage',
    'ServerScriptService': 'ServerScriptService',
    'StarterGui': 'StarterGui',
    'StarterPlayer': 'StarterPlayer',
    'Lighting': 'Lighting',
    'Teams': 'Teams',
  };
  
  for (const [shortcut, service] of Object.entries(shortcuts)) {
    if (new RegExp(`\\b${shortcut}\\b`).test(code)) {
      services.add(service);
    }
  }
  
  return Array.from(services);
}

function extractFolderStructure(code: string): FolderStructure[] {
  const structures: FolderStructure[] = [];
  const processedPaths = new Set<string>();
  
  // Extract folder paths from various patterns
  const pathPatterns = [
    /(\w+)\.(\w+)\.(\w+)/g,  // Service.Folder.Object
    /ReplicatedStorage:WaitForChild\s*\(\s*["'](\w+)["']\s*\)/g,
    /ServerStorage:WaitForChild\s*\(\s*["'](\w+)["']\s*\)/g,
    /local\s+\w+\s*=\s*(\w+)\.(\w+)/g,
  ];
  
  // Analyze paths to determine folder structure
  const folderPaths = new Set<string>();
  
  // Look for explicit folder creation
  const folderMatches = code.matchAll(/Instance\.new\s*\(\s*["']Folder["']\s*\)/g);
  for (const match of folderMatches) {
    // Find the associated variable and name
    const context = code.substring(Math.max(0, match.index! - 100), match.index! + 200);
    const varMatch = context.match(/local\s+(\w+)\s*=\s*Instance\.new/);
    if (varMatch) {
      const varName = varMatch[1];
      const nameMatch = context.match(new RegExp(`${varName}\\.Name\\s*=\\s*["']([^"']+)["']`));
      const parentMatch = context.match(new RegExp(`${varName}\\.Parent\\s*=\\s*([\\w.]+)`));
      
      if (nameMatch && parentMatch) {
        const path = `${parentMatch[1]}.${nameMatch[1]}`;
        folderPaths.add(path);
      }
    }
  }
  
  // Extract implied folder structure from paths
  const impliedPaths = [
    'ReplicatedStorage.RemoteEvents',
    'ReplicatedStorage.RemoteFunctions',
    'ReplicatedStorage.Modules',
    'ServerStorage.Tools',
    'ServerStorage.Models',
    'workspace.Maps',
    'workspace.Spawns',
  ];
  
  for (const path of impliedPaths) {
    if (code.includes(path.split('.')[1])) {
      folderPaths.add(path);
    }
  }
  
  // Convert paths to folder structures
  for (const path of folderPaths) {
    if (!processedPaths.has(path)) {
      processedPaths.add(path);
      const parts = path.split('.');
      if (parts.length >= 2) {
        structures.push({
          path,
          type: 'Folder',
          children: []
        });
      }
    }
  }
  
  return structures;
}

function extractVariables(code: string): VariableInfo[] {
  const variables: VariableInfo[] = [];
  
  // Extract configuration variables
  const configPatterns = [
    /local\s+(\w+)\s*=\s*(\d+)\s*--.*(?:cooldown|time|delay|duration|speed|amount)/gi,
    /local\s+(\w+)\s*=\s*["']([^"']+)["']\s*--.*(?:name|id|key)/gi,
    /local\s+(\w+_(?:TIME|DELAY|COOLDOWN|SPEED|AMOUNT))\s*=\s*(.+)/g,
  ];
  
  for (const pattern of configPatterns) {
    const matches = [...code.matchAll(pattern)];
    for (const match of matches) {
      variables.push({
        name: match[1],
        value: match[2],
        type: isNaN(Number(match[2])) ? 'string' : 'number'
      });
    }
  }
  
  return variables;
}

function extractPropertyRequirements(code: string): PropertyRequirement[] {
  const requirements: PropertyRequirement[] = [];
  
  // Extract property checks and requirements
  if (code.includes('.Touched:Connect')) {
    requirements.push({
      object: 'Part',
      property: 'CanCollide',
      value: true,
      required: true
    });
  }
  
  if (code.includes('Anchored = true')) {
    requirements.push({
      object: 'Part',
      property: 'Anchored',
      value: true,
      required: false
    });
  }
  
  if (code.includes('ClickDetector')) {
    requirements.push({
      object: 'Part',
      property: 'ClickDetector',
      value: 'Child object',
      required: true
    });
  }
  
  if (code.includes('ProximityPrompt')) {
    requirements.push({
      object: 'Part',
      property: 'ProximityPrompt',
      value: 'Child object',
      required: true
    });
  }
  
  return requirements;
}

/**
 * Generate a visual hierarchy structure for the Explorer
 */
export function generateHierarchy(analysis: CodeAnalysis): string {
  let hierarchy = '';
  
  // Group by service
  const serviceGroups: Record<string, string[]> = {
    'Workspace': [],
    'ReplicatedStorage': [],
    'ServerStorage': [],
    'ServerScriptService': [],
    'StarterPlayer': [],
    'StarterGui': []
  };
  
  // Add objects to their services
  for (const obj of analysis.objects) {
    if (obj.parent) {
      const service = obj.parent.split('.')[0];
      if (serviceGroups[service]) {
        serviceGroups[service].push(`  └─ ${obj.name} (${obj.type})`);
      }
    }
  }
  
  // Add folder structures
  for (const folder of analysis.folderStructure) {
    const [service, ...folderPath] = folder.path.split('.');
    if (serviceGroups[service]) {
      serviceGroups[service].push(`  └─ 📁 ${folderPath.join('/')}`);
    }
  }
  
  // Add remote events
  for (const remote of analysis.remoteEvents) {
    const service = remote.location.split('.')[0];
    if (serviceGroups[service]) {
      serviceGroups[service].push(`  └─ 🔌 ${remote.name} (${remote.type})`);
    }
  }
  
  // Build hierarchy string
  for (const [service, items] of Object.entries(serviceGroups)) {
    if (items.length > 0) {
      hierarchy += `📦 ${service}\n`;
      hierarchy += items.join('\n') + '\n\n';
    }
  }
  
  return hierarchy;
}