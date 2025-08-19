"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  color: string;
}

const GlobalNavigation: React.FC = () => {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    {
      label: 'Lounge Dashboard',
      href: '/dashboard',
      icon: '🏠',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      label: 'Landing Page',
      href: '/landing',
      icon: '🎯',
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      label: 'Interactive Demo',
      href: '/demo',
      icon: '🚀',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      label: 'Square POS',
      href: '/square-pos',
      icon: '💳',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Sessions',
      href: '/sessions',
      icon: '📊',
      color: 'bg-pink-600 hover:bg-pink-700'
    },
    {
      label: 'Admin Control',
      href: '/admin',
      icon: '⚙️',
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  return (
    <nav className="bg-gray-900 border-b border-purple-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="text-green-500 text-2xl">🍃</div>
            <div className="text-teal-400 font-bold text-xl">HOOKAH+</div>
            <div className="text-gray-400 text-sm">SESSION TRACKER</div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${item.color} ${
                      isActive ? 'ring-2 ring-white ring-opacity-50' : ''
                    } text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 hover:scale-105`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-400 hover:text-white p-2">
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${
                  isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavigation;
