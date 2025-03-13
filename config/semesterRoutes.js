const express = require("express")
const router = express.Router()
const semesterController = require("./semesterController")
const authMiddleware = require("../middleware/authMiddleware")

// Protect all routes
router.use(authMiddleware.protect)

// Routes accessible by all authenticated users
router.get("/", semesterController.getAllSemesters)
router.get("/active", semesterController.getActiveSemester)
router.get("/:id", semesterController.getSemesterById)

// Routes restricted to Head only
router.use(authMiddleware.restrictTo("Head"))
router.post("/", semesterController.createSemester)
// router.put("/:id", semesterController.updateSemester)
router.delete("/:id", semesterController.deleteSemester)

module.exports = router

