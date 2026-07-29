import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getUserCredits } from '../controllers/userController.js';


const userRouter = express.Router();

userRouter.get('/credits',protect, getUserCredits) ;




export default userRouter ;