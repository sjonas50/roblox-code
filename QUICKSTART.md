# Roblox Claude Code Generator - Quick Start Guide

This project provides a TypeScript library that uses the Claude Code SDK to generate Roblox Luau scripts from natural language prompts.

## Setup

1. Navigate to the generator directory:
```bash
cd roblox-claude-codegen
```

2. Install dependencies:
```bash
npm install
```

3. Set your Anthropic API key:
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

4. Build the project:
```bash
npm run build
```

## Usage Example

Here's a simple example of generating a Roblox script:

```typescript
import { generateRobloxCode } from './src';

const result = await generateRobloxCode(
  "Create a door that opens when a player gets close",
  {
    scriptType: 'server',
    useTypeChecking: true
  }
);

if (result.success) {
  console.log(result.files[0].content);
}
```

## Run Examples

### Interactive CLI:
```bash
npm run dev examples/cli.ts
```

### Full Examples:
```bash
npm run dev examples/example.ts
```

### Basic Test:
```bash
npm run dev test-basic.ts
```

## Key Features

- **Natural Language Input**: Describe what you want in plain English
- **Multiple Script Types**: Generate server scripts, client scripts, or modules
- **Roblox-Aware**: Understands Roblox services, APIs, and best practices
- **File Management**: Automatically organizes files with proper extensions
- **Type Safety**: Optional Luau type checking with `--!strict`

## Next Steps

1. Try the interactive CLI to generate your first script
2. Review the generated code and test it in Roblox Studio
3. Use Rojo to sync files directly to Studio
4. Explore advanced features like context injection and custom prompts

For more details, see the full README in the roblox-claude-codegen directory.