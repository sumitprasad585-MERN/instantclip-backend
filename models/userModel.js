const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user must have a name'],
    maxLength: [40, 'name must not exceed 40 characters']
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    minLength: [3, 'username must be atleast 3 character long']
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
    validator: [validator.isEmail, 'Invalid email']
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minLength: [8, 'password must be atleast 8 character long'],
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, 'confirmPassword is required'],
    validate: {
      message: 'password and confirmPassword does not match',
      validator: function (val) {
        return this.password === val
      }
    }
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'developer', 'admin'],
      message: 'Invalid role'
    },
    default: 'user',
    select: false
  },
  active: {
    type: Boolean,
    default: true
  },
  passwordResetToken: String,
  passwordResetTokenExpiresAt: Date,
  passwordChangedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

/** Pre save hook to hash the password */
userSchema.pre('save', async function (next) {
  /** 'this' refers to document here */

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

/** Instance method on schema to validate the password */
userSchema.methods.verifyPassword = async function (userPassword, dbPassword) {
  /** 'this' refers to the document here */

  let correct = await bcrypt.compare(userPassword, dbPassword);
  return correct;
};

/** Instance method on schema to check is password was changed after issuing the token */
userSchema.methods.didPasswordChange = function(issuedJwtTimestamp) {
  /** 'this' refers to document here */
  if (this.passwordChangedAt) {
    let changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return changeTimestamp > issuedJwtTimestamp;
  }
  return false;
};

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
