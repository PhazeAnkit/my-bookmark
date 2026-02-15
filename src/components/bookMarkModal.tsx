"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Link as LinkIcon, Loader2, Globe, CheckCircle2, 
  Tag as TagIcon, AlertCircle, ChevronDown, ChevronUp 
} from "lucide-react"

type BookmarkData = {
  id?: string
  url: string
  title: string
  tags: string[]
  notes?: string
}

type BookmarkModalProps = {
  isOpen: boolean
  onClose: () => void
  mode: "add" | "edit"
  initialData?: BookmarkData | null
  onSubmit: (data: BookmarkData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const BookmarkModal = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  onDelete,
}: BookmarkModalProps) => {
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [showNotes, setShowNotes] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState({ url: false, title: false })

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setUrl(initialData.url || "")
        setTitle(initialData.title || "")
        setTags(initialData.tags || [])
        setNotes(initialData.notes || "")
        setShowNotes(!!initialData.notes)
      } else {
        setUrl("")
        setTitle("")
        setTags([])
        setNotes("")
        setShowNotes(false)
      }
      setTagInput("")
      setError(null)
      setTouched({ url: false, title: false })
    } else {

      setUrl("")
      setTitle("")
      setTags([])
      setNotes("")
      setTagInput("")
      setShowNotes(false)
      setIsSaving(false)
      setIsDeleting(false)
      setError(null)
      setTouched({ url: false, title: false })
    }
  }, [isOpen, mode, initialData])




  const validateUrl = (value: string) => {
    if (!value.trim()) return false
    try {
      new URL(value.trim())
      return true
    } catch {
      return false
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag])
      setTagInput("")
      setError(null)
    } else if (tag) {
      setError("Tag already exists")
      setTimeout(() => setError(null), 2500)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
    setError(null)
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      addTag()
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  const handleSubmit = async () => {

    const isUrlValid = validateUrl(url)
    const isTitleValid = title.trim().length > 0
    
    if (!isUrlValid) {
      setError("Please enter a valid URL (include http:// or https://)")
      setTouched(prev => ({ ...prev, url: true }))
      return
    }
    
    if (!isTitleValid) {
      setError("Title is required")
      setTouched(prev => ({ ...prev, title: true }))
      return
    }

    setError(null)
    setIsSaving(true)
    
    try {
      await onSubmit({
        ...(mode === "edit" && initialData?.id ? { id: initialData.id } : {}),
        url: url.trim(),
        title: title.trim(),
        tags,
        notes: notes.trim() || undefined
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode === "add" ? "create" : "update"} bookmark`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id || !onDelete) return
    
    if (!confirm("Are you sure you want to delete this bookmark permanently?")) return
    
    setIsDeleting(true)
    setError(null)
    
    try {
      await onDelete(initialData.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete bookmark")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  const isUrlValid = validateUrl(url) || !touched.url
  const isTitleValid = title.trim().length > 0 || !touched.title
  const canSubmit = isUrlValid && isTitleValid && url.trim() && title.trim() && !isSaving && !isDeleting

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookmark-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white text-black rounded-2xl shadow-2xl overflow-hidden"
      >

        <div className="flex items-center justify-between p-5 border-b">
          <h2 
            id="bookmark-modal-title"
            className="text-xl font-bold text-slate-800"
          >
            {mode === "add" ? "Add New Bookmark" : "Edit Bookmark"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>


        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-5 mt-3 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm"
              role="alert"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>


        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">

          <div>
            <label htmlFor="bookmark-url" className="block text-sm font-medium text-slate-700 mb-1.5">
              URL *
            </label>
            <div className="relative">
              <LinkIcon 
                size={18} 
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" 
              />
              <input
                id="bookmark-url"
                value={url}
                onChange={e => {
                  setUrl(e.target.value)
                  if (touched.url) setTouched(prev => ({ ...prev, url: true }))
                }}
                onBlur={() => setTouched(prev => ({ ...prev, url: true }))}
                className={`w-full h-12 pl-11 pr-4 rounded-lg border ${
                  touched.url && !isUrlValid 
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                    : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                } focus:outline-none focus:ring-1`}
                placeholder="https://example.com"
                aria-required="true"
              />
            </div>
            {!isUrlValid && touched.url && (
              <p className="mt-1 text-xs text-red-500">Valid URL required (include http://)</p>
            )}
          </div>



          <div>
            <label htmlFor="bookmark-title" className="block text-sm font-medium text-slate-700 mb-1.5">
              Title *
            </label>
            <input
              id="bookmark-title"
              value={title}
              onChange={e => {
                setTitle(e.target.value)
                if (touched.title) setTouched(prev => ({ ...prev, title: true }))
              }}
              onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
              className={`w-full h-12 px-4 rounded-lg border ${
                touched.title && !isTitleValid
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
              } focus:outline-none focus:ring-1`}
              placeholder="Bookmark title"
              aria-required="true"
            />
            {!isTitleValid && touched.title && (
              <p className="mt-1 text-xs text-red-500">Title cannot be empty</p>
            )}
          </div>


          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <TagIcon size={16} className="text-slate-500" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 p-2.5 border rounded-lg min-h-[46px] border-slate-300">
              {tags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-indigo-900 transition-colors"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                placeholder={tags.length === 0 ? "Add tags..." : ""}
                className="flex-1 min-w-[80px] outline-none border-0 p-0 focus:ring-0 bg-transparent"
                aria-label="Tag input"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border font-mono text-[10px]">Enter</kbd> or click outside to add tag
            </p>
          </div>


          <div>
            <button
              type="button"
              onClick={() => setShowNotes(v => !v)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              aria-expanded={showNotes}
              aria-controls="notes-section"
            >
              {showNotes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showNotes ? "Hide Notes" : "Add Notes"}
            </button>

            <AnimatePresence>
              {showNotes && (
                <motion.div
                  id="notes-section"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full h-28 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                    placeholder="Additional notes about this bookmark (optional)"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>


        <div className="p-5 border-t bg-slate-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          {mode === "edit" && onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="w-full sm:w-auto px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              aria-busy={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <X size={16} />
                  Delete Bookmark
                </>
              )}
            </button>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              disabled={isSaving || isDeleting}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              aria-busy={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {mode === "add" ? "Adding..." : "Updating..."}
                </>
              ) : (
                mode === "add" ? "Add Bookmark" : "Save Changes"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default BookmarkModal