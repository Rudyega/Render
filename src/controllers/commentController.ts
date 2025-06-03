import { Request, Response } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, postId, text } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Пользователь не авторизован" });
      return;
    }

    if (!postId || !text) {
      res.status(400).json({ message: "postId и text обязательны" });
      return;
    }

    const comment = new Comment({
      postId,
      userId,
      text,
    });

    await comment.save();

    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error("[COMMENT ERROR]", err);
    res.status(500).json({ message: "Ошибка при добавлении комментария" });
  }
};

export const getCommentsByPostId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .populate("userId", "username name");

    res.json(comments);
  } catch (err) {
    console.error("[GET COMMENTS ERROR]", err);
    res.status(500).json({ message: "Ошибка при получении комментариев" });
  }
};
