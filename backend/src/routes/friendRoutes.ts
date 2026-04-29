import { Router } from "express";
import { FriendController } from "../modules/friend/controller/friend.controller";
import { protectRoute } from "../middleware/auth";

const router = Router();

router.use(protectRoute);

router.post("/request", FriendController.sendRequest);
router.post("/accept/:requesterId", FriendController.acceptRequest);
router.post("/decline/:requesterId", FriendController.declineRequest);
router.delete("/unfriend/:userId2", FriendController.unfriend);
router.get("/list", FriendController.getFriends);
router.get("/requests", FriendController.getPendingRequests);
router.get("/status/:userId2", FriendController.getFriendshipStatus);

export default router;
