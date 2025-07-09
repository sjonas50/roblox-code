# Roblox Lovable UI

A sophisticated web platform for generating Roblox games using AI, powered by Claude Code SDK with intelligent multi-agent orchestration.

## Features

### Core Capabilities
- 🤖 **Intelligent Code Generation**: Uses Claude Code SDK to generate high-quality Roblox Luau scripts
- 🧠 **Smart Multi-Agent Orchestration**: Claude analyzes requests and dynamically coordinates specialized agents
- 📝 **Multiple Script Types**: Supports server scripts, client scripts, and module scripts
- 🎮 **Game-Aware Generation**: Understands Roblox services, APIs, and best practices

### User Interface
- 🎨 **Beautiful Design**: Soft gradient backgrounds (orange → pink → blue → black) with floating animations
- 💬 **Interactive Chat Panel**: Improve generated code through conversation
- 📚 **Comprehensive Tutorials**: Smart, code-aware instructions with exact object names and paths
- 🔍 **Syntax Validation**: Automatic detection and fixing of Luau syntax errors
- 📊 **Version Control**: Track all code iterations with descriptions
- 🌓 **Dark Mode Support**: Fully themed for light and dark preferences

### Advanced Features
- 🏗️ **Visual Hierarchy Display**: Shows required Explorer structure
- ✅ **Interactive Checklists**: Step-by-step implementation guides
- 🔌 **RemoteEvent Setup Scripts**: Copy-paste code for quick setup
- 🧪 **Code-Specific Testing Steps**: Based on actual implementation
- 🔧 **Smart Troubleshooting**: Context-aware error solutions

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd roblox-lovable-ui
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env.local
```

4. Run the development server:
```bash
npm run dev
# or use the convenience script
./run-dev.sh
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

### Simple Requests
For straightforward requests, the system uses single-agent generation:
```
"Create a part that gives players a sword when touched"
→ Direct generation with focused prompts
```

### Complex Requests
For complex game requests, Claude analyzes and orchestrates multiple agents:
```
"Create a racing game with checkpoints, timer, and leaderboard"
→ Claude analyzes request
→ Creates specialized tasks:
   - Architecture Agent: Game structure
   - Vehicle System Agent: Racing mechanics
   - Checkpoint Agent: Progress tracking
   - Timer Agent: Time management
   - UI Agent: HUD and displays
→ Combines results into cohesive game
```

## Project Structure

```
roblox-lovable-ui/
├── app/
│   ├── page.tsx              # Main UI page
│   └── api/
│       ├── generate-intelligent/  # Smart orchestration endpoint
│       ├── generate/             # Standard generation
│       └── chat/                 # Chat improvements
├── components/
│   ├── CodeOutput.tsx        # Code display with syntax highlighting
│   ├── ChatPanel.tsx         # Interactive chat interface
│   ├── TutorialDisplay.tsx   # Enhanced tutorial component
│   ├── HierarchyDiagram.tsx  # Visual Explorer structure
│   └── MultiAgentProgress.tsx # Task progress display
├── utils/
│   ├── intelligentOrchestrator.ts # Claude-powered orchestration
│   ├── robloxCodeAnalyzer.ts     # Deep code analysis
│   ├── tutorialGenerator.ts      # Smart tutorial generation
│   └── luauSyntaxChecker.ts      # Syntax validation
```

## API Endpoints

- `POST /api/generate-intelligent` - Intelligent orchestration with Claude analysis
- `POST /api/generate` - Standard single-agent generation
- `POST /api/chat` - Chat-based code improvements

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI**: Claude Code SDK, Anthropic API
- **Code Processing**: Roblox Luau syntax checking, AST analysis
- **UI Libraries**: React Syntax Highlighter, Framer Motion

## Configuration

See `CLAUDE.md` for detailed configuration options and multi-agent orchestration details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details