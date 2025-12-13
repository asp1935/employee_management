import {Router} from 'express';
import { login, logout, refreshToken, signup } from '../controllers/auth.controller.js';
import { upload } from '../middlewares/multer.middlware.js';

const router=Router();

router.route('/signup').post(upload.single('profilePhoto'),signup);
router.route('/login').post(login);
router.route('/refresh-token').post(refreshToken);
router.route('/logout').post(logout);



export default router;