import React, { useState, useEffect } from 'react';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { useLogo } from '../src/useLogo';
import { getToken, removeToken } from '../src/api';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  onLogin?: (status: boolean) => void;
}

export function Header({ currentPage, onNavigate, isLoggedIn, onLogin }: HeaderProps) {
  const [hoveredGNB, setHoveredGNB] = useState<string | null>(null);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { logoUrl } = useLogo();

  useEffect(() => {
    // 토큰이 있으면 어드민으로 간주
    const checkAdmin = () => {
      const token = getToken();
      setIsAdmin(!!token);
    };
    
    // 초기 확인
    checkAdmin();
    
    // localStorage 변경 감지 (다른 탭에서 로그인/로그아웃 시)
    const handleStorageChange = () => {
      checkAdmin();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 현재 탭에서의 변경 감지를 위한 커스텀 이벤트
    const handleCustomStorageChange = () => {
      checkAdmin();
    };
    
    window.addEventListener('tokenChanged', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenChanged', handleCustomStorageChange);
    };
  }, [isLoggedIn, currentPage]);

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
      subItems: [
        { id: 'recruiting', title: 'RECRUITING' },
        { id: 'recommendations', title: 'RECOMMENDATIONS' }
      ]
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
              src={logoUrl} 
              alt="DArt-B Logo" 
              className="h-24 w-auto"
              onError={(e) => {
                // 로고 로드 실패 시 기본 이미지 사용
                (e.target as HTMLImageElement).src = '/assets/images/logo-white.png';
              }}
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

            {/* Admin Menu */}
            {isAdmin && (
              <div
                className="relative"
                onMouseEnter={() => setShowAdminMenu(true)}
                onMouseLeave={() => setShowAdminMenu(false)}
              >
                <button
                  className={`px-4 py-2 transition-all duration-200 flex items-center gap-1 ${
                    showAdminMenu || currentPage === 'admin' ? 'font-bold' : 'font-normal'
                  } hover:font-bold`}
                >
                  <Settings className="w-4 h-4" />
                  ADMIN
                  <ChevronDown className="inline-block ml-1 w-4 h-4" />
                </button>

                {/* Admin Dropdown */}
                {showAdminMenu && (
                  <div className="absolute top-full right-0 bg-gray-100 min-w-48 shadow-lg rounded-b-lg overflow-hidden">
                    <button
                      className="block w-full px-4 py-3 text-left text-gray-800 hover:bg-gray-200 hover:font-bold transition-all duration-200 flex items-center gap-2"
                      onClick={() => {
                        onNavigate('admin');
                        setShowAdminMenu(false);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                      관리자 페이지
                    </button>
                    <button
                      className="block w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 hover:font-bold transition-all duration-200 flex items-center gap-2"
                      onClick={() => {
                        if (confirm('정말 로그아웃하시겠습니까?')) {
                          removeToken();
                          setIsAdmin(false);
                          if (onLogin) {
                            onLogin(false);
                          }
                          onNavigate('home');
                        }
                        setShowAdminMenu(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}