"use client"

import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase-browser"

export function useBookmarkRealtime(
  userId: string | undefined, 
  setBookmarks: React.Dispatch<React.SetStateAction<any[]>>
) {
  const channelRef = useRef<any>(null)
  const isProcessing = useRef(false)

  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }


    if (!userId) {
    
      return
    }

    const channelName = `bookmarks-${userId}-${Date.now()}`
    
    channelRef.current = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: userId }
        }
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (isProcessing.current) return
          isProcessing.current = true

          setBookmarks(prev => {
            try {
              switch (payload.eventType) {
                case "INSERT":
                  if (prev.some(b => b.id === payload.new.id)) {
                    return prev
                  }
                  return [payload.new, ...prev]
                
                case "UPDATE":
                  return prev.map(b => 
                    b.id === payload.new.id ? payload.new : b
                  )
                
                case "DELETE":
                  return prev.filter(b => b.id !== payload.old.id)
                
                default:
                  return prev
              }
            } finally {
              setTimeout(() => {
                isProcessing.current = false
              }, 100)
            }
          })
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(" realtime channel subscribed:", channelName)
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("Realtime channel issue:", status)
        }
      })

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      isProcessing.current = false
    }
  }, [userId, setBookmarks])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && userId) {
        setBookmarks(prev => [...prev])
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [userId, setBookmarks])
}