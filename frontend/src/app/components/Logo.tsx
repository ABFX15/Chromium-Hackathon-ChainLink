export function Logo({ className = "w-8 h-8", showText = true }: { className?: string, showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <svg 
        className={className} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer hexagon representing blockchain */}
        <path 
          d="M20 2L35 11V29L20 38L5 29V11L20 2Z" 
          stroke="url(#gradient1)" 
          strokeWidth="2" 
          fill="rgba(6, 182, 212, 0.1)"
        />
        
        {/* Inner diamond representing property/NFT */}
        <path 
          d="M20 8L28 16L20 32L12 16L20 8Z" 
          fill="url(#gradient2)"
          stroke="rgba(6, 182, 212, 0.8)"
          strokeWidth="1"
        />
        
        {/* AI neural network nodes */}
        <circle cx="20" cy="14" r="1.5" fill="#00ff88" />
        <circle cx="16" cy="20" r="1.5" fill="#00ff88" />
        <circle cx="24" cy="20" r="1.5" fill="#00ff88" />
        <circle cx="20" cy="26" r="1.5" fill="#00ff88" />
        
        {/* Neural network connections */}
        <path 
          d="M20 14L16 20M20 14L24 20M16 20L20 26M24 20L20 26M16 20L24 20" 
          stroke="#00ff88" 
          strokeWidth="0.8" 
          opacity="0.6"
        />
        
        {/* Cross-chain bridge representation */}
        <path 
          d="M8 12L12 8M32 12L28 8M8 28L12 32M32 28L28 32" 
          stroke="url(#gradient3)" 
          strokeWidth="2" 
          opacity="0.7"
        />
        
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.2)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.3)" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-cyan-300 font-bold text-xl tracking-wide">ORACLEND</span>
          <span className="text-cyan-500/70 text-xs font-mono tracking-widest">AI LENDING</span>
        </div>
      )}
    </div>
  )
}