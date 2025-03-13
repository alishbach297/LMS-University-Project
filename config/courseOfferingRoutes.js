const express = require("express")
const router = express.Router()
const courseOfferingController = require("./courseOfferingController")
const authMiddleware = require("../middleware/authMiddleware")

// Protect all routes
router.use(authMiddleware.protect)

// Routes accessible by all authenticated users
router.get("/", courseOfferingController.getAllCourseOfferings)
router.get("/:id", courseOfferingController.getCourseOfferingById)
router.get("/academic-semester/:semesterId", courseOfferingController.getCourseOfferingsByAcademicSemester)
router.get("/program-semester/:programSemesterId", courseOfferingController.getCourseOfferingsByProgramSemester)
router.get("/program/:programId", courseOfferingController.getCourseOfferingsByProgram)
router.get("/teacher/:teacherId", courseOfferingController.getCourseOfferingsByTeacher)

// Routes restricted to Head only
router.use(authMiddleware.restrictTo("Head"))
router.post("/", courseOfferingController.createCourseOffering)
router.put("/:id", courseOfferingController.updateCourseOffering)
router.delete("/:id", courseOfferingController.deleteCourseOffering)

module.exports = router

