const express = require("express")
const router = express.Router()
const programController = require("../controllers/programController")
const authMiddleware = require("../middleware/authMiddleware")

// Protect all routes
router.use(authMiddleware.protect)

// Routes accessible by all authenticated users
router.get("/", programController.getAllPrograms)
router.get("/:id", programController.getProgramById)
router.get("/department/:departmentId", programController.getProgramsByDepartment)

// Routes restricted to Head only
router.use(authMiddleware.restrictTo("Head"))
router.post("/", programController.createProgram)
router.put("/:id", programController.updateProgram)
router.delete("/:id", programController.deleteProgram)
router.post("/:programId/create-semesters/:academicSessionId", programController.createProgramSemestersForSession)

module.exports = router

