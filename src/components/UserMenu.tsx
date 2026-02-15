"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Settings, Download, Upload, LogOut, 
  User as UserIcon, Loader2 
} from "lucide-react"

type UserMenuProps = {
  isOpen: boolean
  onClose: () => void
  userEmail: string | null
  onSignOut: () => Promise<void>
}

const UserMenu = ({
  isOpen,
  onClose,
  userEmail,
  onSignOut,
}: UserMenuProps) => {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await onSignOut()
    } finally {
      setIsSigningOut(false)
      onClose()
    }
  }

  if (!userEmail) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20" 
            onClick={onClose}
            aria-hidden="true"
          />
          
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-4 mt-2 w-64 md:right-6 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
            role="menu"
            aria-label="User menu"
          >
            <div className="px-4 py-3 bg-indigo-600 border-b border-indigo-800/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {userEmail.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{userEmail}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                                
                  </div>
                </div>
              </div>
            </div>


            <div className="h-px bg-slate-100 mx-1.5 my-1" />

            <div className="p-1.5">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                role="menuitem"
                aria-busy={isSigningOut}
              >
                <LogOut 
                  size={18} 
                  className={`${
                    isSigningOut ? "animate-pulse" : ""
                  } text-red-500`} 
                />
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>

          
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default UserMenu