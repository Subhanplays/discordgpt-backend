import React from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'

export default function CreationProgress() {
  const { creationProgress, setCreationProgress } = useChat()

  if (!creationProgress) return null

  const { step, total, steps, completed, done } = creationProgress
  const percentage = total > 0 ? Math.round((completed?.length || 0) / total * 100) : 0

  return (
    <div className="progress-container slide-up">
      <div className="progress-card">
        <div className="progress-header">
          <h3>{done ? 'Server Created Successfully!' : 'Creating Your Server...'}</h3>
          <div className="progress-bar-container">
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
            </div>
            <div className="progress-bar-text">{percentage}%</div>
          </div>
        </div>
        <div className="progress-steps">
          {steps.map((s, i) => {
            const isCompleted = completed?.includes(i)
            const isActive = step === i && !isCompleted
            return (
              <div key={i} className={`progress-step ${isCompleted ? 'completed' : isActive ? 'active' : 'pending'}`}>
                <div className="progress-step-icon">
                  {isCompleted ? <Check size={14} /> : isActive ? <Loader2 size={14} className="spinner" /> : <span>{i + 1}</span>}
                </div>
                <span className="progress-step-text">{s}</span>
              </div>
            )
          })}
        </div>
        {done && (
          <div className="progress-actions">
            <button className="btn btn-ghost" onClick={() => setCreationProgress(null)}>Close</button>
            <button className="btn btn-primary">Open Discord Server</button>
          </div>
        )}
      </div>
    </div>
  )
}
