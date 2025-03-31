import { Router } from "@oak/oak";
import { login, refreshToken, signup } from "./AuthController.ts";

const router = new Router();

router.post("/login", login);
router.post("/singup", signup);
router.post("/refresh", refreshToken);

export default router;
