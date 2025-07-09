local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Create the GUI
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "CoinDisplay"
screenGui.ResetOnSpawn = false
screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
screenGui.Parent = playerGui

-- Create the main frame
local frame = Instance.new("Frame")
frame.Name = "CoinFrame"
frame.Size = UDim2.new(0, 200, 0, 50)
frame.Position = UDim2.new(1, -210, 0, 10)
frame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
frame.BorderSizePixel = 0
frame.BackgroundTransparency = 0.2
frame.Parent = screenGui

-- Add rounded corners
local uiCorner = Instance.new("UICorner")
uiCorner.CornerRadius = UDim.new(0, 8)
uiCorner.Parent = frame

-- Add stroke for better visibility
local uiStroke = Instance.new("UIStroke")
uiStroke.Color = Color3.fromRGB(255, 215, 0)
uiStroke.Thickness = 2
uiStroke.Transparency = 0.5
uiStroke.Parent = frame

-- Create coin icon (using text emoji for simplicity)
local coinIcon = Instance.new("TextLabel")
coinIcon.Name = "CoinIcon"
coinIcon.Size = UDim2.new(0, 40, 0, 40)
coinIcon.Position = UDim2.new(0, 5, 0, 5)
coinIcon.BackgroundTransparency = 1
coinIcon.Text = "💰"
coinIcon.TextScaled = true
coinIcon.Font = Enum.Font.SourceSans
coinIcon.TextColor3 = Color3.fromRGB(255, 215, 0)
coinIcon.Parent = frame

-- Create coin amount label
local coinLabel = Instance.new("TextLabel")
coinLabel.Name = "CoinAmount"
coinLabel.Size = UDim2.new(1, -50, 1, 0)
coinLabel.Position = UDim2.new(0, 45, 0, 0)
coinLabel.BackgroundTransparency = 1
coinLabel.Text = "0"
coinLabel.TextScaled = true
coinLabel.Font = Enum.Font.SourceSansBold
coinLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
coinLabel.TextXAlignment = Enum.TextXAlignment.Center
coinLabel.Parent = frame

-- Add text stroke for better readability
local textStroke = Instance.new("UITextSizeConstraint")
textStroke.MaxTextSize = 30
textStroke.MinTextSize = 20
textStroke.Parent = coinLabel

-- Function to update coin display
local function updateCoinDisplay(value)
    coinLabel.Text = tostring(value)
    
    -- Add a small animation effect when coins change
    local tween = game:GetService("TweenService"):Create(
        frame,
        TweenInfo.new(0.1, Enum.EasingStyle.Bounce, Enum.EasingDirection.Out),
        {Size = UDim2.new(0, 210, 0, 55)}
    )
    tween:Play()
    tween.Completed:Connect(function()
        local tweenBack = game:GetService("TweenService"):Create(
            frame,
            TweenInfo.new(0.1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
            {Size = UDim2.new(0, 200, 0, 50)}
        )
        tweenBack:Play()
    end)
end

-- Wait for character and leaderstats
local function connectCoinUpdates()
    local leaderstats = player:WaitForChild("leaderstats", 10)
    if leaderstats then
        local coins = leaderstats:WaitForChild("Coins", 10)
        if coins then
            -- Initial update
            updateCoinDisplay(coins.Value)
            
            -- Connect to value changes
            coins:GetPropertyChangedSignal("Value"):Connect(function()
                updateCoinDisplay(coins.Value)
            end)
        else
            -- If no Coins value exists, display 0
            coinLabel.Text = "0"
            warn("No 'Coins' value found in leaderstats")
        end
    else
        -- If no leaderstats exists, display 0
        coinLabel.Text = "0"
        warn("No leaderstats found for player")
    end
end

-- Connect to updates
connectCoinUpdates()

-- Reconnect when character respawns (if leaderstats reset)
player.CharacterAdded:Connect(function()
    wait(0.5) -- Small delay to ensure leaderstats are loaded
    connectCoinUpdates()
end)