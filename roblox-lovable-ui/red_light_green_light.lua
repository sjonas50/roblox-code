--!strict

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

-- Game Configuration
local GAME_CONFIG = {
    GreenLightDuration = {min = 3, max = 8},
    YellowLightDuration = {min = 2, max = 5},
    MovementThreshold = 0.5,
    StartPosition = Vector3.new(0, 5, -50),
    FinishLineZ = 50,
    EliminationHeight = -50
}

-- Game State
local gameState = "waiting" -- waiting, greenlight, yellowlight, ended
local playerPositions = {}
local playerVelocities = {}
local winners = {}
local eliminated = {}

-- Create game components
local function createGameComponents()
    -- Create folder for game objects
    local gameFolder = workspace:FindFirstChild("RedLightGreenLight")
    if not gameFolder then
        gameFolder = Instance.new("Folder")
        gameFolder.Name = "RedLightGreenLight"
        gameFolder.Parent = workspace
    end
    
    -- Create start platform
    local startPlatform = Instance.new("Part")
    startPlatform.Name = "StartPlatform"
    startPlatform.Size = Vector3.new(50, 1, 20)
    startPlatform.Position = GAME_CONFIG.StartPosition
    startPlatform.Anchored = true
    startPlatform.Material = Enum.Material.Concrete
    startPlatform.BrickColor = BrickColor.new("Medium stone grey")
    startPlatform.Parent = gameFolder
    
    -- Create finish line
    local finishLine = Instance.new("Part")
    finishLine.Name = "FinishLine"
    finishLine.Size = Vector3.new(50, 20, 2)
    finishLine.Position = Vector3.new(0, 10, GAME_CONFIG.FinishLineZ)
    finishLine.Anchored = true
    finishLine.Material = Enum.Material.Neon
    finishLine.BrickColor = BrickColor.new("Lime green")
    finishLine.Transparency = 0.5
    finishLine.CanCollide = false
    finishLine.Parent = gameFolder
    
    -- Create traffic light
    local trafficLight = Instance.new("Part")
    trafficLight.Name = "TrafficLight"
    trafficLight.Size = Vector3.new(10, 15, 3)
    trafficLight.Position = Vector3.new(0, 15, GAME_CONFIG.FinishLineZ + 10)
    trafficLight.Anchored = true
    trafficLight.Material = Enum.Material.Metal
    trafficLight.BrickColor = BrickColor.new("Really black")
    trafficLight.Parent = gameFolder
    
    -- Create light bulb
    local lightBulb = Instance.new("Part")
    lightBulb.Name = "LightBulb"
    lightBulb.Shape = Enum.PartType.Ball
    lightBulb.Size = Vector3.new(8, 8, 8)
    lightBulb.Position = Vector3.new(0, 15, GAME_CONFIG.FinishLineZ + 8)
    lightBulb.Anchored = true
    lightBulb.Material = Enum.Material.Neon
    lightBulb.BrickColor = BrickColor.new("Medium stone grey")
    lightBulb.Parent = trafficLight
    
    -- Create play area floor
    local floor = Instance.new("Part")
    floor.Name = "GameFloor"
    floor.Size = Vector3.new(50, 1, 120)
    floor.Position = Vector3.new(0, 0, 0)
    floor.Anchored = true
    floor.Material = Enum.Material.Grass
    floor.BrickColor = BrickColor.new("Bright green")
    floor.Parent = gameFolder
    
    return gameFolder, lightBulb, finishLine
end

local gameFolder, lightBulb, finishLine = createGameComponents()

-- Create RemoteEvents
local remoteFolder = ReplicatedStorage:FindFirstChild("RedLightGreenLight")
if not remoteFolder then
    remoteFolder = Instance.new("Folder")
    remoteFolder.Name = "RedLightGreenLight"
    remoteFolder.Parent = ReplicatedStorage
end

local stateChangeRemote = remoteFolder:FindFirstChild("StateChange") or Instance.new("RemoteEvent")
stateChangeRemote.Name = "StateChange"
stateChangeRemote.Parent = remoteFolder

-- Reset player to start
local function resetPlayer(player: Player)
    local character = player.Character
    if character then
        local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
        if humanoidRootPart then
            humanoidRootPart.CFrame = CFrame.new(
                GAME_CONFIG.StartPosition.X + math.random(-20, 20),
                GAME_CONFIG.StartPosition.Y + 5,
                GAME_CONFIG.StartPosition.Z
            )
        end
    end
end

-- Track player movement
local function trackPlayerMovement(player: Player)
    local character = player.Character
    if not character then return end
    
    local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
    if not humanoidRootPart then return end
    
    local currentPosition = humanoidRootPart.Position
    local lastPosition = playerPositions[player]
    
    if lastPosition then
        local velocity = (currentPosition - lastPosition).Magnitude
        playerVelocities[player] = velocity
    end
    
    playerPositions[player] = currentPosition
