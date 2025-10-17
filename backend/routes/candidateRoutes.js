const express = require('express');
const router = express.Router();
const {
  createCandidate,
  getCandidates,
  updateCandidateStatus,
  deleteCandidate,
  getStats
} = require('../controllers/candidateController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', authenticateToken, upload.single('resume'), createCandidate);
router.get('/', authenticateToken, getCandidates);
router.get('/stats', authenticateToken, getStats);
router.put('/:id/status', authenticateToken, updateCandidateStatus);
router.delete('/:id', authenticateToken, deleteCandidate);

module.exports = router;