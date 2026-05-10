import type { User } from "@supabase/supabase-js"
import { createClient } from "@supabase/supabase-js"
import { supabaseConfig } from "../config"
import { useState, useEffect } from "react"
const supabase = createClient(supabaseConfig.url, supabaseConfig.publishableKey);
import axios from "axios";
import { BACKEND_URL } from "../lib/config";

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

    useEffect(() => {
        async function getExistingConversations() {
            if (user) {
                // Implementation for fetching existing conversations
                const {data: {session}} = await supabase.auth.getSession();
                session?.access_token && axios.post(`${BACKEND_URL}/api/conversations`, {
                    headers: {
                        "Authorization": session.access_token
                    }                }).then(res => res.json()).then(data => {
                    console.log("Existing conversations:", data);
                })

            }
        }
        getExistingConversations();
    }, [user])

    return <div>
        {!user && <button onClick={() => window.location.href = "/auth"}>Login</button>}
        {user && <div>
            {user?.email}
            <button onClick={() => supabase.auth.signOut().then(() => setUser(null))}>Logout</button>
        </div>}
    </div>
}