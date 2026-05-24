import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getContentTypes, getContentType } from '../api/contentTypes'
import { getEntries, deleteEntry } from '../api/entries'
import { Button, Card, CardHeader, CardBody, Table, Spinner } from '../components/ui'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'

export default function EntriesPage() {
  const { contentType } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: contentTypes } = useQuery({ queryKey: ['content-types'], queryFn: getContentTypes })
  const ct = contentTypes?.find((c) => c.name === contentType)

  const { data: entries, isLoading } = useQuery({
    queryKey: ['entries', contentType],
    queryFn: () => getEntries(contentType),
    enabled: !!contentType,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteEntry(contentType, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries', contentType] }),
  })

  if (isLoading) return <Spinner size="lg" className="mt-20" />

  const dataFields = entries?.length > 0 ? Object.keys(entries[0].data || {}).slice(0, 5) : []

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'slug', label: 'Slug' },
    { key: 'status', label: 'Estado' },
    ...dataFields.map((key) => ({
      key,
      label: key,
      render: (row) => {
        const val = row.data?.[key]
        if (typeof val === 'string') return val.slice(0, 60) + (val.length > 60 ? '...' : '')
        return String(val ?? '')
      },
    })),
  ]

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
        <ArrowLeft size={16} /> Volver
      </button>
      <Card>
        <CardHeader
          title={`Entradas: ${ct?.display_name || contentType}`}
          action={
            <Button onClick={() => navigate(`/${contentType}/entries/new`)}>
              <Plus size={16} /> Nueva Entrada
            </Button>
          }
        />
        <CardBody>
          <Table
            columns={columns}
            data={(entries || []).map((entry) => ({
              ...entry,
              actions: (
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/${contentType}/entries/${entry.id}`)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(entry.id)}>
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              ),
            }))}
          />
        </CardBody>
      </Card>
    </div>
  )
}
