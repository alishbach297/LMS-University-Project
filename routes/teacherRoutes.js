const express = require("express")
const router = express.Router()
const teacherController = require("../controllers/teacherController")
const authMiddleware = require("../middleware/authMiddleware")

// Protect all routes
router.use(authMiddleware.protect)

// Routes accessible by all authenticated users
router.get("/:id", teacherController.getTeacherById)

// Routes accessible by Head and Teachers
// router.get("/:teacherId/courses", teacherController.getTeacherCourses)

// Routes restricted to Head only
router.use(authMiddleware.restrictTo("Head"))
router.get("/", teacherController.getAllTeachers)
router.post("/", teacherController.registerTeacher)
router.put("/:id", teacherController.updateTeacher)

// Routes for teacher to manage their courses
// router.get(
//   "/:teacherId/courses/:courseOfferingId/students",
//   authMiddleware.restrictTo("Head", "Teacher"),
//   authMiddleware.isTeacherOrHead,
//   teacherController.getCourseStudents,
// )

// router.put(
//   "/:teacherId/courses/:courseOfferingId/grades",
//   authMiddleware.restrictTo("Head", "Teacher"),
//   authMiddleware.isTeacherOrHead,
//   teacherController.updateStudentGrades,
// )

module.exports = router

