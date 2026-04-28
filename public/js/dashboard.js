const tableBody = document.getElementById('complaintsTableBody');
const loader = document.getElementById('tableLoader');
const emptyState = document.getElementById('emptyState');
const urgentList = document.getElementById('urgentList');
const complaintCategorySelect = document.getElementById('complaintCategory');
const otherCategoryGroup = document.getElementById('otherCategoryGroup');
const otherCategoryInput = document.getElementById('otherCategory');

let complaintState = [];
let allComplaints = [];

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

function toggleOtherCategoryInput() {
  const isOther = complaintCategorySelect.value === 'Other';
  otherCategoryGroup.classList.toggle('hidden', !isOther);
  otherCategoryInput.required = isOther;

  if (!isOther) {
    otherCategoryInput.value = '';
  }
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

    const disableActions = item.status === 'Resolved';

    tr.innerHTML = `
      <td>#${item.id}</td>
      <td>${item.title}</td>
      <td>${item.category}</td>
      <td>${statusBadge(item.status)}</td>
      <td>${priorityBadge(item.priority)}</td>
      <td>${formatDate(item.created_at)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-secondary" ${disableActions ? 'disabled' : ''} data-action="edit" data-id="${item.id}">Edit</button>
          <button class="btn btn-danger" ${disableActions ? 'disabled' : ''} data-action="delete" data-id="${item.id}">Delete</button>
        </div>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

async function loadStats() {
  const result = await apiFetch('/api/complaints/stats/summary');
  if (!result) return;

  document.getElementById('statTotal').textContent = result.stats.total;
  document.getElementById('statPending').textContent = result.stats.pending;
  document.getElementById('statResolved').textContent = result.stats.resolved;
  document.getElementById('statHigh').textContent = result.stats.high_priority;
}

async function loadProfile() {
  const result = await apiFetch('/api/auth/me');
  if (!result) return;

  const user = result.user;
  document.getElementById('profileBadge').textContent = `${user.name} (${user.role})`;
  document.getElementById('profileName').value = user.name;
  document.getElementById('profileRole').value = user.role.charAt(0).toUpperCase() + user.role.slice(1);
}

async function loadUrgentComplaints() {
  if (!allComplaints.length) {
    const result = await apiFetch('/api/complaints');
    if (!result) return;
    allComplaints = result.complaints || [];
  }

  const urgentComplaints = allComplaints.filter(
    (c) => c.status === 'Pending' || c.priority === 'High'
  );

  urgentList.innerHTML = '';
  if (!urgentComplaints.length) {
    const li = document.createElement('li');
    li.textContent = 'All caught up! No urgent complaints.';
    li.style.color = 'var(--muted)';
    urgentList.appendChild(li);
    return;
  }

  urgentComplaints.slice(0, 5).forEach((item) => {
    const li = document.createElement('li');
    const priorityBadge = item.priority === 'High' ? ' <span class="badge high">High</span>' : '';
    const statusBadge = item.status === 'Pending' ? ' <span class="badge pending">Pending</span>' : ' <span class="badge progress">In Progress</span>';
    li.innerHTML = `<span><strong>#${item.id}</strong> ${item.title}${priorityBadge}${statusBadge}</span><span class="muted" style="font-size: 0.85rem;">${formatDate(item.created_at)}</span>`;
    urgentList.appendChild(li);
  });
}

async function loadComplaints() {
  const search = document.getElementById('searchInput').value.trim();
  const category = document.getElementById('filterCategory').value;
  const status = document.getElementById('filterStatus').value;

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (status) params.set('status', status);

  setLoading(true);
  try {
    const result = await apiFetch(`/api/complaints?${params.toString()}`);
    if (!result) return;
    complaintState = result.complaints;
    renderTable(complaintState);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setLoading(false);
  }
}

