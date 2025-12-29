import ReactMarkdown from 'react-markdown'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Clock, Edit, Eye, FileText, History, RotateCcw, Save, X } from 'lucide-react'

import type { SavedVersionType } from '../../types/components'

export function MarkdownNotepad() {
  const [content, setContent] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [isSaved, setIsSaved] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [versions, setVersions] = useState<SavedVersionType[]>([])
  const [saveNotification, setSaveNotification] = useState(false)

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('markdown-notepad')
    const savedVersions = localStorage.getItem('markdown-versions')

    if (saved) {
      setContent(saved)
    } else {
      setContent('')
    }

    if (savedVersions) {
      const parsed = JSON.parse(savedVersions)
      setVersions(parsed.map((v: any) => ({ ...v, timestamp: new Date(v.timestamp) })))
    }
  }, [])

  useEffect(() => {
    // Auto-save with debounce
    setIsSaved(false)
    const timer = setTimeout(() => {
      localStorage.setItem('markdown-notepad', content)
      setIsSaved(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [content])

  const manualSave = () => {
    const title = content.split('\n')[0].replace(/^#\s*/, '').trim() || 'Untitled Note'

    const newVersion: SavedVersionType = {
      id: Date.now().toString(),
      content: content,
      timestamp: new Date(),
      title: title.substring(0, 50),
    }

    const updatedVersions = [newVersion, ...versions].slice(0, 20) // Keep last 20 versions
    setVersions(updatedVersions)
    localStorage.setItem('markdown-versions', JSON.stringify(updatedVersions))

    setSaveNotification(true)
    setTimeout(() => setSaveNotification(false), 2000)
  }

  const restoreVersion = (version: SavedVersionType) => {
    setContent(version.content)
    setShowHistory(false)
  }

  const deleteVersion = (id: string) => {
    const updatedVersions = versions.filter(v => v.id !== id)
    setVersions(updatedVersions)
    localStorage.setItem('markdown-versions', JSON.stringify(updatedVersions))
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h2 className="text-gray-300">Markdown Notepad</h2>
        </div>
        <div className="flex items-center space-x-3">
          <AnimatePresence>
            {saveNotification && (
              <motion.div
                initial={{ opacity: 0, scale: 0, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                className="flex items-center space-x-1 text-emerald-400 text-sm bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30">
                <Save className="w-4 h-4" />
                <span>Version saved!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: isSaved ? 1 : 0, scale: isSaved ? 1 : 0 }}
            className="flex items-center space-x-1 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>Auto-saved</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={manualSave}
            className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors border border-emerald-500/30">
            <Save className="w-4 h-4" />
            <span className="text-sm">Save Version</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
              showHistory
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-gray-700/50 text-gray-400 hover:text-white'
            }`}>
            <History className="w-4 h-4" />
            <span className="text-sm">History ({versions.length})</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
              isPreview
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-gray-700/50 text-gray-400 hover:text-white'
            }`}>
            {isPreview ? (
              <>
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-sm">Preview</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Main Editor/Preview Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AnimatePresence mode="wait">
            {isPreview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 overflow-auto bg-gray-900/50 rounded-lg p-4 prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-emerald-400 border-b border-gray-700 pb-2">{children}</h1>
                    ),
                    h2: ({ children }) => <h2 className="text-emerald-300 mt-6 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-emerald-200 mt-4 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="text-gray-300 mb-4 list-disc list-inside">{children}</ul>,
                    ol: ({ children }) => <ol className="text-gray-300 mb-4 list-decimal list-inside">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 my-4 bg-emerald-900/10 text-gray-400 italic">
                        {children}
                      </blockquote>
                    ),
                    code: ({ className, children }) => {
                      const isInline = !className
                      return isInline ? (
                        <code className="bg-gray-800 text-emerald-400 px-1.5 py-0.5 rounded text-sm">{children}</code>
                      ) : (
                        <code className="block bg-gray-800 text-emerald-400 p-3 rounded-lg overflow-x-auto text-sm">
                          {children}
                        </code>
                      )
                    },
                    strong: ({ children }) => <strong className="text-white">{children}</strong>,
                    em: ({ children }) => <em className="text-emerald-300">{children}</em>,
                  }}>
                  {content}
                </ReactMarkdown>
              </motion.div>
            ) : (
              <motion.textarea
                key="editor"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="flex-1 bg-gray-900/50 rounded-lg p-4 text-gray-300 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-shadow"
                placeholder="Start writing in markdown..."
              />
            )}
          </AnimatePresence>
        </div>

        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 320 }}
              exit={{ opacity: 0, width: 0 }}
              className="flex flex-col bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700/50">
              <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4 text-blue-400" />
                  <h3 className="text-white">Version History</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-auto p-2 space-y-2">
                {versions.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 px-4">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No saved versions yet</p>
                    <p className="text-xs mt-1">Click "Save Version" to create snapshots</p>
                  </div>
                ) : (
                  versions.map((version, idx) => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70 transition-colors border border-gray-700/30 group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm truncate mb-1">{version.title}</h4>
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(version.timestamp)}</span>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteVersion(version.id)}
                          className="text-red-400/60 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <X className="w-3 h-3" />
                        </motion.button>
                      </div>

                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{version.content.substring(0, 80)}...</p>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => restoreVersion(version)}
                        className="w-full flex items-center justify-center space-x-1 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs transition-colors border border-blue-500/30">
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
