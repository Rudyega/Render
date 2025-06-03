import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary";
import Post from "../models/Post";
import mongoose from "mongoose";
import Comment from '../models/Comment';

// Загрузка изображения
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, imageUrl, collectionId, userId } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Неавторизован: нет userId" });
      return;
    }

    if (!imageUrl) {
      res.status(400).json({ message: "Image URL обязателен" });
      return;
    }

    const newPost = new Post({
      title: title || "",
      description: description || "",
      imageUrl,
      userId,
    });

    await newPost.save();

    if (collectionId) {
      const Collection = await import("../models/Collection").then((m) => m.default);
      const collection = await Collection.findById(collectionId);
      if (collection) {
        collection.postIds.push(newPost._id);
        await collection.save();
      }
    }

    res.status(201).json({ message: "Пост создан", post: newPost });
  } catch (err) {
    console.error("[POST ERROR]", err);
    res.status(500).json({ message: "Ошибка при создании поста" });
  }
};

// Получить посты
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate("userId", "username name");
    res.json(posts);
  } catch (err) {
    console.error("[GET POSTS ERROR]", err);
    res.status(500).json({ error: "Ошибка при получении постов" });
  }
};

// Удаление поста
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ error: "Пост не найден" });
      return;
    }

    if (post.userId.toString() !== userId) {
      res.status(403).json({ error: "Нет доступа" });
      return;
    }

    await post.deleteOne();
    res.json({ message: "Пост удалён" });
  } catch (err) {
    res.status(500).json({ error: "Ошибка при удалении" });
  }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("userId", "username name")
      .populate({
        path: "comments",
        populate: { path: "userId", select: "username name" },
      });

    if (!post) {
      res.status(404).json({ message: "Пост не найден" });
      return;
    }

    res.json(post);
  } catch (err) {
    console.error("[GET POST BY ID ERROR]", err);
    res.status(500).json({ message: "Ошибка при получении поста" });
  }
};

export const toggleLike: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Неавторизован" });
      return;
    }

    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Пост не найден" });
      return;
    }

    const alreadyLiked = post.likes.some(
      (id: mongoose.Types.ObjectId) => id.toString() === userId
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id: mongoose.Types.ObjectId) => id.toString() !== userId
      );
    } else {
      post.likes.push(new mongoose.Types.ObjectId(userId));
    }

    await post.save();
    res.status(200).json({ likes: post.likes });
  } catch (error) {
    console.error("Ошибка при лайке:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};
