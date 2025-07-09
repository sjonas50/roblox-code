--!strict

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Create RemoteEvent for welcome message if it doesn't exist
local remoteEvents = ReplicatedStorage:FindFirstChild("RemoteEvents")
if not remoteEvents then
    remoteEvents = Instance.new("Folder")
    remoteEvents.Name = "RemoteEvents"
    remoteEvents.Parent = ReplicatedStorage
end

local welcomeRemote = remoteEvents:FindFirstChild("WelcomePlayer")
if not welcomeRemote then
    welcomeRemote = Instance.new("RemoteEvent")
    welcomeRemote.Name = "WelcomePlayer"
    welcomeRemote.Parent = remoteEvents
end

local function createLeaderstats(player: Player)
    -- Create leaderstats folder
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player
    
    -- Create Coins value
    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = 0
    coins.Parent = leaderstats
    
    return leaderstats
end

local function onPlayerAdded(player: Player)
    -- Create leaderstats and give initial coins
    local leaderstats = createLeaderstats(player)
    local coins = leaderstats:FindFirstChild("Coins") :: IntValue
    
    if coins then
        coins.Value = 100
    end
    
    -- Fire welcome event to client
    task.wait(1) -- Small delay to ensure character loads
    welcomeRemote:FireClient(player, {
        message = "Welcome to the game, " .. player.Name .. "!",
        coins = 100
    })
    
    -- Log player join
    print(player.Name .. " joined the game and received 100 coins")
end

-- Connect player added event
Players.PlayerAdded:Connect(onPlayerAdded)