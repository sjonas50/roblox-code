// Template Service with starter scripts for common Roblox game mechanics
import { Template, TemplateCategory } from '@/types/project';

export const STARTER_TEMPLATES: Template[] = [
  {
    id: 'template_leaderstats',
    name: 'Leaderboard System',
    category: 'player-systems',
    description: 'Basic leaderboard with points and level system',
    tags: ['leaderboard', 'stats', 'player-data'],
    difficulty: 'beginner',
    scripts: [
      {
        name: 'LeaderboardManager',
        type: 'server',
        path: 'ServerScriptService',
        content: `-- Leaderboard System
-- Place in ServerScriptService

local Players = game:GetService("Players")

local function createLeaderstats(player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player
    
    local points = Instance.new("IntValue")
    points.Name = "Points"
    points.Value = 0
    points.Parent = leaderstats
    
    local level = Instance.new("IntValue")
    level.Name = "Level"
    level.Value = 1
    level.Parent = leaderstats
    
    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = 100
    coins.Parent = leaderstats
end

Players.PlayerAdded:Connect(createLeaderstats)`,
        description: 'Creates leaderboard stats for each player'
      }
    ]
  },
  {
    id: 'template_team_system',
    name: 'Team System',
    category: 'player-systems',
    description: 'Auto-balancing team system with team spawns',
    tags: ['teams', 'spawning', 'multiplayer'],
    difficulty: 'beginner',
    scripts: [
      {
        name: 'TeamManager',
        type: 'server',
        path: 'ServerScriptService',
        content: `-- Team System with Auto-Balance
-- Place in ServerScriptService

local Teams = game:GetService("Teams")
local Players = game:GetService("Players")

-- Create teams if they don't exist
local function createTeams()
    local redTeam = Teams:FindFirstChild("Red Team") or Instance.new("Team")
    redTeam.Name = "Red Team"
    redTeam.TeamColor = BrickColor.new("Really red")
    redTeam.Parent = Teams
    
    local blueTeam = Teams:FindFirstChild("Blue Team") or Instance.new("Team")
    blueTeam.Name = "Blue Team"
    blueTeam.TeamColor = BrickColor.new("Really blue")
    blueTeam.Parent = Teams
end

-- Auto-balance teams
local function autoBalancePlayer(player)
    local redCount = #Teams["Red Team"]:GetPlayers()
    local blueCount = #Teams["Blue Team"]:GetPlayers()
    
    if redCount <= blueCount then
        player.Team = Teams["Red Team"]
    else
        player.Team = Teams["Blue Team"]
    end
end

createTeams()
Players.PlayerAdded:Connect(autoBalancePlayer)`,
        description: 'Automatically assigns players to balanced teams'
      }
    ]
  },
  {
    id: 'template_shop_system',
    name: 'Shop System',
    category: 'economy',
    description: 'Basic shop with purchasable items',
    tags: ['shop', 'economy', 'coins', 'purchases'],
    difficulty: 'intermediate',
    scripts: [
      {
        name: 'ShopServer',
        type: 'server',
        path: 'ServerScriptService',
        content: `-- Shop System Server
-- Place in ServerScriptService

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

-- Create RemoteEvents
local remotes = Instance.new("Folder")
remotes.Name = "ShopRemotes"
remotes.Parent = ReplicatedStorage

local purchaseItem = Instance.new("RemoteFunction")
purchaseItem.Name = "PurchaseItem"
purchaseItem.Parent = remotes

-- Shop items configuration
local SHOP_ITEMS = {
    SpeedBoost = {
        name = "Speed Boost",
        price = 100,
        description = "Increases walk speed by 50%",
        duration = 60 -- seconds
    },
    JumpBoost = {
        name = "Jump Power",
        price = 150,
        description = "Doubles jump height",
        duration = 60
    },
    Sword = {
        name = "Basic Sword",
        price = 500,
        description = "A basic combat sword",
        permanent = true
    }
}

local function applyItemEffect(player, itemId)
    local item = SHOP_ITEMS[itemId]
    if not item then return end
    
    local character = player.Character
    if not character then return end
    
    local humanoid = character:FindFirstChild("Humanoid")
    if not humanoid then return end
    
    if itemId == "SpeedBoost" then
        humanoid.WalkSpeed = 32
        task.wait(item.duration)
        humanoid.WalkSpeed = 16
    elseif itemId == "JumpBoost" then
        humanoid.JumpPower = 100
        task.wait(item.duration)
        humanoid.JumpPower = 50
    elseif itemId == "Sword" then
        -- Give sword tool (implement sword tool separately)
        print("Sword purchased for " .. player.Name)
    end
end

purchaseItem.OnServerInvoke = function(player, itemId)
    local item = SHOP_ITEMS[itemId]
    if not item then
        return false, "Item not found"
    end
    
    local leaderstats = player:FindFirstChild("leaderstats")
    if not leaderstats then
        return false, "No leaderstats found"
    end
    
    local coins = leaderstats:FindFirstChild("Coins")
    if not coins then
        return false, "No coins found"
    end
    
    if coins.Value < item.price then
        return false, "Not enough coins"
    end
    
    coins.Value = coins.Value - item.price
    
    -- Apply item effect
    spawn(function()
        applyItemEffect(player, itemId)
    end)
    
    return true, "Purchase successful"
end`,
        description: 'Server-side shop logic with item effects'
      },
      {
        name: 'ShopGUI',
        type: 'client',
        path: 'StarterGui',
        content: `-- Shop GUI Client
-- Place in StarterGui

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local player = Players.LocalPlayer

-- Wait for remotes
local remotes = ReplicatedStorage:WaitForChild("ShopRemotes")
local purchaseItem = remotes:WaitForChild("PurchaseItem")

-- Create GUI
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "ShopGUI"
screenGui.Parent = player:WaitForChild("PlayerGui")

local frame = Instance.new("Frame")
frame.Size = UDim2.new(0, 300, 0, 400)
frame.Position = UDim2.new(1, -320, 0.5, -200)
frame.BackgroundColor3 = Color3.new(0.2, 0.2, 0.2)
frame.BorderSizePixel = 0
frame.Parent = screenGui

local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, 0, 0, 50)
title.Text = "SHOP"
title.TextScaled = true
title.TextColor3 = Color3.new(1, 1, 1)
title.BackgroundColor3 = Color3.new(0.1, 0.1, 0.1)
title.Font = Enum.Font.SourceSansBold
title.Parent = frame

-- Shop toggle button
local toggleButton = Instance.new("TextButton")
toggleButton.Size = UDim2.new(0, 100, 0, 50)
toggleButton.Position = UDim2.new(0, 10, 0.5, -25)
toggleButton.Text = "SHOP"
toggleButton.TextScaled = true
toggleButton.Parent = screenGui

local shopOpen = false
toggleButton.MouseButton1Click:Connect(function()
    shopOpen = not shopOpen
    frame.Visible = shopOpen
end)

frame.Visible = false`,
        description: 'Client-side shop GUI'
      }
    ]
  },
  {
    id: 'template_datastore',
    name: 'Data Persistence',
    category: 'data',
    description: 'Save and load player data between sessions',
    tags: ['datastore', 'saving', 'persistence'],
    difficulty: 'intermediate',
    scripts: [
      {
        name: 'DataManager',
        type: 'server',
        path: 'ServerScriptService',
        content: `-- Data Store System
-- Place in ServerScriptService

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local RunService = game:GetService("RunService")

local playerDataStore = DataStoreService:GetDataStore("PlayerData_v1")

-- Default player data
local DEFAULT_DATA = {
    coins = 100,
    level = 1,
    experience = 0,
    inventory = {},
    settings = {
        musicEnabled = true,
        sfxEnabled = true
    }
}

local playerData = {}

local function loadPlayerData(player)
    local key = "Player_" .. player.UserId
    local success, data = pcall(function()
        return playerDataStore:GetAsync(key)
    end)
    
    if success then
        playerData[player] = data or DEFAULT_DATA
    else
        warn("Failed to load data for " .. player.Name)
        playerData[player] = DEFAULT_DATA
    end
    
    -- Create leaderstats from loaded data
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player
    
    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = playerData[player].coins
    coins.Parent = leaderstats
    
    local level = Instance.new("IntValue")
    level.Name = "Level"
    level.Value = playerData[player].level
    level.Parent = leaderstats
end

local function savePlayerData(player)
    local key = "Player_" .. player.UserId
    local data = playerData[player]
    
    if data then
        -- Update data from leaderstats
        local leaderstats = player:FindFirstChild("leaderstats")
        if leaderstats then
            data.coins = leaderstats.Coins.Value
            data.level = leaderstats.Level.Value
        end
        
        local success, err = pcall(function()
            playerDataStore:SetAsync(key, data)
        end)
        
        if not success then
            warn("Failed to save data for " .. player.Name .. ": " .. err)
        end
    end
end

-- Auto-save every 60 seconds
local function autoSave()
    while true do
        wait(60)
        for _, player in pairs(Players:GetPlayers()) do
            savePlayerData(player)
        end
    end
end

Players.PlayerAdded:Connect(loadPlayerData)
Players.PlayerRemoving:Connect(function(player)
    savePlayerData(player)
    playerData[player] = nil
end)

-- Save all data when server shuts down
game:BindToClose(function()
    if RunService:IsStudio() then
        wait(2)
    else
        for _, player in pairs(Players:GetPlayers()) do
            savePlayerData(player)
        end
    end
end)

-- Start auto-save
spawn(autoSave)`,
        description: 'Automatic data saving and loading system'
      }
    ]
  },
  {
    id: 'template_admin_commands',
    name: 'Admin Commands',
    category: 'admin',
    description: 'Basic admin command system',
    tags: ['admin', 'commands', 'moderation'],
    difficulty: 'intermediate',
    scripts: [
      {
        name: 'AdminCommands',
        type: 'server',
        path: 'ServerScriptService',
        content: `-- Admin Commands System
-- Place in ServerScriptService

local Players = game:GetService("Players")

-- List of admin user IDs (replace with your user IDs)
local ADMINS = {
    123456789, -- Replace with admin user IDs
}

-- Check if player is admin
local function isAdmin(player)
    return table.find(ADMINS, player.UserId) ~= nil
end

-- Command handlers
local commands = {}

commands.kick = function(admin, targetName, reason)
    local target = Players:FindFirstChild(targetName)
    if target then
        target:Kick(reason or "Kicked by admin")
        return true, "Kicked " .. targetName
    end
    return false, "Player not found"
end

commands.teleport = function(admin, targetName)
    local target = Players:FindFirstChild(targetName)
    if target and target.Character and admin.Character then
        target.Character:SetPrimaryPartCFrame(admin.Character.PrimaryPart.CFrame)
        return true, "Teleported " .. targetName
    end
    return false, "Teleport failed"
end

commands.give = function(admin, targetName, amount)
    local target = Players:FindFirstChild(targetName)
    amount = tonumber(amount) or 0
    
    if target then
        local leaderstats = target:FindFirstChild("leaderstats")
        if leaderstats and leaderstats:FindFirstChild("Coins") then
            leaderstats.Coins.Value = leaderstats.Coins.Value + amount
            return true, "Gave " .. amount .. " coins to " .. targetName
        end
    end
    return false, "Failed to give coins"
end

commands.speed = function(admin, speed)
    speed = tonumber(speed) or 16
    if admin.Character and admin.Character:FindFirstChild("Humanoid") then
        admin.Character.Humanoid.WalkSpeed = speed
        return true, "Set speed to " .. speed
    end
    return false, "Failed to set speed"
end

-- Parse and execute commands
local function onChatted(message, player)
    if not isAdmin(player) then return end
    
    if message:sub(1, 1) == "/" then
        local args = message:sub(2):split(" ")
        local commandName = args[1]:lower()
        table.remove(args, 1)
        
        local command = commands[commandName]
        if command then
            local success, result = command(player, unpack(args))
            print("[Admin] " .. player.Name .. ": " .. result)
        end
    end
end

Players.PlayerAdded:Connect(function(player)
    if isAdmin(player) then
        print(player.Name .. " is an admin")
    end
    
    player.Chatted:Connect(function(message)
        onChatted(message, player)
    end)
end)`,
        description: 'Admin command system with basic commands'
      }
    ]
  },
  {
    id: 'template_combat_system',
    name: 'Combat System',
    category: 'combat',
    description: 'Basic melee combat with damage and effects',
    tags: ['combat', 'fighting', 'damage', 'weapons'],
    difficulty: 'advanced',
    scripts: [
      {
        name: 'CombatServer',
        type: 'server',
        path: 'ServerScriptService',
        content: `-- Combat System Server
-- Place in ServerScriptService

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Debris = game:GetService("Debris")

-- Create remotes
local remotes = Instance.new("Folder")
remotes.Name = "CombatRemotes"
remotes.Parent = ReplicatedStorage

local dealDamage = Instance.new("RemoteEvent")
dealDamage.Name = "DealDamage"
dealDamage.Parent = remotes

-- Damage configuration
local DAMAGE_CONFIG = {
    baseDamage = 20,
    critChance = 0.1,
    critMultiplier = 2,
    knockbackPower = 30
}

-- Track combat cooldowns
local combatCooldowns = {}

local function isOnCooldown(player)
    local lastAttack = combatCooldowns[player]
    if lastAttack then
        return tick() - lastAttack < 0.5 -- 0.5 second cooldown
    end
    return false
end

local function applyKnockback(character, direction, power)
    local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
    if humanoidRootPart then
        local bodyVelocity = Instance.new("BodyVelocity")
        bodyVelocity.MaxForce = Vector3.new(4000, 4000, 4000)
        bodyVelocity.Velocity = direction * power + Vector3.new(0, 20, 0)
        bodyVelocity.Parent = humanoidRootPart
        
        Debris:AddItem(bodyVelocity, 0.2)
    end
end

dealDamage.OnServerEvent:Connect(function(player, targetHumanoid, weaponData)
    -- Validate request
    if not player.Character or isOnCooldown(player) then return end
    
    local character = player.Character
    local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
    if not humanoidRootPart then return end
    
    -- Validate target
    if not targetHumanoid or not targetHumanoid.Parent then return end
    if targetHumanoid.Health <= 0 then return end
    
    local targetCharacter = targetHumanoid.Parent
    local targetRootPart = targetCharacter:FindFirstChild("HumanoidRootPart")
    if not targetRootPart then return end
    
    -- Check distance (anti-exploit)
    local distance = (humanoidRootPart.Position - targetRootPart.Position).Magnitude
    if distance > 15 then return end -- Max attack range
    
    -- Calculate damage
    local damage = weaponData.damage or DAMAGE_CONFIG.baseDamage
    local isCrit = math.random() < DAMAGE_CONFIG.critChance
    
    if isCrit then
        damage = damage * DAMAGE_CONFIG.critMultiplier
    end
    
    -- Apply damage
    targetHumanoid:TakeDamage(damage)
    
    -- Apply knockback
    local knockbackDirection = (targetRootPart.Position - humanoidRootPart.Position).Unit
    applyKnockback(targetCharacter, knockbackDirection, DAMAGE_CONFIG.knockbackPower)
    
    -- Update cooldown
    combatCooldowns[player] = tick()
    
    -- Visual feedback
    local damageIndicator = Instance.new("BillboardGui")
    damageIndicator.Size = UDim2.new(2, 0, 2, 0)
    damageIndicator.StudsOffset = Vector3.new(0, 2, 0)
    damageIndicator.Parent = targetCharacter:FindFirstChild("Head")
    
    local damageText = Instance.new("TextLabel")
    damageText.Size = UDim2.new(1, 0, 1, 0)
    damageText.BackgroundTransparency = 1
    damageText.Text = tostring(math.floor(damage))
    damageText.TextScaled = true
    damageText.TextColor3 = isCrit and Color3.new(1, 0, 0) or Color3.new(1, 1, 0)
    damageText.Font = Enum.Font.SourceSansBold
    damageText.Parent = damageIndicator
    
    -- Animate damage indicator
    spawn(function()
        for i = 1, 20 do
            damageIndicator.StudsOffset = damageIndicator.StudsOffset + Vector3.new(0, 0.1, 0)
            damageText.TextTransparency = i / 20
            wait(0.05)
        end
        damageIndicator:Destroy()
    end)
end)`,
        description: 'Server-side combat handling with validation'
      }
    ]
  }
];

