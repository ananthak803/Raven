import {Router} from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { getMe,searchUsers,updateMe,getUserById } from '../controllers/user.controller.js';


const router=Router();

router.get('/me',authMiddleware,getMe)
router.get('/search',authMiddleware,searchUsers)
router.get('/:userId',authMiddleware,getUserById)
router.patch('/me',authMiddleware,updateMe)


export default router;