
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, description, className = "" }: StatsCardProps) {
  return (
    <div className={`glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {description && (
            <p className="text-gray-500 text-sm mt-1">{description}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
      </div>
    </div>
  );
}
