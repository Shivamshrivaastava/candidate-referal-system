const Candidate = require('../models/Candidate');
const generateId = require('../utils/generateId');
const { validateEmail, validatePhone } = require('../utils/validators');
const cloudinary = require('../config/cloudinary');

const createCandidate = async (req, res) => {
  try {
    const { name, email, phone, job_title } = req.body;

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ detail: 'Invalid email format' });
    }

    // Validate phone
    if (!validatePhone(phone)) {
      return res.status(400).json({ detail: 'Invalid phone number format. Phone must be 10-15 digits' });
    }

    let resume_url = null;

    // Handle resume upload
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'resumes',
              format: 'pdf',
              use_filename: true,
              unique_filename: true
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        resume_url = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ detail: 'Failed to upload resume' });
      }
    }

    // Create candidate
    const candidate = new Candidate({
      id: generateId(),
      name,
      email,
      phone,
      job_title,
      resume_url,
      referred_by: req.user.id
    });

    await candidate.save();

    res.status(201).json({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      job_title: candidate.job_title,
      status: candidate.status,
      resume_url: candidate.resume_url,
      referred_by: candidate.referred_by,
      created_at: candidate.created_at
    });
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

const getCandidates = async (req, res) => {
  try {
    const { search, status_filter } = req.query;
    const query = {};

    // Search by name or job title
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { job_title: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status_filter) {
      query.status = status_filter;
    }

    const candidates = await Candidate.find(query)
      .select('-_id -__v')
      .sort({ created_at: -1 });
    
    res.json(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

const updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Reviewed', 'Hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        detail: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const candidate = await Candidate.findOneAndUpdate(
      { id },
      { status },
      { new: true }
    ).select('-_id -__v');

    if (!candidate) {
      return res.status(404).json({ detail: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Candidate.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: 'Candidate not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const total = await Candidate.countDocuments();
    const pending = await Candidate.countDocuments({ status: 'Pending' });
    const reviewed = await Candidate.countDocuments({ status: 'Reviewed' });
    const hired = await Candidate.countDocuments({ status: 'Hired' });

    res.json({ total, pending, reviewed, hired });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

module.exports = {
  createCandidate,
  getCandidates,
  updateCandidateStatus,
  deleteCandidate,
  getStats
};