import express from "express";
import { createPost, getPosts } from "../controllers/postController";
import { protectRoute } from "../middleware/auth";


const router = express.Router();


router.post("/", protectRoute, createPost);
router.get("/", protectRoute, getPosts);


export default router;



