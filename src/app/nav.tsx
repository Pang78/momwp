'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3Icon, HomeIcon } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Data Analyzer', path: '/analyze', icon: BarChart3Icon },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Data.gov.sg Explorer</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="block md:hidden">
            <div className="flex items-center space-x-2">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`p-2 rounded-md ${
                      isActive 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 