end

-- Eliminate player
local function eliminatePlayer(player: Player)
    if eliminated[player] then return end
    
    eliminated[player] = true
    local character = player.Character
    if character then
        local humanoid = character:FindFirstChild("Humanoid")
        if humanoid then
            humanoid.Health = 0
        end
    end
    
    -- Notify player
    stateChangeRemote:FireClient(player, "eliminated")
end

-- Check for movement during yellow light
local function checkMovementViolations()
    if gameState ~= "yellowlight" then return end
    
    for _, player in pairs(Players:GetPlayers()) do
        if not eliminated[player] and not winners[player] then
            local velocity = playerVelocities[player]
            if velocity and velocity > GAME_CONFIG.MovementThreshold then
                eliminatePlayer(player)
            end
        end
    end
end

-- Check for winners
local function checkWinCondition()
    for _, player in pairs(Players:GetPlayers()) do
        if not winners[player] and not eliminated[player] then
            local character = player.Character
            if character then
                local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
                if humanoidRootPart then
                    if humanoidRootPart.Position.Z >= GAME_CONFIG.FinishLineZ then
                        winners[player] = true
                        stateChangeRemote:FireClient(player, "winner")
                    end
                end
            end
        end
    end
end

-- Change light color
local function setLightColor(color: string)
    if color == "green" then
        lightBulb.BrickColor = BrickColor.new("Lime green")
    elseif color == "yellow" then
        lightBulb.BrickColor = BrickColor.new("New Yeller")
    else
        lightBulb.BrickColor = BrickColor.new("Medium stone grey")
    end
end

-- Game loop
local function runGame()
    while true do
        -- Wait for players
        if #Players:GetPlayers() < 1 then
            gameState = "waiting"
            setLightColor("grey")
            task.wait(1)
            continue
        end
        
        -- Reset game
        winners = {}
        eliminated = {}
        playerPositions = {}
        playerVelocities = {}
        
        -- Reset all players
        for _, player in pairs(Players:GetPlayers()) do
            resetPlayer(player)
        end
        
        task.wait(3) -- Give players time to load
        
        -- Game loop
        while #Players:GetPlayers() > 0 do
            -- Check if all players are either winners or eliminated
            local activePlayers = 0
            for _, player in pairs(Players:GetPlayers()) do
                if not winners[player] and not eliminated[player] then
                    activePlayers = activePlayers + 1
                end
            end
            
            if activePlayers == 0 then
                break
            end
            
            -- Green light phase
            gameState = "greenlight"
            setLightColor("green")
            stateChangeRemote:FireAllClients("greenlight")
            
            local greenDuration = math.random(GAME_CONFIG.GreenLightDuration.min, GAME_CONFIG.GreenLightDuration.max)
            task.wait(greenDuration)
            
            -- Yellow light phase
            gameState = "yellowlight"
            setLightColor("yellow")
            stateChangeRemote:FireAllClients("yellowlight")
            
            -- Clear velocities before yellow light
            for player, _ in pairs(playerVelocities) do
                playerVelocities[player] = 0
            end
            
            local yellowDuration = math.random(GAME_CONFIG.YellowLightDuration.min, GAME_CONFIG.YellowLightDuration.max)
            task.wait(yellowDuration)
        end
        
        -- Game ended
        gameState = "ended"
        setLightColor("grey")
        task.wait(5)
    end
end

-- Player handlers
Players.PlayerAdded:Connect(function(player: Player)
    player.CharacterAdded:Connect(function(character)
        -- Wait for character to load
        character:WaitForChild("HumanoidRootPart")
        task.wait(0.5)
        
        if gameState == "waiting" then
            resetPlayer(player)
        end
    end)
end)

Players.PlayerRemoving:Connect(function(player: Player)
    playerPositions[player] = nil
    playerVelocities[player] = nil
    winners[player] = nil
    eliminated[player] = nil
end)

-- Movement tracking loop
RunService.Heartbeat:Connect(function()
    for _, player in pairs(Players:GetPlayers()) do
        trackPlayerMovement(player)
    end
    
    checkMovementViolations()
    checkWinCondition()
end)

-- Finish line detection
finishLine.Touched:Connect(function(hit)
    local humanoid = hit.Parent:FindFirstChildOfClass("Humanoid")
    if humanoid then
        local player = Players:GetPlayerFromCharacter(hit.Parent)
        if player and not winners[player] and not eliminated[player] then
            winners[player] = true
            stateChangeRemote:FireClient(player, "winner")
        end
    end
end)

-- Start game loop
task.spawn(runGame)