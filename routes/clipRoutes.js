const express = require('express');
const Clip = require('../models/clipModel');
const { getAllClips, createNewClip, updateClip, deleteClip } = require('../controllers/clipController');

const router = express.Router();

router.get('/', getAllClips);

router.post('/', createNewClip);

router.patch('/:id', updateClip);

router.delete('/:id', deleteClip);

module.exports = router;
