const mongoose = require('mongoose');

const clipSchema = new mongoose.Schema({
  label: {
    type: String,
    unique: true,
    sparse: true
  },
  text: {
    type: String,
    required: [true, 'a clip must have text']
  },
  fontSize: {
    type: Number,
    default: 16
  },
  backgroundColor: {
    type: String,
  },
  type: {
    type: String,
    enum: {
      values: ['plaintext', 'password', 'code'],
      message: 'Invalid text type'
    },
    default: 'plaintext'
  },
  category: {
    type: [String]
  },
  clipScore: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

/** Create index  */
clipSchema.index({ text: 1 }, { unique: true });
clipSchema.index({ label: 1 }, { unique: true });

const Clip = mongoose.model('Clip', clipSchema);

module.exports = Clip;
