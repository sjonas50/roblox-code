# Migration Guide: Single Script → Project Management

## What's Changed?

The Roblox Code Generator now features a full project management system. Instead of generating one script at a time, you can now:
- Create multiple projects for different games
- Organize multiple scripts within each project
- Use templates to jumpstart development
- Export entire projects to Roblox Studio

## Quick Start

### First Time Users
1. When you open the app, click **"Open Project Manager"**
2. Click **"New Project"** to create your first project
3. Give it a name like "My Obby Game" or "Sword Fighting Game"
4. Choose a template if you want starter code, or select "Blank Project"
5. Click **"Create Project"**

### For Existing Users
Your previous single-script workflow still works! Just:
1. Generate code as before using the input field
2. The code is automatically saved to your current script
3. Create new scripts with the **"New Script"** button
4. Switch between scripts using the sidebar

## Key Differences

### Before (Single Script)
```
Generate Code → View Output → Copy to Studio
```

### Now (Project Management)
```
Create Project → Add Scripts → Generate Code → Export Project
```

## New Features You'll Love

### 1. **Templates** 
Start with pre-built systems:
- Leaderboards
- Teams
- Shops
- Combat
- Data Saving
- Admin Commands

### 2. **Script Organization**
- **Server Scripts** (🖥️) - Backend game logic
- **Client Scripts** (👤) - Player-specific code
- **Module Scripts** (📦) - Shared code libraries

### 3. **Export Options**
- **Direct to Studio** - Download as .rbxmx file
- **Rojo Setup** - Professional workflow
- **Backup** - Save your entire project

### 4. **Smart Chat**
- Ask questions without changing code
- Get implementation help
- Fix errors with context

## Common Tasks

### Creating a New Game
1. Click **"New Project"** in sidebar
2. Choose a game template (optional)
3. Start generating scripts

### Adding Features
1. Click **"New Script"** 
2. Choose script type (Server/Client/Module)
3. Generate code with AI

### Exporting to Roblox Studio
1. Click **"Export"** button
2. Choose **"Roblox Model"**
3. Import the .rbxmx file into Studio

### Switching Projects
- Click any project in the sidebar
- Your last project opens automatically

## Tips for Power Users

### Keyboard Shortcuts
- `Ctrl/Cmd + N` - New script (coming soon)
- `Ctrl/Cmd + S` - Save current script (auto-saved)
- `Ctrl/Cmd + E` - Export project (coming soon)

### Organization Best Practices
```
My Tower Defense/
├── GameController (Server)
├── TowerPlacement (Client)
├── WaveManager (Server)
├── TowerStats (Module)
└── ShopUI (Client)
```

### Using Templates Effectively
1. Start with a template
2. Generate improvements via chat
3. Add your custom features
4. Export when ready

## FAQ

**Q: Where are my scripts saved?**
A: Locally in your browser. Use Export → JSON Backup to save externally.

**Q: Can I import existing scripts?**
A: Yes! Create a new script and paste your code, or use Import to restore a backup.

**Q: Do I need to use projects?**
A: No, but it's recommended for better organization.

**Q: Can I share projects?**
A: Export as JSON and share the file. Recipients can import it.

## Need Help?

- **Chat Assistant**: Ask "How do I..." questions
- **Templates**: Browse examples for inspiration
- **GitHub Issues**: Report bugs or request features