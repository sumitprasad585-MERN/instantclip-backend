const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: [true, 'username is already taken'],
    sparse: true,
    minLength: [3, 'username must be at least 3 character long'],
  },
  name: {
    type: String,
    minLength: [3, 'name must be at least 3 character long'],
    maxLength: [40, 'name must not exceed 40 characters']
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: [true, 'email already registered'],
    validate: {
      validator: function (value) {
        return validator.isEmail(value);
      },
      message: 'Please enter a valid email'
    },
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minLength: [8, 'password must be at least 8 character long'],
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, 'confirm password is required'],
    validate: {
      validator: function (value) {
        return this.password === value
      },
      message: 'Passwords do not match'
    }
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'moderator', 'developer', 'user', 'guest'],
      message: 'Invalid role'
    },
    default: 'user'
  },
  passwordResetToken: String,
  passwordResetTokenExpiresAt: Date,
  passwordChangedAt: Date,
  slug: String,
  createdAt: {
    type: Date,
    default: Date.now()
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// Pre save hook to encrypt the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcryptjs.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

// Instance schema method to validate the user password
userSchema.methods.validatePassword = async function (enteredPassword, userPasswordInDb) {
  // 'this' refers to document here
  return bcryptjs.compare(enteredPassword, userPasswordInDb);
};

// Instance schema method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const numHours = 1;
  this.passwordResetToken = hashedToken;
  this.passwordResetTokenExpiresAt = Date.now() + 1000 * 60 * 60 * numHours;

  return resetToken;
};

// pre save hook to update the 'passwordChangedAt' whenever password is changed
userSchema.pre('save', function (next) {
  // 'this' refers to document here
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true })

const User = mongoose.model('User', userSchema);

module.exports = User;
