import React from 'react';
import { cn } from '@/lib/utils';
import { Search, Wrench, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface SidebarProps {
  activeTab: 'pc-builder' | 'quick-search';
  onTabChange: (tab: 'pc-builder' | 'quick-search') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { toggleTheme, isDark } = useTheme();
  
  const menuItems = [
    {
      id: 'pc-builder' as const,
      label: 'PC Builder',
      icon: Wrench,
      description: 'Monte seu PC completo'
    },
    {
      id: 'quick-search' as const,
      label: 'Busca Rápida',
      icon: Search,
      description: 'Encontre peças específicas'
    }
  ];

  return (
    <div className="w-64 h-full bg-sidebar-background border-r border-sidebar-border flex flex-col transition-all duration-300">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Hardware Store
        </h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1">Configurador de PC</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20 shadow-lg"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 mr-3 transition-colors duration-300",
                    isActive ? "text-primary" : "text-sidebar-foreground/60"
                  )} />
                  <div className="flex-1">
                    <div className={cn(
                      "font-medium transition-colors duration-300",
                      isActive ? "text-primary" : "text-sidebar-foreground"
                    )}>
                      {item.label}
                    </div>
                    <div className={cn(
                      "text-xs mt-0.5 transition-colors duration-300",
                      isActive ? "text-primary/80" : "text-sidebar-foreground/60"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <button
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-300",
            "bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground",
            "border border-sidebar-border hover:border-primary/20"
          )}
        >
          {isDark ? (
            <Sun className="w-4 h-4 mr-2" />
          ) : (
            <Moon className="w-4 h-4 mr-2" />
          )}
          <span className="text-sm font-medium">
            {isDark ? 'Modo Claro' : 'Modo Escuro'}
          </span>
        </button>
        
        <div className="text-xs text-sidebar-foreground/50 text-center">
          © 2024 Hardware Store
        </div>
      </div>
    </div>
  );
};