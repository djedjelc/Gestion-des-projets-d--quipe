# API Backend de l'Application de Gestion des Tâches

Ce backend fournit une API RESTful pour l'application de gestion des tâches. Il est construit avec Node.js, Express et MongoDB.

## Technologies utilisées

- Node.js
- Express
- MongoDB & Mongoose
- JWT pour l'authentification
- Multer pour l'upload de fichiers
- bcryptjs pour le hachage des mots de passe

## Configuration requise

- Node.js (v14 ou supérieur)
- MongoDB (local ou Atlas)

## Installation

1. Clonez le dépôt
```
git clone <votre-dépôt>
```

2. Installez les dépendances
```
cd backend
npm install
```

3. Configurez les variables d'environnement
Créez un fichier `.env` à la racine du projet avec les variables suivantes:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=votre_secret_jwt
JWT_EXPIRE=30d
```

4. Démarrez le serveur
```
npm run dev
```

## Structure du projet

```
backend/
├── config/         # Configuration (base de données)
├── controllers/    # Contrôleurs de l'API
├── middlewares/    # Middlewares (auth, upload)
├── models/         # Modèles Mongoose
├── routes/         # Routes de l'API
├── public/         # Fichiers statiques
│   └── uploads/    # Uploads des utilisateurs
├── server.js       # Point d'entrée
└── .env            # Variables d'environnement
```

## Endpoints API

### Authentification
- POST `/api/auth/register` - Inscription d'un utilisateur
- POST `/api/auth/login` - Connexion d'un utilisateur
- GET `/api/auth/me` - Obtenir les infos de l'utilisateur connecté

### Utilisateurs (admin uniquement)
- GET `/api/users` - Obtenir tous les utilisateurs
- GET `/api/users/:id` - Obtenir un utilisateur spécifique
- POST `/api/users` - Créer un utilisateur
- PUT `/api/users/:id` - Mettre à jour un utilisateur
- DELETE `/api/users/:id` - Supprimer un utilisateur

### Projets
- GET `/api/projects` - Obtenir tous les projets (filtrés selon le rôle)
- GET `/api/projects/:id` - Obtenir un projet spécifique
- POST `/api/projects` - Créer un nouveau projet (responsable/admin)
- PUT `/api/projects/:id` - Mettre à jour un projet
- DELETE `/api/projects/:id` - Supprimer un projet
- PUT `/api/projects/:id/members` - Ajouter un membre au projet

### Tâches
- GET `/api/tasks` - Obtenir toutes les tâches
- GET `/api/projects/:projectId/tasks` - Obtenir les tâches d'un projet
- GET `/api/tasks/:id` - Obtenir une tâche spécifique
- POST `/api/projects/:projectId/tasks` - Créer une tâche dans un projet
- PUT `/api/tasks/:id` - Mettre à jour une tâche
- DELETE `/api/tasks/:id` - Supprimer une tâche 