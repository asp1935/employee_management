import { Router } from "express";
import { authRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllUsers, softDeleteUser, updateRole, updateStatus } from "../controllers/user.controller.js";

const router=Router();

router.use(verifyJWT,authRoles('admin'));

router.route('/current').get(getAllUsers);
router.route('/').get(getAllUsers)
router.route('/:id/role').patch(updateRole);
router.route('/:id/status').patch(updateStatus);
router.route('/:id').delete(softDeleteUser);

export default router;