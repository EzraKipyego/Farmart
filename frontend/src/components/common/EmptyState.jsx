function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-4">
      {Icon && (
        <div className="w-11 h-11 rounded-full bg-[#161b22] flex items-center justify-center">
          <Icon size={20} className="text-[#8b95a1]" aria-hidden="true" />
        </div>
      )}
      <p className="text-sm font-medium text-[#f5f5f0]">{title}</p>
      {description && <p className="text-xs text-[#8b95a1] max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

export default EmptyState
