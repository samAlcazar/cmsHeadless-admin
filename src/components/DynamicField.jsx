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

export default function DynamicField({ field, value, onChange, error }) {
  const id = `field-${field.id || field.name}`

  if (field.field_type === 'text') {
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

  if (field.field_type === 'relation') {
    return (
      <Input
        id={id}
        label={field.display_name || field.name}
        placeholder="ID del contenido relacionado"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
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
