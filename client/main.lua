QBCore = exports['qb-core']:GetCoreObject()
PlayerData = nil
local hotbarShown = false

-- Handlers

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    LocalPlayer.state:set('inv_busy', false, true)
    PlayerData = QBCore.Functions.GetPlayerData()
    GetDrops()
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    LocalPlayer.state:set('inv_busy', true, true)
    PlayerData = nil
end)

RegisterNetEvent('QBCore:Client:UpdateObject', function()
    QBCore = exports['qb-core']:GetCoreObject()
end)

RegisterNetEvent('QBCore:Player:SetPlayerData', function(val)
    PlayerData = val
end)

AddEventHandler('onResourceStart', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        PlayerData = QBCore.Functions.GetPlayerData()
    end
end)

-- Functions

function LoadAnimDict(dict)
    if HasAnimDictLoaded(dict) then return end

    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        Wait(10)
    end
end

-- Función de limpieza mejorada
local function SanitizeItems(items)
    local clean = {}
    if type(items) == 'table' then
        for key, item in pairs(items) do
            if type(item) == 'table' and item.name then
                if not item.slot and type(key) == 'number' then
                    item.slot = key
                end
                clean[#clean+1] = item
            end
        end
    end
    return clean
end

local function FormatWeaponAttachments(itemdata)
    if not itemdata.info or not itemdata.info.attachments or #itemdata.info.attachments == 0 then
        return {}
    end
    local attachments = {}
    local weaponName = itemdata.name
    local WeaponAttachments = exports['qb-weapons']:getConfigWeaponAttachments()
    if not WeaponAttachments then return {} end
    for attachmentType, weapons in pairs(WeaponAttachments) do
        local componentHash = weapons[weaponName]
        if componentHash then
            for _, attachmentData in pairs(itemdata.info.attachments) do
                if attachmentData.component == componentHash then
                    local label = QBCore.Shared.Items[attachmentType] and QBCore.Shared.Items[attachmentType].label or 'Unknown'
                    attachments[#attachments + 1] = {
                        attachment = attachmentType,
                        label = label
                    }
                end
            end
        end
    end
    return attachments
end

function HasItem(items, amount)
    local isTable = type(items) == 'table'
    local isArray = isTable and table.type(items) == 'array' or false
    local totalItems = isArray and #items or 0
    local count = 0

    if isTable and not isArray then
        for _ in pairs(items) do totalItems = totalItems + 1 end
    end

    if PlayerData and type(PlayerData.items) == "table" then
        for _, itemData in pairs(PlayerData.items) do
            if isTable then
                for k, v in pairs(items) do
                    if itemData and itemData.name == (isArray and v or k) and ((amount and itemData.amount >= amount) or (not isArray and itemData.amount >= v) or (not amount and isArray)) then
                        count = count + 1
                        if count == totalItems then
                            return true
                        end
                    end
                end
            else -- Single item as string
                if itemData and itemData.name == items and (not amount or (itemData and amount and itemData.amount >= amount)) then
                    return true
                end
            end
        end
    end

    return false
end

exports('HasItem', HasItem)

-- Events

RegisterNetEvent('qb-inventory:client:requiredItems', function(items, bool)
    local itemTable = {}
    if bool then
        for k in pairs(items) do
            itemTable[#itemTable + 1] = {
                item = items[k].name,
                label = QBCore.Shared.Items[items[k].name]['label'],
                image = items[k].image,
            }
        end
    end

    SendNUIMessage({
        action = 'requiredItem',
        items = itemTable,
        toggle = bool
    })
end)

RegisterNetEvent('qb-inventory:client:hotbar', function(items)
    hotbarShown = not hotbarShown
    local cleanHotbar = SanitizeItems(items)
    SendNUIMessage({
        action = 'toggleHotbar',
        open = hotbarShown,
        items = cleanHotbar
    })
end)

RegisterNetEvent('qb-inventory:client:closeInv', function()
    SendNUIMessage({
        action = 'close',
    })
end)

RegisterNetEvent('qb-inventory:client:updateInventory', function()
    local items = {}
    if PlayerData and type(PlayerData.items) == "table" then
        items = PlayerData.items
    end
    
    local cleanItems = SanitizeItems(items)

    SendNUIMessage({
        action = 'update',
        inventory = cleanItems
    })
end)

RegisterNetEvent('qb-inventory:client:ItemBox', function(itemData, type, amount)
    SendNUIMessage({
        action = 'itemBox',
        item = itemData,
        type = type,
        amount = amount
    })
end)

RegisterNetEvent('qb-inventory:server:RobPlayer', function(TargetId)
    SendNUIMessage({
        action = 'RobMoney',
        TargetId = TargetId,
    })
end)

RegisterNetEvent('qb-inventory:client:openInventory', function(items, other)
    SetNuiFocus(true, true)
    Wait(250)
    
    local cleanPlayerItems = SanitizeItems(items)
    local cleanOther = nil
    if other then
        if type(other) == 'table' and not other.inventory then
             cleanOther = SanitizeItems(other)
        elseif type(other) == 'table' and other.inventory then
            cleanOther = {
                name = other.name,
                label = other.label,
                maxweight = other.maxweight,
                slots = other.slots,
                inventory = SanitizeItems(other.inventory)
            }
        end
    end
    
    SendNUIMessage({
        action = 'open',
        inventory = cleanPlayerItems,
        slots = Config.MaxSlots,
        maxweight = Config.MaxWeight,
        other = cleanOther
    })
end)

RegisterNetEvent('qb-inventory:client:giveAnim', function()
    if IsPedInAnyVehicle(PlayerPedId(), false) then return end
    LoadAnimDict('mp_common')
    TaskPlayAnim(PlayerPedId(), 'mp_common', 'givetake1_b', 8.0, 1.0, -1, 16, 0, false, false, false)
end)

-- Vending

CreateThread(function()
    exports['qb-target']:AddTargetModel(Config.VendingObjects, {
        options = {
            {
                type = 'server',
                event = 'qb-inventory:server:openVending',
                icon = 'fa-solid fa-cash-register',
                label = Lang:t('menu.vending'),
            },
        },
        distance = 2.5
    })
end)

-- Commands

RegisterCommand('openInv', function()
    if IsNuiFocused() or IsPauseMenuActive() then return end
    ExecuteCommand('inventory')
end, false)

RegisterCommand('toggleHotbar', function()
    ExecuteCommand('hotbar')
end, false)

RegisterCommand('debugui', function()
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'open',
        inventory = {},
        slots = 40,
        maxweight = 120000,
        other = nil
    })
