local isOpen = false

local function setNuiFocus(state)
    SetNuiFocus(state, state)
end

local function refreshKeybind()
    local savedKey = GetResourceKvpString('fiveroster_key') or Config.defaultKey
    RegisterKeyMapping(Config.openCommand, 'Open FiveRoster', 'keyboard', savedKey)
end

local function toggleUI()
    isOpen = not isOpen
    SetNuiFocus(isOpen, isOpen)
    SendNUIMessage({
        type = 'toggle',
        open = isOpen
    })

    if isOpen then
        TriggerServerEvent('fiveroster:server:getState')
    end
end

RegisterNUICallback('close', function(_, cb)
    isOpen = false
    setNuiFocus(false)
    SendNUIMessage({ type = 'toggle', open = false })
    cb({ ok = true })
end)

RegisterNUICallback('ready', function(_, cb)
    TriggerServerEvent('fiveroster:server:getState')
    cb({ ok = true })
end)

RegisterNUICallback('createDepartment', function(data, cb)
    TriggerServerEvent('fiveroster:server:createDepartment', data.name)
    cb({ ok = true })
end)

RegisterNUICallback('createRank', function(data, cb)
    TriggerServerEvent('fiveroster:server:createRank', data)
    cb({ ok = true })
end)

RegisterNUICallback('addMember', function(data, cb)
    TriggerServerEvent('fiveroster:server:addMember', data)
    cb({ ok = true })
end)

RegisterNUICallback('updateMember', function(data, cb)
    TriggerServerEvent('fiveroster:server:updateMember', data)
    cb({ ok = true })
end)

RegisterNUICallback('removeMember', function(data, cb)
    TriggerServerEvent('fiveroster:server:removeMember', data.id)
    cb({ ok = true })
end)

RegisterNUICallback('addShift', function(data, cb)
    TriggerServerEvent('fiveroster:server:addShift', data)
    cb({ ok = true })
end)

RegisterNUICallback('addLeave', function(data, cb)
    TriggerServerEvent('fiveroster:server:addLeave', data)
    cb({ ok = true })
end)

RegisterNUICallback('updateLeave', function(data, cb)
    TriggerServerEvent('fiveroster:server:updateLeave', data.id, data.status)
    cb({ ok = true })
end)

RegisterNUICallback('addTraining', function(data, cb)
    TriggerServerEvent('fiveroster:server:addTraining', data)
    cb({ ok = true })
end)

RegisterNUICallback('completeTraining', function(data, cb)
    TriggerServerEvent('fiveroster:server:completeTraining', data.id)
    cb({ ok = true })
end)

RegisterNUICallback('addDiscipline', function(data, cb)
    TriggerServerEvent('fiveroster:server:addDiscipline', data)
    cb({ ok = true })
end)

RegisterNUICallback('addApplication', function(data, cb)
    TriggerServerEvent('fiveroster:server:addApplication', data)
    cb({ ok = true })
end)

RegisterNUICallback('updateApplication', function(data, cb)
    TriggerServerEvent('fiveroster:server:updateApplication', data.id, data.status)
    cb({ ok = true })
end)

RegisterNetEvent('fiveroster:client:syncState', function(data)
    SendNUIMessage({
        type = 'state',
        data = data
    })
end)

RegisterCommand(Config.openCommand, function()
    toggleUI()
end, false)

RegisterCommand('fiveroster_setkey', function(_, args)
    if not args[1] then
        TriggerEvent('chat:addMessage', {
            color = { 255, 255, 255 },
            multiline = false,
            args = { 'FiveRoster', 'Usage: /fiveroster_setkey F3' }
        })
        return
    end

    local newKey = string.upper(args[1])
    SetResourceKvp('fiveroster_key', newKey)
    refreshKeybind()

    TriggerEvent('chat:addMessage', {
        color = { 76, 175, 80 },
        multiline = false,
        args = { 'FiveRoster', 'Keybind updated to: ' .. newKey }
    })
end, false)

CreateThread(function()
    refreshKeybind()
end)

print('FiveRoster client ready.')
