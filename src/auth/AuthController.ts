import { Context } from "https://deno.land/x/oak@v17.1.1/mod.ts";
import SupabaseClient from "../supabase/SupabaseClient.ts";

const login = async ({ request, response }: Context) => {
    try {
        const supabase = SupabaseClient.getClient();

        const { email, password } = await request.body.json();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        const { data: userData, error: userError } = await supabase.from(
            "users",
        ).select("user_id").eq("email", email).single();

        if (error || userError) {
            response.status = 400;

            const errorMessage = error?.message || userError?.message;
            response.body = { error: errorMessage };
        } else {
            response.status = 200;
            response.body = { ...data.session, userId: userData?.user_id };
        }
    } catch (error) {
        console.error((error as Error).message);

        response.status = 500;
        response.body = { error: "Internal Server Error" };
    }
};

const signup = async ({ request, response }: Context) => {
    try {
        const { email, password, name } = await request.body.json();
        const supabase = SupabaseClient.getClient();

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            response.status = 400;
            response.body = { error: error.message };

            return;
        }

        const user = data.user;

        const { error: insertError } = await supabase.from(
            "users",
        ).insert({
            email: user?.email,
            name: name,
            auth_id: user?.id,
        });

        if (insertError) {
            response.status = 400;
            response.body = { error: insertError.message };

            return;
        }

        response.status = 201;
        response.body = { user };
    } catch (error) {
        console.log((error as Error).message);

        response.status = 500;
        response.body = { error: "Internal Server Error" };
    }
};

const refreshToken = async ({ request, response }: Context) => {
    try {
        const { refreshToken } = await request.body.json();

        if (!refreshToken) {
            response.status = 401;
            response.body = { error: "No token provided" };

            return;
        }

        const supabase = SupabaseClient.getClient();
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
        });

        if (error) {
            response.status = 401;
            response.body = { error: error.message };

            return;
        }

        response.status = 200;
        response.body = { session: data.session };
    } catch (error) {
        console.error((error as Error).message);
        response.status = 500;
        response.body = { error: "Internal Server Error" };
    }
};

export { login, refreshToken, signup };
