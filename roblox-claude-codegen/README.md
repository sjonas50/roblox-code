# Roblox Claude Code Generator

A TypeScript library that uses the Claude Code SDK to generate Roblox Luau scripts from natural language prompts. This tool enables developers to quickly create server scripts, client scripts, and module scripts for Roblox Studio using AI-powered code generation.

## Features

- 🤖 **AI-Powered Generation**: Uses Claude Code SDK to generate high-quality Luau code
- 📝 **Multiple Script Types**: Supports server scripts, client scripts, and module scripts
- 🎯 **Context-Aware**: Understands Roblox services, APIs, and best practices
- 🏗️ **Project Structure**: Generates Rojo-compatible file structures
- 🔒 **Type Safety**: Optional Luau type checking with `--!strict`
- 📁 **File Management**: Automatic file naming and organization

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd roblox-claude-codegen

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

Set your Anthropic API key as an environment variable:

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

## Usage

### Basic Example

```typescript
import { generateRobloxCode } from 'roblox-claude-codegen';

const result = await generateRobloxCode(
  "Create a script that gives players 50 coins when they touch a part",
  {
    scriptType: 'server',
    useTypeChecking: true
  }
);

if (result.success) {
  console.log(result.files[0].content);
}
```

### Permission Modes

By default, the generator uses `bypassPermissions` mode for automatic operation. You can configure this:

```typescript
const result = await generateRobloxCode(
  "Create a leaderboard system",
  {
    scriptType: 'server',
    permissionMode: 'bypassPermissions' // Automatic, no prompts (default)
    // permissionMode: 'acceptEdits'    // May prompt for edits
    // permissionMode: 'default'        // Standard mode with prompts
  }
);
```

You can also set a default permission mode via environment variable:
```bash
export CLAUDE_CODE_PERMISSION_MODE=acceptEdits
```

### Advanced Example with Context

```typescript
import { generateRobloxCode, writeGeneratedFiles } from 'roblox-claude-codegen';

const result = await generateRobloxCode(
  "Create an inventory system with item storage and retrieval",
  {
    scriptType: 'module',
    targetService: 'ReplicatedStorage',
    maxTurns: 5
  },
  {
    gameType: 'rpg',
    existingServices: ['DataStoreService', 'Players'],
    dependencies: ['DataStore2']
  }
);

// Write files to disk
if (result.success) {
  await writeGeneratedFiles(result.files, {
    outputDir: './src',
    createDirectories: true
  });
}
```

### CLI Usage

Run the interactive CLI:

```bash
npm run dev examples/cli.ts
```

### Full Example

See `examples/example.ts` for a comprehensive demonstration:

```bash
npm run dev examples/example.ts
```

## API Reference

### `generateRobloxCode(prompt, options, context?)`

Generates Roblox Luau code from a natural language prompt.

#### Parameters:
- `prompt` (string): Natural language description of what to create
- `options` (RobloxGenerationOptions):
  - `scriptType`: 'server' | 'client' | 'module'
  - `targetService?`: Target Roblox service (e.g., 'ServerScriptService')
  - `maxTurns?`: Maximum conversation turns (default: 3)
  - `includeComments?`: Include helpful comments in code
  - `useTypeChecking?`: Add `--!strict` for type checking
  - `permissionMode?`: Permission mode ('default' | 'acceptEdits' | 'bypassPermissions')
  - `customSystemPrompt?`: Override the default system prompt
  - `allowedTools?`: Array of allowed tool names
  - `cwd?`: Working directory for operations
- `context?` (RobloxContext):
  - `gameType?`: Type of game ('rpg', 'obby', 'tycoon', etc.)
  - `existingServices?`: Services already in use
  - `dependencies?`: Required modules or packages

#### Returns:
- `GeneratedCode` object with:
  - `success`: boolean
  - `files`: Array of generated files
  - `messages`: SDK messages
  - `errors?`: Any errors encountered

### `writeGeneratedFiles(files, options)`

Writes generated files to disk.

#### Parameters:
- `files`: Array of GeneratedFile objects
- `options`: WriteOptions
  - `outputDir`: Output directory path
  - `createDirectories?`: Create missing directories
  - `overwrite?`: Overwrite existing files

### `createRobloxProject(projectName, outputDir)`

Creates a standard Roblox project structure.

## Project Structure

Generated projects follow this structure:

```
MyRobloxGame/
├── src/
│   ├── server/      # Server scripts
│   ├── client/      # Client scripts
│   └── shared/      # Shared modules
├── assets/          # Game assets
├── tests/           # Test scripts
├── default.project.json  # Rojo configuration
└── README.md
```

## File Naming Convention

- Server scripts: `*.server.lua`
- Client scripts: `*.client.lua`
- Module scripts: `*.lua`

## Integration with Roblox Studio

### Using Rojo

1. Install Rojo: `cargo install rojo`
2. Start Rojo server in your project: `rojo serve`
3. Install the Rojo plugin in Roblox Studio
4. Connect to `localhost:34872`

### Direct File Import

Generated `.lua` files can be copied directly into Roblox Studio.

## Best Practices

1. **Be Specific**: Provide detailed prompts for better results
2. **Use Context**: Specify game type and existing services
3. **Review Generated Code**: Always review and test generated code
4. **Iterate**: Use higher `maxTurns` for complex systems

## Examples of Prompts

### Server Scripts
- "Create a leaderboard system that tracks player scores"
- "Build a shop system where players can buy items with coins"
- "Make a day/night cycle that changes every 5 minutes"

### Client Scripts
- "Create a health bar GUI that updates in real-time"
- "Build a settings menu with sound and graphics options"
- "Make a minimap that shows nearby players"

### Module Scripts
- "Create a weapon system with different damage types"
- "Build a quest manager that handles multiple quest types"
- "Make a utility module for common math operations"

## Limitations

- Visual assets (models, textures) are not generated
- Complex game mechanics may require multiple generations
- Generated code should be reviewed and tested

## Contributing

Contributions are welcome! Please submit pull requests or issues.

## License

MIT License