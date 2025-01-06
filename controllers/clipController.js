const catchAsync = require('../utils/catchAsync');
const Clip = require('../models/clipModel');

const getAllClips = catchAsync(async (req, res, next) => {
  const clips = await Clip.find({});
  return res.status(200).json({
    status: 'success',
    length: clips.length,
    data: {
      clips
    }
  });
});

const createNewClip = catchAsync(async (req, res, next) => {
  const clip = await Clip.create(req.body);
  return res.status(201).json({
    status: 'success',
    data: {
      clip
    }
  });
});

const updateClip = catchAsync(async (req, res, next) => {
  const updatedClip = await Clip.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true
  });
  return res.status(200).json({
    status: 'success',
    data: {
      clip: updatedClip
    }
  });
});

const deleteClip = catchAsync(async (req, res, next) => {
  console.log(req.params);
  await Clip.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

module.exports = {
  getAllClips,
  createNewClip,
  updateClip,
  deleteClip
};
