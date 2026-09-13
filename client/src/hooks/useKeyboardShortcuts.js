import { useEffect } from 'react'

export default function useKeyboardShortcuts({ onNewChat, onFocusSearch, onOpenSettings, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      const isMeta = e.metaKey || e.ctrlKey
      if (isMeta && e.key === 'n') {
        e.preventDefault()
        onNewChat?.()
      }
      if (isMeta && e.key === 'k') {
        e.preventDefault()
        onFocusSearch?.()
      }
      if (isMeta && e.key === ',') {
        e.preventDefault()
        onOpenSettings?.()
      }
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onNewChat, onFocusSearch, onOpenSettings, onClose])
}
