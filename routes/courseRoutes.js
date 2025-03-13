const express = require("express")
const router = express.Router()
const courseController = require("../config/courseController")
const authMiddleware = require("../middleware/authMiddleware")

// Protect all routes
router.use(authMiddleware.protect)

// Routes accessible by all authenticated users
router.get("/", courseController.getAllCourses)
router.get("/:id", courseController.getCourseById)
router.get("/department/:departmentId", courseController.getCoursesByDepartment)
router.get("/program/:programId", courseController.getCoursesByProgram)

// Routes restricted to Head only
router.use(authMiddleware.restrictTo("Head"))
router.post("/", courseController.createCourse)
router.put("/:id", courseController.updateCourse)
router.delete("/:id", courseController.deleteCourse)

module.exports = router

