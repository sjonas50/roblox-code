local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")

-- Configuration
local NORMAL_SPEED = 16
local SPRINT_SPEED = 24
local SPRINT_KEY = Enum.KeyCode.LeftShift

-- Variables
local player = Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")
local isSprinting = false

-- Function to update character references when respawning
local function updateCharacterReferences()
	character = player.Character
	if character then
		humanoid = character:WaitForChild("Humanoid")
		-- Reset to normal speed on respawn
		humanoid.WalkSpeed = NORMAL_SPEED
		isSprinting = false
	end
end

-- Function to start sprinting
local function startSprint()
	if humanoid and humanoid.Health > 0 and not isSprinting then
		isSprinting = true
		humanoid.WalkSpeed = SPRINT_SPEED
	end
end

-- Function to stop sprinting
local function stopSprint()
	if humanoid and isSprinting then
		isSprinting = false
		humanoid.WalkSpeed = NORMAL_SPEED
	end
end

-- Input handling
UserInputService.InputBegan:Connect(function(input, gameProcessedEvent)
	-- Ignore if player is typing in chat or other GUI
	if gameProcessedEvent then
		return
	end
	
	if input.KeyCode == SPRINT_KEY then
		startSprint()
	end
end)

UserInputService.InputEnded:Connect(function(input, gameProcessedEvent)
	if gameProcessedEvent then
		return
	end
	
	if input.KeyCode == SPRINT_KEY then
		stopSprint()
	end
end)

-- Handle character respawning
player.CharacterAdded:Connect(updateCharacterReferences)

-- Mobile support (optional)
local function createMobileButton()
	local playerGui = player:WaitForChild("PlayerGui")
	
	-- Create sprint button for mobile
	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = "SprintGui"
	screenGui.ResetOnSpawn = false
	screenGui.Parent = playerGui
	
	local sprintButton = Instance.new("TextButton")
	sprintButton.Name = "SprintButton"
	sprintButton.Size = UDim2.new(0, 80, 0, 80)
	sprintButton.Position = UDim2.new(1, -100, 1, -200)
	sprintButton.AnchorPoint = Vector2.new(0.5, 0.5)
	sprintButton.BackgroundColor3 = Color3.new(0.2, 0.2, 0.2)
	sprintButton.BackgroundTransparency = 0.3
	sprintButton.Text = "Sprint"
	sprintButton.TextColor3 = Color3.new(1, 1, 1)
	sprintButton.TextScaled = true
	sprintButton.Font = Enum.Font.SourceSansBold
	sprintButton.Parent = screenGui
	
	-- Round corners
	local uiCorner = Instance.new("UICorner")
	uiCorner.CornerRadius = UDim.new(0, 12)
	uiCorner.Parent = sprintButton
	
	-- Mobile button functionality
	sprintButton.MouseButton1Down:Connect(startSprint)
	sprintButton.MouseButton1Up:Connect(stopSprint)
	sprintButton.TouchLongPress:Connect(startSprint)
	sprintButton.TouchEnded:Connect(stopSprint)
	
	-- Hide on PC, show on mobile
	if UserInputService.TouchEnabled and not UserInputService.KeyboardEnabled then
		sprintButton.Visible = true
	else
		sprintButton.Visible = false
	end
end

-- Check if on mobile and create button
if UserInputService.TouchEnabled then
	createMobileButton()
end

-- Safety check: Stop sprinting if humanoid dies
if humanoid then
	humanoid.Died:Connect(function()
		stopSprint()
	end)
end