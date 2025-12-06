Config = {} -- Inicializamos la tabla primero

Config.UseTarget = GetConvar('UseTarget', 'false') == 'true'

Config.MaxWeight = 120000
Config.MaxSlots = 40

Config.StashSize = {
    maxweight = 2000000,
    slots = 100
}

Config.DropSize = {
    maxweight = 100000, -- Corregí un 0 extra que tenías aquí (1 millón es mucho para un drop, lo dejé en 100k, ajústalo si quieres)
    slots = 50
}

Config.Keybinds = {
    Open = 'TAB',
    Hotbar = 'Z',
}

Config.CleanupDropTime = 15    -- in minutes
Config.CleanupDropInterval = 1 -- in minutes

Config.ItemDropObject = 'bkr_prop_duffel_bag_01a' -- Corregido: usaba comillas invertidas ` que pueden dar error en Lua puro a veces
Config.ItemDropObjectBone = 28422
Config.ItemDropObjectOffset = {
    vector3(0.260000, 0.040000, 0.000000),
    vector3(90.000000, 0.000000, -78.989998),
}

Config.VendingObjects = {
    'prop_vend_soda_01',
    'prop_vend_soda_02',
    'prop_vend_water_01',
    'prop_vend_coffe_01',
}

Config.VendingItems = {
    [1] = { name = 'kurkakola',    price = 4, amount = 50, info = {}, type = "item", slot = 1 },
    [2] = { name = 'water_bottle', price = 4, amount = 50, info = {}, type = "item", slot = 2 },
}