export class TemplateService {
  static getAllTemplates(): Template[] {
    return STARTER_TEMPLATES;
  }
  
  static getTemplatesByCategory(category: TemplateCategory): Template[] {
    return STARTER_TEMPLATES.filter(t => t.category === category);
  }
  
  static getTemplate(id: string): Template | null {
    return STARTER_TEMPLATES.find(t => t.id === id) || null;
  }
  
  static searchTemplates(query: string): Template[] {
    const lowercaseQuery = query.toLowerCase();
    return STARTER_TEMPLATES.filter(t => 
      t.name.toLowerCase().includes(lowercaseQuery) ||
      t.description.toLowerCase().includes(lowercaseQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
  
  static getCategories(): { value: TemplateCategory; label: string }[] {
    return [
      { value: 'game-mechanics', label: 'Game Mechanics' },
      { value: 'player-systems', label: 'Player Systems' },
      { value: 'ui-systems', label: 'UI Systems' },
      { value: 'economy', label: 'Economy & Shop' },
      { value: 'combat', label: 'Combat & Weapons' },
      { value: 'social', label: 'Social Features' },
      { value: 'admin', label: 'Admin Tools' },
      { value: 'utilities', label: 'Utilities' },
      { value: 'effects', label: 'Visual Effects' },
      { value: 'data', label: 'Data & Storage' }
    ];
  }
}