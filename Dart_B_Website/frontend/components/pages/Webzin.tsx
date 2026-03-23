import React, { useState } from 'react';
import { PageBanner } from '../common/PageBanner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText } from 'lucide-react';

export function Webzin() {
  const [selectedGeneration, setSelectedGeneration] = useState('5');

  // Mock webzine data - 4기부터 시작
  const webzines = {
    '5': {
      title: '5기 DArt-B 웹진',
      description: '2025년 5기 활동 내용을 담은 웹진입니다.',
      pdfUrl: '/webzin/dartb_5th.pdf'
    },
    '4': {
      title: '4기 DArt-B 웹진',
      description: '2024년 4기 활동 내용을 담은 웹진입니다.',
      pdfUrl: '/webzin/dartb_4th.pdf'
    }
  };

  const currentWebzin = webzines[selectedGeneration as keyof typeof webzines];

  return (
    <div className="min-h-screen">
      <PageBanner title="WEBZIN" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Generation Selector */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#0B2447] rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#0B2447]">DArt-B 웹진</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">기수 선택:</span>
              <Select value={selectedGeneration} onValueChange={setSelectedGeneration}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5기 (최신)</SelectItem>
                  <SelectItem value="4">4기</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Webzin Info */}
          <div className="bg-gray-50 rounded-[10px] p-6 mb-8">
            <h3 className="text-xl font-bold text-[#0B2447] mb-2">{currentWebzin.title}</h3>
            <p className="text-gray-700">{currentWebzin.description}</p>
          </div>

          {/* PDF Reader Mock */}
          <div className="bg-white rounded-[10px] shadow-lg overflow-hidden">
            <div className="bg-gray-100 p-4 border-b">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">PDF 뷰어</span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-[#0B2447] text-white rounded text-sm hover:bg-[#0a1f3a]">
                    다운로드
                  </button>
                  <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                    인쇄
                  </button>
                </div>
              </div>
            </div>
            
            {/* PDF Content Area */}
            <div className="h-[600px] flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-600 mb-2">{currentWebzin.title}</h4>
                <p className="text-gray-500 mb-4">웹진 내용이 여기에 표시됩니다.</p>
                <div className="bg-white rounded-lg p-8 max-w-md mx-auto shadow-sm">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* PDF Controls */}
            <div className="bg-gray-100 p-4 border-t">
              <div className="flex items-center justify-center space-x-4">
                <button className="px-3 py-1 bg-white border rounded hover:bg-gray-50">
                  이전 페이지
                </button>
                <span className="text-sm text-gray-600">1 / 12</span>
                <button className="px-3 py-1 bg-white border rounded hover:bg-gray-50">
                  다음 페이지
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}