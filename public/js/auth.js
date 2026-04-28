async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    if (!email || !password) {
      showToast('Email and password are required', 'error');
      return;
    }

    const result = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    showToast(result.message || 'Login successful');
    window.location.href = result.user.role === 'admin' ? '/admin' : '/dashboard';
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function handleSignup(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    if (!name || !email || !password) {
      showToast('All fields are required', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password }
    });

    showToast('Signup successful. Redirecting...');
    window.location.href = '/dashboard';
  } catch (error) {
    showToast(error.message, 'error');
  }
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', handleSignup);
}
