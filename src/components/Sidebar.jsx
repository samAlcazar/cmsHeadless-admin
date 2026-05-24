import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, Image, X } from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/content-types', label: 'Tipos de Contenido', icon: FileText },
  { to: '/authors', label: 'Autores', icon: Users },
  { to: '/media', label: 'Media', icon: Image },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-800 text-white transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-700">
          <h1 className="text-lg font-bold">CMS Admin</h1>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
