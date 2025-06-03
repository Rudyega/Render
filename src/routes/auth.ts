import { Request, Response } from "express";
import User from "../models/User";
import express from 'express'


import {
  register,
  //forgotPassword,
  //resetPassword,
  login 
} from '../controllers/authController'

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

//router.post('/forgot-password', forgotPassword)
//router.post('/reset-password/:token', resetPassword)
router.patch("/assign-username", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, username } = req.body;

    if (!userId || !username) {
      res.status(400).json({ message: "userId и username обязательны" });
      return;
    }

    await User.findByIdAndUpdate(userId, { username });
    res.status(200).json({ message: "Имя пользователя назначено" });
  } catch (err) {
    console.error("Ошибка при назначении username:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
