export async function getPostById(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params
    const post = await Post.findById(id).populate(
      "user",
      "name username avatar",
    )
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }
    res.json(post)
  } catch (error) {
    res.status(500)
    next(error)
  }
}
