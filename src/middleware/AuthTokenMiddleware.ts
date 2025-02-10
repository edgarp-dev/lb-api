import { Context } from "https://deno.land/x/oak/mod.ts";
import SupabaseClient from "../supabase/SupabaseClient.ts";

const supabase = SupabaseClient.getClient();

const validateAuthToken = async (
    context: Context,
    next: () => Promise<unknown>,
) => {
    let isAuthTokenValid = true;
    try {
        const authHeader = context.request.headers.get("Authorization");

        if (!authHeader) {
            isAuthTokenValid = false;
        } else {
            const authToken = authHeader.split(" ")[1];

            const { error } = await supabase.auth.getUser(authToken);

            if (error) {
                isAuthTokenValid = false;
            }
        }
    } catch (error) {
        console.error(error);
        isAuthTokenValid = false;
    }

    if (!isAuthTokenValid) {
        context.throw(
            401,
            "Unauthorized: Invalid or missing authorization token",
        );
    }

    await next();
};

export default validateAuthToken;
