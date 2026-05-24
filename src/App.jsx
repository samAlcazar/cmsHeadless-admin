import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ContentTypesPage from './pages/ContentTypesPage'
import ContentTypeFormPage from './pages/ContentTypeFormPage'
import EntriesPage from './pages/EntriesPage'
import EntryFormPage from './pages/EntryFormPage'
import AuthorsPage from './pages/AuthorsPage'
import MediaPage from './pages/MediaPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="content-types" element={<ContentTypesPage />} />
              <Route path="content-types/:id" element={<ContentTypeFormPage />} />
              <Route path=":contentType/entries" element={<EntriesPage />} />
              <Route path=":contentType/entries/new" element={<EntryFormPage />} />
              <Route path=":contentType/entries/:id" element={<EntryFormPage />} />
              <Route path="authors" element={<AuthorsPage />} />
              <Route path="media" element={<MediaPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
