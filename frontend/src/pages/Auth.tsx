import { createClient } from "@supabase/supabase-js"
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!);

export function Auth() {

    async function login(provider: "google" | "github") {
        const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider
    })
        if (error) {
            console.error("Error during login:", error);
        } else {
            console.log("Login successful:", data);
        }
    }
    


    return <div>
        <button onClick={() => login("google")}>Login with Google</button>
        <button onClick={() => login("github")}>Login with GitHub</button>
    </div>
}