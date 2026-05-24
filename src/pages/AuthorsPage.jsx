import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getAuthors, createAuthor, updateAuthor, deleteAuthor } from '../api/authors'
import { Button, Input, Textarea, Card, CardHeader, CardBody, Table, Modal, Spinner } from '../components/ui'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function AuthorsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', bio: '', email: '', role: '', avatar_url: '', twitter: '', instagram: '' })
  const [error, setError] = useState('')

  const { data: authors, isLoading } = useQuery({ queryKey: ['authors'], queryFn: getAuthors })

  const createMutation = useMutation({
    mutationFn: createAuthor,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['authors'] }); closeModal() },
    onError: (err) => setError(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateAuthor(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['authors'] }); closeModal() },
    onError: (err) => setError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAuthor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authors'] }),
  })

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm({ name: '', slug: '', bio: '', email: '', role: '', avatar_url: '', twitter: '', instagram: '' }); setError('') }

  const openNew = () => { setEditing(null); setForm({ name: '', slug: '', bio: '', email: '', role: '', avatar_url: '', twitter: '', instagram: '' }); setModalOpen(true) }

  const openEdit = (author) => {
    setEditing(author)
    setForm({ name: author.name, slug: author.slug || '', bio: author.bio || '', email: author.email || '', role: author.role || '', avatar_url: author.avatar_url || '', twitter: author.twitter || '', instagram: author.instagram || '' })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...form })
    } else {
      createMutation.mutate(form)
    }
  }

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rol' },
  ]

  if (isLoading) return <Spinner size="lg" className="mt-20" />

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Autores" action={<Button onClick={openNew}><Plus size={16} /> Nuevo Autor</Button>} />
        <CardBody>
          <Table
            columns={columns}
            data={(authors || []).map((a) => ({
              ...a,
              actions: (
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(a.id)}><Trash2 size={14} className="text-red-500" /></Button>
                </div>
              ),
            }))}
          />
        </CardBody>
      </Card>
      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Autor' : 'Nuevo Autor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Rol" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <Input label="URL Avatar" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
          <Textarea label="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <Input label="Twitter" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} />
          <Input label="Instagram" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
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
