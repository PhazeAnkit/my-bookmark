"use client"

import { motion } from 'framer-motion'
import { 
  Bookmark, 
  Search, 
  AlertCircle, 
  Plus, 
  X as XIcon, 
  RefreshCw, 
  MessageSquare 
} from 'lucide-react'

type EmptyVariantType = 'no-bookmarks' | 'no-search' | 'error'

interface EmptyVariantProps {
  type?: EmptyVariantType
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
  className?: string
}

const EmptyVariant = ({ 
  type = 'no-bookmarks',
  onPrimaryClick,
  onSecondaryClick,
  className = ''
}: EmptyVariantProps) => {
  const configs: Record<EmptyVariantType, {
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
    title: string
    description: string
    primary: { label: string; icon?: React.ComponentType<{ size?: number }> }
    secondary?: { label: string; icon?: React.ComponentType<{ size?: number }> }
    bg: string
    borderColor: string
    accent?: string
    btnClass?: string
  }> = {
    'no-bookmarks': {
      icon: Bookmark,
      title: "Your collection is empty",
      description: "Save and organize your favorite links here. Click the '+' button to add your first bookmark!",
      primary: { label: "Add Bookmark", icon: Plus },
      bg: "bg-transparent",
      borderColor: "border-transparent"
    },
    'no-search': {
      icon: Search,
      title: "No matches found",
      description: "We couldn't find anything matching your search. Try different keywords or add a new bookmark.",
      primary: { label: "Clear Search", icon: XIcon },
      secondary: { label: "Add Bookmark" },
      bg: "bg-slate-50/50",
      borderColor: "border-slate-100"
    },
    'error': {
      icon: AlertCircle,
      title: "Failed to load bookmarks",
      description: "There was a problem connecting to our servers. Please check your connection and try again.",
      primary: { label: "Retry", icon: RefreshCw },
      secondary: { label: "Contact Support", icon: MessageSquare },
      bg: "bg-red-50/50",
      borderColor: "border-red-100",
      accent: "text-red-500",
      btnClass: "bg-red-600 hover:bg-red-700 shadow-red-100"
    }
  }

  const config = configs[type]
  const Icon = config.icon

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className={`w-full max-w-2xl mx-auto rounded-[40px] border ${config.borderColor} ${config.bg} p-8 md:p-16 ${className}`}>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center text-center"
      >
        <motion.div variants={item} className="mb-6 md:mb-8">
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center ${
            type === 'error' ? 'bg-red-100/50' : 'bg-white border border-slate-100 shadow-sm'
          }`}>
            <Icon 
              size={32} 
              className={`${config.accent || "text-slate-300"} ${type === 'error' ? 'text-red-500' : ''}`} 
              strokeWidth={1.5} 
            />
          </div>
        </motion.div>

        <motion.h3 
          variants={item} 
          className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3"
        >
          {config.title}
        </motion.h3>
        
        <motion.p 
          variants={item} 
          className="text-slate-500 text-sm md:text-base leading-relaxed max-w-prose mb-6 md:mb-8 px-2"
        >
          {config.description}
        </motion.p>

        <motion.div 
          variants={item} 
          className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs"
        >
          <button 
            onClick={onPrimaryClick}
            disabled={!onPrimaryClick}
            className={`w-full h-11 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
              config.btnClass || "bg-indigo-600 hover:bg-indigo-700 text-white"
            } ${!onPrimaryClick ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={config.primary.label}
          >
            {config.primary.icon && <config.primary.icon size={18} aria-hidden="true" />}
            {config.primary.label}
          </button>
          
          {config.secondary && (
            <button 
              onClick={onSecondaryClick}
              disabled={!onSecondaryClick}
              className={`w-full h-11 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                !onSecondaryClick 
                  ? 'opacity-50 cursor-not-allowed text-slate-400' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              aria-label={config.secondary.label}
            >
              {config.secondary.icon && <config.secondary.icon size={18} aria-hidden="true" />}
              {config.secondary.label}
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default EmptyVariant