const tableBody = document.getElementById('complaintsTableBody');
const loader = document.getElementById('tableLoader');
const emptyState = document.getElementById('emptyState');
const activityList = document.getElementById('activityList');

let complaints = [];
let allComplaints = null; // cache of full complaints fetched from server
let currentSort = { key: 'created_at', dir: 'desc' };
let chart = null;

function setLoading(isLoading) {
  loader.classList.toggle('hidden', !isLoading);
}

function statusBadge(status) {
  if (status === 'Resolved') return '<span class="badge resolved">Resolved</span>';
  if (status === 'In Progress') return '<span class="badge progress">In Progress</span>';
  return '<span class="badge pending">Pending</span>';
}

function priorityBadge(priority) {
  if (priority === 'High') return '<span class="badge high">High</span>';
  if (priority === 'Low') return '<span class="badge low">Low</span>';
  return '<span class="badge medium">Medium</span>';
}

function renderTable(items) {
  tableBody.innerHTML = '';

  if (!items.length) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  items.forEach((item) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>#${item.id}</td>
      <td>${item.student_name}<br/><span class="muted">${item.student_email}</span></td>
      <td>${item.title}</td>
      <td>${item.category}</td>
      <td>${statusBadge(item.status)}</td>
      <td>${priorityBadge(item.priority)}</td>
      <td>${formatDate(item.created_at)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-secondary" data-action="update" data-id="${item.id}">Update</button>
          <button class="btn btn-danger" data-action="delete" data-id="${item.id}">Delete</button>
        </div>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

function renderChart(monthly = []) {
  const labels = monthly.map((m) => m.month);
  const values = monthly.map((m) => m.total);

  const ctx = document.getElementById('complaintChart');
  if (!ctx) return;

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Complaints',
          data: values,
          backgroundColor: 'rgba(0, 120, 215, 0.7)',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
}

async function loadStatsAndChart() {
  const result = await apiFetch('/api/admin/stats/summary');
  if (!result) return;

  document.getElementById('statTotal').textContent = result.stats.total;
  document.getElementById('statPending').textContent = result.stats.pending;
  document.getElementById('statResolved').textContent = result.stats.resolved;
  document.getElementById('statHigh').textContent = result.stats.high_priority;

  renderChart(result.monthly || []);
}

async function loadActivities() {
  const result = await apiFetch('/api/admin/activity/recent');
  if (!result) return;

  activityList.innerHTML = '';
  if (!result.activities.length) {
    const li = document.createElement('li');
    li.textContent = 'No admin activities yet.';
    activityList.appendChild(li);
    return;
  }

  result.activities.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.action}</span><span class="muted">${formatDate(item.created_at)}</span>`;
    activityList.appendChild(li);
  });
}

async function loadProfile() {
  const result = await apiFetch('/api/auth/me');
  if (!result) return;
  const user = result.user;
  document.getElementById('profileBadge').textContent = `${user.name} (${user.role})`;
}
async function fetchAllComplaints() {
  setLoading(true);
  try {
    const result = await apiFetch('/api/admin/complaints');
    if (!result) return;
    allComplaints = result.complaints || [];
    complaints = [...allComplaints];
    applyFiltersAndRender();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setLoading(false);
  }
}

function applyFiltersAndRender() {
  if (!Array.isArray(allComplaints)) return;
  const search = document.getElementById('searchInput').value.trim().toLowerCase();
  const category = document.getElementById('filterCategory').value;
  const status = document.getElementById('filterStatus').value;

  complaints = allComplaints.filter((c) => {
    if (search && !String(c.title || '').toLowerCase().includes(search)) return false;
    if (category && category !== '' && c.category !== category) return false;
    if (status && status !== '' && c.status !== status) return false;
    return true;
  });

  // apply sorting
  complaints.sort((a, b) => {
    const key = currentSort.key;
    let av = a[key];
    let bv = b[key];
    if (key === 'created_at') {
      av = new Date(av).getTime();
      bv = new Date(bv).getTime();
    }
    if (av < bv) return currentSort.dir === 'asc' ? -1 : 1;
    if (av > bv) return currentSort.dir === 'asc' ? 1 : -1;
    return 0;
  });

  renderTable(complaints);
}

async function logout() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function getCurrentFilters() {
  const params = new URLSearchParams();
  const search = document.getElementById('searchInput').value.trim();
  const category = document.getElementById('filterCategory').value;
  const status = document.getElementById('filterStatus').value;

  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (status) params.set('status', status);
  return params;
}

function exportCsv() {
  const params = getCurrentFilters();
  const url = `/api/admin/complaints/export/csv?${params.toString()}`;
  window.open(url, '_blank');
}

async function handleRowAction(event) {
  const target = event.target;
  const action = target.dataset.action;
  const id = target.dataset.id;

  if (!action || !id) return;

  if (action === 'delete') {
    const shouldDelete = window.confirm(`Delete complaint #${id}?`);
    if (!shouldDelete) return;

    try {
      await apiFetch(`/api/admin/complaints/${id}`, { method: 'DELETE' });
      showToast('Complaint deleted');
      await Promise.all([loadComplaints(), loadStatsAndChart(), loadActivities()]);
    } catch (error) {
      showToast(error.message, 'error');
    }
    return;
  }

  if (action === 'update') {
    const status = window.prompt('Set status (Pending, In Progress, Resolved):');
    if (!status) return;

    const priority = window.prompt('Set priority (Low, Medium, High):');
    if (!priority) return;

    try {
      await apiFetch(`/api/admin/complaints/${id}`, {
        method: 'PUT',
        body: { status: status.trim(), priority: priority.trim() }
      });
      showToast('Complaint updated');
      await Promise.all([loadComplaints(), loadStatsAndChart(), loadActivities()]);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }
}

function bindEvents() {
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);

  document.getElementById('searchInput').addEventListener('input', debounce(applyFiltersAndRender, 300));
  document.getElementById('filterCategory').addEventListener('change', applyFiltersAndRender);
  document.getElementById('filterStatus').addEventListener('change', applyFiltersAndRender);

  // allow sorting by clicking table headers (ID, Date)
  const table = document.querySelector('.table-wrap table');
  if (table) {
    const ths = table.querySelectorAll('th');
    ths.forEach((th) => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const keyMap = { 'ID': 'id', 'Date': 'created_at' };
        const key = keyMap[th.textContent.trim()] || null;
        if (!key) return;
        if (currentSort.key === key) {
          currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.key = key;
          currentSort.dir = 'desc';
        }
        applyFiltersAndRender();
      });
    });
  }

  tableBody.addEventListener('click', handleRowAction);
}

async function init() {
  bindEvents();
  try {
    await Promise.all([loadProfile(), loadStatsAndChart(), fetchAllComplaints(), loadActivities()]);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

init();
