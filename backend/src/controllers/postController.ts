import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { Post } from "../models/Post";


export async function createPost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { imageUrl, description } = req.body;


    if (!imageUrl) {
      res.status(400).json({ message: "Image URL is required" });
      return;
    }


    // Deactivate previous active posts for the same user
    await Post.updateMany(
      { user: userId, isActive: true },
      { $set: { isActive: false } }
    );


    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);


    const post = new Post({
      user: userId,
      imageUrl,
      description,
      expiresAt,
      isActive: true,
    });


    await post.save();


    // Populate user info for the response
    const populatedPost = await Post.findById(post._id).populate(
      "user",
      "name username avatar"
    );


    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500);
    next(error);
  }
}


export async function getPosts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Fetch active posts that haven't expired
    const posts = await Post.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 });


    res.json(posts);
  } catch (error) {
    res.status(500);
    next(error);
  }
}