end, false)

for i = 1, 5 do
    RegisterCommand('slot_' .. i, function()
        local itemData = PlayerData.items[i]
        if not itemData then return end
        if itemData.type == "weapon" then
            if HoldingDrop then
                return QBCore.Functions.Notify("Your already holding a bag, Go Drop it!", "error", 5500)
            end
        end
        TriggerServerEvent('qb-inventory:server:useItem', itemData)
    end, false)
    RegisterKeyMapping('slot_' .. i, Lang:t('inf_mapping.use_item') .. i, 'keyboard', i)
end

RegisterKeyMapping('openInv', Lang:t('inf_mapping.opn_inv'), 'keyboard', Config.Keybinds.Open)
RegisterKeyMapping('toggleHotbar', Lang:t('inf_mapping.tog_slots'), 'keyboard', Config.Keybinds.Hotbar)


-- =========================================================
--             CALLBACKS DEL NUI (React -> Lua)
-- =========================================================

RegisterNUICallback('PlayDropFail', function(_, cb)
    PlaySound(-1, 'Place_Prop_Fail', 'DLC_Dmod_Prop_Editor_Sounds', 0, 0, 1)
    cb({})
end)

RegisterNUICallback('AttemptPurchase', function(data, cb)
    QBCore.Functions.TriggerCallback('qb-inventory:server:attemptPurchase', function(canPurchase)
        cb(canPurchase)
    end, data)
end)

-- Cerrar Inventario
RegisterNUICallback('close', function(data, cb)
    SetNuiFocus(false, false)
    
    -- Si React nos envía un secondaryId (ej: 'trunk-XYZ'), lo usamos
    if data and data.secondaryId then
        if data.secondaryId:find('trunk-') then
            CloseTrunk()
        end
        TriggerServerEvent('qb-inventory:server:closeInventory', data.secondaryId)
        
    -- Si no, checkeamos drops o cerramos player
    elseif CurrentDrop then
        TriggerServerEvent('qb-inventory:server:closeInventory', CurrentDrop)
        CurrentDrop = nil
    else
        TriggerServerEvent('qb-inventory:server:closeInventory', 'player')
    end
    
    cb({})
end)

-- Alias para cierre
RegisterNUICallback('CloseInventory', function(data, cb)
    SetNuiFocus(false, false)
    cb({})
end)

