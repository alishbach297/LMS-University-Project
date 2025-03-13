const express = require("express")
const router = express.Router()
const academicSessionController = require("../controllers/academicSessionController")
const authMiddleware = require("../middleware/authMiddleware")

// Protect all routes
router.use(authMiddleware.protect)

// Routes accessible by all authenticated users
router.get("/", academicSessionController.getAllAcademicSessions)
router.get("/active", academicSessionController.getActiveAcademicSession)
router.get("/:id", academicSessionController.getAcademicSessionById)

// Routes restricted to Head only
router.use(authMiddleware.restrictTo("Head"))
router.post("/", academicSessionController.createAcademicSession)
router.put("/:id", academicSessionController.updateAcademicSession)
router.delete("/:id", academicSessionController.deleteAcademicSession)

module.exports = router

