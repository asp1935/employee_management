import { Router } from "express";
import { authRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createTask,
    getTasks,
    updateTaskStatus,
    addTaskComment,
    getTaskById
} from "../controllers/task.controller.js";

const router = Router();

// All task routes require authentication
router.use(verifyJWT);

// Create task: restricted to managers and admins
// Get tasks: open to all authenticated users (role-filtered in controller)
router.route("/")
    .post(authRoles("manager", "admin"), createTask)
    .get(getTasks);

// Update task status: open to all authenticated (authorized in controller)
router.route("/:id/status").patch(updateTaskStatus);

// Add task comment: open to all authenticated (authorized in controller)
router.route("/:id/comments").post(addTaskComment);

router.route("/:id")
    .delete(authRoles("manager", "admin"), deleteTask)
    .patch(authRoles("manager", "admin"), updateTaskDetails);

router.route("/:id").get(getTaskById);

export default router;
