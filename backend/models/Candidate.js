const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  job_title: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Reviewed', 'Hired']
  },
  resume_url: {
    type: String
  },
  referred_by: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Candidate', candidateSchema);