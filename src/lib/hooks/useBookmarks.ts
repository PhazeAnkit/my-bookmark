"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase-browser"

export type Bookmark = {
  id: string
  url: string
  title: string
  tags: string[]
  notes: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export function useBookmarks(userId?: string) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookmarks = useCallback(async () => {
    if (!userId) {
      setBookmarks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId) 
        .order("created_at", { ascending: false })

      if (error) throw error

      setBookmarks((data ?? []) as Bookmark[])
    } catch (err: any) {
      console.error("Fetch bookmarks error:", err)
      setError(err.message || "Failed to load bookmarks")
      setBookmarks([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchBookmarks()
  }, [fetchBookmarks])

  return {
    bookmarks,
    setBookmarks,
    loading,
    error,
    refetch: fetchBookmarks,
  }
}
