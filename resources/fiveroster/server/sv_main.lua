local roster = {
    departments = {
        { id = 1, name = 'Operations' },
        { id = 2, name = 'Support' }
    },
    ranks = {
        { id = 1, name = 'Recruit', level = 1, departmentId = 1 },
        { id = 2, name = 'Officer', level = 2, departmentId = 1 },
        { id = 3, name = 'Supervisor', level = 3, departmentId = 1 },
        { id = 4, name = 'Admin', level = 4, departmentId = 2 }
    },
    members = {
        { id = 1, username = 'PlayerOne', discordId = '123456789', callsign = 'LION-1', rankId = 2, departmentId = 1, status = 'active' }
    },
    shifts = {
        { id = 1, memberId = 1, status = 'on-duty', checkedAt = '2026-01-01 12:00:00' }
    },
    leave = {},
    training = {},
    discipline = {},
    applications = {}
}

local function getNextId(list)
    local maxId = 0
    for _, item in ipairs(list) do
        if item.id and item.id > maxId then
            maxId = item.id
        end
    end
    return maxId + 1
end

local function broadcastState(target)
    if target then
        TriggerClientEvent('fiveroster:client:syncState', target, roster)
    else
        TriggerClientEvent('fiveroster:client:syncState', -1, roster)
    end
end

RegisterNetEvent('fiveroster:server:getState', function()
    TriggerClientEvent('fiveroster:client:syncState', source, roster)
end)

RegisterNetEvent('fiveroster:server:createDepartment', function(name)
    if not name or name == '' then return end
    table.insert(roster.departments, {
        id = getNextId(roster.departments),
        name = name
    })
    broadcastState()
end)

RegisterNetEvent('fiveroster:server:createRank', function(data)
    if not data or not data.name or data.name == '' then return end
    table.insert(roster.ranks, {
        id = getNextId(roster.ranks),
        name = data.name,
        level = tonumber(data.level) or 1,
        departmentId = tonumber(data.departmentId) or nil
    })
    broadcastState()
end)

RegisterNetEvent('fiveroster:server:addMember', function(data)
    if not data or not data.username or data.username == '' then return end
    table.insert(roster.members, {
        id = getNextId(roster.members),
        username = data.username,
        discordId = data.discordId or '',
        callsign = data.callsign or '',
        rankId = tonumber(data.rankId) or nil,
        departmentId = tonumber(data.departmentId) or nil,
        status = data.status or 'active'
    })
    broadcastState()
end)

RegisterNetEvent('fiveroster:server:updateMember', function(data)
    if not data or not data.id then return end
    local memberId = tonumber(data.id)
    for _, member in ipairs(roster.members) do
        if member.id == memberId then
            member.username = data.username or member.username
            member.discordId = data.discordId or member.discordId
            member.callsign = data.callsign or member.callsign
            member.rankId = data.rankId and tonumber(data.rankId) or member.rankId
            member.departmentId = data.departmentId and tonumber(data.departmentId) or member.departmentId
            member.status = data.status or member.status
            break
        end
    end
    broadcastState()
end)

RegisterNetEvent('fiveroster:server:removeMember', function(id)
    local memberId = tonumber(id)
    for i, member in ipairs(roster.members) do
        if member.id == memberId then
            table.remove(roster.members, i)
            break
        end
    end
    broadcastState()
end)

RegisterNetEvent('fiveroster:server:addShift', function(data)
    if not data or not data.memberId then return end
    table.insert(roster.shifts, {
        id = getNextId(roster.shifts),
        memberId = tonumber(data.memberId),
        status = data.status or 'on-duty',
        checkedAt = data.checkedAt or os.date('%Y-%m-%d %H:%M:%S')
    })
    broadcastState()
end)

RegisterNetEvent('fiveroster:server:addLeave', function(data)
    if not data or not data.memberId or not data.reason then return end
    table.insert(roster.leave, {
        id = getNextId(roster.leave),
        memberId = tonumber(data.memberId),
        reason = data.reason,
        startDate = data.startDate,
        endDate = data.endDate,
        status = 'pending'
    })
    broadcastState()
end)

RegisterNetEvent('fiveroster:server:updateLeave', function(id, status)
    local leaveId = tonumber(id)
    for _, entry in ipairs(roster.leave) do
        if entry.id == leaveId then
            entry.status = status
            break
        end
    end
    broadcastState()
end)

RegisterNetEvent('fiveroster:server:addTraining', function(data)
    if not data or not data.memberId or not data.module then return end
    table.insert(roster.training, {
        id = getNextId(roster.training),
        memberId = tonumber(data.memberId),
        module = data.module,
        completed = false
    })
    broadcastState()
end)

RegisterNetEvent('fiveroster:server:completeTraining', function(id)
    local trainingId = tonumber(id)
    for _, entry in ipairs(roster.training) do
        if entry.id == trainingId then
            entry.completed = true
            break
        end
    end
    broadcastState()
end)

RegisterNetEvent('fiveroster:server:addDiscipline', function(data)
    if not data or not data.memberId or not data.reason then return end
    table.insert(roster.discipline, {
        id = getNextId(roster.discipline),
        memberId = tonumber(data.memberId),
        reason = data.reason,
        severity = data.severity or 'warning',
        issuedBy = data.issuedBy or 'Admin'
    })
    broadcastState()
end)

RegisterNetEvent('fiveroster:server:addApplication', function(data)
    if not data or not data.username or not data.experience then return end
    table.insert(roster.applications, {
        id = getNextId(roster.applications),
        username = data.username,
        experience = data.experience,
        status = 'pending'
    })
    broadcastState()
end)

RegisterNetEvent('fiveroster:server:updateApplication', function(id, status)
    local appId = tonumber(id)
    for _, entry in ipairs(roster.applications) do
        if entry.id == appId then
            entry.status = status
            break
        end
    end
    broadcastState()
end)

print('FiveRoster server started successfully.')
