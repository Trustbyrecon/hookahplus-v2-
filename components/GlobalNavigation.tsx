"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavGroup {
  label: string;
  items: NavItem[];
  color: string;
  bgColor: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
}

const GlobalNavigation: React.FC = () => {
  const pathname = usePathname();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  
  const navGroups: NavGroup[] = [
    {
      label: 'Core',
      color: 'from-teal-500 to-emerald-500',
      bgColor: 'bg-teal-500/10',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: '🏠', description: 'Main lounge overview' },
        { label: 'Sessions', href: '/sessions', icon: '🍃', description: 'Active hookah sessions' },
        { label: 'Fire Session', href: '/fire-session-dashboard', icon: '🔥', description: 'Session workflow' }
      ]
    },
    {
      label: 'Demo',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      items: [
        { label: 'Demo Flow', href: '/demo-flow', icon: '📱', description: 'Customer journey demo' },
        { label: 'Interactive', href: '/demo', icon: '🚀', description: 'Interactive demo' },
        { label: 'Demo Video', href: '/demo-video', icon: '🎬', description: 'Video walkthrough' }
      ]
    },
    {
      label: 'Business',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      items: [
        { label: 'ROI Calculator', href: '/roi-calculator', icon: '💰', description: 'Calculate returns' },
        { label: 'Landing', href: '/landing', icon: '🎯', description: 'Main landing page' },
        { label: 'Preorders', href: '/owner-cta?form=preorder', icon: '💳', description: 'Start preorders' }
      ]
    },
    {
      label: 'Admin',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      items: [
        { label: 'Control Center', href: '/admin-control', icon: '⚙️', description: 'Admin dashboard' },
        { label: 'Customers', href: '/admin-customers', icon: '👥', description: 'Customer management' },
        { label: 'Connectors', href: '/admin-connectors', icon: '🔗', description: 'Integration management' }
      ]
    },
    {
      label: 'POS',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-500/10',
      items: [
        { label: 'Square POS', href: '/square-pos', icon: '💳', description: 'Square integration' }
      ]
    }
  ];

  const getCurrentGroup = () => {
    return navGroups.find(group => 
      group.items.some(item => item.href === pathname)
    );
  };

  const currentGroup = getCurrentGroup();
  const currentPage = currentGroup?.items.find(item => item.href === pathname);

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar - Logo and Current Page */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="text-teal-400 text-2xl animate-pulse">🍃</div>
            <div className="text-teal-400 font-bold text-xl">HOOKAH+</div>
            {currentGroup && (
              <div className={`${currentGroup.bgColor} text-zinc-300 text-sm font-medium px-3 py-1 rounded-lg border border-zinc-700 transition-all duration-300`}>
                {currentGroup.label.toUpperCase()}
              </div>
            )}
          </div>

          {/* Current Page Display */}
          <div className="hidden md:flex items-center space-x-4">
            {currentPage && (
              <div className="text-right">
                <div className="text-white font-semibold flex items-center space-x-2">
                  <span className="text-lg">{currentPage.icon}</span>
                  <span>{currentPage.label}</span>
                </div>
                {currentPage.description && (
                  <div className="text-zinc-400 text-sm">{currentPage.description}</div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              className="text-zinc-400 hover:text-white p-2 transition-colors duration-200"
              onClick={() => setActiveGroup(activeGroup ? null : 'mobile')}
            >
              <span className="text-xl">{activeGroup === 'mobile' ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Groups - Desktop */}
        <div className="hidden md:block border-t border-zinc-800 pt-4 pb-4">
          <div className="flex items-center justify-center space-x-6">
            {navGroups.map((group) => (
              <div key={group.label} className="relative group">
                <button
                  className={`bg-gradient-to-r ${group.color} text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-2 ${
                    activeGroup === group.label ? 'ring-2 ring-white/30 shadow-xl' : ''
                  }`}
                  onClick={() => setActiveGroup(activeGroup === group.label ? null : group.label)}
                >
                  <span className="text-lg">{group.items[0]?.icon}</span>
                  <span>{group.label}</span>
                  <span className={`text-sm opacity-80 transition-transform duration-300 ${
                    activeGroup === group.label ? 'rotate-180' : ''
                  }`}>▼</span>
                </button>

                {/* Dropdown */}
                {activeGroup === group.label && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`${
                              isActive 
                                ? 'bg-teal-500/20 border-teal-500/50' 
                                : 'hover:bg-zinc-800 border-transparent'
                            } block p-3 rounded-lg border transition-all duration-200 hover:scale-105`}
                            onClick={() => setActiveGroup(null)}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{item.icon}</span>
                              <div className="flex-1">
                                <div className={`font-medium ${isActive ? 'text-teal-300' : 'text-white'}`}>
                                  {item.label}
                                </div>
                                {item.description && (
                                  <div className="text-zinc-400 text-sm">{item.description}</div>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        {activeGroup === 'mobile' && (
          <div className="md:hidden border-t border-zinc-800 pt-4 pb-4 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-4">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-2">
                  <div className={`bg-gradient-to-r ${group.color} text-white px-4 py-2 rounded-lg font-medium text-center shadow-lg`}>
                    {group.label}
                  </div>
                  <div className="ml-4 space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`${
                            isActive ? 'bg-teal-500/20 text-teal-300' : 'text-zinc-300 hover:bg-zinc-800'
                          } block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2`}
                          onClick={() => setActiveGroup(null)}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {activeGroup && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveGroup(null)}
        />
      )}
    </nav>
  );
};

export default GlobalNavigation;
