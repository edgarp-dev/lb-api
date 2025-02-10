import { Router } from "https://deno.land/x/oak@v17.1.1/mod.ts";
import { login, refreshToken, signup } from "./AuthController.ts";

const router = new Router();

router.post("/login", login);
router.post("/singup", signup);
router.post("/refresh", refreshToken);

export default router;
