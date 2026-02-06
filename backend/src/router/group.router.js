import { Router } from "express";
import { createGroup, getGroups, getGroupById, addMember } from "../controller/group.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticateUser);

router.route("/").post(createGroup).get(getGroups);
router.post("/:id/members", addMember);
router.route("/:id").get(getGroupById);

export default router;
