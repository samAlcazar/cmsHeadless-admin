import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getContentTypes, createContentType, deleteContentType } from '../api/contentTypes'
import { Button, Input, Textarea, Card, CardHeader, CardBody, Table, Modal, Spinner } from '../components/ui'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function ContentTypesPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', display_name: '', description: '' })
  const [error, setError] = useState('')

  const { data: contentTypes, isLoading } = useQuery({ queryKey: ['content-types'], queryFn: getContentTypes })

  const createMutation = useMutation({
    mutationFn: createContentType,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['content-types'] }); setModalOpen(false); setForm({ name: '', display_name: '', description: '' }) },
    onError: (err) => setError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteContentType,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content-types'] }),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    createMutation.mutate(form)
  }

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'display_name', label: 'Nombre mostrado' },
    { key: 'description', label: 'Descripción' },
    { key: 'is_single', label: 'Único', render: (row) => row.is_single ? 'Sí' : 'No' },
  ]

  if (isLoading) return <Spinner size="lg" className="mt-20" />

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Tipos de Contenido"
          action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> Nuevo</Button>}
        />
        <CardBody>
          <Table
            columns={columns}
            data={(contentTypes || []).map((ct) => ({
              ...ct,
              actions: (
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/content-types/${ct.id}`)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(ct.id)}>
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              ),
            }))}
          />
        </CardBody>
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Tipo de Contenido">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <Input label="Nombre (slug)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="ej: post" />
          <Input label="Nombre mostrado" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="ej: Post" />
          <Textarea label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
