const express = require('express');
const Clip = require('../models/clipModel');
const { getAllClips, createNewClip, updateClip, deleteClip } = require('../controllers/clipController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.get('/', protect, getAllClips);

router.post('/', protect, createNewClip);

router.patch('/:id', protect, updateClip);

router.delete('/:id', protect, deleteClip);

module.exports = router;
