import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckSquare, Plus, Trash2 } from 'lucide-react'

import type { TaskType } from '../../types/components'

const COLUMNS = [
  { id: 'todo' as const, title: 'To Do', color: 'from-gray-700 to-gray-800' },
  { id: 'in-progress' as const, title: 'In Progress', color: 'from-blue-900/40 to-blue-800/40' },
  { id: 'done' as const, title: 'Done', color: 'from-green-900/40 to-green-800/40' },
]

export function KanbanBoard() {
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [newTaskColumn, setNewTaskColumn] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  useEffect(() => {
    // Load tasks from localStorage
    const saved = localStorage.getItem('kanban-tasks')
    if (saved) {
      const parsed = JSON.parse(saved)
      setTasks(parsed.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) })))
    } else {
      // Initialize with sample tasks
      const sampleTasks: TaskType[] = [
        {
          id: '1',
          title: 'Design new landing page',
          description: 'Create mockups and wireframes',
          status: 'todo',
          priority: 'high',
          createdAt: new Date(),
        },
        {
          id: '2',
          title: 'Implement user authentication',
          description: 'JWT tokens and session management',
          status: 'in-progress',
          priority: 'high',
          createdAt: new Date(),
        },
        {
          id: '3',
          title: 'Write API documentation',
          description: 'Document all endpoints',
          status: 'in-progress',
          priority: 'medium',
          createdAt: new Date(),
        },
        {
          id: '4',
          title: 'Setup CI/CD pipeline',
          description: 'GitHub Actions workflow',
          status: 'done',
          priority: 'medium',
          createdAt: new Date(),
        },
        {
          id: '5',
          title: 'Database optimization',
          description: 'Add indexes and query optimization',
          status: 'todo',
          priority: 'low',
          createdAt: new Date(),
        },
        {
          id: '6',
          title: 'Code review process',
          description: 'Establish team guidelines',
          status: 'done',
          priority: 'low',
          createdAt: new Date(),
        },
      ]
      setTasks(sampleTasks)
    }
  }, [])

  useEffect(() => {
    // Auto-save tasks
    if (tasks.length > 0) {
      localStorage.setItem('kanban-tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  const addTask = (column: string) => {
    if (!newTaskTitle.trim()) return

    const newTask: TaskType = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: '',
      status: column as TaskType['status'],
      priority: 'medium',
      createdAt: new Date(),
    }

    setTasks([...tasks, newTask])
    setNewTaskTitle('')
    setNewTaskColumn(null)
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const moveTask = (taskId: string, newStatus: TaskType['status']) => {
    setTasks(tasks.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: TaskType['status']) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    moveTask(taskId, status)
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CheckSquare className="w-5 h-5 text-purple-400" />
          <h2 className="text-gray-300">Kanban Board</h2>
        </div>
        <div className="text-sm text-gray-500">{tasks.length} tasks</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.id)

          return (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, column.id)}
              className="flex flex-col">
              <div className={`bg-gradient-to-br ${column.color} rounded-lg p-3 mb-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-white">{column.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-300 bg-gray-700/50 px-2 py-0.5 rounded">
                      {columnTasks.length}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setNewTaskColumn(column.id)}
                      className="text-gray-300 hover:text-white transition-colors">
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 min-h-[400px]">
                <AnimatePresence>
                  {newTaskColumn === column.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-700/50 rounded-lg p-3 border-2 border-dashed border-gray-600">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') addTask(column.id)
                          if (e.key === 'Escape') setNewTaskColumn(null)
                        }}
                        placeholder="Task title..."
                        autoFocus
                        className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none mb-2"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addTask(column.id)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors">
                          Add
                        </button>
                        <button
                          onClick={() => setNewTaskColumn(null)}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors">
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {columnTasks.map((task, idx) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02, boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}>
                      <div
                        draggable
                        onDragStart={(e: React.DragEvent) => handleDragStart(e, task.id)}
                        className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50 cursor-move hover:border-gray-500/50 transition-all group">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white flex-1">{task.title}</h4>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteTask(task.id)}
                              className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        {task.description && <p className="text-sm text-gray-400 mb-3">{task.description}</p>}

                        <div className="flex items-center justify-between">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                          <span className="text-xs text-gray-500 capitalize">{task.priority}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
