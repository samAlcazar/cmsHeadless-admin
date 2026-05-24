import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMediaItems, createMediaItem, updateMediaItem, deleteMediaItem } from '../api/media'
import { Button, Input, Select, Textarea, Card, CardHeader, CardBody, Table, Modal, Spinner } from '../components/ui'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const MEDIA_TYPES = [
  { value: 'image', label: 'Imagen' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'other', label: 'Otro' },
]

const PROVIDERS = [
  { value: '', label: 'Ninguno' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'vimeo', label: 'Vimeo' },
  { value: 'imgur', label: 'Imgur' },
  { value: 'custom', label: 'Custom' },
]

export default function MediaPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ external_url: '', provider: '', media_type: 'image', title: '', caption: '', alt: '', credits: '', width: '', height: '' })
  const [error, setError] = useState('')

  const { data: media, isLoading } = useQuery({ queryKey: ['media'], queryFn: getMediaItems })

  const createMutation = useMutation({
    mutationFn: createMediaItem,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['media'] }); closeModal() },
    onError: (err) => setError(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateMediaItem(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['media'] }); closeModal() },
    onError: (err) => setError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMediaItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  })

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm({ external_url: '', provider: '', media_type: 'image', title: '', caption: '', alt: '', credits: '', width: '', height: '' }); setError('') }

  const openNew = () => { setEditing(null); setForm({ external_url: '', provider: '', media_type: 'image', title: '', caption: '', alt: '', credits: '', width: '', height: '' }); setModalOpen(true) }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      external_url: item.external_url || '',
      provider: item.provider || '',
      media_type: item.media_type || 'image',
      title: item.title || '',
      caption: item.caption || '',
      alt: item.alt || '',
      credits: item.credits || '',
      width: item.width?.toString() || '',
      height: item.height?.toString() || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const payload = { ...form, width: form.width ? Number(form.width) : null, height: form.height ? Number(form.height) : null }
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const columns = [
    { key: 'preview', label: 'Preview', render: (row) => row.media_type === 'image' && row.external_url
      ? <img src={row.external_url} alt="" className="h-10 w-10 rounded object-cover" />
      : <span className="text-xs text-gray-400">{row.media_type}</span>
    },
    { key: 'title', label: 'Título' },
    { key: 'media_type', label: 'Tipo' },
    { key: 'provider', label: 'Proveedor' },
  ]

  if (isLoading) return <Spinner size="lg" className="mt-20" />

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Media" action={<Button onClick={openNew}><Plus size={16} /> Nueva Media</Button>} />
        <CardBody>
          <Table
            columns={columns}
            data={(media || []).map((m) => ({
              ...m,
              actions: (
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(m.id)}><Trash2 size={14} className="text-red-500" /></Button>
                </div>
              ),
            }))}
          />
        </CardBody>
      </Card>
      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Media' : 'Nueva Media'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <Input label="URL" value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} required placeholder="https://..." />
          <Select label="Proveedor" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} options={PROVIDERS} />
          <Select label="Tipo" value={form.media_type} onChange={(e) => setForm({ ...form, media_type: e.target.value })} options={MEDIA_TYPES} />
          <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Alt text" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} />
          <Textarea label="Caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
          <Input label="Créditos" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ancho" type="number" value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })} />
            <Input label="Alto" type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
