const express = require("express")
const router = express.Router()
const studentController = require("../controllers/studentController")
const authMiddleware = require("../middleware/authMiddleware")

// Protect all routes
router.use(authMiddleware.protect)

// Routes accessible by all authenticated users
router.get("/:id", studentController.getStudentById)
router.get("/:studentId/courses", studentController.getStudentCourses)

// Routes accessible by Head and Teachers
router.use(authMiddleware.restrictTo("Head", "Teacher"))
router.get("/", studentController.getAllStudents)
router.get("/program/:programId", studentController.getStudentsByProgram)

// Routes restricted to Head only
router.use(authMiddleware.restrictTo("Head"))
router.post("/", studentController.registerStudent)
router.put("/:id", studentController.updateStudent)
router.post("/:studentId/register-courses", studentController.registerCourses)

module.exports = router

