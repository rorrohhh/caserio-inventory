fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'Caserio & QB-Core'
description 'QB-Inventory con UI React'
version '2.0.0'

shared_scripts {
    '@qb-core/shared/locale.lua',
    'locales/en.lua',
    'locales/*.lua',
    'config/config.lua',
    'config/vehicles.lua' -- ESTA ES LA LÍNEA QUE FALTABA
}

client_scripts {
    'client/main.lua',
    'client/drops.lua',
    'client/vehicles.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
    'server/functions.lua',
    'server/commands.lua',
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/vite.svg',
    'web/dist/assets/*.js',
    'web/dist/assets/*.css',
    -- 'web/dist/img/icons/*.png',
}

dependencies {
    'qb-core',
    'qb-weapons',
    'oxmysql'
}