import { Context } from "https://deno.land/x/oak@v17.1.1/context.ts";

const cors = async (context: Context, next: () => Promise<unknown>) => {
  context.response.headers.set("Access-Control-Allow-Origin", "*");
  context.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  context.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  if (context.request.method === "OPTIONS") {
    context.response.status = 204; // No Content
  } else {
    await next();
  }
};

export default cors;
