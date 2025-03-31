import "@std/dotenv/load";
import { Application, Router } from "@oak/oak";
import cors from "./middleware/CORSMiddleware.ts";
import routinesController from "./routines/RoutinesRouter.ts";
import authRouter from "./auth/AuthRouter.ts";

const router = new Router();

router.get("/hello", (context) => {
	context.response.body = "Hello world!";
});

const app = new Application();
app.use(cors);

app.use(router.routes());
app.use(router.allowedMethods());

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.use(routinesController.routes());
app.use(routinesController.allowedMethods());

const port = Deno.env.get("PORT") ?? "9000";
console.log(`Server running on http://localhost:${port}`);
await app.listen({ port: parseInt(port) });
