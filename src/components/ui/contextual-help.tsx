'use client';

import { useState } from 'react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ContextualHelpProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ContextualHelp({
  title,
  children,
  className
}: ContextualHelpProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <div className={cn(
      "bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-md p-3 relative",
      className
    )}>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
        aria-label="Dismiss help"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
      
      <h4 className="text-sm font-medium flex items-center gap-2 mb-1">
        <InformationCircleIcon className="h-4 w-4 text-blue-500" />
        {title}
      </h4>
      
      <div className="text-xs text-muted-foreground">
        {children}
      </div>
    </div>
  );
} 