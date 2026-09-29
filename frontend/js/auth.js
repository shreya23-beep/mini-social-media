const API_URL = 'http://localhost:5000/api/auth';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authTitle = document.getElementById('auth-title');
const authError = document.getElementById('auth-error');

function toggleAuth(showRegister) {
  authError.textContent = '';
  if (showRegister) {
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
    authTitle.textContent = 'Register';
  } else {
    registerForm.style.display = 'none';
    loginForm.style.display = 'flex';
    authTitle.textContent = 'Login';
  }
}

// Handle Register
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';

  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'index.html';
  } catch (err) {
    authError.textContent = err.message;
  }
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'index.html';
  } catch (err) {
    authError.textContent = err.message;
  }
});