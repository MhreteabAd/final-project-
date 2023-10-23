const mongoose = require('mongoose');

// Create a Profile model
const ProfileSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  }
});

const Profile = mongoose.model('Profile', ProfileSchema);

// Save the file to MongoDB
const profile = new Profile({
  image: req.file.filename
});
await profile.save();



module.exports = model;
