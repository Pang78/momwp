'use client';

import * as React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface AdvancedOptionsProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AdvancedOptions({
  title,
  children,
  defaultOpen = false,
  className
}: AdvancedOptionsProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 text-sm font-medium text-left bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-opacity-50"
      >
        <span>{title}</span>
        <ChevronDownIcon 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen ? "transform rotate-180" : ""
          )} 
        />
      </button>
      
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="p-3 border-t">{children}</div>
      </div>
    </div>
  );
} 