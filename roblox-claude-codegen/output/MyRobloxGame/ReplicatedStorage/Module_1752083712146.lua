--!strict
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local RunService = game:GetService("RunService")

local PlayerDataModule = {}
PlayerDataModule.__index = PlayerDataModule

-- Constants
local DATA_STORE_NAME = "PlayerData_v1"
local AUTO_SAVE_INTERVAL = 300 -- 5 minutes
local MAX_RETRIES = 3
local RETRY_DELAY = 2

-- Type definitions
type PlayerData = {
    coins: number,
    gems: number,
    experience: number,
    level: number,
    playtime: number,
    joinDate: number,
    lastSave: number,
    [string]: any
}

type PlayerDataObject = {
    player: Player,
    data: PlayerData,
    sessionData: PlayerData,
    isLoaded: boolean,
    isSaving: boolean,
    lastSaveTime: number,
    dataChangedSignal: RBXScriptSignal?
}

-- Default data template
local DEFAULT_DATA: PlayerData = {
    coins = 0,
    gems = 0,
    experience = 0,
    level = 1,
    playtime = 0,
    joinDate = os.time(),
    lastSave = os.time()
}

-- Private variables
local playerDataStore = DataStoreService:GetDataStore(DATA_STORE_NAME)
local activeSessions: {[Player]: PlayerDataObject} = {}
local isShuttingDown = false

-- Private functions
local function deepCopy(original: any): any
    local copy = {}
    for key, value in pairs(original) do
        if type(value) == "table" then
            copy[key] = deepCopy(value)
        else
            copy[key] = value
        end
    end
    return copy
end

local function getDataKey(player: Player): string
    return "Player_" .. tostring(player.UserId)
end

local function loadPlayerData(player: Player): (boolean, PlayerData?)
    local key = getDataKey(player)
    local success, result
    
    for attempt = 1, MAX_RETRIES do
        success, result = pcall(function()
            return playerDataStore:GetAsync(key)
        end)
        
        if success then
            break
        else
            warn("Failed to load data for", player.Name, "- Attempt", attempt, "-", result)
            if attempt < MAX_RETRIES then
                task.wait(RETRY_DELAY)
            end
        end
    end
    
    if success then
        if result then
            -- Merge with default data to handle new fields
            local mergedData = deepCopy(DEFAULT_DATA)
            for key, value in pairs(result) do
                mergedData[key] = value
            end
            return true, mergedData
        else
            -- New player
            return true, deepCopy(DEFAULT_DATA)
        end
    else
        return false, nil
    end
end

local function savePlayerData(playerDataObject: PlayerDataObject): boolean
    if playerDataObject.isSaving or not playerDataObject.isLoaded then
        return false
    end
    
    playerDataObject.isSaving = true
    local key = getDataKey(playerDataObject.player)
    local dataToSave = deepCopy(playerDataObject.sessionData)
    dataToSave.lastSave = os.time()
    
    local success, result
    for attempt = 1, MAX_RETRIES do
        success, result = pcall(function()
            playerDataStore:SetAsync(key, dataToSave)
        end)
        
        if success then
            playerDataObject.data = deepCopy(dataToSave)
            playerDataObject.lastSaveTime = os.time()
            break
        else
            warn("Failed to save data for", playerDataObject.player.Name, "- Attempt", attempt, "-", result)
            if attempt < MAX_RETRIES then
                task.wait(RETRY_DELAY)
            end
        end
    end
    
    playerDataObject.isSaving = false
    return success
end

-- Public methods
function PlayerDataModule.new(player: Player): PlayerDataObject?
    if activeSessions[player] then
        return activeSessions[player]
    end
    
    local success, loadedData = loadPlayerData(player)
    if not success then
        warn("Failed to create data session for", player.Name)
        return nil
    end
    
    local playerDataObject = {
        player = player,
        data = loadedData :: PlayerData,
        sessionData = deepCopy(loadedData) :: PlayerData,
        isLoaded = true,
        isSaving = false,
        lastSaveTime = os.time(),
        dataChangedSignal = nil
    }
    
    setmetatable(playerDataObject, PlayerDataModule)
    activeSessions[player] = playerDataObject
    
    return playerDataObject
end

function PlayerDataModule:Get(statName: string): any
    if not self.isLoaded then
        warn("Attempted to get data before it was loaded")
        return nil
    end
    
    return self.sessionData[statName]
end

function PlayerDataModule:Set(statName: string, value: any): boolean
    if not self.isLoaded then
        warn("Attempted to set data before it was loaded")
        return false
    end
    
    if type(statName) ~= "string" then
        warn("Stat name must be a string")
        return false
    end
    
    local oldValue = self.sessionData[statName]
    self.sessionData[statName] = value
    
    -- Fire changed signal if it exists
    if self.dataChangedSignal then
        self.dataChangedSignal:Fire(statName, value, oldValue)
    end
    
    return true
end

function PlayerDataModule:Increment(statName: string, amount: number): boolean
    if not self.isLoaded then
        warn("Attempted to increment data before it was loaded")
        return false
    end
    
    local currentValue = self.sessionData[statName]
    if type(currentValue) ~= "number" then
        warn("Cannot increment non-numeric value:", statName)
        return false
    end
    
    return self:Set(statName, currentValue + amount)
end

function PlayerDataModule:GetAll(): PlayerData?
    if not self.isLoaded then
        warn("Attempted to get all data before it was loaded")
        return nil
    end
    
    return deepCopy(self.sessionData)
end

function PlayerDataModule:Save(): boolean
    return savePlayerData(self)
end

function PlayerDataModule:IsLoaded(): boolean
    return self.isLoaded
end

function PlayerDataModule:GetTimeSinceLastSave(): number
    return os.time() - self.lastSaveTime
end

function PlayerDataModule:Destroy()
    if activeSessions[self.player] then
        self:Save()
        activeSessions[self.player] = nil
    end
end

-- Module functions
function PlayerDataModule.GetPlayerData(player: Player): PlayerDataObject?
    return activeSessions[player]
end

function PlayerDataModule.SaveAll()
    for _, playerData in pairs(activeSessions) do
        savePlayerData(playerData)
    end
end

function PlayerDataModule.SaveAllAndWait()
    local saveThreads = {}
    
    for _, playerData in pairs(activeSessions) do
        table.insert(saveThreads, task.spawn(function()
            savePlayerData(playerData)
        end))
    end
    
    for _, thread in ipairs(saveThreads) do
        task.wait(thread)
    end
end

-- Auto-save loop
task.spawn(function()
    while not isShuttingDown do
        task.wait(AUTO_SAVE_INTERVAL)
        
        for _, playerData in pairs(activeSessions) do
            if playerData:GetTimeSinceLastSave() >= AUTO_SAVE_INTERVAL then
                task.spawn(function()
                    savePlayerData(playerData)
                end)
            end
        end
    end
end)

-- Playtime tracking
task.spawn(function()
    while not isShuttingDown do
        task.wait(1)
        
        for _, playerData in pairs(activeSessions) do
            if playerData.isLoaded then
                playerData:Increment("playtime", 1)
            end
        end
    end
end)

-- Handle player removing
Players.PlayerRemoving:Connect(function(player)
    local playerData = activeSessions[player]
    if playerData then
        savePlayerData(playerData)
        activeSessions[player] = nil
    end
end)

-- Handle game shutdown
game:BindToClose(function()
    isShuttingDown = true
    PlayerDataModule.SaveAllAndWait()
end)

return PlayerDataModule