"use client"
export const dynamic = "force-dynamic"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase-browser"

function saveProviderTokens(session: any) {
  if (!session) return

  try {
    const tokens = {
      google_access_token: session.provider_token ?? null,
      google_refresh_token: session.provider_refresh_token ?? null,
      supabase_access_token: session.access_token,
      saved_at: new Date().toISOString(),
    }

    localStorage.setItem("oauth_tokens", JSON.stringify(tokens))
  } catch (err) {
    console.error("Token save failed:", err)
  }
}

function CallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<"processing" | "error">("processing")
  const [message, setMessage] = useState("Completing sign-in…")

  useEffect(() => {
    async function run() {
      try {
        
        const error = searchParams.get("error")
        const errorDescription = searchParams.get("error_description")

        if (error) {
          throw new Error(errorDescription || "Authentication failed")
        }
        const { data, error: userError } = await supabase.auth.getUser()

        if (userError || !data.user) {
          throw new Error(userError?.message || "No user session found")
        }

        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session) {
          saveProviderTokens(sessionData.session)
        }

        await new Promise(r => setTimeout(r, 600))


        window.history.replaceState({}, "", "/")
        router.replace("/")

      } catch (err: any) {
        console.error("Auth callback error:", err)
        setStatus("error")
        setMessage(err.message || "Login failed")
      }
    }

    run()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === "processing" && (
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p>{message}</p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <p className="text-red-600 mb-4">{message}</p>
          <button
            onClick={() => router.replace("/login")}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Back to login
          </button>
        </div>
      )}
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <CallbackInner />
    </Suspense>
  )
}
