import { Input, Textarea, Select, Toggle } from './ui'
import RichTextEditor from './RichTextEditor'

const FIELD_TYPE_OPTIONS = [
  { value: 'string', label: 'Texto corto' },
  { value: 'text', label: 'Texto largo' },
  { value: 'richtext', label: 'Texto enriquecido' },
  { value: 'number', label: 'Número' },
  { value: 'boolean', label: 'Booleano' },
  { value: 'date', label: 'Fecha' },
  { value: 'image', label: 'Imagen' },
  { value: 'relation', label: 'Relación' },
]

export function FieldTypeSelect({ value, onChange, error }) {
  return (
    <Select
      label="Tipo de campo"
      value={value}
      onChange={onChange}
      options={FIELD_TYPE_OPTIONS}
      error={error}
    />
  )
}

function getEntryLabel(entry) {
  return entry.name || entry.title || entry.display_name || entry.id
}

export default function DynamicField({ field, value, onChange, error, relatedEntries }) {
  const id = `field-${field.id || field.name}`

  if (field.field_type === 'text') {
    if (field.is_list) {
      const items = Array.isArray(value) ? value : []
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.display_name || field.name}
          </label>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-1">
                  <Textarea
                    value={item}
                    onChange={(e) => {
                      const next = [...items]
                      next[i] = e.target.value
                      onChange(next)
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = items.filter((_, idx) => idx !== i)
                    onChange(next.length ? next : [])
                  }}
                  className="self-start mt-1 text-red-400 hover:text-red-600 cursor-pointer"
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange([...items, ''])}
            className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            + Agregar
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )
    }

    return (
      <Textarea
        id={id}
        label={field.display_name || field.name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        error={error}
      />
    )
  }

  if (field.field_type === 'richtext') {
    return (
      <RichTextEditor
        label={field.display_name || field.name}
        value={value || ''}
        onChange={onChange}
        error={error}
      />
    )
  }

  if (field.field_type === 'number') {
    return (
      <Input
        id={id}
        label={field.display_name || field.name}
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        error={error}
      />
    )
  }

  if (field.field_type === 'boolean') {
    return (
      <Toggle
        label={field.display_name || field.name}
        checked={!!value}
        onChange={onChange}
      />
    )
  }

  if (field.field_type === 'date') {
    return (
      <Input
        id={id}
        label={field.display_name || field.name}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        error={error}
      />
    )
  }

  if (field.field_type === 'image') {
    return (
      <div className="space-y-2">
        <Input
          id={id}
          label={field.display_name || field.name}
          placeholder="URL de la imagen"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
        {value && (
          <img src={value} alt="" className="max-h-40 rounded-lg border object-contain" />
        )}
      </div>
    )
  }

  if (field.options?.values) {
    const opts = field.options.values.map((v) => ({ value: v, label: v }))
    return (
      <Select
        label={field.display_name || field.name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        options={opts}
        error={error}
      />
    )
  }

  if (field.field_type === 'relation') {
    if (field.is_list) {
      const selected = value || []
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.display_name || field.name}
          </label>
          {(!relatedEntries || relatedEntries.length === 0) && (
            <p className="text-sm text-gray-500">No hay entradas relacionadas disponibles.</p>
          )}
          <div className="space-y-1 max-h-60 overflow-y-auto border rounded-lg p-3">
            {relatedEntries?.map((entry) => {
              const entryId = entry.id
              const isChecked = selected.includes(entryId)
              return (
                <label key={entryId} className="flex items-center gap-2 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      if (isChecked) {
                        onChange(selected.filter((id) => id !== entryId))
                      } else {
                        onChange([...selected, entryId])
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{getEntryLabel(entry)}</span>
                </label>
              )
            })}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )
    }

    const options = [
      { value: '', label: 'Seleccionar...' },
      ...(relatedEntries || []).map((entry) => ({
        value: entry.id,
        label: getEntryLabel(entry),
      })),
    ]
    return (
      <Select
        label={field.display_name || field.name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        options={options}
        error={error}
      />
    )
  }

  if (field.is_list) {
    const listValue = Array.isArray(value) ? value.join(', ') : (value || '')
    return (
      <Input
        id={id}
        label={field.display_name || field.name}
        placeholder="Valores separados por coma"
        value={listValue}
        onChange={(e) => {
          const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
          onChange(arr)
        }}
        error={error}
      />
    )
  }

  return (
    <Input
      id={id}
      label={field.display_name || field.name}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      error={error}
    />
  )
}
