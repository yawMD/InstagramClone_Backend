const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        unique: true,
        required: true,
      },
      phone: {
        type: String,
        trim: true,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: [true, "Please enter username"],
        minlength: [6, "Username must be of minimum 6 characters"],
        unique: [true, "Username already exists"],
    },
    avatar: {
      type: String
  },
  bio: {
      type: String,
      default: "Hi👋 Welcome To My Profile"
  },
  website: {
      type: String,
      trim: true,
  },
  posts: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
      }
  ],
  saved: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
      }
  ],
      verified: {
        type: Boolean,
        default: false
      },
      followers:[{type:  mongoose.Schema.Types.ObjectId,ref:"User"}],
      following:[{type:  mongoose.Schema.Types.ObjectId,ref:"User"}]
})

const User = mongoose.model('User',UserSchema)

module.exports = User