function getAuthHeader() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}


async function getTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la récupération des tâches');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}


async function getProjectTasks(projectId) {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la récupération des tâches du projet');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}


async function getTask(taskId) {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la récupération de la tâche');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}


async function createTask(projectId, taskData) {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(taskData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la création de la tâche');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}


async function updateTask(taskId, taskData) {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(taskData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la mise à jour de la tâche');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}


async function deleteTask(taskId) {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la suppression de la tâche');
    }

    return data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}


function displayTasks(tasks, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (tasks.length === 0) {
    container.innerHTML = '<p class="text-center p-4">Aucune tâche trouvée</p>';
    return;
  }

  tasks.forEach(task => {
    const dueDate = new Date(task.dueDate);
    const formattedDate = dueDate.toLocaleDateString('fr-FR');
    
    let priorityClass = '';
    switch(task.priority) {
      case 'Haute':
        priorityClass = 'text-red-600';
        break;
      case 'Moyenne':
        priorityClass = 'text-yellow-600';
        break;
      case 'Basse':
        priorityClass = 'text-green-600';
        break;
    }

    let statusClass = '';
    switch(task.status) {
      case 'En cours':
        statusClass = 'text-blue-600';
        break;
      case 'Terminé':
        statusClass = 'text-green-600';
        break;
      case 'En retard':
        statusClass = 'text-red-600';
        break;
    }
    
    const taskItem = document.createElement('li');
    taskItem.className = 'bg-gray-100 p-3 rounded-lg';
    taskItem.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <p class="font-medium">${task.title}</p>
          <p class="text-sm">${task.description || ''}</p>
          <p class="text-sm">
            <span class="${statusClass}">${task.status}</span> - 
            <span class="${priorityClass}">Priorité ${task.priority}</span> - 
            À rendre le ${formattedDate}
          </p>
        </div>
        <div class="flex gap-1">
          <button class="edit-task-btn text-xs bg-yellow-500 text-white px-2 py-1 rounded" data-id="${task._id}">Éditer</button>
          <button class="delete-task-btn text-xs bg-red-500 text-white px-2 py-1 rounded" data-id="${task._id}">Supprimer</button>
        </div>
      </div>
    `;

    container.appendChild(taskItem);
  });

  
  addTaskButtonListeners();
}


function addTaskButtonListeners() {
  
  document.querySelectorAll('.edit-task-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const taskId = e.target.dataset.id;
      
      console.log(`Éditer tâche ${taskId}`);
    });
  });

  
  document.querySelectorAll('.delete-task-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche?')) {
        const taskId = e.target.dataset.id;
        try {
          await deleteTask(taskId);
          
          loadTasks();
        } catch (error) {
          alert('Erreur lors de la suppression: ' + error.message);
        }
      }
    });
  });
}


async function loadTasks() {
  try {
    const tasks = await getTasks();
    displayTasks(tasks, 'tasks-container');
  } catch (error) {
    console.error('Erreur lors du chargement des tâches:', error);
    alert('Erreur lors du chargement des tâches: ' + error.message);
  }
}


async function loadProjectTasks(projectId) {
  try {
    const tasks = await getProjectTasks(projectId);
    displayTasks(tasks, 'project-tasks-container');
  } catch (error) {
    console.error('Erreur lors du chargement des tâches du projet:', error);
    alert('Erreur lors du chargement des tâches du projet: ' + error.message);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      
      const projectId = document.getElementById('project-id').value || 
                        new URLSearchParams(window.location.search).get('projectId');
      
      if (!projectId) {
        alert('ID de projet non spécifié');
        return;
      }
      
      const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        priority: document.getElementById('task-priority').value,
        dueDate: document.getElementById('task-due-date').value,
        assignedTo: document.getElementById('task-assigned-to').value,
      };

      try {
        await createTask(projectId, taskData);
        alert('Tâche créée avec succès!');
        
        document.getElementById('task-form-section').classList.add('hidden');
        loadProjectTasks(projectId);
        
        taskForm.reset();
      } catch (error) {
        alert('Erreur lors de la création de la tâche: ' + error.message);
      }
    });
  }

  
  if (document.getElementById('tasks-container')) {
    loadTasks();
  }
  
  
  if (document.getElementById('project-tasks-container')) {
    const projectId = new URLSearchParams(window.location.search).get('id');
    if (projectId) {
      loadProjectTasks(projectId);
    }
  }
}); 