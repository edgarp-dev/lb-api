import { createClient, SupabaseClient as SupabaseLibraryClient } from "jsr:@supabase/supabase-js@2";

export default class SupabaseClient {
    private static client: SupabaseLibraryClient;

    public static getClient(): SupabaseLibraryClient {
        if (!SupabaseClient.client) {
            const supabaseUrl = "https://mnnaojacstyjlwunfodz.supabase.co";
            const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubmFvamFjc3R5amx3dW5mb2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk4OTk4NTEsImV4cCI6MjA0NTQ3NTg1MX0.Owlg7z4h3CcYRvN64eVkMBTX37BY_Ds8dDxSn5Pmpt8";
            
            SupabaseClient.client = createClient(supabaseUrl, supabaseAnonKey);
        }

        return SupabaseClient.client;
    }
}
