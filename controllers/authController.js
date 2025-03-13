const bcrypt = require('bcrypt');
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "Head",
    });

    await newUser.save();
    res.status(201).json({ message: "Head registered successfully" });

  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Server Error" });
  }
};

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "sk_test_51N1v9ICmXVqoMpIro7NtDGZMRKr7G52eFnTBCUpigRRqQqRCS7xqkoKRr9b1vPVQ7sMcbjOT0qh57RqewdaeAyhA00tFVt7Uq7",
        { expiresIn: "1d" }
      );
  
      res.json({
        token,
        user: {
          role: user.role,
        },
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  };

  
  exports.resetPassword = async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
  
      // Check if user is Head
      if (user.role !== "Head") {
        return res.status(403).json({ message: "Unauthorized: Only Head can reset password" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.json({ message: "Password updated successfully" });
  
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ message: "Server Error" });
    }
  };