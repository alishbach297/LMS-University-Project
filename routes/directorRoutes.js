const express = require("express")
const router = express.Router()
const directorController = require("../controllers/directorController")
const authMiddleware = require("../middleware/authMiddleware")

// Protect all routes
router.use(authMiddleware.protect)

// Routes accessible by all authenticated users
router.get("/:id", directorController.getDirectorById)

// Routes restricted to Head only
router.use(authMiddleware.restrictTo("Head"))
router.post("/", directorController.registerDirector)
router.get("/", directorController.getAllDirectors)
router.put("/:id", directorController.updateDirector)
router.delete("/:id", directorController.deleteDirector)
router.post("/:directorId/departments/:departmentId", directorController.assignDirectorToDepartment)
router.delete("/departments/:departmentId", directorController.removeDirectorFromDepartment)

module.exports = router

