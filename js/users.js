// URL de l'API est déjà définie dans auth.js
// Pas besoin de redéclarer API_URL

// Fonction pour obtenir l'en-tête d'autorisation
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Récupérer tous les utilisateurs (admin seulement)
async function getUsers() {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la récupération des utilisateurs');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Récupérer un utilisateur spécifique (admin seulement)
async function getUser(userId) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la récupération de l\'utilisateur');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Créer un nouvel utilisateur (admin seulement)
async function createUser(userData) {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la création de l\'utilisateur');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Mettre à jour un utilisateur (admin seulement)
async function updateUser(userId, userData) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la mise à jour de l\'utilisateur');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Supprimer un utilisateur (admin seulement)
async function deleteUser(userId) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la suppression de l\'utilisateur');
    }

    return data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Afficher la liste des utilisateurs dans le HTML
function displayUsers(users, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (users.length === 0) {
    container.innerHTML = '<p class="text-center p-4">Aucun utilisateur trouvé</p>';
    return;
  }

  // Créer la table
  const table = document.createElement('table');
  table.className = 'w-full table-auto';
  
  // En-tête
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr class="bg-gray-100 text-left">
      <th class="p-2">Nom</th>
      <th class="p-2">Email</th>
      <th class="p-2">Rôle</th>
      <th class="p-2">Actions</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Corps
  const tbody = document.createElement('tbody');
  
  users.forEach(user => {
    const row = document.createElement('tr');
    row.className = 'border-b';
    
    row.innerHTML = `
      <td class="p-2">${user.name}</td>
      <td class="p-2">${user.email}</td>
      <td class="p-2">${user.role}</td>
      <td class="p-2 flex gap-1">
        <button class="edit-user-btn text-xs bg-yellow-500 text-white px-2 py-1 rounded" data-id="${user._id}">Éditer</button>
        <button class="delete-user-btn text-xs bg-red-500 text-white px-2 py-1 rounded" data-id="${user._id}">Supprimer</button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);

  // Ajouter les écouteurs d'événements
  addUserButtonListeners();
}

// Ajouter les écouteurs d'événements aux boutons utilisateur
function addUserButtonListeners() {
  // Boutons Éditer
  document.querySelectorAll('.edit-user-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const userId = e.target.dataset.id;
      // Logique d'édition - peut être implémentée selon les besoins
      console.log(`Éditer utilisateur ${userId}`);
    });
  });

  // Boutons Supprimer
  document.querySelectorAll('.delete-user-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
        const userId = e.target.dataset.id;
        try {
          await deleteUser(userId);
          // Rafraîchir la liste
          loadUsers();
        } catch (error) {
          alert('Erreur lors de la suppression: ' + error.message);
        }
      }
    });
  });
}

// Charger tous les utilisateurs
async function loadUsers() {
  try {
    const users = await getUsers();
    displayUsers(users, 'users-container');
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error);
    alert('Erreur lors du chargement des utilisateurs: ' + error.message);
  }
}

// Gestion du formulaire d'ajout d'utilisateur (admin dashboard)
document.addEventListener('DOMContentLoaded', () => {
  // Protection des pages admin
  if (document.body.classList.contains('admin-dashboard')) {
    protectPage();
    
    // Vérifier le rôle de l'utilisateur
    const user = getCurrentUser();
    if (user && user.role !== 'admin') {
      window.location.href = user.role === 'responsable' ? 'dashboard.html' : 'userDashboard.html';
    }
  }

  const userForm = document.getElementById('add-user-form');
  if (userForm) {
    userForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
      };

      try {
        await createUser(userData);
        alert('Utilisateur créé avec succès!');
        userForm.reset();
        // Recharger la liste des utilisateurs
        loadUsers();
      } catch (error) {
        alert('Erreur lors de la création de l\'utilisateur: ' + error.message);
      }
    });
  }

  // Charger les utilisateurs au chargement de la page si le conteneur existe
  if (document.getElementById('users-container')) {
    loadUsers();
  }
}); 