import React, { useState, useEffect } from 'react';
import { uploadApi, getImageUrl } from '../../src/api';
import { Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function ImageGallery() {
  const [category, setCategory] = useState<'members' | 'logos' | 'images'>('images');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadImages();
  }, [category]);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const response = await uploadApi.listImages(category);
      if (response.data) {
        setImages(response.data.files);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (imagePath: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await uploadApi.deleteImage(imagePath);
      if (response.data) {
        await loadImages();
        alert('이미지가 삭제되었습니다.');
      } else {
        alert(response.error || '삭제에 실패했습니다.');
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
    }
  };

  const copyUrl = (url: string) => {
    const fullUrl = getImageUrl(url);
    navigator.clipboard.writeText(fullUrl);
    alert('URL이 클립보드에 복사되었습니다.');
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Select value={category} onValueChange={(value: 'members' | 'logos' | 'images') => setCategory(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="members">멤버</SelectItem>
            <SelectItem value="logos">로고</SelectItem>
            <SelectItem value="images">일반</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={loadImages} disabled={isLoading}>
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4 text-sm text-gray-500">로딩 중...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-4 text-sm text-gray-500">이미지가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {images.map((imagePath, index) => (
            <div key={index} className="relative group">
              <img
                src={getImageUrl(imagePath)}
                alt={`Image ${index + 1}`}
                className="w-full h-20 object-cover rounded border cursor-pointer"
                onClick={() => copyUrl(imagePath)}
                title="클릭하여 URL 복사"
              />
              <button
                onClick={() => handleDelete(imagePath)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

