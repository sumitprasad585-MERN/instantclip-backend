const mongoose = require('mongoose');

const clipSchema = new mongoose.Schema({
  data: {
    type: String,
    required: [true, 'a clip should not be empty']
  },
  datatype: {
    type: String,
    enum: {
      values: ['plaintext', 'password'],
      message: 'Invalid datatype'
    },
    default: 'plaintext'
  },
  label: {
    type: String,
    required: function () {
      return this.datatype === 'password' ? true : false
    },
    validate: {
      validator: function (value) {
        // 'label' is required if datatype is 'password'
        if (this.datatype === 'password' && (!value || value.trim() === '')) {
          return false;
        }
        return true;
      },
      message: "The 'label' field is required when 'datatype' is 'password'."
    }
  },
  fontSize: {
    type: Number,
    default: 16
  },
  listScore: {
    type: Number,
    default: 1
  },
  hide: {
    type: Boolean,
    default: false
  }
});

// Pre save hook to set hide to true when datatype is password
clipSchema.pre('save', function (next) {
  // 'this' refers to document here
  this.hide = this.datatype === 'password' ? true : false;
  next();
});

const Clip = mongoose.model('Clip', clipSchema);

module.exports = Clip;
