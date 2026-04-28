function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2800);
}

async function apiFetch(url, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  };

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (response.status === 401) {
    window.location.href = '/login';
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    const error = data?.error || 'Request failed';
    throw new Error(error);
  }

  return data;
}

function getTheme() {
  return localStorage.getItem('theme') || 'light';
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}

function initThemeToggle() {
  applyTheme(getTheme());
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      applyTheme(nextTheme);
      showToast(`Switched to ${nextTheme} mode`);
    });
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

initThemeToggle();
