import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { getContentTypes } from '../api/contentTypes'
import { getFieldsByContentType } from '../api/fields'
import { getEntries, getEntry, createEntry, updateEntry } from '../api/entries'
import DynamicField from '../components/DynamicField'
import { Button, Card, CardBody, Spinner } from '../components/ui'
import { ArrowLeft, Save } from 'lucide-react'

export default function EntryFormPage() {
  const { contentType, id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id

  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

  const { data: contentTypes } = useQuery({ queryKey: ['content-types'], queryFn: getContentTypes })
  const ct = contentTypes?.find((c) => c.name === contentType)

  const { data: fields } = useQuery({
    queryKey: ['fields', ct?.id],
    queryFn: () => getFieldsByContentType(ct.id),
    enabled: !!ct?.id,
  })

  const { data: entry } = useQuery({
    queryKey: ['entry', contentType, id],
    queryFn: () => getEntry(contentType, id),
    enabled: isEditing,
  })

  useEffect(() => {
    if (isEditing && entry) setFormData(entry)
  }, [entry, isEditing])

  useEffect(() => {
    if (fields && !isEditing) {
      const initial = {}
      fields.forEach((f) => {
        if (f.default_value !== null && f.default_value !== undefined) {
          initial[f.name] = f.default_value
        } else if (f.is_list) {
          initial[f.name] = []
        } else if (f.field_type === 'boolean') {
          initial[f.name] = false
        } else {
          initial[f.name] = ''
        }
      })
      setFormData(initial)
    }
  }, [fields, isEditing])

  const relationFields = (fields || []).filter(
    (f) => f.field_type === 'relation' && f.relation_content_type_id
  )

  const relationQueries = useQueries({
    queries: relationFields.map((f) => {
      const relatedCt = contentTypes?.find((ct) => ct.id === f.relation_content_type_id)
      return {
        queryKey: ['entries', relatedCt?.name],
        queryFn: () => getEntries(relatedCt.name),
        enabled: !!relatedCt,
      }
    }),
  })

  const relatedEntriesMap = {}
  relationFields.forEach((f, i) => {
    relatedEntriesMap[f.name] = relationQueries[i]?.data || []
  })

  const createMutation = useMutation({
    mutationFn: (data) => createEntry(contentType, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['entries', contentType] }); navigate(`/${contentType}/entries`) },
  })

  const updateMutation = useMutation({
    mutationFn: (data) => updateEntry(contentType, id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['entries', contentType] }); navigate(`/${contentType}/entries`) },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    fields.forEach((f) => {
      if (f.is_required && (formData[f.name] === undefined || formData[f.name] === '' || formData[f.name] === null || (Array.isArray(formData[f.name]) && formData[f.name].length === 0))) {
        newErrors[f.name] = 'Este campo es requerido'
      }
    })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    if (isEditing) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  if (ct && fields === undefined) return <Spinner size="lg" className="mt-20" />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(`/${contentType}/entries`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
        <ArrowLeft size={16} /> Volver a entradas
      </button>
      <Card>
        <CardBody>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            {isEditing ? 'Editar' : 'Nueva'} Entrada: {ct?.display_name || contentType}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields?.map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={formData[field.name]}
                onChange={(val) => setField(field.name, val)}
                error={errors[field.name]}
                relatedEntries={relatedEntriesMap[field.name]}
              />
            ))}
            {(!fields || fields.length === 0) && (
              <p className="text-sm text-gray-500">Este tipo de contenido no tiene campos definidos.</p>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" type="button" onClick={() => navigate(`/${contentType}/entries`)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                <Save size={16} /> {isEditing ? 'Guardar Cambios' : 'Crear Entrada'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
