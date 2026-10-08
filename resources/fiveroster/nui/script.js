const app = document.getElementById('app');
const tabs = [...document.querySelectorAll('.tab')];
const tabPanels = [...document.querySelectorAll('.tab-panel')];
const closeBtn = document.getElementById('closeBtn');

const state = {
  departments: [],
  ranks: [],
  members: [],
  shifts: [],
  leave: [],
  training: [],
  discipline: [],
  applications: []
};

function fetchNui(eventName, payload) {
  fetch(`https://${GetParentResourceName()}/${eventName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(payload || {})
  }).catch(() => {});
}

function renderDepartmentList() {
  const list = document.getElementById('departmentList');
  list.innerHTML = state.departments.length
    ? state.departments.map(dep => `
      <div class="list-item">
        <div>
          <div><strong>${dep.name}</strong></div>
          <div class="meta">Department ID: ${dep.id}</div>
        </div>
      </div>
    `).join('')
    : '<div class="empty">No departments created.</div>';
}

function renderRankList() {
  const list = document.getElementById('rankList');
  list.innerHTML = state.ranks.length
    ? state.ranks.map(rank => `
      <div class="list-item">
        <div>
          <div><strong>${rank.name}</strong></div>
          <div class="meta">Level ${rank.level}</div>
        </div>
      </div>
    `).join('')
    : '<div class="empty">No ranks created.</div>';
}

function renderMemberList() {
  const list = document.getElementById('memberList');
  list.innerHTML = state.members.length
    ? state.members.map(member => `
      <div class="list-item">
        <div>
          <div><strong>${member.username}</strong> ${member.callsign ? `(${member.callsign})` : ''}</div>
          <div class="meta">${member.discordId || 'No Discord ID'} • <span class="badge ${member.status || 'active'}">${member.status || 'active'}</span></div>
        </div>
        <div class="actions">
          <button class="secondary" data-action="editMember" data-id="${member.id}">Edit</button>
          <button class="danger" data-action="removeMember" data-id="${member.id}">Remove</button>
        </div>
      </div>
    `).join('')
    : '<div class="empty">No roster members.</div>';

  document.querySelectorAll('[data-action="removeMember"]').forEach(button => {
    button.addEventListener('click', () => {
      fetchNui('removeMember', { id: Number(button.dataset.id) });
    });
  });

  document.querySelectorAll('[data-action="editMember"]').forEach(button => {
    button.addEventListener('click', () => {
      const member = state.members.find(item => item.id === Number(button.dataset.id));
      if (!member) return;

      const confirmation = prompt('Update member username', member.username || '');
      if (confirmation === null) return;

      const updated = {
        id: member.id,
        username: confirmation.trim() || member.username,
        callsign: member.callsign || '',
        discordId: member.discordId || '',
        rankId: member.rankId || null,
        departmentId: member.departmentId || null,
        status: member.status || 'active'
      };

      fetchNui('updateMember', updated);
    });
  });
}

function renderShiftList() {
  const list = document.getElementById('shiftList');
  list.innerHTML = state.shifts.length
    ? state.shifts.map(shift => `
      <div class="list-item">
        <div>
          <div><strong>Member ${shift.memberId}</strong></div>
          <div class="meta">${shift.checkedAt} • <span class="badge ${shift.status}">${shift.status}</span></div>
        </div>
      </div>
    `).join('')
    : '<div class="empty">No shift logs.</div>';
}

function renderLeaveList() {
  const list = document.getElementById('leaveList');
  list.innerHTML = state.leave.length
    ? state.leave.map(item => `
      <div class="list-item">
        <div>
          <div><strong>Member ${item.memberId}</strong></div>
          <div class="meta">${item.startDate} → ${item.endDate} • ${item.reason}</div>
        </div>
        <div class="actions">
          <span class="badge ${item.status}">${item.status}</span>
          ${item.status === 'pending' ? `
            <button class="success" data-action="approveLeave" data-id="${item.id}">Approve</button>
            <button class="danger" data-action="denyLeave" data-id="${item.id}">Deny</button>
          ` : ''}
        </div>
      </div>
    `).join('')
    : '<div class="empty">No leave requests.</div>';

  document.querySelectorAll('[data-action="approveLeave"]').forEach(button => {
    button.addEventListener('click', () => fetchNui('updateLeave', { id: Number(button.dataset.id), status: 'approved' }));
  });

  document.querySelectorAll('[data-action="denyLeave"]').forEach(button => {
    button.addEventListener('click', () => fetchNui('updateLeave', { id: Number(button.dataset.id), status: 'denied' }));
  });
}

function renderTrainingList() {
  const list = document.getElementById('trainingList');
  list.innerHTML = state.training.length
    ? state.training.map(item => `
      <div class="list-item">
        <div>
          <div><strong>Member ${item.memberId}</strong></div>
          <div class="meta">${item.module}</div>
        </div>
        <div class="actions">
          <span class="badge ${item.completed ? 'approved' : 'pending'}">${item.completed ? 'Complete' : 'Pending'}</span>
          ${!item.completed ? `<button class="success" data-action="completeTraining" data-id="${item.id}">Complete</button>` : ''}
        </div>
      </div>
    `).join('')
    : '<div class="empty">No training assigned.</div>';

  document.querySelectorAll('[data-action="completeTraining"]').forEach(button => {
    button.addEventListener('click', () => fetchNui('completeTraining', { id: Number(button.dataset.id) }));
  });
}

function renderDisciplineList() {
  const list = document.getElementById('disciplineList');
  list.innerHTML = state.discipline.length
    ? state.discipline.map(item => `
      <div class="list-item">
        <div>
          <div><strong>Member ${item.memberId}</strong></div>
          <div class="meta">${item.reason}</div>
        </div>
        <div class="actions">
          <span class="badge ${item.severity}">${item.severity}</span>
        </div>
      </div>
    `).join('')
    : '<div class="empty">No discipline reports.</div>';
}

function renderApplicationsList() {
  const list = document.getElementById('applicationList');
  list.innerHTML = state.applications.length
    ? state.applications.map(item => `
      <div class="list-item">
        <div>
          <div><strong>${item.username}</strong></div>
          <div class="meta">${item.experience}</div>
        </div>
        <div class="actions">
          <span class="badge ${item.status}">${item.status}</span>
          ${item.status === 'pending' ? `
            <button class="success" data-action="approveApp" data-id="${item.id}">Approve</button>
            <button class="danger" data-action="denyApp" data-id="${item.id}">Deny</button>
          ` : ''}
        </div>
      </div>
    `).join('')
    : '<div class="empty">No applications yet.</div>';

  document.querySelectorAll('[data-action="approveApp"]').forEach(button => {
    button.addEventListener('click', () => fetchNui('updateApplication', { id: Number(button.dataset.id), status: 'approved' }));
  });

  document.querySelectorAll('[data-action="denyApp"]').forEach(button => {
    button.addEventListener('click', () => fetchNui('updateApplication', { id: Number(button.dataset.id), status: 'denied' }));
  });
}

function populateSelects() {
  const departmentOptions = state.departments.map(dep => `<option value="${dep.id}">${dep.name}</option>`).join('');
  const rankOptions = state.ranks.map(rank => `<option value="${rank.id}">${rank.name}</option>`).join('');
  const memberOptions = state.members.map(member => `<option value="${member.id}">${member.username}</option>`).join('');

  document.getElementById('rankDepartment').innerHTML = `<option value="">Choose department</option>${departmentOptions}`;
  document.getElementById('memberDepartment').innerHTML = `<option value="">Choose department</option>${departmentOptions}`;
  document.getElementById('memberRank').innerHTML = `<option value="">Choose rank</option>${rankOptions}`;
  document.getElementById('shiftMember').innerHTML = `<option value="">Choose member</option>${memberOptions}`;
  document.getElementById('leaveMember').innerHTML = `<option value="">Choose member</option>${memberOptions}`;
  document.getElementById('trainingMember').innerHTML = `<option value="">Choose member</option>${memberOptions}`;
  document.getElementById('disciplineMember').innerHTML = `<option value="">Choose member</option>${memberOptions}`;
}

function render() {
  renderDepartmentList();
  renderRankList();
  renderMemberList();
  renderShiftList();
  renderLeaveList();
  renderTrainingList();
  renderDisciplineList();
  renderApplicationsList();
  populateSelects();
}

function switchTab(tabName) {
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === tabName));
  tabPanels.forEach(panel => panel.classList.toggle('active', panel.id === `${tabName}-panel`));
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

closeBtn.addEventListener('click', () => fetchNui('close', {}));

document.getElementById('deptForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('deptName').value.trim();
  if (!name) return;
  fetchNui('createDepartment', { name });
  document.getElementById('deptName').value = '';
});

document.getElementById('rankForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('rankName').value.trim();
  const level = Number(document.getElementById('rankLevel').value || 1);
  const departmentId = Number(document.getElementById('rankDepartment').value || null);
  if (!name) return;
  fetchNui('createRank', { name, level, departmentId });
  document.getElementById('rankForm').reset();
});

document.getElementById('memberForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = {
    username: document.getElementById('memberUsername').value.trim(),
    discordId: document.getElementById('memberDiscord').value.trim(),
    callsign: document.getElementById('memberCallsign').value.trim(),
    rankId: Number(document.getElementById('memberRank').value || null),
    departmentId: Number(document.getElementById('memberDepartment').value || null),
    status: 'active'
  };
  if (!data.username) return;
  fetchNui('addMember', data);
  document.getElementById('memberForm').reset();
});

document.getElementById('shiftForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const memberId = Number(document.getElementById('shiftMember').value);
  const status = document.getElementById('shiftStatus').value;
  if (!memberId) return;
  fetchNui('addShift', {
    memberId,
    status,
    checkedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
  });
  document.getElementById('shiftForm').reset();
});

document.getElementById('leaveForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const memberId = Number(document.getElementById('leaveMember').value);
  const reason = document.getElementById('leaveReason').value.trim();
  const startDate = document.getElementById('leaveStart').value;
  const endDate = document.getElementById('leaveEnd').value;
  if (!memberId || !reason || !startDate || !endDate) return;
  fetchNui('addLeave', { memberId, reason, startDate, endDate });
  document.getElementById('leaveForm').reset();
});

document.getElementById('trainingForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const memberId = Number(document.getElementById('trainingMember').value);
  const module = document.getElementById('trainingModule').value.trim();
  if (!memberId || !module) return;
  fetchNui('addTraining', { memberId, module });
  document.getElementById('trainingForm').reset();
});

document.getElementById('disciplineForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const memberId = Number(document.getElementById('disciplineMember').value);
  const reason = document.getElementById('disciplineReason').value.trim();
  const severity = document.getElementById('disciplineSeverity').value;
  const issuedBy = document.getElementById('disciplineIssuer').value.trim();
  if (!memberId || !reason || !issuedBy) return;
  fetchNui('addDiscipline', { memberId, reason, severity, issuedBy });
  document.getElementById('disciplineForm').reset();
});

document.getElementById('appForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('appUsername').value.trim();
  const experience = document.getElementById('appExperience').value.trim();
  if (!username || !experience) return;
  fetchNui('addApplication', { username, experience });
  document.getElementById('appForm').reset();
});

window.addEventListener('message', function(event) {
  const payload = event.data;
  if (!payload || !payload.type) return;

  if (payload.type === 'toggle') {
    app.classList.toggle('hidden', !payload.open);
    if (payload.open) {
      fetchNui('ready', {});
    }
  }

  if (payload.type === 'state') {
    Object.assign(state, payload.data || {});
    render();
  }
});

fetchNui('ready', {});
showTab('departments');

function showTab(tabName) {
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === tabName));
  tabPanels.forEach(panel => panel.classList.toggle('active', panel.id === `${tabName}-panel`));
}
