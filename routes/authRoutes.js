const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")

// Public routes
router.post("/register", authController.register)
router.post("/login", authController.login)

// Protected routes
router.post("/reset-password", authMiddleware.protect, authMiddleware.restrictTo("Head"), authController.resetPassword)

module.exports = router

