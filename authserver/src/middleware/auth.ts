import type { NextFunction, Request, Response } from "express";
import { User } from "../entities/User";
import { SecurityService } from "../modules/auth/security.service";

const securityService = new SecurityService();

export type AuthRequest = Request & {
  userId?: string;
};

export async function protectRoute(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = securityService.verifyToken(token);
    const userId = typeof payload.userId === "string" ? payload.userId : undefined;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.userId = user._id.toString();
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
}
