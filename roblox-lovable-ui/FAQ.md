# Frequently Asked Questions (FAQ)

## General Questions

### What is the Roblox Code Generator?
The Roblox Code Generator is an AI-powered development platform that helps you create Roblox scripts using natural language. Simply describe what you want to build, and the AI generates professional Lua code for your game.

### Is this free to use?
The platform itself is free, but you need an Anthropic API key to use the AI generation features. You can get an API key from [Anthropic's website](https://console.anthropic.com/).

### What can I build with this?
Anything you can imagine for Roblox! Common examples include:
- Game mechanics (combat, movement, abilities)
- UI systems (shops, inventories, menus)
- Economy systems (currencies, trading)
- Admin tools and moderation
- Special effects and animations
- Data persistence and leaderboards

### Do I need to know how to code?
No! The AI handles the coding for you. However, basic understanding of Roblox Studio and where to place scripts is helpful.

## Getting Started

### How do I start my first project?
1. When you first open the app, you'll see three options:
   - **Quick Start**: Immediately start generating code
   - **New Project**: Create an organized project
   - **Use Template**: Start with pre-built systems

2. Choose the option that fits your needs
3. Start describing what you want to build!

### What's the difference between Quick Start and New Project?
- **Quick Start**: Creates a single script immediately, perfect for testing ideas
- **New Project**: Lets you organize multiple scripts, better for complete games

### Should I use templates?
Templates are great for:
- Learning how systems work
- Getting a head start on common features
- Understanding best practices

Available templates include leaderboards, teams, shops, combat systems, and more.

## Using the Generator

### How do I generate code?
1. Select or create a script in your project
2. Type what you want in the input box (e.g., "Create a sword that deals damage")
3. Choose the script type (Server, Client, or Module)
4. Click Generate or press Enter

### What are Server, Client, and Module scripts?
- **Server Scripts** (🖥️): Run on the server, handle game logic, security
- **Client Scripts** (👤): Run on each player's computer, handle UI and input
- **Module Scripts** (📦): Shared code that other scripts can use

### Can I generate multiple related scripts?
Yes! The AI understands context. For example:
1. Generate a server script for game logic
2. Generate a client script for the UI
3. The AI will make them work together

### How detailed should my prompts be?
Be specific about what you want:
- ❌ "Make a gun"
- ✅ "Create a laser gun that shoots red beams, deals 20 damage, has a 0.5 second cooldown, and plays a sound effect"

## Project Management

### How do I organize my scripts?
Projects automatically organize scripts by type:
- Server scripts go together
- Client scripts go together  
- Module scripts go together

You can rename scripts to keep track of their purpose.

### Can I have multiple projects?
Yes! Create as many projects as you need. Each game should typically be its own project.

### How do I switch between projects?
Click on any project name in the sidebar. Your last open project is remembered.

### Can I delete projects or scripts?
Yes, right-click on any project or script in the sidebar (feature coming soon). For now, you can export and reimport to clean up.

## Code Generation

### The AI generated code with errors. What do I do?
1. Click the chat button (bottom right)
2. Paste the error message from Roblox Studio
3. The AI will fix the code and explain what was wrong

### Can I ask the AI to modify existing code?
Yes! Use the chat to:
- Add features: "Add a cooldown to the sword"
- Fix issues: "Make this work for all players"
- Optimize: "Make this more efficient"

### Does the AI remember previous conversations?
Yes, within the same session. The AI remembers:
- What code it generated
- Previous modifications
- The context of your project

### Can I ask questions without changing code?
Yes! The chat understands when you're asking for help vs requesting changes. Examples:
- "How do I implement this in Studio?"
- "Where should I put this script?"
- "Can you explain how this works?"

## Exporting and Using Code

### How do I get my code into Roblox Studio?
Several options:
1. **Copy & Paste**: Click copy button, paste in Studio
2. **Export as .rbxmx**: Download and drag into Studio
3. **Export as Rojo**: For professional workflows

### What export format should I use?
- **Beginners**: Use copy/paste or .rbxmx
- **Teams**: Use Rojo for version control
- **Backup**: Use JSON to save your project

### Where do I place scripts in Roblox Studio?
- **Server Scripts**: ServerScriptService
- **Client Scripts**: StarterPlayer > StarterPlayerScripts
- **Module Scripts**: ReplicatedStorage (usually)

The generator adds comments telling you where each script belongs.

## Templates and Examples

### What templates are available?
- **Leaderboard System**: Player stats and points
- **Team System**: Auto-balancing teams
- **Shop System**: In-game purchases
- **Data Persistence**: Save player progress
- **Admin Commands**: Moderation tools
- **Combat System**: Weapons and damage

### Can I modify templates?
Yes! Templates are starting points. After adding a template:
1. Review the code
2. Use chat to customize it
3. Add your own features

### Can I create my own templates?
Not yet, but you can:
1. Save projects as JSON backups
2. Share them with others
3. Import them as starting points

## Troubleshooting

### My code isn't working in Studio
Common issues:
1. **Script in wrong location**: Check the comments for placement
2. **Missing dependencies**: Some scripts work together
3. **API Services not enabled**: Enable required services in Game Settings
4. **Syntax errors**: Use chat to fix

### The generator is taking too long
- Complex requests may take 30-60 seconds
- Break down complex systems into smaller parts
- Use the abort button if needed (coming soon)

### I lost my project
If you cleared browser data:
1. Always export important projects as backups
2. JSON exports can be reimported
3. Consider using Rojo for external version control

### The chat isn't updating my code
Make sure to:
1. Have a script selected
2. Be specific about what to change
3. Check that the code panel is showing the current version

## Best Practices

### How should I structure my game?
1. Start with core mechanics
2. Add features incrementally
3. Test each script before adding more
4. Keep related scripts in the same project

### Should I generate everything at once?
No, it's better to:
1. Generate one system at a time
2. Test it in Studio
3. Fix any issues
4. Then add the next feature

### How can I make my code more secure?
The AI follows Roblox security best practices:
- Server validation for important actions
- Never trust the client
- Use RemoteEvents carefully
- Validate all user input

### Any tips for better results?
1. Be specific in your prompts
2. Use the chat for iterations
3. Test frequently in Studio
4. Read the generated comments
5. Ask questions when unsure

## Advanced Features

### Can I use external APIs?
Yes, but remember:
- Enable HttpService in Game Settings
- Follow Roblox's HttpService limitations
- Handle errors properly
- Never expose API keys

### Does it support advanced Roblox features?
Yes! You can request:
- Pathfinding systems
- Advanced animations
- Custom particle effects
- Complex UI with Roact
- DataStore v2 features

### Can I integrate with existing code?
Yes! 
1. Paste your existing code in chat
2. Ask the AI to integrate new features
3. Or create compatible modules

## Getting Help

### Where can I get more help?
- Use the chat to ask questions
- Check the How-To guide for tutorials
- Report issues on GitHub
- Join the community (coming soon)

### Can I contribute to the project?
Yes! The project is open source:
- Report bugs on GitHub
- Suggest features
- Contribute code
- Share your templates

### Is my code/data private?
- Projects are stored locally in your browser
- Code is sent to Anthropic's API for generation
- We don't store or see your code
- Export backups for safety