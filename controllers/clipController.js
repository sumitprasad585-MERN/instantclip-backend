const catchAsync = require('../utils/catchAsync');
const Clip = require('../models/clipModel');
const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');

const getAllClips = catchAsync(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(Clip.find({}), req.query)
    .enableSearchByFieldFor('data', 'label')
    .filter()
    .sort()
    .paginate()
    .limitFields();
  const clips = await apiFeatures.query;
  return res.status(200).json({
    status: 'success',
    length: clips.length,
    data: {
      clips,
    },
  });
});

const getClip = catchAsync(async (req, res, next) => {
  const clip = await Clip.findById(req.params.id);
  if (!clip) {
    const appError = new AppError(404, 'Clip not found');
    return next(appError);
  }
  res.status(200).json({
    status: 'success',
    data: {
      clip
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
  await Clip.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

module.exports = {
  getAllClips,
  getClip,
  createNewClip,
  updateClip,
  deleteClip
};
