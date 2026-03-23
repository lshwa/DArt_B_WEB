import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import logoWhite from 'figma:asset/8413864131553daace5e7db8eac9ba1d53aec702.png';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
}

export function Header({ currentPage, onNavigate, isLoggedIn }: HeaderProps) {
  const [hoveredGNB, setHoveredGNB] = useState<string | null>(null);

  const gnbItems = [
    {
      id: 'about',
      title: 'ABOUT',
      subItems: [
        { id: 'about-us', title: 'ABOUT US' },
        { id: 'preface', title: 'PREFACE' },
        { id: 'rules', title: 'RULES' }
      ]
    },
    {
      id: 'programs',
      title: 'PROGRAMS',
      subItems: [
        { id: 'curriculum', title: 'CURRICULUM' },
        { id: 'webzin', title: 'WEBZINE' },
        { id: 'data-thon', title: 'DATA-THON' }
      ]
    },
    {
      id: 'members',
      title: 'MEMBERS',
      subItems: [
        { id: 'members', title: 'MEMBERS' },
        { id: 'networking', title: 'NETWORKING' }
      ]
    },
    {
      id: 'recruiting',
      title: 'RECRUITING',
      subItems: []
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Main Header */}
      <div className="h-20 bg-gradient-to-r from-[#0B2447] via-[#1a3a5c] to-[#2d4a6b] text-white px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          {/* Logo */}
          <div 
            className="cursor-pointer flex items-center"
            onClick={() => onNavigate('home')}
          >
            <img 
              src={logoWhite} 
              alt="DArt-B Logo" 
              className="h-18 w-auto"
            />
          </div>

          {/* GNB Navigation */}
          <nav className="flex items-center space-x-8">
            {gnbItems.map((item) => (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredGNB(item.id)}
                onMouseLeave={() => setHoveredGNB(null)}
              >
                <button
                  className={`px-4 py-2 transition-all duration-200 ${
                    hoveredGNB === item.id ? 'font-bold' : 'font-normal'
                  } hover:font-bold`}
                  onClick={() => {
                    if (item.subItems.length === 0) {
                      onNavigate('recruiting');
                    }
                  }}
                >
                  {item.title}
                  {item.subItems.length > 0 && (
                    <ChevronDown className="inline-block ml-1 w-4 h-4" />
                  )}
                </button>

                {/* LNB Dropdown */}
                {item.subItems.length > 0 && hoveredGNB === item.id && (
                  <div className="absolute top-full left-0 bg-gray-100 min-w-48 shadow-lg rounded-b-lg overflow-hidden">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        className="block w-full px-4 py-3 text-left text-gray-800 hover:bg-gray-200 hover:font-bold transition-all duration-200"
                        onClick={() => onNavigate(subItem.id)}
                      >
                        {subItem.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}