"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase-browser"

const CARD_WIDTH = 400
const REDIRECT_PATH = "/auth/callback"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
const handleGoogleLogin = async () => {
  if (isLoading) return

  setError(null)
  setIsLoading(true)

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    }

  } catch {
    setError("Login failed. Please try again.")
    setIsLoading(false)
  }
}


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full"
        style={{ maxWidth: CARD_WIDTH }}
      >
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10">
          <div className="flex flex-col items-center text-center">

            {/* Logo */}
            <div className="mb-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-white w-7 h-7" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Bookmarkly
            </h1>

            {/* Subtitle */}
            <p className="text-base text-slate-500 max-w-[280px] mb-6">
              Save and organize your bookmarks in one place
            </p>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full mb-4"
                >
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              aria-label="Continue with Google"
              className="
                group relative w-full h-12 flex items-center justify-center gap-3
                px-6 bg-white border border-slate-200 rounded-xl
                text-slate-700 font-medium
                transition-all duration-200
                hover:bg-slate-50 hover:border-slate-300
                active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100
              "
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}

              <span className="text-[15px]">
                {isLoading ? "Signing in..." : "Continue with Google"}
              </span>
            </button>

          </div>
        </div>
      </motion.div>
    </div>
  )
}
