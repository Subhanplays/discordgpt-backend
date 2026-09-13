import React, { useEffect, useState } from 'react'
import { Search, FolderOpen, X, Loader2 } from 'lucide-react'
import TemplateCard from '../components/TemplateCard'
import { useChat } from '../contexts/ChatContext'
import { useNavigate } from 'react-router-dom'

export default function TemplatesPage() {
  const { templates, fetchTemplates, deleteTemplate, saveTemplate, setBlueprint } = useChat()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const filtered = templates.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDuplicate = async (template) => {
    const bp = template.blueprint_json || {}
    await saveTemplate({
      name: `${template.name} (Copy)`,
      description: template.description || '',
      blueprint: bp
    })
  }

  const handleEdit = (template) => {
    setEditing(template)
    setEditName(template.name)
    setEditDesc(template.description || '')
  }

  const handleSaveEdit = async () => {
    setEditSaving(true)
    try {
      await saveTemplate({
        id: editing.id,
        name: editName,
        description: editDesc,
        blueprint: editing.blueprint_json || {}
      })
      setEditing(null)
    } catch {}
    setEditSaving(false)
  }

  const handleUse = (template) => {
    setBlueprint(template.blueprint_json || {})
    navigate('/')
  }

  return (
    <div className="template-page">
      <div className="template-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.svg" alt="" className="page-header-logo" />
          <h1>Templates</h1>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="template-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            style={{ paddingLeft: 32 }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="template-empty">
          <FolderOpen size={40} />
          <p>{search ? 'No templates match your search' : 'No templates yet. Create one from a conversation!'}</p>
        </div>
      ) : (
        <div className="template-grid">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onUse={handleUse}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={deleteTemplate}
            />
          ))}
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>Edit Template</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Template name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit} disabled={editSaving || !editName.trim()}>
                {editSaving ? <><Loader2 size={14} className="spinner" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
