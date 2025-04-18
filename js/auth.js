//const API_URL = 'http://localhost:5000/api';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://gestion-des-projets-d-equipe.onrender.com/api';

async function register(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription');
    }

    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    
    redirectBasedOnRole(data.user.role);

    return data;
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    throw error;
  }
}


async function login(credentials) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Erreur de connexion');
    }

    
    localStorage.setItem('token', data.token);
    
    
    let userData;
    if (data.user) {
      userData = data.user;
    } else if (data.data) {
      userData = data.data;
    } else {
      
      
      userData = {
        email: credentials.email,
        role: data.role || 'user' 
      };
      console.warn('Aucune donnée utilisateur trouvée dans la réponse API, création de données minimales');
    }
    
    console.log('Données utilisateur identifiées:', userData);
    
    
    localStorage.setItem('user', JSON.stringify(userData));

    
    if (userData && userData.role) {
      redirectBasedOnRole(userData.role);
    } else {
      console.error('Aucun rôle utilisateur trouvé pour la redirection');
      window.location.href = 'userDashboard.html'; 
    }

    return data;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
}


function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}


function isAuthenticated() {
  return localStorage.getItem('token') !== null;
}


function redirectBasedOnRole(role) {
  console.log('Redirection basée sur le rôle:', role);
  
  switch(role) {
    case 'admin':
      window.location.href = 'adminDashboard.html';
      break;
    case 'responsable':
      window.location.href = 'dashboard.html';
      break;
    case 'user':
      window.location.href = 'userDashboard.html';
      break;
    default:
      console.warn(`Rôle inconnu: ${role}, redirection vers la page utilisateur`);
      window.location.href = 'userDashboard.html';
  }
}


function getCurrentUser() {
  const userJSON = localStorage.getItem('user');
  if (!userJSON) return null;
  return JSON.parse(userJSON);
}


function protectPage() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }
  
  
  const user = getCurrentUser();
  const isAdminPage = document.body.classList.contains('admin-dashboard');
  const isUserPage = document.body.classList.contains('user-dashboard');
  
  if (isAdminPage && user.role !== 'admin') {
    window.location.href = 'userDashboard.html';
  } else if (isUserPage && user.role === 'admin') {
    window.location.href = 'adminDashboard.html';
  }
}


if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const errorMessageEl = document.getElementById('errorMessage');
    if (errorMessageEl) {
      errorMessageEl.classList.add('hidden');
    }
    
    const userData = {
      name: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      role: 'user'
    };

    try {
      await register(userData);
    } catch (error) {
      if (errorMessageEl) {
        errorMessageEl.textContent = error.message;
        errorMessageEl.classList.remove('hidden');
      }
    }
  });
}


if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const errorMessageEl = document.getElementById('errorMessage');
    if (errorMessageEl) {
      errorMessageEl.classList.add('hidden');
    }
    
    const credentials = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };

    try {
      await login(credentials);
    } catch (error) {
      if (errorMessageEl) {
        errorMessageEl.textContent = error.message;
        errorMessageEl.classList.remove('hidden');
      }
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  
  const logoutButtons = document.querySelectorAll('.logout-btn');
  logoutButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });
}); 