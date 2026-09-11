import React from 'react'
import { Layers, Hash, Clock, Play, Edit, Copy, Trash2 } from 'lucide-react'

export default function TemplateCard({ template, onUse, onEdit, onDuplicate, onDelete }) {
  const catCount = template.categories?.length || 0
  const chCount = template.categories?.reduce((acc, cat) => acc + (cat.channels?.length || 0), 0) || 0

  return (
    <div className="template-card">
      <div className="template-card-name">{template.name}</div>
      <div className="template-card-desc">{template.description || 'No description'}</div>
      <div className="template-card-meta">
        <span><Layers size={12} /> {catCount} categories</span>
        <span><Hash size={12} /> {chCount} channels</span>
        {template.createdAt && <span><Clock size={12} /> {new Date(template.createdAt).toLocaleDateString()}</span>}
      </div>
      <div className="template-card-actions">
        <button className="btn btn-primary btn-sm" onClick={() => onUse?.(template)}>
          <Play size={12} /> Use
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit?.(template)} title="Edit">
          <Edit size={12} />
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onDuplicate?.(template)} title="Duplicate">
          <Copy size={12} />
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onDelete?.(template.id)} title="Delete" style={{ color: 'var(--error)' }}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}