-- Mover Items (Arrastrar y Soltar)
RegisterNUICallback('moveItem', function(data, cb)
    local fromInventory = data.fromInv
    local toInventory = data.toInv

    -- Si es player, usamos el source del jugador
    if fromInventory == 'player' then fromInventory = PlayerData.source end 
    if toInventory == 'player' then toInventory = PlayerData.source end

    -- Trigger al evento original de qb-inventory
    TriggerServerEvent('qb-inventory:server:SetInventoryData', 
        fromInventory,
        toInventory,
        data.fromSlot,
        data.toSlot,
        data.fromAmount,
        0 -- toAmount suele ignorarse en qb moderno si se envía 0
    )
    cb({ success = true })
end)

-- Usar Item
RegisterNUICallback('useItem', function(data, cb)
    TriggerServerEvent('qb-inventory:server:useItem', data.item)
    cb({})
end)

-- Tirar Item (Drop) CORREGIDO
RegisterNUICallback('DropItem', function(data, cb)
    -- Aseguramos que sean números
    local slot = tonumber(data.item.slot)
    local amount = tonumber(data.amount)
    local itemName = data.item.name

    -- DEBUG: Esto aparecerá en tu consola F8 cuando intentes tirar algo.
    -- Si dice "nil", sabemos que React no está enviando bien el dato.
    print('[DEBUG Drop] Intentando tirar:', itemName, 'x', amount, 'del Slot:', slot)

    if not slot or not amount then 
        print('[ERROR] Slot o cantidad inválidos')
        cb('error')
        return
    end

    -- Trigger al evento de creación de drop
    QBCore.Functions.TriggerCallback('qb-inventory:server:createDrop', function(dropId)
        if dropId then
            cb('ok')
        else
            -- Si el servidor devuelve false, es porque no encontró el item en ese slot
            print('[ERROR] El servidor rechazó el drop (Item no encontrado en slot '..slot..')')
            cb('error')
        end
    end, {
        name = itemName, 
        amount = amount, 
        fromSlot = slot, -- QB espera 'fromSlot'
        type = data.item.type or 'item', 
        info = data.item.info or {}
    })
end)

-- Dar Item (Give)
RegisterNUICallback('GiveItem', function(data, cb)
    local player, distance = QBCore.Functions.GetClosestPlayer()
    if player ~= -1 and distance < 2.5 then
        local playerId = GetPlayerServerId(player)
        
        -- Usamos la callback existente de QB
        QBCore.Functions.TriggerCallback('qb-inventory:server:giveItem', function(success)
            if success then
                QBCore.Functions.Notify("Has dado " .. data.amount .. "x " .. data.item.label, "success")
            else
                QBCore.Functions.Notify("No se pudo dar el item", "error")
            end
            cb('ok')
        end, playerId, data.item.name, tonumber(data.amount), data.item.slot, data.item.info)
    else
        QBCore.Functions.Notify("No hay nadie cerca", "error")
        cb('ok')
    end
end)

RegisterNUICallback('GetWeaponData', function(cData, cb)
    local data = {
        WeaponData = QBCore.Shared.Items[cData.weapon],
        AttachmentData = FormatWeaponAttachments(cData.ItemData)
    }
    cb(data)
end)

RegisterNUICallback('RemoveAttachment', function(data, cb)
    local ped = PlayerPedId()
    local WeaponData = data.WeaponData
    local allAttachments = exports['qb-weapons']:getConfigWeaponAttachments()
    local Attachment = allAttachments[data.AttachmentData.attachment][WeaponData.name]
    local itemInfo = QBCore.Shared.Items[data.AttachmentData.attachment]
    QBCore.Functions.TriggerCallback('qb-weapons:server:RemoveAttachment', function(NewAttachments)
        if NewAttachments ~= false then
            local Attachies = {}
            RemoveWeaponComponentFromPed(ped, joaat(WeaponData.name), joaat(Attachment))
            for _, v in pairs(NewAttachments) do
                for attachmentType, weapons in pairs(allAttachments) do
                    local componentHash = weapons[WeaponData.name]
                    if componentHash and v.component == componentHash then
                        local label = itemInfo and itemInfo.label or 'Unknown'
                        Attachies[#Attachies + 1] = {
                            attachment = attachmentType,
                            label = label,
                        }
                    end
                end
            end
            local DJATA = {
                Attachments = Attachies,
                WeaponData = WeaponData,
                itemInfo = itemInfo,
            }
            cb(DJATA)
        else
            RemoveWeaponComponentFromPed(ped, joaat(WeaponData.name), joaat(Attachment))
            cb({})
        end
    end, data.AttachmentData, WeaponData)
end)