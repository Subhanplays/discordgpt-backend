import React, { useEffect, useState } from 'react'
import { Search, FolderOpen } from 'lucide-react'
import TemplateCard from '../components/TemplateCard'
import { useChat } from '../contexts/ChatContext'

export default function TemplatesPage() {
  const { templates, fetchTemplates, deleteTemplate, saveTemplate } = useChat()
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const filtered = templates.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDuplicate = async (template) => {
    await saveTemplate({ ...template, id: undefined, name: `${template.name} (Copy)` })
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
              onUse={(tpl) => {}}
              onEdit={(tpl) => {}}
              onDuplicate={handleDuplicate}
              onDelete={deleteTemplate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
