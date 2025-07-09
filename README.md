# Roblox Code Generator

An AI-powered platform for generating Roblox games using Claude Code SDK with intelligent multi-agent orchestration.

## Projects

### 1. roblox-claude-codegen
Core library that interfaces with Claude Code SDK to generate Roblox Luau scripts.

### 2. roblox-lovable-ui
Beautiful web interface for the code generator with:
- Intelligent multi-agent orchestration
- Interactive chat for code improvements
- Comprehensive tutorials with code analysis
- Syntax validation and auto-fixing
- Version control for iterations

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/sjonas50/roblox-code.git
cd roblox-code
```

2. Install dependencies:
```bash
# Install core library dependencies
cd roblox-claude-codegen
npm install
npm run build

# Install UI dependencies
cd ../roblox-lovable-ui
npm install
```

3. Set up environment:
```bash
# In roblox-lovable-ui directory
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env.local
```

4. Run the application:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Features

- 🤖 **AI-Powered Generation**: Uses Claude Code SDK for high-quality Roblox scripts
- 🧠 **Intelligent Analysis**: Claude analyzes requests to determine optimal approach
- 👥 **Multi-Agent System**: Dynamically coordinates specialized agents for complex games
- 📚 **Smart Tutorials**: Code-aware instructions with exact names and paths
- 💬 **Interactive Chat**: Improve generated code through conversation
- ✨ **Beautiful UI**: Modern interface inspired by lovable.dev

## Documentation

See individual project READMEs for detailed documentation:
- [Core Library Documentation](./roblox-claude-codegen/README.md)
- [UI Documentation](./roblox-lovable-ui/README.md)
- [Configuration Guide](./CLAUDE.md)

## License

MIT License - see LICENSE file for details