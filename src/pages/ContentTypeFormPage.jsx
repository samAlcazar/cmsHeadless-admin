import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getContentType } from '../api/contentTypes'
import { getFieldsByContentType, createField, updateField, deleteField } from '../api/fields'
import { Button, Input, Textarea, Select, Toggle, Card, CardHeader, CardBody, Table, Modal, Spinner } from '../components/ui'
import { FieldTypeSelect } from '../components/DynamicField'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'

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

export default function ContentTypeFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [form, setForm] = useState({ name: '', display_name: '', field_type: 'string', is_required: false, is_list: false, default_value: '', options: '', position: 0 })

  const { data: ct, isLoading: ctLoading } = useQuery({ queryKey: ['content-type', id], queryFn: () => getContentType(id) })
  const { data: fields, isLoading: fieldsLoading } = useQuery({ queryKey: ['fields', id], queryFn: () => getFieldsByContentType(id) })

  const createMutation = useMutation({
    mutationFn: createField,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fields', id] }); closeModal() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id: fieldId, ...data }) => updateField(fieldId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fields', id] }); closeModal() },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteField,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fields', id] }),
  })

  const closeModal = () => { setModalOpen(false); setEditingField(null); setForm({ name: '', display_name: '', field_type: 'string', is_required: false, is_list: false, default_value: '', options: '', position: 0 }) }

  const openNew = () => { setEditingField(null); setForm({ name: '', display_name: '', field_type: 'string', is_required: false, is_list: false, default_value: '', options: '', position: fields?.length || 0 }); setModalOpen(true) }

  const openEdit = (field) => {
    setEditingField(field)
    setForm({
      name: field.name,
      display_name: field.display_name || '',
      field_type: field.field_type,
      is_required: field.is_required,
      is_list: field.is_list,
      default_value: field.default_value || '',
      options: field.options ? JSON.stringify(field.options) : '',
      position: field.position,
    })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      content_type_id: Number(id),
      ...form,
      options: form.options ? JSON.parse(form.options) : null,
    }
    if (editingField) {
      updateMutation.mutate({ id: editingField.id, ...payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  if (ctLoading || fieldsLoading) return <Spinner size="lg" className="mt-20" />

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'display_name', label: 'Mostrado' },
    { key: 'field_type', label: 'Tipo', render: (row) => FIELD_TYPE_OPTIONS.find(o => o.value === row.field_type)?.label || row.field_type },
    { key: 'is_required', label: 'Requerido', render: (row) => row.is_required ? 'Sí' : 'No' },
    { key: 'position', label: 'Posición' },
  ]

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/content-types')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
        <ArrowLeft size={16} /> Volver
      </button>
      <Card>
        <CardHeader
          title={`Campos de: ${ct?.display_name || ct?.name}`}
          action={<Button onClick={openNew}><Plus size={16} /> Nuevo Campo</Button>}
        />
        <CardBody>
          <Table
            columns={columns}
            data={(fields || []).map((f) => ({
              ...f,
              actions: (
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(f)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(f.id)}>
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              ),
            }))}
          />
        </CardBody>
      </Card>
      <Modal open={modalOpen} onClose={closeModal} title={editingField ? 'Editar Campo' : 'Nuevo Campo'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre (slug)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="ej: title" />
          <Input label="Nombre mostrado" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="ej: Título" />
          <FieldTypeSelect value={form.field_type} onChange={(e) => setForm({ ...form, field_type: e.target.value })} />
          <div className="flex gap-4">
            <Toggle label="Requerido" checked={form.is_required} onChange={(v) => setForm({ ...form, is_required: v })} />
            <Toggle label="Es lista" checked={form.is_list} onChange={(v) => setForm({ ...form, is_list: v })} />
          </div>
          <Input label="Valor por defecto" value={form.default_value} onChange={(e) => setForm({ ...form, default_value: e.target.value })} />
          <Textarea label="Opciones (JSON)" value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} placeholder='["opcion1", "opcion2"]' />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingField ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
