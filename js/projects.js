// URL de l'API est déjà définie dans auth.js
// Pas besoin de redéclarer API_URL

// Fonction pour obtenir l'en-tête d'autorisation (sans Content-Type pour FormData)
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
}

// Fonction pour obtenir l'en-tête d'autorisation avec Content-Type JSON
function getAuthHeaderJSON() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Récupérer tous les projets
async function getProjects() {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      headers: getAuthHeaderJSON()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la récupération des projets');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Récupérer un projet spécifique
async function getProject(projectId) {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'GET',
      headers: getAuthHeaderJSON()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la récupération du projet');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Créer un nouveau projet (avec support d'image)
async function createProject(formData) {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeader(), // Sans Content-Type pour FormData
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la création du projet');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Créer un nouveau projet avec JSON (sans images)
async function createProjectJSON(projectData) {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaderJSON(),
      body: JSON.stringify(projectData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la création du projet');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Mettre à jour un projet
async function updateProject(projectId, projectData) {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: getAuthHeaderJSON(),
      body: JSON.stringify(projectData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la mise à jour du projet');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Supprimer un projet
async function deleteProject(projectId) {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaderJSON()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la suppression du projet');
    }

    return data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Ajouter un membre à un projet
async function addProjectMember(projectId, userId) {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/members`, {
      method: 'PUT',
      headers: getAuthHeaderJSON(),
      body: JSON.stringify({ userId })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de l\'ajout du membre au projet');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Afficher la liste des projets dans le HTML
function displayProjects(projects, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (projects.length === 0) {
    container.innerHTML = '<p class="text-center p-4">Aucun projet trouvé</p>';
    return;
  }

  projects.forEach(project => {
    const deadlineDate = new Date(project.deadline);
    const formattedDate = deadlineDate.toLocaleDateString('fr-FR');
    
    const projectCard = document.createElement('div');
    projectCard.className = 'bg-card p-5 rounded-2xl shadow hover:scale-105 transition-all';
    projectCard.innerHTML = `
      <img src="${project.image ? project.image : 'images/default-project.jpg'}" class="rounded-lg mb-4 w-full h-40 object-cover" />
      <h3 class="text-lg font-bold mb-2">${project.name}</h3>
      <div class="h-2 bg-gray-200 rounded-full mb-2">
        <div class="h-full bg-primary rounded-full" style="width: ${project.progress || 0}%"></div>
      </div>
      <p class="text-sm">${project.progress || 0}% - ${formattedDate}</p>
      <div class="mt-3 flex justify-end gap-2">
        <button class="view-project-btn text-sm bg-blue-500 text-white px-2 py-1 rounded" data-id="${project._id}">Voir</button>
        <button class="edit-project-btn text-sm bg-yellow-500 text-white px-2 py-1 rounded" data-id="${project._id}">Éditer</button>
        <button class="delete-project-btn text-sm bg-red-500 text-white px-2 py-1 rounded" data-id="${project._id}">Supprimer</button>
      </div>
    `;

    container.appendChild(projectCard);
  });

  // Ajouter les écouteurs d'événements
  addProjectButtonListeners();
}

// Ajouter les écouteurs d'événements aux boutons de projet
function addProjectButtonListeners() {
  // Boutons Voir
  document.querySelectorAll('.view-project-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const projectId = e.target.dataset.id;
      window.location.href = `project-details.html?id=${projectId}`;
    });
  });

  // Boutons Éditer
  document.querySelectorAll('.edit-project-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const projectId = e.target.dataset.id;
      if (typeof window.loadProjectForEdit === 'function') {
        window.loadProjectForEdit(projectId);
      } else {
        console.error("La fonction loadProjectForEdit n'est pas disponible");
      }
    });
  });

  // Boutons Supprimer
  document.querySelectorAll('.delete-project-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
        const projectId = e.target.dataset.id;
        try {
          await deleteProject(projectId);
          // Rafraîchir la liste
          loadProjects();
        } catch (error) {
          alert('Erreur lors de la suppression: ' + error.message);
        }
      }
    });
  });
}

// Charger tous les projets
async function loadProjects() {
  try {
    const projects = await getProjects();
    displayProjects(projects, 'projects-container');
  } catch (error) {
    console.error('Erreur lors du chargement des projets:', error);
    alert('Erreur lors du chargement des projets: ' + error.message);
  }
}

// Gestion du formulaire de création/édition de projet
document.addEventListener('DOMContentLoaded', () => {
  const projectForm = document.getElementById('project-form');
  if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Récupérer l'ID du projet (pour édition)
      const projectId = document.getElementById('project-id').value;
      const isEditing = projectId !== '';
      
      // Créer un objet JavaScript standard pour les données du projet
      const projectData = {
        name: document.getElementById('project-name').value,
        description: document.getElementById('project-description').value,
        deadline: document.getElementById('project-deadline').value,
        progress: document.getElementById('project-progress') ? 
                 parseInt(document.getElementById('project-progress').value) : 0
      };
      
      try {
        // Afficher un message de chargement
        const submitBtn = document.getElementById('submit-btn') || projectForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = isEditing ? '⏳ Mise à jour...' : '⏳ Création en cours...';
        submitBtn.disabled = true;
        
        if (isEditing) {
          // Mode édition
          await updateProject(projectId, projectData);
          alert('Projet mis à jour avec succès!');
        } else {
          // Mode création
          await createProjectJSON(projectData);
          alert('Projet créé avec succès!');
        }
        
        // Masquer le formulaire et recharger les projets
        document.getElementById('project-form-section').classList.add('hidden');
        loadProjects();
        
        // Réinitialiser les champs du formulaire
        document.getElementById('project-name').value = '';
        document.getElementById('project-description').value = '';
        document.getElementById('project-deadline').value = '';
        document.getElementById('project-progress').value = '0';
        document.getElementById('project-id').value = '';
        
        // Restaurer le bouton
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      } catch (error) {
        alert(`Erreur lors de ${isEditing ? 'la mise à jour' : 'la création'} du projet: ` + error.message);
        const submitBtn = document.getElementById('submit-btn') || projectForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }

  // Charger les projets au chargement de la page si le conteneur existe
  if (document.getElementById('projects-container')) {
    loadProjects();
  }
}); 