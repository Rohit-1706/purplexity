import type { User } from "@supabase/supabase-js"
import { createClient } from "@supabase/supabase-js"
import { supabaseConfig } from "../config"
import { useState, useEffect } from "react"
const supabase = createClient(supabaseConfig.url, supabaseConfig.publishableKey);

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function getInfo() {
            const { data } = await supabase.auth.getUser()
            if (data.user){
                setUser(data.user);
            }
        }
        getInfo();
    }, [])

    return <div>
        {!user && <button onClick={() => window.location.href = "/auth"}>Login</button>}
        {user && <div>
            {user?.email}
            <button onClick={() => supabase.auth.signOut().then(() => setUser(null))}>Logout</button>
        </div>}
    </div>
}