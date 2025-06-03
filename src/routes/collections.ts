import express, { Request, Response } from "express";
import Collection from "../models/Collection";
import Post from "../models/Post";
import User from "../models/User";
import mongoose from "mongoose";

const router = express.Router();

//  Создать коллекцию
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) {
      res.status(400).json({ message: "Имя и пользователь обязательны" });
      return;
    }

    const newCollection = await Collection.create({
      name,
      userId,
      postIds: [],
    });

    res.status(201).json(newCollection); // возвращаем весь объект коллекции
  } catch (err) {
    console.error("Ошибка при создании коллекции:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

//  Добавить пост в коллекцию
router.patch("/:collectionId/add", async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionId } = req.params;
    const { postId } = req.body;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      res.status(404).json({ message: "Коллекция не найдена" });
      return;
    }

    const alreadyExists = collection.postIds.some((id: mongoose.Types.ObjectId) => id.toString() === postId);

    if (!alreadyExists) {
      collection.postIds.push(postId);
      await collection.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Ошибка при добавлении поста в коллекцию:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

//  Получить одну коллекцию по username и имени коллекции
router.get("/username/:username/:collectionName", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, collectionName } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    const collection = await Collection.findOne({
      userId: user._id,
      name: collectionName,
    }).populate("postIds");

    if (!collection) {
      res.status(404).json({ message: "Коллекция не найдена" });
      return;
    }

    res.json(collection);
  } catch (err) {
    console.error("Ошибка при получении коллекции:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

//  Получить все коллекции пользователя по userId
router.get("/user/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const collections = await Collection.find({ userId }).sort({ createdAt: -1 });
    res.json({ collections });
  } catch (err) {
    console.error("Ошибка при получении коллекций:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
