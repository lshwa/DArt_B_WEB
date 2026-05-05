import React, { useState, useEffect } from 'react';
import { PageBanner } from '../common/PageBanner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Download, RefreshCw } from 'lucide-react';

interface WebzineItem {
  id: string;
  name: string;
  generation: number | null;
  preview_url: string;
  download_url: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api/v1';

export function Webzin() {
  const [webzines, setWebzines] = useState<WebzineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    async function fetchWebzines() {
      try {
        const res = await fetch(`${API_BASE_URL}/webzine/list`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        const list: WebzineItem[] = data.webzines ?? [];
        setWebzines(list);
        if (list.length > 0) setSelectedId(list[0].id);
      } catch (e) {
        setError('웹진 목록을 불러올 수 없습니다.');
        console.error('Webzine fetch error:', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWebzines();
  }, []);

  const current = webzines.find((w) => w.id === selectedId) ?? null;
  const maxGen = webzines.reduce((m, w) => Math.max(m, w.generation ?? 0), 0);

  const generationLabel = (item: WebzineItem) => {
    const g = item.generation;
    if (!g) return item.name.replace('.pdf', '');
    return g === maxGen ? `${g}기 (최신)` : `${g}기`;
  };

  return (
    <div className="min-h-screen">
      <PageBanner title="WEBZIN" />

      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#0B2447] rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#0B2447]">DArt-B 웹진</h2>
            </div>

            {!isLoading && !error && webzines.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">기수 선택:</span>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {webzines.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {generationLabel(w)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-32">
              <RefreshCw className="w-6 h-6 animate-spin text-[#0B2447]" />
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="text-center py-16 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{error}</p>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && current && (
            <>
              <div className="bg-gray-50 rounded-[10px] p-6 mb-8">
                <h3 className="text-xl font-bold text-[#0B2447] mb-2">
                  {current.generation ? `${current.generation}기 DArt-B 웹진` : current.name.replace('.pdf', '')}
                </h3>
                <p className="text-gray-700">
                  {current.generation ? `${current.generation}기 활동 내용을 담은 웹진입니다.` : ''}
                </p>
              </div>

              <div className="bg-white rounded-[10px] shadow-lg overflow-hidden">
                {/* PDF toolbar */}
                <div className="bg-gray-100 p-4 border-b flex items-center justify-between">
                  <span className="text-sm text-gray-600">PDF 뷰어</span>
                  <div className="flex space-x-2">
                    <a
                      href={current.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#0B2447] text-white rounded text-sm hover:bg-[#0a1f3a] flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      다운로드
                    </a>
                    <a
                      href={current.preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                    >
                      새 탭으로 열기
                    </a>
                  </div>
                </div>

                {/* iframe viewer */}
                <iframe
                  key={current.id}
                  src={current.preview_url}
                  className="w-full"
                  style={{ height: '80vh', minHeight: '600px', border: 'none' }}
                  title={current.name}
                  allow="autoplay"
                />
              </div>
            </>
          )}

          {/* Empty state */}
          {!isLoading && !error && webzines.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>등록된 웹진이 없습니다.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
