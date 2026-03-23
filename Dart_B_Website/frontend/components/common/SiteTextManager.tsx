import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { settingsApi } from '../../src/api';
import { invalidateSiteTextCache, DEFAULT_TEXTS } from '../../src/useSiteTexts';
import { useSiteTexts } from '../../src/useSiteTexts';
import { RefreshCw, Edit2, Check } from 'lucide-react';

// ─── Text catalogue ──────────────────────────────────────────────────────────
interface TextItem {
  key: string;
  label: string;
  multiline?: boolean;
}

interface TextCategory {
  name: string;
  items: TextItem[];
}

const TEXT_CATEGORIES: TextCategory[] = [
  {
    name: '홈 배너',
    items: [
      { key: 'home.hero.title', label: '제목 (큰 글자)' },
      { key: 'home.hero.subtitle', label: '부제목' },
      { key: 'home.hero.description', label: '설명 문구', multiline: true },
    ],
  },
  {
    name: 'About Us',
    items: [
      { key: 'about.intro', label: '소개 요약', multiline: true },
      { key: 'about.body1', label: '본문 1', multiline: true },
      { key: 'about.body2', label: '본문 2', multiline: true },
      { key: 'about.body3', label: '본문 3', multiline: true },
    ],
  },
  {
    name: '인사말 (Preface)',
    items: [
      { key: 'preface.heading', label: '교수님 인사 제목', multiline: true },
      { key: 'preface.body1', label: '인사말 1단락', multiline: true },
      { key: 'preface.body2', label: '인사말 2단락', multiline: true },
      { key: 'preface.body3', label: '인사말 3단락', multiline: true },
    ],
  },
  {
    name: '네트워킹',
    items: [
      { key: 'networking.title', label: '이벤트 제목' },
      { key: 'networking.intro', label: '이벤트 소개', multiline: true },
      { key: 'networking.section1.title', label: '섹션 1 제목' },
      { key: 'networking.section1.body', label: '섹션 1 내용', multiline: true },
      { key: 'networking.section2.title', label: '섹션 2 제목' },
      { key: 'networking.section2.body', label: '섹션 2 내용', multiline: true },
      { key: 'networking.section3.title', label: '섹션 3 제목' },
      { key: 'networking.section3.body', label: '섹션 3 내용', multiline: true },
      { key: 'networking.highlight.title', label: '하이라이트 제목' },
      { key: 'networking.highlight.body', label: '하이라이트 내용', multiline: true },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function SiteTextManager() {
  const { texts, isLoading, refresh } = useSiteTexts();
  const [selectedItem, setSelectedItem] = useState<TextItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const openEdit = (item: TextItem) => {
    setSelectedItem(item);
    setEditValue(texts[item.key] ?? DEFAULT_TEXTS[item.key] ?? '');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    setIsSaving(true);
    try {
      const response = await settingsApi.updateSetting(
        `site_text.${selectedItem.key}`,
        editValue,
      );
      if (response.error) {
        alert(`저장 실패: ${response.error}`);
      } else {
        setSaveSuccess(selectedItem.key);
        invalidateSiteTextCache();
        await refresh();
        setTimeout(() => {
          setSaveSuccess(null);
          setIsDialogOpen(false);
        }, 1200);
      }
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-gray-500">텍스트 목록 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#0B2447]">사이트 텍스트 관리</h3>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* Categories */}
      {TEXT_CATEGORIES.map((category) => (
        <div key={category.name} className="border rounded-lg p-4">
          <h4 className="font-bold text-[#0B2447] mb-4">{category.name}</h4>
          <div className="space-y-3">
            {category.items.map((item) => {
              const currentValue = texts[item.key] ?? DEFAULT_TEXTS[item.key] ?? '';
              const isSuccess = saveSuccess === item.key;

              return (
                <div
                  key={item.key}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Text preview */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 mb-1">{item.label}</p>
                    <p className="text-sm text-gray-800 line-clamp-2 whitespace-pre-line">
                      {currentValue || <span className="italic text-gray-400">（비어 있음）</span>}
                    </p>
                  </div>

                  {/* Edit button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 flex items-center gap-1"
                    onClick={() => openEdit(item)}
                  >
                    {isSuccess ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Edit2 className="w-3 h-3" />
                    )}
                    {isSuccess ? '저장됨' : '편집'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedItem?.label} 편집</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4 mt-2">
              {/* Current vs editing */}
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">현재 텍스트</Label>
                <div className="bg-gray-100 rounded-md p-3 text-sm text-gray-700 whitespace-pre-line max-h-24 overflow-y-auto">
                  {texts[selectedItem.key] ?? DEFAULT_TEXTS[selectedItem.key] ?? '（비어 있음）'}
                </div>
              </div>

              <div>
                <Label htmlFor="text-edit-input" className="text-xs text-gray-500 mb-1 block">
                  새 텍스트
                </Label>
                {selectedItem.multiline ? (
                  <textarea
                    id="text-edit-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={5}
                    disabled={isSaving}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2447] resize-y"
                    placeholder="텍스트를 입력하세요..."
                  />
                ) : (
                  <input
                    id="text-edit-input"
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    disabled={isSaving}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2447]"
                    placeholder="텍스트를 입력하세요..."
                  />
                )}
              </div>

              {/* Save success */}
              {saveSuccess === selectedItem.key && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">텍스트가 성공적으로 저장되었습니다!</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSaving}
                >
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || editValue.trim() === ''}
                  className="bg-[#0B2447] hover:bg-[#0a1f3a] text-white"
                >
                  {isSaving ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
