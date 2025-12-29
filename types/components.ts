// MarkdownNotepad types
export interface SavedVersionType {
  id: string
  content: string
  timestamp: Date
  title: string
}

// EmailWidget types
export interface GoogleTokenClientConfigType {
  client_id: string
  scope: string
  callback: (tokenResponse: { access_token: string }) => void
}

export interface GoogleTokenClientType {
  requestAccessToken: (options?: { prompt?: 'consent' | 'none' }) => void
}

export interface GmailListResponseType {
  messages?: Array<{ id: string; threadId: string }>
}

export interface GmailMessageHeaderType {
  name: string
  value: string
}

export interface GmailMessageResponseType {
  id: string
  threadId: string
  snippet?: string
  payload?: {
    headers?: GmailMessageHeaderType[]
  }
}

export interface EmailSummaryType {
  id: string
  threadId: string
  subject: string
  from: string
  date: string
  snippet: string
}

// KanbanBoard types
export interface TaskType {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
}

// GitLabFeed types
export interface MergeRequestType {
  id: number
  title: string
  author: string
  status: 'open' | 'merged' | 'closed'
  createdAt: string
  sourceBranch: string
  targetBranch: string
  description: string
}

// Counter types
export interface NumberPropsType {
  /** Motion value representing the animated counter value */
  mv: import('motion/react').MotionValue<number>
  /** The digit (0-9) this component represents */
  number: number
  /** Height of the digit container in pixels */
  height: number
}

export interface DigitPropsType {
  /** Place value (e.g., 10 for tens, 1 for ones) */
  place: number
  /** Current numeric value to display */
  value: number
  /** Height of the digit container in pixels */
  height: number
  /** Optional custom styles to apply to the digit container */
  digitStyle?: React.CSSProperties
}

export interface CounterPropsType {
  /** The numeric value to display */
  value: number
  /** Font size in pixels (default: 100) */
  fontSize?: number
  /** Additional padding around digits in pixels (default: 0) */
  padding?: number
  /** Array of place values to display, e.g., [100, 10, 1] for hundreds, tens, ones (default: [100, 10, 1]) */
  places?: number[]
  /** Gap between digits in pixels (default: 8) */
  gap?: number
  /** Border radius in pixels (default: 4) */
  borderRadius?: number
  /** Horizontal padding in pixels (default: 8) */
  horizontalPadding?: number
  /** Text color (default: 'white') */
  textColor?: string
  /** Font weight (default: 'bold') */
  fontWeight?: React.CSSProperties['fontWeight']
  /** Optional custom styles for the outer container */
  containerStyle?: React.CSSProperties
  /** Optional custom styles for the counter display */
  counterStyle?: React.CSSProperties
  /** Optional custom styles for individual digits */
  digitStyle?: React.CSSProperties
  /** Height of gradient overlays in pixels (default: 16) */
  gradientHeight?: number
  /** Starting color for gradients (default: 'black') */
  gradientFrom?: string
  /** Ending color for gradients (default: 'transparent') */
  gradientTo?: string
  /** Optional custom styles for the top gradient overlay */
  topGradientStyle?: React.CSSProperties
  /** Optional custom styles for the bottom gradient overlay */
  bottomGradientStyle?: React.CSSProperties
}

