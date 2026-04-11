export async function searchUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId
    const q = (req.query.q as string) || ""
    const friendsOnly = req.query.friendsOnly === "true"

    console.log("Search Users:", { userId, q, friendsOnly })

    const searchRegex = q ? { $regex: q, $options: "i" } : { $exists: true }

    if (friendsOnly) {
      // find chats where the user is a participant, then search among chat participants
      const { Chat } = await import("../models/Chat")
      const chats = await Chat.find({ participants: userId }).select(
        "participants",
      )
      const friendIds = new Set<string>()
      chats.forEach((c: any) => {
        c.participants.forEach((p: any) => {
          const idStr = p.toString()
          if (idStr !== userId) friendIds.add(idStr)
        })
      })

      const users = await User.find({
        _id: { $in: Array.from(friendIds) },
        $or: [{ name: searchRegex }, { username: searchRegex }],
      })
        .select("name username avatar")
        .limit(50)

      res.json(users)
      return
    }

    // global search (exclude self)
    const users = await User.find({
      _id: { $ne: userId },
      $or: [{ name: searchRegex }, { username: searchRegex }],
    })
      .select("name username avatar")
      .limit(50)
    res.json(users)
  } catch (error) {
    res.status(500)
    next(error)
  }
}
