import express from 'express';
import {
  getAllPosts,
  uploadImage,
  deletePost,
  getPostById,
  toggleLike
} from '../controllers/uploadController';


const router = express.Router()

//  GET /api/posts
router.get('/', getAllPosts)

router.get("/:id", getPostById);

// POST /api/posts
router.post('/', uploadImage)

//  DELETE /api/posts/:id
router.delete('/:id', deletePost)

router.put('/:id/like', toggleLike);


export default router
