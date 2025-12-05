fx_version 'cerulean'
game 'gta5'

author 'TuNombre'
description 'NextGen Inventory con React y Zustand'
version '1.0.0'

-- Versión de QBCore
shared_script '@qb-core/import.lua'

-- Scripts de Cliente y Servidor
client_scripts {
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}

-- Interfaz de Usuario (React Build)
ui_page 'web/build/index.html'

files {
    'web/build/index.html',
    'web/build/assets/*.js',
    'web/build/assets/*.css',
    'web/build/images/*.png', -- Si pones imágenes locales aquí
}

-- Habilitar NUI en el juego
lua54 'yes'