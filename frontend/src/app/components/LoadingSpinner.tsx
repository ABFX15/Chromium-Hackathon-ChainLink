
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Main Spinner */}
      <div className="relative">
        {/* Outer Ring */}
        <div className={`${sizeClasses[size]} rounded-full border-2 border-white/10`}></div>
        
        {/* Gradient Ring */}
        <div className={`${sizeClasses[size]} rounded-full border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 absolute top-0 left-0`} 
             style={{
               background: 'conic-gradient(from 0deg, transparent, rgb(99, 102, 241), rgb(168, 85, 247), transparent)',
               borderRadius: '50%',
               animation: 'spin 2s linear infinite'
             }}>
        </div>
        
        {/* Inner Circle */}
        <div className={`${sizeClasses[size]} rounded-full bg-gray-900 absolute top-1 left-1`}
             style={{
               width: `calc(100% - 8px)`,
               height: `calc(100% - 8px)`
             }}>
        </div>
        
        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Loading Text */}
      {text && (
        <div className="text-center space-y-2">
          <p className={`text-white font-medium ${textSizeClasses[size]}`}>
            {text}
          </p>
          
          {/* Animated Dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Alternative Minimal Spinner
export function MinimalSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
    </div>
  )
}

// Page Loading Overlay
export function PageLoadingOverlay({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card p-8 text-center">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  )
}
