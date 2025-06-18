import { useState, useEffect } from 'react'
import { Bell, X, Check, AlertTriangle, Info } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      title: 'New Property Available',
      message: 'Luxury Downtown Condo just listed for $750,000',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Loan Payment Due',
      message: 'Property #123 loan payment due in 3 days',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'success',
      title: 'Transaction Confirmed',
      message: 'Your purchase of Property #456 is complete',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return Check
      case 'warning': return AlertTriangle
      case 'error': return AlertTriangle
      default: return Info
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400 bg-green-400/10'
      case 'warning': return 'text-yellow-400 bg-yellow-400/10'
      case 'error': return 'text-red-400 bg-red-400/10'
      default: return 'text-blue-400 bg-blue-400/10'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return `${Math.floor(minutes / 1440)}d ago`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getIcon(notification.type)
                const colorClass = getColor(notification.type)
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                      !notification.read ? 'bg-gray-800/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-white text-sm font-medium">
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-500 hover:text-gray-300 ml-2"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <p className="text-gray-400 text-xs mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-gray-500 text-xs">
                            {formatTime(notification.timestamp)}
                          </span>
                          
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-cyan-400 hover:text-cyan-300 text-xs"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700">
              <button 
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                className="w-full text-cyan-400 hover:text-cyan-300 text-sm"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}