"use client"

import React, { useMemo, useState, useRef } from "react"
import { Search, Plus, LayoutGrid, List, X, Bookmark, User as UserIcon } from "lucide-react"

import UserMenu from "@/components/UserMenu"
import EmptyVariant from "@/components/emptyVaiants"

import { useAuthUser } from "@/lib/hooks/useAuthUser"
import { useBookmarks } from "@/lib/hooks/useBookmarks"
import { useBookmarkActions } from "@/lib/hooks/useBookmarkActions"
import { useBookmarkRealtime } from "@/lib/hooks/useBookmarkRealtime"
import BookmarkModal from "@/components/bookMarkModal"

export default function MainListPage() {
  const { user, loading: authLoading, logout } = useAuthUser()
  const { bookmarks, setBookmarks, loading, error } = useBookmarks(user?.id)
  useBookmarkRealtime(user?.id, setBookmarks)
  const actions = useBookmarkActions(setBookmarks, user?.id || "")

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTag, setActiveTag] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [editingBookmark, setEditingBookmark] = useState<any>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  if (!authLoading && !user) {
    if (typeof window !== "undefined") window.location.href = "/login"
    return null
  }

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    bookmarks.forEach(b => b.tags?.forEach(tag => tagSet.add(tag)))
    return ["All", ...Array.from(tagSet)]
  }, [bookmarks])

  const filtered = useMemo(() => {
    return bookmarks.filter(b => {
      const query = searchQuery.toLowerCase().trim()
      const matchesQuery = 
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query)
      const matchesTag = activeTag === "All" || b.tags?.includes(activeTag)
      return matchesQuery && matchesTag
    })
  }, [bookmarks, searchQuery, activeTag])

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return url.replace(/^https?:\/\//, '').split('/')[0]
    }
  }

  const openAddModal = () => {
    setModalMode("add")
    setIsModalOpen(true)
  }

  const openEditModal = (bookmark: any) => {
    if (!bookmark?.id) return
    setEditingBookmark(bookmark)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleModalSubmit = async (data: any) => {
    if (modalMode === "add") {
      await actions.createBookmark({
        ...data,
        domain: getDomain(data.url),
        userId: user?.id
      })
    } else if (modalMode === "edit" && editingBookmark?.id) {
      await actions.updateBookmark(editingBookmark.id, data)
    }
  }

  const handleModalDelete = async (id: string) => {
    await actions.deleteBookmark(id)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    searchInputRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      <nav className="h-16 border-b bg-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Bookmark size={18} />
          </div>
          <span className="font-bold text-lg text-black hidden md:block">Bookmarkly</span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
      
          <div className="relative">
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" 
            />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-10 h-10 w-40 md:w-64 bg-slate-100 text-black rounded-lg text-sm px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search..."
              aria-label="Search bookmarks"
            />
            {searchQuery && (
              <button 
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

      
          <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid" 
                  ? "bg-white shadow-sm text-indigo-600" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list" 
                  ? "bg-white shadow-sm text-indigo-600" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <List size={18} />
            </button>
          </div>

      
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-3 h-10 rounded-lg flex items-center gap-1.5 hover:bg-indigo-700 transition-colors shadow-sm"
            aria-label="Add new bookmark"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
          </button>

      
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(prev => !prev)}
              className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center hover:bg-slate-300 transition-colors"
              aria-label="User menu"
              aria-expanded={isUserMenuOpen}
              aria-controls="user-menu"
            >
              <span className="font-medium text-slate-700">
                {user?.email?.charAt(0).toUpperCase() || <UserIcon size={18} />}
              </span>
            </button>
            
            <UserMenu
              isOpen={isUserMenuOpen}
              onClose={() => setIsUserMenuOpen(false)}
              userEmail={user?.email || null}
              onSignOut={logout}
            />
          </div>
        </div>
      </nav>

      
      <div className="px-4 md:px-6 py-3 md:py-4 flex gap-2 overflow-x-auto border-b bg-white">
        {allTags.map(tag => (
          <button 
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTag === tag 
                ? "bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            aria-pressed={activeTag === tag}
          >
            {tag}
          </button>
        ))}
      </div>

      <main className="px-4 md:px-6 py-6 flex-1">
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-indigo-600 border-t-transparent"></div>
            <p className="mt-3 text-slate-500">Loading your bookmarks...</p>
          </div>
        )}




{!loading && !error && filtered.length === 0 && searchQuery === "" && (
  <EmptyVariant 
    type="no-bookmarks"
    onPrimaryClick={() => {
      setModalMode("add")
      setIsModalOpen(true)
    }}
  />
)}


{!loading && !error && filtered.length === 0 && searchQuery !== "" && (
  <EmptyVariant 
    type="no-search"
    onPrimaryClick={() => {
      setSearchQuery("")
      searchInputRef.current?.focus()
    }}
    onSecondaryClick={() => {
      setModalMode("add")
      setIsModalOpen(true)
    }}
  />
)}


{error && (
  <EmptyVariant 
    type="error"
    onPrimaryClick={()=>{}}
    onSecondaryClick={() => window.location.href = "mailto:support@bookmarkly.com"}
  />
)}

        {!loading && filtered.length > 0 && (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              : "space-y-3"
          }>
            {filtered.map(bookmark => (
              <div 
                key={bookmark.id}
                onClick={() => openEditModal(bookmark)}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                  viewMode === "grid"
                    ? "hover:shadow-md hover:-translate-y-0.5" 
                    : "hover:bg-slate-50"
                }`}
                role="button"
                aria-label={`Edit bookmark: ${bookmark.title}`}
              >
                <h3 className="font-semibold text-slate-900 truncate mb-1">
                  {bookmark.title || 'Untitled'}
                </h3>
                <p className="text-xs text-slate-500 truncate mb-2">
                  {getDomain(bookmark.url)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bookmark.tags?.slice(0, 3).map(tag => (
                    <span 
                      key={tag} 
                      className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full truncate"
                      title={tag}
                    >
                      {tag}
                    </span>
                  ))}
                  {bookmark.tags && bookmark.tags.length > 3 && (
                    <span className="text-[10px] text-slate-400" title={`${bookmark.tags.slice(3).join(', ')}`}>
                      +{bookmark.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>


      <BookmarkModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBookmark(null)
        }}
        mode={modalMode}
        initialData={modalMode === "edit" ? editingBookmark : undefined}
        onSubmit={handleModalSubmit}
        onDelete={modalMode === "edit" ? handleModalDelete : undefined}
      />
    </div>
  )
}