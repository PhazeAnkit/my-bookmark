"use client"

import { supabase } from "@/lib/supabase-browser"
import { Bookmark } from "./useBookmarks"

export function useBookmarkActions(
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>, 
  userId: string
) {
  const createBookmark = async (input: Omit<Bookmark, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) throw new Error("User ID is required")
    
    const { data, error } = await supabase
      .from("bookmarks")
      .insert([{
        url: input.url.trim(),
        title: input.title.trim(),
        tags: input.tags || [],
        notes: input.notes?.trim() || null,
        user_id: userId
      }])
      .select()
      .single()

    if (error) {
      console.error("Create bookmark error:", error)
      throw new Error(error.message || "Failed to create bookmark")
    }
    
    return data
  }

  const updateBookmark = async (id: string, patch: Partial<Bookmark>) => {
    if (!id) throw new Error("Bookmark ID is required")
    
    let previousState: Bookmark[] = []
    setBookmarks(prev => {
      previousState = prev.map(b => ({ ...b }))
      return prev.map(b => 
        b.id === id 
          ? { ...b, ...patch, updated_at: new Date().toISOString() }
          : b
      )
    })

    const { error } = await supabase
      .from("bookmarks")
      .update({
        url: patch.url?.trim(),
        title: patch.title?.trim(),
        tags: patch.tags,
        notes: patch.notes?.trim() || null
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Update bookmark error:", error)
      setBookmarks(() => previousState)
      throw new Error(error.message || "Failed to update bookmark")
    }
    
    return error
  }

  const deleteBookmark = async (id: string) => {
    if (!id) throw new Error("Bookmark ID is required")
    
    let snapshot: Bookmark[] = []
    setBookmarks(prev => {
      snapshot = [...prev]
      return prev.filter(b => b.id !== id)
    })

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Delete bookmark error:", error)
      setBookmarks(() => snapshot)
      throw new Error(error.message || "Failed to delete bookmark")
    }
    
    return error
  }

  return { 
    createBookmark, 
    updateBookmark, 
    deleteBookmark 
  }
}