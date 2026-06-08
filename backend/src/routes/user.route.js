import { Router } from "express";
import { authRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { currentUser, getAllUsers, getMyEmployees, registerEmployee, softDeleteUser, updateRole, updateStatus } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlware.js";

const router=Router();

// All user routes require authentication
router.use(verifyJWT);

// Access current logged-in user profile (all roles)
router.route('/current').get(currentUser);

// Access managed employees (Manager/Admin only)
router.route('/my-employees').get(authRoles('manager', 'admin'), getMyEmployees);

// Register a new employee (Manager/Admin only)
router.route('/register-employee').post(authRoles('manager', 'admin'), upload.single('profilePhoto'), registerEmployee);

// Admin-only user management routes
router.use(authRoles('admin'));

router.route('/').get(getAllUsers);
router.route('/:id/role').patch(updateRole);
router.route('/:id/status').patch(updateStatus);
router.route('/:id').delete(softDeleteUser);

export default router;