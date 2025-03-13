const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Head", "Director", "Teacher", "Student"], required: true },
  profilePicture: { type: String, default: "" }, // Stores the image URL
})

module.exports = mongoose.model("User", userSchema)

