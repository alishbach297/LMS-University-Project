const express = require("express")
const router = express.Router()
const departmentController = require("../controllers/departmentController")
const authMiddleware = require("../middleware/authMiddleware")

// Protect all routes
router.use(authMiddleware.protect)

// Restrict to Head only
router.use(authMiddleware.restrictTo("Head"))

// Department routes
router.route("/").post(departmentController.createDepartment).get(departmentController.getAllDepartments)

router
  .route("/:id")
  .get(departmentController.getDepartmentById)
  .put(departmentController.updateDepartment)
  .delete(departmentController.deleteDepartment)

module.exports = router

