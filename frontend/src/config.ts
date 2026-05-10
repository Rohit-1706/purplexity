import { createClient } from "@supabase/supabase-js";

export const supabaseConfig = {
  url: "https://nzphfunowgookosaziwg.supabase.co",
  publishableKey: "sb_publishable_OCqUa2F7DTY6F8eVdSwfGg_PoltJRLz",
};

export const supabase = createClient(supabaseConfig.url, supabaseConfig.publishableKey);