import { Router } from "express";
import { authRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { currentUser, getAllUsers, softDeleteUser, updateRole, updateStatus } from "../controllers/user.controller.js";

const router=Router();

// All user routes require authentication
router.use(verifyJWT);

// Access current logged-in user profile (all roles)
router.route('/current').get(currentUser);

// Admin-only user management routes
router.route('/').get(authRoles('admin','manager'),getAllUsers);
router.use(authRoles('admin'));

router.route('/:id/role').patch(updateRole);
router.route('/:id/status').patch(updateStatus);
router.route('/:id').delete(softDeleteUser);

export default router;