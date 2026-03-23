import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadApi, getImageUrl } from '../../src/api';

interface ImageUploadProps {
  category?: 'members' | 'logos' | 'images';
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: string) => void;
  customFilename?: string;
  label?: string;
  className?: string;
}

export function ImageUpload({
  category = 'images',
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  customFilename,
  label,
  className = '',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  // currentImageUrl이 있으면 getImageUrl로 변환하여 미리보기 표시
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl ? getImageUrl(currentImageUrl) : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // currentImageUrl이 변경되면 미리보기 업데이트
  useEffect(() => {
    if (currentImageUrl) {
      setPreview(getImageUrl(currentImageUrl));
    } else {
      setPreview(null);
    }
  }, [currentImageUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      onUploadError?.('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await uploadApi.uploadImage(file, category, customFilename);
      if (response.error) {
        onUploadError?.(response.error);
        setPreview(null);
      } else if (response.data) {
        // 백엔드에서 받은 상대 경로를 그대로 저장 (예: /uploads/members/filename.jpg)
        // 미리보기용으로는 전체 URL 사용
        const previewUrl = getImageUrl(response.data.url);
        setPreview(previewUrl);
        // 데이터베이스에는 상대 경로만 저장
        onUploadSuccess(response.data.url);
      }
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.');
      setPreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadSuccess('');
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <div className="flex items-center gap-4">
        {/* 이미지 미리보기 */}
        {preview && (
          <div className="relative w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 업로드 버튼 */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`image-upload-${category}`}
          />
          <label htmlFor={`image-upload-${category}`}>
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              className="cursor-pointer"
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? '업로드 중...' : preview ? '이미지 변경' : '이미지 업로드'}
              </span>
            </Button>
          </label>
          {!preview && (
            <p className="text-xs text-gray-500">
              JPG, PNG, GIF, WEBP, SVG (최대 10MB)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

