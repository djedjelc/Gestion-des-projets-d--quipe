const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://gestion-des-projets-d-equipe.onrender.com/api';

// Fonction pour s'inscrire
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

    // Stocker le token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Redirection selon le rôle
    redirectBasedOnRole(data.user.role);

    return data;
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    throw error;
  }
}

// Fonction pour se connecter
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

    // Stocker le token
    localStorage.setItem('token', data.token);
    
    // Vérifier où se trouvent les données utilisateur dans la réponse
    let userData;
    if (data.user) {
      userData = data.user;
    } else if (data.data) {
      userData = data.data;
    } else {
      // Si aucune donnée utilisateur n'est trouvée, créer un objet utilisateur minimal
      // basé sur la réponse du serveur ou les informations d'authentification
      userData = {
        email: credentials.email,
        role: data.role || 'user' // Utiliser le rôle de la réponse ou 'user' par défaut
      };
      console.warn('Aucune donnée utilisateur trouvée dans la réponse API, création de données minimales');
    }
    
    console.log('Données utilisateur identifiées:', userData);
    
    // Stocker les données utilisateur
    localStorage.setItem('user', JSON.stringify(userData));

    // Redirection selon le rôle (si disponible)
    if (userData && userData.role) {
      redirectBasedOnRole(userData.role);
    } else {
      console.error('Aucun rôle utilisateur trouvé pour la redirection');
      window.location.href = 'userDashboard.html'; // Redirection par défaut
    }

    return data;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
}

// Fonction pour se déconnecter
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Vérifier si l'utilisateur est connecté
function isAuthenticated() {
  return localStorage.getItem('token') !== null;
}

// Rediriger en fonction du rôle
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

// Obtenir les infos de l'utilisateur connecté
function getCurrentUser() {
  const userJSON = localStorage.getItem('user');
  if (!userJSON) return null;
  return JSON.parse(userJSON);
}

// Protection des pages - à exécuter au chargement des pages protégées
function protectPage() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }
  
  // For admin-only pages, check role
  const user = getCurrentUser();
  const isAdminPage = document.body.classList.contains('admin-dashboard');
  const isUserPage = document.body.classList.contains('user-dashboard');
  
  if (isAdminPage && user.role !== 'admin') {
    window.location.href = 'userDashboard.html';
  } else if (isUserPage && user.role === 'admin') {
    window.location.href = 'adminDashboard.html';
  }
}

// Gestion du formulaire d'inscription
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
      role: 'user' // Default role for registration
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

// Gestion du formulaire de connexion
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

// Gestion des boutons de déconnexion
document.addEventListener('DOMContentLoaded', () => {
  // Ajout d'événements de déconnexion si les boutons existent
  const logoutButtons = document.querySelectorAll('.logout-btn');
  logoutButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });
}); 