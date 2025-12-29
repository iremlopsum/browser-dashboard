import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { AlertCircle, CheckCircle, Clock, GitBranch, GitMerge, User } from 'lucide-react'

import type { MergeRequestType } from '../../types/components'

// To use GitLab API, import gitLabApi from '../api' and create an instance with your token

export function GitLabFeed() {
  const [mergeRequests, setMergeRequests] = useState<MergeRequestType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch GitLab MRs
    // To use real API:
    // 1. Create a GitLab API instance with your token in src/api/index.ts:
    //    const gitLabApiWithToken = APIConstructor<...>({
    //      getGitLabMergeRequests: new GetRequestWithHeaders<...>(
    //        '/api/v4/projects/:id/merge_requests',
    //        { headers: { 'PRIVATE-TOKEN': 'YOUR_GITLAB_TOKEN' } }
    //      )
    //    }, { baseUrl: 'https://gitlab.com' })
    // 2. Import and use it here:
    //    const fetchMergeRequests = async () => {
    //      try {
    //        const data = await gitLabApiWithToken('getGitLabMergeRequests', {
    //          projectId: 'YOUR_PROJECT_ID',
    //          state: 'opened',
    //          per_page: 20,
    //        })
    //        // Transform GitLab API response to our format
    //        const transformed = data.map((mr) => ({
    //          id: mr.id,
    //          title: mr.title,
    //          author: mr.author.name,
    //          status: mr.state === 'merged' ? 'merged' : mr.state === 'closed' ? 'closed' : 'open',
    //          createdAt: new Date(mr.created_at).toLocaleString(),
    //          sourceBranch: mr.source_branch,
    //          targetBranch: mr.target_branch,
    //          description: mr.description || '',
    //        }))
    //        setMergeRequests(transformed)
    //        setLoading(false)
    //      } catch (err) {
    //        console.error('Failed to fetch GitLab MRs:', err)
    //        setLoading(false)
    //      }
    //    }
    //    fetchMergeRequests()

    // For now, use mock data
    setTimeout(() => {
      const mockData: MergeRequestType[] = [
        {
          id: 1,
          title: 'Add user authentication module',
          author: 'Sarah Chen',
          status: 'open',
          createdAt: '2 hours ago',
          sourceBranch: 'feature/auth',
          targetBranch: 'main',
          description: 'Implements JWT-based authentication',
        },
        {
          id: 2,
          title: 'Fix: Dashboard loading performance',
          author: 'Mike Johnson',
          status: 'merged',
          createdAt: '5 hours ago',
          sourceBranch: 'bugfix/dashboard-perf',
          targetBranch: 'main',
          description: 'Optimized queries and lazy loading',
        },
        {
          id: 3,
          title: 'Update API documentation',
          author: 'Emily Davis',
          status: 'open',
          createdAt: '1 day ago',
          sourceBranch: 'docs/api-update',
          targetBranch: 'develop',
          description: 'Added OpenAPI spec examples',
        },
        {
          id: 4,
          title: 'Refactor payment processing',
          author: 'Alex Kumar',
          status: 'open',
          createdAt: '2 days ago',
          sourceBranch: 'refactor/payments',
          targetBranch: 'main',
          description: 'Cleaner code and better error handling',
        },
        {
          id: 5,
          title: 'Add dark mode support',
          author: 'Lisa Wang',
          status: 'merged',
          createdAt: '3 days ago',
          sourceBranch: 'feature/dark-mode',
          targetBranch: 'main',
          description: 'Theme switching with persistence',
        },
      ]

      setMergeRequests(mockData)
      setLoading(false)
    }, 800)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'merged':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'open':
        return <Clock className="w-4 h-4 text-blue-400" />
      case 'closed':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'merged':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'open':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'closed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl h-[600px] flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <GitMerge className="w-5 h-5 text-orange-400" />
        <h2 className="text-gray-300">GitLab Merge Requests</h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading merge requests...</div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto space-y-3">
          {mergeRequests.map((mr, idx) => (
            <motion.div
              key={mr.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30 hover:border-orange-500/30 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-white mb-1">{mr.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{mr.description}</p>
                </div>
                <div
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-xs ml-2 ${getStatusColor(
                    mr.status,
                  )}`}>
                  {getStatusIcon(mr.status)}
                  <span className="capitalize">{mr.status}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <User className="w-3 h-3" />
                    <span>{mr.author}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <GitBranch className="w-3 h-3" />
                    <span className="text-xs bg-gray-600/40 px-2 py-0.5 rounded">{mr.sourceBranch}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-xs bg-gray-600/40 px-2 py-0.5 rounded">{mr.targetBranch}</span>
                  </div>
                </div>
                <span className="text-gray-500 text-xs">{mr.createdAt}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700/50 text-sm text-gray-500">
        💡 Configure with your GitLab token in the code
      </div>
    </div>
  )
}
