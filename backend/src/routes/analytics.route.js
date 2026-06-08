import { Router } from "express";
import { authRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getAdminAnalytics,
    getManagerAnalytics,
    getEmployeeAnalytics
} from "../controllers/analytics.controller.js";

const router = Router();

// All analytics routes require authentication
router.use(verifyJWT);

// Employee analytics: open to all logged-in users
router.route("/employee").get(getEmployeeAnalytics);

// Manager analytics: restricted to manager and admin roles
router.route("/manager").get(authRoles("manager", "admin"), getManagerAnalytics);

// Admin analytics: restricted to admin role only
router.route("/admin").get(authRoles("admin"), getAdminAnalytics);

export default router;
