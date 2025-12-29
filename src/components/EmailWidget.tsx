import { useCallback, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { AlertCircle, ExternalLink, Mail, RefreshCw } from 'lucide-react'

import type {
  EmailSummaryType,
  GmailListResponseType,
  GmailMessageResponseType,
  GoogleTokenClientConfigType,
  GoogleTokenClientType,
} from '../../types/components'

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: GoogleTokenClientConfigType) => GoogleTokenClientType
        }
      }
    }
  }
}

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly'

export function EmailWidget() {
  const [tokenClient, setTokenClient] = useState<GoogleTokenClientType | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [emails, setEmails] = useState<EmailSummaryType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  console.log('GIS clientId in EmailWidget:', clientId)

  const fetchEmails = useCallback(async (token: string) => {
    try {
      setLoading(true)
      setError(null)

      const listRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&labelIds=INBOX',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!listRes.ok) {
        throw new Error(`Failed to list messages: ${listRes.status}`)
      }

      const listData: GmailListResponseType = await listRes.json()
      const messagesMeta = listData.messages ?? []

      const summaries: EmailSummaryType[] = []

      for (const meta of messagesMeta) {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${meta.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!msgRes.ok) continue

        const msgData: GmailMessageResponseType = await msgRes.json()
        const headers = msgData.payload?.headers ?? []

        const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''

        summaries.push({
          id: msgData.id,
          threadId: msgData.threadId,
          subject: getHeader('Subject') || '(no subject)',
          from: getHeader('From') || '',
          date: getHeader('Date') || '',
          snippet: msgData.snippet ?? '',
        })
      }

      setEmails(summaries)
    } catch (err) {
      console.error('Failed to fetch Gmail messages', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!clientId) {
      setError('VITE_GOOGLE_CLIENT_ID is not configured')
      return
    }

    // If the GIS script is already present, don't add another one
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    )

    if (existingScript && window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GMAIL_SCOPE,
        callback: tokenResponse => {
          setAccessToken(tokenResponse.access_token)
          fetchEmails(tokenResponse.access_token)
        },
      })

      setTokenClient(client)
      setInitialized(true)
      return
    }

    const script = existingScript ?? document.createElement('script')

    if (!existingScript) {
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    script.onload = () => {
      if (!window.google?.accounts?.oauth2) {
        setError('Google Identity Services failed to initialize')
        return
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GMAIL_SCOPE,
        callback: tokenResponse => {
          setAccessToken(tokenResponse.access_token)
          fetchEmails(tokenResponse.access_token)
        },
      })

      console.log('GIS client in EmailWidget:', client)

      setTokenClient(client)
      setInitialized(true)
    }

    script.onerror = () => {
      setError('Failed to load Google Identity Services script')
    }

    // We intentionally do not remove the script on unmount so it can be reused
  }, [clientId, fetchEmails])

  const handleConnect = () => {
    if (!clientId) {
      setError('VITE_GOOGLE_CLIENT_ID is not configured')
      return
    }

    if (!tokenClient) {
      setError('Google auth is not ready yet')
      return
    }

    setError(null)
    tokenClient.requestAccessToken({ prompt: 'consent' })
  }

  const handleRefresh = () => {
    if (accessToken) {
      fetchEmails(accessToken)
    } else {
      handleConnect()
    }
  }

  const openInGmail = (threadId: string) => {
    // Gmail API doesn't expose which account index (u/0, u/1, etc.) corresponds to the authenticated account.
    // The account index is Gmail's internal way of distinguishing multiple signed-in accounts in the browser.
    // Since we're using OAuth with 'users/me', the authenticated account is the one that granted access.
    // We default to u/0 (typically the primary account), but Gmail will redirect to the correct account
    // if the user has multiple accounts signed in and u/0 isn't the right one.
    // Alternatively, we can use a URL without the account index - Gmail will handle the routing.
    window.open(`https://mail.google.com/mail/#inbox/${threadId}`, '_blank', 'noopener,noreferrer')
  }

  console.log('emails in EmailWidget:', emails)

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Mail className="w-5 h-5 text-blue-400" />
          <h2 className="text-gray-300">Work Email</h2>
        </div>

        <div className="flex items-center space-x-2">
          {initialized && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-1 text-xs px-2 py-1 rounded-md bg-gray-700/60 hover:bg-gray-600/60 text-gray-200 disabled:opacity-50">
              <RefreshCw className="w-3 h-3" />
              <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
            </motion.button>
          )}
          {!accessToken && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConnect}
              disabled={!initialized || loading}
              className="flex items-center space-x-1 text-xs px-2 py-1 rounded-md bg-blue-600/80 hover:bg-blue-500/90 text-white disabled:opacity-50">
              <span>Connect Google</span>
            </motion.button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 flex items-center space-x-2 text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-md px-2 py-1">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}

      {!accessToken && !error && (
        <p className="text-xs text-gray-400 mb-3">
          Connect your Google Workspace account to see the latest emails from your inbox.
        </p>
      )}

      <div className="flex-1 overflow-auto space-y-3">
        {loading && emails.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading emails...</div>
        )}

        {!loading && emails.length === 0 && accessToken && !error && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No emails found in your inbox.
          </div>
        )}

        {emails.map(email => (
          <motion.div
            key={email.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
            className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30 hover:border-blue-500/40 cursor-pointer flex flex-col"
            onClick={() => openInGmail(email.threadId)}>
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex-1 mr-2">
                <p className="text-xs text-gray-400 truncate">{email.from}</p>
                <h3 className="text-sm text-white truncate">{email.subject}</h3>
              </div>
              <ExternalLink className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" />
            </div>
            <p className="text-xs text-gray-400 line-clamp-2 mb-1">{email.snippet}</p>
            <p className="text-[11px] text-gray-500">{email.date}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700/50 text-[11px] text-gray-500">
        Uses read-only access to your Gmail inbox. You can revoke access anytime from your Google Account settings.
      </div>
    </div>
  )
}
