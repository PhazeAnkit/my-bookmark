"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-browser"

function saveProviderTokens(session: any) {
  if (!session) return

  const tokens = {
    google_access_token: session.provider_token ?? null,
    google_refresh_token: session.provider_refresh_token ?? null,
    supabase_access_token: session.access_token,
  }

  localStorage.setItem("oauth_tokens", JSON.stringify(tokens))
}

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const finishLogin = async () => {
      
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        saveProviderTokens(data.session)
      }

      
      window.history.replaceState({}, document.title, "/")

      router.replace("/")
    }

    finishLogin()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
      Completing sign in…
    </div>
  )
}
