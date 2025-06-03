import express from "express";
import { createComment, getCommentsByPostId } from "../controllers/commentController";


const router = express.Router();

router.post("/", createComment); // <-- Никаких (req, res) =>
router.get("/:postId", getCommentsByPostId);

export default router;
