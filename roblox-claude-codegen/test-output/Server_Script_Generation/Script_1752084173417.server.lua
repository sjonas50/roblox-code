--!strict
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Configuration
local RESPAWN_DELAY = 3 -- Seconds before respawning
local SPAWN_POINT_NAME = "SpawnPoint"
local SPAWN_POINTS_FOLDER_NAME = "SpawnPoints"

-- Variables
local spawnPoints: {BasePart} = {}
local playerConnections: {[Player]: {RBXScriptConnection}} = {}

-- Function to collect all spawn points in the workspace
local function collectSpawnPoints()
	spawnPoints = {}
	
	-- Look for a dedicated spawn points folder
	local spawnFolder = workspace:FindFirstChild(SPAWN_POINTS_FOLDER_NAME)
	if spawnFolder then
		for _, child in ipairs(spawnFolder:GetChildren()) do
			if child:IsA("BasePart") then
				table.insert(spawnPoints, child)
			end
		end
	end
	
	-- Also look for parts named "SpawnPoint" throughout workspace
	for _, descendant in ipairs(workspace:GetDescendants()) do
		if descendant:IsA("BasePart") and descendant.Name == SPAWN_POINT_NAME then
			-- Avoid duplicates if it's already in the spawn folder
			if not spawnFolder or descendant.Parent ~= spawnFolder then
				table.insert(spawnPoints, descendant)
			end
		end
	end
	
	print(string.format("[SpawnSystem] Found %d spawn points", #spawnPoints))
end

-- Function to get a random spawn point
local function getRandomSpawnPoint(): BasePart?
	if #spawnPoints == 0 then
		warn("[SpawnSystem] No spawn points available!")
		return nil
	end
	
	local randomIndex = math.random(1, #spawnPoints)
	return spawnPoints[randomIndex]
end

-- Function to teleport character to spawn point
local function teleportToSpawnPoint(character: Model, spawnPoint: BasePart)
	local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
	if not humanoidRootPart or not humanoidRootPart:IsA("BasePart") then
		warn("[SpawnSystem] Character missing HumanoidRootPart")
		return
	end
	
	-- Calculate spawn position slightly above the spawn point to avoid clipping
	local spawnCFrame = spawnPoint.CFrame + Vector3.new(0, 5, 0)
	
	-- Apply random rotation for variety
	local randomRotation = CFrame.Angles(0, math.rad(math.random(0, 360)), 0)
	spawnCFrame = spawnCFrame * randomRotation
	
	-- Teleport the character
	character:SetPrimaryPartCFrame(spawnCFrame)
end

-- Function to handle character spawning
local function onCharacterAdded(character: Model, player: Player)
	-- Wait for humanoid to load
	local humanoid = character:WaitForChild("Humanoid", 10)
	if not humanoid then
		warn(string.format("[SpawnSystem] Humanoid not found for %s", player.Name))
		return
	end
	
	-- Store connections for cleanup
	if not playerConnections[player] then
		playerConnections[player] = {}
	end
	
	-- Handle death
	local diedConnection = humanoid.Died:Connect(function()
		print(string.format("[SpawnSystem] %s died, respawning in %d seconds...", player.Name, RESPAWN_DELAY))
		
		-- Wait for respawn delay
		task.wait(RESPAWN_DELAY)
		
		-- Force respawn the player
		local success, err = pcall(function()
			player:LoadCharacter()
		end)
		
		if not success then
			warn(string.format("[SpawnSystem] Failed to respawn %s: %s", player.Name, err))
		end
	end)
	
	table.insert(playerConnections[player], diedConnection)
	
	-- Teleport to random spawn point on initial spawn
	local spawnPoint = getRandomSpawnPoint()
	if spawnPoint then
		-- Small delay to ensure character is fully loaded
		task.wait(0.1)
		teleportToSpawnPoint(character, spawnPoint)
		print(string.format("[SpawnSystem] Teleported %s to %s", player.Name, spawnPoint.Name))
	else
		warn(string.format("[SpawnSystem] Could not find spawn point for %s", player.Name))
	end
end

-- Function to clean up player connections
local function onPlayerRemoving(player: Player)
	if playerConnections[player] then
		for _, connection in ipairs(playerConnections[player]) do
			connection:Disconnect()
		end
		playerConnections[player] = nil
	end
end

-- Function to handle dynamic spawn point changes
local function onSpawnPointAdded(instance: Instance)
	if instance:IsA("BasePart") and instance.Name == SPAWN_POINT_NAME then
		table.insert(spawnPoints, instance)
		print(string.format("[SpawnSystem] Added new spawn point: %s", instance:GetFullName()))
	end
end

local function onSpawnPointRemoved(instance: Instance)
	if instance:IsA("BasePart") and instance.Name == SPAWN_POINT_NAME then
		local index = table.find(spawnPoints, instance)
		if index then
			table.remove(spawnPoints, index)
			print(string.format("[SpawnSystem] Removed spawn point: %s", instance:GetFullName()))
		end
	end
end

-- Initialize
collectSpawnPoints()

-- Connect events
Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function(character)
		onCharacterAdded(character, player)
	end)
end)

Players.PlayerRemoving:Connect(onPlayerRemoving)

-- Monitor for spawn point changes
workspace.DescendantAdded:Connect(onSpawnPointAdded)
workspace.DescendantRemoving:Connect(onSpawnPointRemoved)

-- Handle spawn folder creation/destruction
workspace.ChildAdded:Connect(function(child)
	if child.Name == SPAWN_POINTS_FOLDER_NAME then
		collectSpawnPoints()
	end
end)

workspace.ChildRemoved:Connect(function(child)
	if child.Name == SPAWN_POINTS_FOLDER_NAME then
		collectSpawnPoints()
	end
end)

print("[SpawnSystem] Initialized successfully")