async function submitComplaint(event) {
  event.preventDefault();
  const form = event.target;
  const selectedCategory = form.category.value;
  const title = form.title.value.trim();
  const description = form.description.value.trim();

  let category = selectedCategory;
  let finalDescription = description;

  if (selectedCategory === 'Other') {
    const otherCategory = otherCategoryInput.value.trim();
    if (!otherCategory) {
      showToast('Please enter the custom category for Others', 'error');
      otherCategoryInput.focus();
      return;
    }
    category = 'Other';
    finalDescription = `[Other Category: ${otherCategory}] ${description}`;
  }

  const payload = {
    title,
    category,
    description: finalDescription
  };

  if (!payload.title || !payload.category || !payload.description) {
    showToast('Please fill all complaint fields', 'error');
    return;
  }

  try {
    await apiFetch('/api/complaints', {
      method: 'POST',
      body: payload
    });
    showToast('Complaint submitted successfully');
    form.reset();
    toggleOtherCategoryInput();
    await Promise.all([loadComplaints(), loadStats(), loadActivities()]);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function updateProfile(event) {
  event.preventDefault();
  const name = document.getElementById('profileName').value.trim();

  if (!name) {
    showToast('Name is required', 'error');
    return;
  }

  try {
    await apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: { name }
    });
    document.getElementById('profileBadge').textContent = `${name} (student)`;
    showToast('Profile updated');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function logout() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function handleRowAction(event) {
  const target = event.target;
  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id) return;

  const complaint = complaintState.find((item) => item.id === Number(id));
  if (!complaint) return;

  if (action === 'delete') {
    const shouldDelete = window.confirm(`Delete complaint #${id}?`);
    if (!shouldDelete) return;

    try {
      await apiFetch(`/api/complaints/${id}`, { method: 'DELETE' });
      showToast('Complaint deleted');
      await Promise.all([loadComplaints(), loadStats(), loadActivities()]);
    } catch (error) {
      showToast(error.message, 'error');
    }
    return;
  }

  if (action === 'edit') {
    const title = window.prompt('Update complaint title:', complaint.title);
    if (!title) return;

    const category = window.prompt(
      'Update category (Electrical, WiFi / Network, Lab Equipment, Hostel, Cleanliness, Classroom, Canteen / Food, Water Supply, Library, Transport, Security, Other):',
      complaint.category
    );
    if (!category) return;

    const description = window.prompt('Update description:', complaint.description);
    if (!description) return;

    try {
      await apiFetch(`/api/complaints/${id}`, {
        method: 'PUT',
        body: {
          title: title.trim(),
          category: category.trim(),
          description: description.trim()
        }
      });
      showToast('Complaint updated');
      await Promise.all([loadComplaints(), loadActivities()]);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }
}

async function changePassword(event) {
  event.preventDefault();
  const currentPassword = document.getElementById('currentPassword').value.trim();
  const newPassword = document.getElementById('newPassword').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    showToast('Please fill all password fields', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast('New passwords do not match', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showToast('New password must be at least 6 characters', 'error');
    return;
  }

  try {
    await apiFetch('/api/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword }
    });
    showToast('Password changed successfully');
    document.getElementById('passwordForm').reset();
    closePasswordModal();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function openPasswordModal() {
  document.getElementById('passwordModal').classList.remove('hidden');
}

function closePasswordModal() {
  document.getElementById('passwordModal').classList.add('hidden');
  document.getElementById('passwordForm').reset();
}

function bindEvents() {
  document.getElementById('complaintForm').addEventListener('submit', submitComplaint);
  document.getElementById('profileForm').addEventListener('submit', updateProfile);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('changePasswordBtn').addEventListener('click', openPasswordModal);
  document.getElementById('passwordForm').addEventListener('submit', changePassword);
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', closePasswordModal);
  });

  document.getElementById('searchInput').addEventListener('input', debounce(loadComplaints, 350));
  document.getElementById('filterCategory').addEventListener('change', loadComplaints);
  document.getElementById('filterStatus').addEventListener('change', loadComplaints);
  complaintCategorySelect.addEventListener('change', toggleOtherCategoryInput);

  toggleOtherCategoryInput();
  tableBody.addEventListener('click', handleRowAction);
}

async function init() {
  bindEvents();
  try {
    await Promise.all([loadProfile(), loadStats(), loadComplaints(), loadUrgentComplaints()]);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

init();
