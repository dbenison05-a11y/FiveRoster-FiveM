fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'dbenison05-a11y'
description 'FiveRoster - In-game roster management UI'
version '1.0.0'

ui_page 'nui/index.html'

files {
    'nui/index.html',
    'nui/style.css',
    'nui/script.js'
}

client_scripts {
    'config.lua',
    'client/*.lua'
}

server_scripts {
    'config.lua',
    'server/*.lua'
}
