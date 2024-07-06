const Clip = require('../models/clipModel');
const ApiFeatures = require('../utils/ApiFeatures');
const catchAsync = require('../utils/catchAsync');

const getAllClips = catchAsync(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(Clip.find({}), req.query)
                            .enableSearchByFieldFor('label', 'text')
                            .filter()
                            .limitFields()
                            .sort();
  const clips = await apiFeatures.query;
  res.status(200).json({
    status: 'success',
    data: {
      clips
    }
  });
});

const getClip = catchAsync(async (req, res, next) => {
  const clip = await Clip.findById(req.params.id);
  if (!clip) {
    return res.status(404).json({
      status: 'fail',
      message: 'clip not found'
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      clip
    }
  });
});

const createClip = catchAsync(async (req, res, next) => {
  const clip = await Clip.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      clip
    }
  });
});

const updateClip = catchAsync(async (req, res, next) => {
  const updatedClip = await Clip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      clip: updatedClip
    }
  });
});

const deleteClip = catchAsync(async (req, res, next) => {
  await Clip.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

module.exports = {
  getAllClips,
  getClip,
  createClip,
  updateClip,
  deleteClip
};
