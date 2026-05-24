import { useQuery } from '@tanstack/react-query'
import { getContentTypes } from '../api/contentTypes'
import { getAuthors } from '../api/authors'
import { getMediaItems } from '../api/media'
import { Card, CardBody, Spinner } from '../components/ui'
import { FileText, Users, Image, FilePlus } from 'lucide-react'

export default function DashboardPage() {
  const { data: contentTypes } = useQuery({ queryKey: ['content-types'], queryFn: getContentTypes })
  const { data: authors } = useQuery({ queryKey: ['authors'], queryFn: getAuthors })
  const { data: media } = useQuery({ queryKey: ['media'], queryFn: getMediaItems })

  const stats = [
    { label: 'Tipos de Contenido', value: contentTypes?.length ?? 0, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'Autores', value: authors?.length ?? 0, icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Media', value: media?.length ?? 0, icon: Image, color: 'text-purple-600 bg-purple-50' },
  ]

  if (!contentTypes) return <Spinner size="lg" className="mt-20" />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      {contentTypes.length > 0 && (
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Tipos de Contenido</h2>
            <div className="space-y-2">
              {contentTypes.map((ct) => (
                <a
                  key={ct.id}
                  href={`/${ct.name}/entries`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FilePlus size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{ct.display_name || ct.name}</span>
                </a>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
