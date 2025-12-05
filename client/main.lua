local QBCore = exports['qb-core']:GetCoreObject()
local isInventoryOpen = false

-- Comando para abrir (luego mapear a tecla)
RegisterCommand('inventory', function()
    if not isInventoryOpen then
        OpenInventory()
    else
        CloseInventory()
    end
end)

function OpenInventory()
    isInventoryOpen = true
    
    -- 1. Activar Cámara Cinemática (Función en camera.lua)
    TriggerEvent('nextgen-inventory:client:enableCamera') 
    
    -- 2. Solicitar datos al servidor
    TriggerServerEvent('nextgen-inventory:server:requestData')
    
    -- 3. UI Focus
    SetNuiFocus(true, true)
end

function CloseInventory()
    isInventoryOpen = false
    TriggerEvent('nextgen-inventory:client:disableCamera')
    SetNuiFocus(false, false)
    SendNUIMessage({ action = "close" })
end

-- Recibir datos del servidor y mandarlos a React
RegisterNetEvent('nextgen-inventory:client:receiveData', function(data)
    SendNUIMessage({
        action = "openInventory",
        data = data
    })
end)

-- Callbacks NUI
RegisterNUICallback('close', function(_, cb)
    CloseInventory()
    cb('ok')
end)

RegisterNUICallback('moveItem', function(data, cb)
    TriggerServerEvent('nextgen-inventory:server:moveItem', data)
    cb('ok')
end)
