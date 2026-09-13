import React, { useState, useEffect, useCallback } from 'react'
import { Folder, Plus, X, Trash2 } from 'lucide-react'

const FOLDER_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#06b6d4', '#f97316']

function loadFolders() {
  try {
    return JSON.parse(localStorage.getItem('dgp-folders') || '[]')
  } catch {
    return []
  }
}

function saveFolders(folders) {
  try {
    localStorage.setItem('dgp-folders', JSON.stringify(folders))
  } catch {}
}

export default function FolderList({ activeFolder, onFolderSelect }) {
  const [folders, setFolders] = useState(loadFolders)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(FOLDER_COLORS[0])

  useEffect(() => { saveFolders(folders) }, [folders])

  const handleCreate = useCallback(() => {
    const name = newName.trim()
    if (!name) return
    setFolders(prev => [...prev, { id: Date.now().toString(), name, color: newColor }])
    setNewName('')
    setNewColor(FOLDER_COLORS[0])
    setShowCreate(false)
  }, [newName, newColor])

  const handleDelete = useCallback((e, id) => {
    e.stopPropagation()
    setFolders(prev => prev.filter(f => f.id !== id))
    if (activeFolder === id) onFolderSelect(null)
  }, [activeFolder, onFolderSelect])

  return (
    <div className="folder-list">
      <div className="folder-list-header">
        <span className="folder-list-label">Folders</span>
        <button className="folder-add-btn" onClick={() => setShowCreate(!showCreate)} title="Create folder">
          <Plus size={14} />
        </button>
      </div>
      {showCreate && (
        <div className="folder-create">
          <input
            className="folder-create-input"
            type="text"
            placeholder="Folder name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <div className="folder-color-picker">
            {FOLDER_COLORS.map(c => (
              <button
                key={c}
                className={`folder-color-swatch ${newColor === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <div className="folder-create-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleCreate}>Create</button>
          </div>
        </div>
      )}
      {folders.length > 0 && (
        <div className="folder-items">
          <button
            className={`folder-item ${activeFolder === null ? 'active' : ''}`}
            onClick={() => onFolderSelect(null)}
          >
            <Folder size={14} />
            <span>All</span>
          </button>
          {folders.map(folder => (
            <div
              key={folder.id}
              className={`folder-item ${activeFolder === folder.id ? 'active' : ''}`}
              onClick={() => onFolderSelect(folder.id)}
            >
              <Folder size={14} style={{ color: folder.color }} />
              <span>{folder.name}</span>
              <button className="folder-delete-btn" onClick={e => handleDelete(e, folder.id)} aria-label="Delete folder">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
