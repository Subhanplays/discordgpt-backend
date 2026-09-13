import React, { useEffect, useRef } from 'react'
import { Check, Loader2, X, AlertCircle } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'

export default function CreationProgress() {
  const { creationProgress, setCreationProgress, activeJobId, pollJobStatus, setBlueprint, setSelectedServer } = useChat()
  const pollRef = useRef(null)

  useEffect(() => {
    if (!activeJobId) return

    pollRef.current = setInterval(async () => {
      const job = await pollJobStatus(activeJobId)
      if (job && ['completed', 'failed'].includes(job.status)) {
        clearInterval(pollRef.current)
      }
    }, 2000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [activeJobId, pollJobStatus])

  if (!creationProgress) return null

  const { status, step, total, steps, completed, message, position, result, error } = creationProgress
  const isDone = status === 'completed'
  const isFailed = status === 'failed'
  const isQueued = status === 'queued'
  const isProcessing = status === 'processing'
  const percentage = total > 0 ? Math.round((completed?.length || 0) / total * 100) : isDone ? 100 : 0

  const handleClose = () => {
    setCreationProgress(null)
    setBlueprint(null)
  }

  return (
    <div className="progress-container slide-up">
      <div className="progress-card">
        <div className="progress-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.svg" alt="" style={{ width: 24, height: 24, borderRadius: 6 }} />
            <h3 style={{ margin: 0 }}>
              {isDone && 'Server Created Successfully!'}
              {isFailed && 'Creation Failed'}
              {isQueued && `Queued (Position ${position || '...'})`}
              {isProcessing && 'Creating Your Server...'}
            </h3>
          </div>
          {!isFailed && (
            <div className="progress-bar-container">
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${percentage}%`, background: isFailed ? 'var(--error)' : 'var(--accent)' }} />
              </div>
              <div className="progress-bar-text">{percentage}%</div>
            </div>
          )}
        </div>

        {isQueued && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Loader2 size={32} className="spinner" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15 }}>Your job is in queue. Position: <strong>{position || '...'}</strong></p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{message}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Only 1 server is created at a time. Please wait...</p>
          </div>
        )}

        {(isProcessing || isDone) && steps && steps.length > 0 && (
          <div className="progress-steps">
            {steps.map((s, i) => {
              const isCompleted = completed?.includes(i)
              const isActive = step === i && !isCompleted && !isDone
              return (
                <div key={i} className={`progress-step ${isCompleted || (isDone && i < steps.length) ? 'completed' : isActive ? 'active' : 'pending'}`}>
                  <div className="progress-step-icon">
                    {(isCompleted || (isDone && i < steps.length)) ? <Check size={14} /> : isActive ? <Loader2 size={14} className="spinner" /> : <span>{i + 1}</span>}
                  </div>
                  <span className="progress-step-text">{s}</span>
                </div>
              )
            })}
          </div>
        )}

        {isFailed && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
              <AlertCircle size={16} style={{ color: 'var(--error)', flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: 'var(--error)' }}>{error || 'Server creation failed'}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              The bot may have gone offline or lost permissions. Make sure the bot is online and has Manage Server, Manage Roles, and Manage Channels permissions.
            </p>
          </div>
        )}

        <div className="progress-actions">
          {isFailed && (
            <button className="btn btn-secondary" onClick={() => { setCreationProgress(null) }}>
              Try Again
            </button>
          )}
          <button className="btn btn-ghost" onClick={handleClose}>
            {isDone ? 'Done' : 'Close'}
          </button>
          {isDone && result?.guild?.id && (
            <a
              className="btn btn-primary"
              href={`https://discord.com/channels/${result.guild.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Discord Server
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
