import express, { Request, Response } from "express";
import User from "../models/User";
import Post from "../models/Post";
import Collection from "../models/Collection"; 
import jwt from "jsonwebtoken";

const secret = process.env.NEXTAUTH_SECRET!;

const router = express.Router();

// /api/users/:username профиль пользователя его посты и коллекции
router.get("/:username", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    const posts = await Post.find({ userId: user._id }).sort({ createdAt: -1 });

    const collections = await Collection.find({ userId: user._id })
      .populate("postIds")
      .sort({ createdAt: -1 });

    res.json({ user, posts, collections });
  } catch (err) {
    console.error("Ошибка при получении профиля:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/me/collections", async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies['token']; 
    if (!token) {
      res.status(401).json({ message: "Нет токена" });
      return;
    }

    const decoded = jwt.verify(token, secret) as { userId: string };
    const userId = decoded?.userId;

    if (!userId) {
      res.status(401).json({ message: "Неизвестный пользователь" });
      return;
    }

    const collections = await Collection.find({ userId }).sort({ createdAt: -1 });
    res.json({ collections });
  } catch (err) {
    console.error("Ошибка при получении коллекций:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});


export default router;