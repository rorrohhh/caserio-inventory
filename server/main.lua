local QBCore = exports['qb-core']:GetCoreObject()

-- Función auxiliar para formatear items para el frontend
local function FormatItems(items)
    local cleanItems = {}
    for slot, item in pairs(items) do
        table.insert(cleanItems, {
            name = item.name,
            label = item.label,
            count = item.amount,
            slot = item.slot,
            image = item.image,
            metadata = item.info,
            description = item.description or ""
        })
    end
    return cleanItems
end

RegisterNetEvent('nextgen-inventory:server:requestData', function()
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end

    local items = Player.PlayerData.items
    
    TriggerClientEvent('nextgen-inventory:client:receiveData', src, {
        playerItems = FormatItems(items),
        secondaryItems = {}, 
        weight = Player.PlayerData.metadata['weight'],
        maxWeight = QBCore.Config.Player.MaxWeight or 120000
    })
end)

RegisterNetEvent('nextgen-inventory:server:moveItem', function(data)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end

    local fromSlot = tonumber(data.fromSlot)
    local toSlot = tonumber(data.toSlot)
    local fromInv = data.fromInv 
    local toInv = data.toInv
    
    -- Solo manejamos Player <-> Player por ahora
    if fromInv == 'player' and toInv == 'player' then
        local items = Player.PlayerData.items
        local fromItem = items[fromSlot]
        local toItem = items[toSlot]

        if not fromItem then return end -- Seguridad

        -- LOGICA DE MOVIMIENTO / STACKING
        if not toItem then
            -- Caso 1: Mover a vacío
            items[toSlot] = fromItem
            items[toSlot].slot = toSlot
            items[fromSlot] = nil
        else
            -- Caso 2: El item de destino existe. ¿Son iguales?
            -- Verificamos nombre y que no sean unicos (armas, dni, etc)
            local itemInfo = QBCore.Shared.Items[fromItem.name:lower()]
            local isStackable = itemInfo and not itemInfo.unique
            
            if isStackable and fromItem.name == toItem.name and 
               (not fromItem.info or not next(fromItem.info)) and 
               (not toItem.info or not next(toItem.info)) then
                
                -- LOGICA DE STACKING
                local maxStack = itemInfo.max_amount or 100 -- Obtener maximo de shared
                local totalAmount = toItem.amount + fromItem.amount

                if totalAmount <= maxStack then
                    -- Stack perfecto: Todo cabe en el destino
                    items[toSlot].amount = totalAmount
                    items[fromSlot] = nil
                else
                    -- Stack parcial: Llenamos destino, dejamos resto en origen
                    local toFill = maxStack - toItem.amount
                    items[toSlot].amount = maxStack
                    items[fromSlot].amount = fromItem.amount - toFill
                end
            else
                -- SWAP: No son iguales o no stackean, intercambiamos
                local tempItem = items[toSlot]
                items[toSlot] = fromItem
                items[toSlot].slot = toSlot
                items[fromSlot] = tempItem
                items[fromSlot].slot = fromSlot
            end
        end

        -- Guardar y Sincronizar
        Player.Functions.SetInventory(items)
        
        -- IMPORTANTE: Enviamos la data actualizada para corregir cualquier desync visual
        TriggerClientEvent('nextgen-inventory:client:receiveData', src, {
            playerItems = FormatItems(items),
            secondaryItems = {},
            weight = Player.PlayerData.metadata['weight'],
            maxWeight = QBCore.Config.Player.MaxWeight or 120000
        })
    end
end)