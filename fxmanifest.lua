fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'Caserio & QB-Core'
description 'QB-Inventory con UI React'
version '2.0.0'

-- Scripts compartidos (Configuración y Locales)
shared_scripts {
    '@qb-core/shared/locale.lua',
    'locales/en.lua',
    'locales/*.lua',
    'config/config.lua',
    'config/vehicles.lua' -- Mantenemos tu configuración de vehículos
}

-- Scripts del Cliente
client_scripts {
    'client/main.lua',
    'client/drops.lua',
    'client/vehicles.lua',
}

-- Scripts del Servidor
server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
    'server/functions.lua',
    'server/commands.lua',
}

-- Definición de la UI (Página principal compilada)
ui_page 'web/dist/index.html'

-- Archivos que deben cargarse (Assets compilados)
files {
    'web/dist/index.html',
    'web/dist/assets/*.js',   -- Lógica de React compilada
    'web/dist/assets/*.css',  -- Estilos compilados
    
    -- IMÁGENES: Esto cargará los iconos desde la carpeta que creaste
    'web/dist/*.png',  
    
    -- Otros archivos estáticos (opcional)
    'web/dist/*.svg', 
}

dependencies {
    'qb-core',
    'qb-weapons',
    'oxmysql'
}