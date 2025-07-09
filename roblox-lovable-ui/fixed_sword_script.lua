--!strict

local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")

-- Create the sword tool
local sword = Instance.new("Tool")
sword.Name = "Sword"
sword.ToolTip = "A basic sword"
sword.RequiresHandle = true
sword.CanBeDropped = true

-- Create the handle part (this is what the player holds)
local handle = Instance.new("Part")
handle.Name = "Handle"
handle.Size = Vector3.new(0.4, 5, 0.4)
handle.BrickColor = BrickColor.new("Dark stone grey")
handle.Material = Enum.Material.Metal
handle.TopSurface = Enum.SurfaceType.Smooth
handle.BottomSurface = Enum.SurfaceType.Smooth
handle.CanCollide = false
handle.Parent = sword

-- Create the blade mesh for better appearance
local mesh = Instance.new("SpecialMesh")
mesh.MeshType = Enum.MeshType.FileMesh
mesh.MeshId = "rbxasset://fonts/sword.mesh"
mesh.TextureId = "rbxasset://textures/SwordTexture.png"
mesh.Scale = Vector3.new(1, 1, 1)
mesh.Parent = handle

-- FIXED: Adjusted grip properties for proper orientation
-- GripPos controls where the tool sits relative to the hand
-- Negative Y moves it down into the hand, Z moves it forward/back
sword.GripPos = Vector3.new(0, 0, -1.5)

-- FIXED: Corrected grip orientation vectors
-- GripRight points to the right when holding the sword
-- GripUp points upward from the handle
-- GripForward points in the direction the sword blade faces
sword.GripRight = Vector3.new(0, 1, 0)    -- Sword handle points up
sword.GripUp = Vector3.new(0, 0, 1)       -- Blade faces forward
sword.GripForward = Vector3.new(1, 0, 0)  -- Right side of sword

-- Alternative grip for different sword orientation (if needed)
-- This makes the sword point forward like a traditional sword
--[[
sword.GripRight = Vector3.new(1, 0, 0)
sword.GripUp = Vector3.new(0, 1, 0)
sword.GripForward = Vector3.new(0, 0, 1)
sword.GripPos = Vector3.new(0, 0, -1.5)
--]]

-- Store the sword template in ServerStorage
sword.Parent = ServerStorage

-- Create the part that gives the sword
local swordGiver = Instance.new("Part")
swordGiver.Name = "SwordGiver"
swordGiver.Size = Vector3.new(4, 1, 4)
swordGiver.Position = Vector3.new(0, 5, 0)
swordGiver.BrickColor = BrickColor.new("Bright green")
swordGiver.Material = Enum.Material.Neon
swordGiver.TopSurface = Enum.SurfaceType.Smooth
swordGiver.BottomSurface = Enum.SurfaceType.Smooth
swordGiver.Anchored = true
swordGiver.CanCollide = true
swordGiver.Parent = Workspace

-- Create a visual indicator
local selectionBox = Instance.new("SelectionBox")
selectionBox.Adornee = swordGiver
selectionBox.Color3 = Color3.new(0, 1, 0)
selectionBox.LineThickness = 0.1
selectionBox.Parent = swordGiver

-- Add a floating effect to the giver part
local startY = swordGiver.Position.Y
task.spawn(function()
    while swordGiver.Parent do
        local time = tick()
        swordGiver.Position = Vector3.new(
            swordGiver.Position.X,
            startY + math.sin(time * 2) * 0.5,
            swordGiver.Position.Z
        )
        task.wait()
    end
end)

-- Table to track cooldowns per player
local cooldowns = {}

-- Handle the touch event
swordGiver.Touched:Connect(function(hit)
    if not hit or not hit.Parent then
        return
    end
    
    local humanoid = hit.Parent:FindFirstChild("Humanoid")
    if not humanoid then
        return
    end
    
    local player = Players:GetPlayerFromCharacter(hit.Parent)
    if not player then
        return
    end
    
    -- Check cooldown (prevent spam)
    local currentTime = tick()
    if cooldowns[player] and currentTime - cooldowns[player] < 3 then
        return
    end
    
    -- Update cooldown
    cooldowns[player] = currentTime
    
    -- Check if player already has a sword
    local backpack = player:FindFirstChild("Backpack")
    if not backpack then
        return
    end
    
    local character = player.Character
    if not character then
        return
    end
    
    -- Check if sword already exists in backpack or character
    local existingSword = backpack:FindFirstChild("Sword") or character:FindFirstChild("Sword")
    if existingSword then
        return
    end
    
    -- Clone and give the sword
    local newSword = sword:Clone()
    
    -- IMPORTANT: Set up the sword functionality before giving it to the player
    setupSword(newSword)
    
    newSword.Parent = backpack
    
    -- Add a sparkle effect when sword is given
    local sparkle = Instance.new("Sparkles")
    sparkle.SparkleColor = Color3.new(1, 1, 0)
    sparkle.Parent = swordGiver
    task.wait(1)
    sparkle:Destroy()
end)

-- Clean up cooldowns when player leaves
Players.PlayerRemoving:Connect(function(player)
    cooldowns[player] = nil
end)

-- Sword functionality
function setupSword(tool)
    local handle = tool:WaitForChild("Handle")
    local canDamage = true
    local damage = 20
    
    tool.Activated:Connect(function()
        if not canDamage then
            return
        end
        
        -- Get character and humanoid
        local character = tool.Parent
        if not character then
            return
        end
        
        local humanoid = character:FindFirstChild("Humanoid")
        if not humanoid then
            return
        end
        
        -- Play slash animation if available
        local slashAnim = Instance.new("Animation")
        slashAnim.AnimationId = "rbxassetid://129967390" -- Default sword slash animation
        
        local animator = humanoid:FindFirstChild("Animator")
        if animator then
            local animTrack = animator:LoadAnimation(slashAnim)
            animTrack:Play()
        end
        
        -- Damage cooldown
        canDamage = false
        
        -- Handle damage during swing
        local connection
        local damagedHumanoids = {} -- Track who we've already damaged this swing
        
        connection = handle.Touched:Connect(function(hit)
            if not hit or not hit.Parent then
                return
            end
            
            local enemyHumanoid = hit.Parent:FindFirstChild("Humanoid")
            if not enemyHumanoid or enemyHumanoid == humanoid then
                return
            end
            
            -- Only damage each humanoid once per swing
            if damagedHumanoids[enemyHumanoid] then
                return
            end
            
            damagedHumanoids[enemyHumanoid] = true
            enemyHumanoid:TakeDamage(damage)
        end)
        
        -- Disconnect after swing duration
        task.wait(0.5)
        if connection then
            connection:Disconnect()
        end
        
        -- Reset for next swing
        task.wait(0.5)
        canDamage = true
    end)
end