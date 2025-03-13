const express = require("express")
const router = express.Router()
const programSemesterController = require("../controllers/programSemesterController")
const authMiddleware = require("../middleware/authMiddleware")

// Protect all routes
router.use(authMiddleware.protect)

// Routes accessible by all authenticated users
router.get("/", programSemesterController.getAllProgramSemesters)
router.get("/:id", programSemesterController.getProgramSemesterById)
router.get("/program/:programId", programSemesterController.getProgramSemestersByProgram)
router.get("/program/:programId/session/:sessionId", programSemesterController.getProgramSemestersBySession)
router.get("/program/:programId/active", programSemesterController.getActiveProgramSemester)
router.get("/program/:programId/session/:sessionId/active", programSemesterController.getActiveProgramSemester)

// Routes restricted to Head only
router.use(authMiddleware.restrictTo("Head"))
router.post("/:id/activate", programSemesterController.setActiveSemester)
router.post("/:id/courses", programSemesterController.addCoursesToSemester)
router.delete("/:id/courses", programSemesterController.removeCoursesFromSemester)
router.post(
    "/program/:programId/copy-courses/:sourceSessionId/:targetSessionId",
    programSemesterController.copyCoursesBetweenSessions,
)

module.exports = router

