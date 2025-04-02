'use client';

import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Home } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Simple navigation function that logs before navigating
  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    try {
      router.push(path);
    } catch (e) {
      console.error('Router navigation failed, using window.location', e);
      window.location.href = path;
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => handleNavigation('/')}
              className="flex-shrink-0 flex items-center cursor-pointer"
            >
              <span className="text-xl font-bold text-gray-900 dark:text-white">Data.gov.sg Explorer</span>
            </button>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {[
                { name: 'Home', path: '/', icon: Home },
                { name: 'Data Analyzer', path: '/analyze', icon: BarChart3 },
                { name: 'Wizard Explorer', path: '/explorer-wizard', icon: BarChart3 }
              ].map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      isActive 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="block md:hidden">
            <div className="flex items-center space-x-2">
              {[
                { name: 'Home', path: '/', icon: Home },
                { name: 'Data Analyzer', path: '/analyze', icon: BarChart3 },
                { name: 'Wizard', path: '/explorer-wizard', icon: BarChart3 }
              ].map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`p-2 rounded-md cursor-pointer ${
                      isActive 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 