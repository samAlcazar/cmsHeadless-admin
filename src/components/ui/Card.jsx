export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-xs ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}
