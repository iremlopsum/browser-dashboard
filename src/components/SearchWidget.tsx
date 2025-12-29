import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Clock, Search, TrendingUp } from 'lucide-react'

const SEARCH_ENGINES = [
  { name: 'Google', url: 'https://www.google.com/search?q=', icon: '🔍' },
  { name: 'GitHub', url: 'https://github.com/search?q=', icon: '💻' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com/search?q=', icon: '📚' },
  { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: '▶️' },
]

const QUICK_SEARCHES = [
  'React hooks tutorial',
  'TypeScript best practices',
  'CSS animations',
  'JavaScript ES2024',
  'Git commands cheatsheet',
]

export function SearchWidget() {
  const [query, setQuery] = useState('')
  const [selectedEngine, setSelectedEngine] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recent-searches')
    return saved ? JSON.parse(saved) : []
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (!finalQuery.trim()) return

    // Add to recent searches
    const updated = [finalQuery, ...recentSearches.filter(s => s !== finalQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recent-searches', JSON.stringify(updated))

    // Open search in new tab
    const searchUrl = SEARCH_ENGINES[selectedEngine].url + encodeURIComponent(finalQuery)
    window.open(searchUrl, '_blank')

    setQuery('')
    setIsFocused(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  const cycleEngine = () => {
    setSelectedEngine(prev => (prev + 1) % SEARCH_ENGINES.length)
  }

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50 shadow-2xl">
        <div className="flex items-center space-x-3">
          {/* Engine Selector */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={cycleEngine}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg transition-colors border border-gray-600/50 group"
            title="Change search engine">
            <span className="text-xl">{SEARCH_ENGINES[selectedEngine].icon}</span>
            <span className="text-sm text-gray-300 hidden sm:block group-hover:text-white transition-colors">
              {SEARCH_ENGINES[selectedEngine].name}
            </span>
          </motion.button>

          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder={`Search ${SEARCH_ENGINES[selectedEngine].name}...`}
                className="w-full bg-gray-900/50 text-white placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Dropdown Suggestions */}
            <AnimatePresence>
              {isFocused && (recentSearches.length > 0 || QUICK_SEARCHES.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-gray-800/95 backdrop-blur-xl rounded-lg border border-gray-700/50 shadow-2xl overflow-hidden z-50">
                  {recentSearches.length > 0 && (
                    <div className="p-2">
                      <div className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Recent Searches</span>
                      </div>
                      {recentSearches.map((search, idx) => (
                        <motion.button
                          key={search}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handleSearch(search)}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-700/50 rounded-lg text-left text-sm text-gray-300 hover:text-white transition-colors group">
                          <span>{search}</span>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {query === '' && (
                    <div className="p-2 border-t border-gray-700/50">
                      <div className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-500">
                        <TrendingUp className="w-3 h-3" />
                        <span>Quick Searches</span>
                      </div>
                      {QUICK_SEARCHES.slice(0, 3).map((search, idx) => (
                        <motion.button
                          key={search}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handleSearch(search)}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-700/50 rounded-lg text-left text-sm text-gray-300 hover:text-white transition-colors group">
                          <span>{search}</span>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSearch()}
            disabled={!query.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center space-x-2">
            <span className="hidden sm:block">Search</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Keyboard Shortcut Hint */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between text-xs text-gray-500">
              <span>Press Enter to search, Esc to cancel</span>
              <span>Click engine icon to switch</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
