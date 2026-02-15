"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  Smartphone,
  Lock,
  Cloud
} from "lucide-react"
import { supabase } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const controls = useAnimation()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace("/")
      }
    }
    
    checkSession()
  }, [router])

  
  useEffect(() => {
    if (mounted) {
      controls.start({
        y: [0, -10, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      })
    }
  }, [controls, mounted])

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
        throw error
      }
    } catch (err) {
      console.error("Login error:", err)
      const errorMessage = 
        err instanceof Error 
          ? err.message 
          : "Failed to initiate Google sign in. Please try again."
      
      
      if (errorMessage.includes("network")) {
        setError("Network error. Please check your connection and try again.")
      } else if (errorMessage.includes("timeout")) {
        setError("Request timed out. Please try again.")
      } else {
        setError("Authentication failed. Please try again.")
      }
      
      setIsLoading(false)
      
  
      if (mounted) {
        controls.start({
          x: [-5, 5, -5, 5, 0],
          transition: { duration: 0.15 }
        })
      }
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
  
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
  
        <motion.div 
          className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          animate={controls}
          style={{ 
            WebkitTapHighlightColor: "transparent",
            pointerEvents: "none"
          }}
        />
        <motion.div 
          className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          animate={controls}
          style={{ 
            WebkitTapHighlightColor: "transparent",
            pointerEvents: "none"
          }}
        />

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
  
          <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Bookmarkly</h1>
            <p className="text-indigo-100 text-base">Organize your digital life</p>
          </div>

  
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome back</h2>
              <p className="text-slate-500">Sign in to access your bookmarks</p>
            </div>


  
            <AnimatePresence>
              {error && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

  
            <motion.button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`
                relative w-full h-14 flex items-center justify-center gap-3
                px-6 bg-white border border-slate-200 rounded-xl
                text-slate-700 font-medium shadow-sm
                transition-all duration-200
                hover:shadow-md
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-sm
                ${isLoading ? 'animate-pulse' : ''}
              `}
              aria-label="Continue with Google"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  <span className="text-[15px] font-medium">Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
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
                  <span className="text-[15px] font-medium">Continue with Google</span>
                </>
              )}
            </motion.button>

  
         
          </div>

        
        </div>
      </motion.div>
    </div>
  )
}