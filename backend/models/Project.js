const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline']
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  image: {
    type: String,
    default: 'no-image.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  status: {
    type: String,
    enum: ['En cours', 'Terminé', 'En retard', 'À revoir'],
    default: 'En cours'
  }
});

module.exports = mongoose.model('Project', ProjectSchema); 