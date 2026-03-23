import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { siteImagesApi, SiteImageMap } from '../../src/api';
import { useSiteImages } from '../../src/useSiteImages';
import { Upload, Link, RefreshCw, Image as ImageIcon, Check, X } from 'lucide-react';

interface ImageItem {
  key: string;
  label: string;
  description: string;
}

interface ImageCategory {
  name: string;
  items: ImageItem[];
}

const IMAGE_CATEGORIES: ImageCategory[] = [
  {
    name: '홈페이지',
    items: [
      { key: 'home.hero.background', label: '메인 배너 배경', description: '홈 히어로 섹션 배경 이미지' },
      { key: 'home.curriculum.session', label: '정규 세션 활동', description: '홈 커리큘럼 - 세션 활동 이미지' },
      { key: 'home.curriculum.project', label: '프로젝트 활동', description: '홈 커리큘럼 - 프로젝트 활동 이미지' },
    ],
  },
  {
    name: '네트워킹',
    items: [
      { key: 'networking.event', label: 'DArt-B의 밤 이벤트', description: '네트워킹 이벤트 대표 이미지' },
      { key: 'networking.activity', label: '네트워킹 활동', description: '네트워킹 활동 중 이미지' },
      { key: 'networking.group', label: '단체 사진', description: '네트워킹 단체 사진' },
    ],
  },
  {
    name: '데이터톤',
    items: [
      { key: 'datathon.angnal', label: '앵날다쏘', description: '중앙대 DArt-B x 서강대 Parrot 데이터톤' },
      { key: 'datathon.aruda', label: '아러다', description: '중앙대 DArt-B x 중앙대 CUAI 데이터톤' },
      { key: 'datathon.kukudart', label: '쿠쿠다트', description: '중앙대 DArt-B x 경희대 KHUDA 데이터톤' },
    ],
  },
  {
    name: '커리큘럼',
    items: [
      { key: 'curriculum.assignment', label: '정규 과제', description: '커리큘럼 페이지 정규 과제 이미지' },
      { key: 'curriculum.study', label: '스터디 그룹', description: '커리큘럼 페이지 스터디 그룹 이미지' },
    ],
  },
];

export function SiteImageManager() {
  const { images, isLoading, refresh } = useSiteImages();
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedImage) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.');
      return;
    }

    setIsUploading(true);
    try {
      const response = await siteImagesApi.updateWithFile(selectedImage.key, file);
      if (response.error) {
        alert(`업로드 실패: ${response.error}`);
      } else {
        setUploadSuccess(selectedImage.key);
        await refresh();
        setTimeout(() => {
          setUploadSuccess(null);
          setIsDialogOpen(false);
        }, 1500);
      }
    } catch (error) {
      alert('업로드 중 오류가 발생했습니다.');
      console.error('Site image upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlUpdate = async () => {
    if (!urlInput.trim() || !selectedImage) {
      alert('URL을 입력해주세요.');
      return;
    }

    setIsUploading(true);
    try {
      const response = await siteImagesApi.updateWithUrl(selectedImage.key, urlInput.trim());
      if (response.error) {
        alert(`업데이트 실패: ${response.error}`);
      } else {
        setUploadSuccess(selectedImage.key);
        setUrlInput('');
        await refresh();
        setTimeout(() => {
          setUploadSuccess(null);
          setIsDialogOpen(false);
        }, 1500);
      }
    } catch (error) {
      alert('업데이트 중 오류가 발생했습니다.');
      console.error('Site image URL update error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const openEditDialog = (item: ImageItem) => {
    setSelectedImage(item);
    setUploadMode('file');
    setUrlInput('');
    setIsDialogOpen(true);
  };

  const getCurrentImageUrl = (key: string): string | undefined => {
    return images[key]?.url;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-gray-500">이미지 목록 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#0B2447]">사이트 이미지 관리</h3>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {IMAGE_CATEGORIES.map((category) => (
        <div key={category.name} className="border rounded-lg p-4">
          <h4 className="font-bold text-[#0B2447] mb-4">{category.name}</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.items.map((item) => {
              const currentUrl = getCurrentImageUrl(item.key);
              const hasImage = !!currentUrl;

              return (
                <div
                  key={item.key}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 rounded-md mb-2 overflow-hidden relative">
                    {hasImage ? (
                      <img
                        src={currentUrl}
                        alt={item.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    {uploadSuccess === item.key && (
                      <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-sm text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openEditDialog(item)}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    {hasImage ? '이미지 변경' : '이미지 추가'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedImage?.label} 이미지 변경
            </DialogTitle>
          </DialogHeader>

          {selectedImage && (
            <div className="space-y-4 mt-4">
              {/* Current Image Preview */}
              <div>
                <Label className="text-sm text-gray-600">현재 이미지</Label>
                <div className="aspect-video bg-gray-100 rounded-md mt-1 overflow-hidden">
                  {getCurrentImageUrl(selectedImage.key) ? (
                    <img
                      src={getCurrentImageUrl(selectedImage.key)}
                      alt={selectedImage.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={uploadMode === 'file' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setUploadMode('file')}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  파일 업로드
                </Button>
                <Button
                  variant={uploadMode === 'url' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setUploadMode('url')}
                >
                  <Link className="w-4 h-4 mr-1" />
                  URL 입력
                </Button>
              </div>

              {/* File Upload */}
              {uploadMode === 'file' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="site-image-upload"
                  />
                  <label htmlFor="site-image-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploading}
                      className="w-full cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? '업로드 중...' : '이미지 파일 선택'}
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG, GIF, WEBP (최대 10MB)
                  </p>
                </div>
              )}

              {/* URL Input */}
              {uploadMode === 'url' && (
                <div className="space-y-2">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={isUploading}
                  />
                  <Button
                    onClick={handleUrlUpdate}
                    disabled={isUploading || !urlInput.trim()}
                    className="w-full"
                  >
                    {isUploading ? '업데이트 중...' : 'URL로 업데이트'}
                  </Button>
                </div>
              )}

              {/* Success Message */}
              {uploadSuccess === selectedImage.key && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">이미지가 성공적으로 업데이트되었습니다!</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
