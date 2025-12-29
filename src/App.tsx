import { motion } from 'motion/react'
import { useState, useEffect } from 'react'

import { GitLabFeed } from './components/GitLabFeed'
import { ClockWidget } from './components/ClockWidget'
import { KanbanBoard } from './components/KanbanBoard'
import { SearchWidget } from './components/SearchWidget'
import { WeatherWidget } from './components/WeatherWidget'
import { MarkdownNotepad } from './components/MarkdownNotepad'
import { EmailWidget } from './components/EmailWidget'

import '@core/time-core' // Initialize time service

export default function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-[1800px] mx-auto">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Dashboard</h1>
            <p className="text-gray-400 mt-2">Your personalized command center</p>
          </div>
          <ClockWidget />
        </header>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="mb-6">
          <SearchWidget />
        </motion.div>

        {/* Top Row - Weather */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6">
          <WeatherWidget />
        </motion.div>

        {/* Middle Row - Notepad & GitLab */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}>
            <MarkdownNotepad />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}>
            <GitLabFeed />
          </motion.div>
        </div>

        {/* Email Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mb-6">
          <EmailWidget />
        </motion.div>

        {/* Bottom Row - Kanban Board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}>
          <KanbanBoard />
        </motion.div>
      </motion.div>
    </div>
  )
}
