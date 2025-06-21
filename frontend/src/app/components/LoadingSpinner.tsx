
export function LoadingSpinner({ size = 'md', text = 'Loading...' }: { size?: 'sm' | 'md' | 'lg', text?: string }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-4 border-cyan-200/20 rounded-full`}></div>
        
        {/* Spinning ring */}
        <div className={`${sizeClasses[size]} border-4 border-cyan-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0`}></div>
        
        {/* Inner glow */}
        <div className={`${sizeClasses[size]} border-2 border-blue-400/30 rounded-full absolute top-1 left-1 ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'} animate-pulse`}></div>
      </div>
      
      <div className="text-cyan-300 text-sm font-mono animate-pulse">{text}</div>
    </div>
  )
}

export function LoadingSkeleton() {
  return (
    <div className="card-enhanced p-6 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gradient-to-r from-cyan-500/20 to-transparent rounded"></div>
          <div className="h-3 bg-gradient-to-r from-blue-500/20 to-transparent rounded w-3/4"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gradient-to-r from-purple-500/20 to-transparent rounded"></div>
        <div className="h-3 bg-gradient-to-r from-cyan-500/20 to-transparent rounded w-1/2"></div>
      </div>
    </div>
  )
}
