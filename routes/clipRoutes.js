const express = require('express');
const Clip = require('../models/clipModel');
const { getAllClips, createNewClip, updateClip, deleteClip, getClip } = require('../controllers/clipController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.get('/', protect, getAllClips);

router.get('/:id', protect, getClip);

router.post('/', protect, createNewClip);

router.patch('/:id', protect, updateClip);

router.delete('/:id', protect, deleteClip);

module.exports = router;
