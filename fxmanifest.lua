fx_version 'cerulean'
game 'gta5'

author 'Caserio'
description 'NextGen Inventory con React + Vite'
version '1.0.0'

shared_script '@qb-core/import.lua'

-- Scripts Lógicos
client_script 'client/main.lua'
server_script 'server/main.lua'

-- Interfaz de Usuario
-- IMPORTANTE: Vite crea la carpeta 'dist', no 'build'
ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/*.js',
    'web/dist/assets/*.css',
    'web/dist/*.png',
    'web/dist/*.svg',
    -- Si tienes imagenes en public/img/icons, Vite las copiará a dist/img/icons
    'web/dist/img/icons/*.png' 
}

lua54 'yes'