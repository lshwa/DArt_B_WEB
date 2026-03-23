import React from 'react';
import { Instagram, Github, Mail, ExternalLink, Globe } from 'lucide-react';
import { useLogo } from '../src/useLogo';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { logoUrl } = useLogo();
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  return (
    <footer className="bg-[#0B2447] text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Section - Logo and Copyright */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={logoUrl} 
                alt="DArt-B Logo" 
                className="w-16 h-auto"
                onError={(e) => {
                  // 로고 로드 실패 시 기본 이미지 사용
                  const target = e.target as HTMLImageElement;
                  if (target.src !== '/assets/images/logo-white.png') {
                    target.src = '/assets/images/logo-white.png';
                  }
                }}
              />
              <div>
                <h3 className="text-xl font-bold">DArt-B</h3>
                <p className="text-blue-200 text-sm">중앙대학교 데이터분석 학회</p>
              </div>
            </div>
            <p className="text-sm text-blue-200 mt-6">
              Copyright ⓒ DArt-B All Rights Reserved.
            </p>
          </div>

          {/* Right Section - Contact */}
          <div className="md:text-right">
            <h4 className="text-lg font-bold mb-4">CONTACT US</h4>
            <div className="space-y-2 mb-6">
              <p className="text-blue-200">
                <span className="font-medium">PROFESSOR</span> | 서용원 교수님 (중앙대학교 경영학부)
              </p>
              <div className="flex items-center justify-end space-x-2">
                <p className="text-blue-200">
                  <span className="font-medium">EMAIL</span> | dartbofficial@naver.com
                </p>
                <button
                  onClick={() => copyToClipboard('dartbofficial@naver.com')}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  title="이메일 복사"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex justify-end space-x-4 mb-8">
              <a
                href="#"
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Blog"
              >
                <Globe className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>

            {/* Admin Login */}
            <div className="text-right">
              <button
                onClick={() => onNavigate('login')}
                className="text-xs text-gray-400 hover:text-gray-300 transition-colors opacity-50 hover:opacity-75"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}