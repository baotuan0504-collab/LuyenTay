import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { FriendController } from "../modules/friend/friend.controller";

const router = Router();
console.log("[DEBUG] Loading FriendRoutes...");
const friendController = new FriendController();

// Gửi yêu cầu kết bạn
router.post("/request", protectRoute, friendController.sendRequest);

// Chấp nhận yêu cầu
router.put("/accept/:requesterId", protectRoute, friendController.acceptRequest);

// Từ chối yêu cầu
router.put("/decline/:requesterId", protectRoute, friendController.declineRequest);

// Hủy kết bạn/Hủy yêu cầu
router.delete("/unfriend/:userId2", protectRoute, friendController.unfriend);

// Lấy danh sách bạn bè
router.get("/", protectRoute, friendController.getFriends);
router.get("/list", protectRoute, friendController.getFriends); // Alias for frontend

// Lấy danh sách yêu cầu đang chờ
router.get("/pending", protectRoute, friendController.getPendingRequests);
router.get("/requests", protectRoute, friendController.getPendingRequests); // Alias for frontend

// Lấy trạng thái quan hệ
router.get("/status/:userId2", protectRoute, friendController.getFriendshipStatus);

export default router;
