import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Save, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { getToken } from '../../src/api';
import { ImageUpload } from './ImageUpload';

interface EditableBlockProps {
  children: React.ReactNode;
  onSave?: (content: string) => void;
  editable?: boolean;
  type?: 'text' | 'image' | 'history';
  imageUrl?: string;
  onImageChange?: (url: string) => void;
}

export function EditableBlock({ 
  children, 
  onSave, 
  editable = true,
  type = 'text',
  imageUrl,
  onImageChange
}: EditableBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editValue, setEditValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAdmin = !!getToken();

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (type === 'text' && typeof children === 'string') {
      setEditValue(children);
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  if (!isAdmin || !editable) {
    return <>{children}</>;
  }

  if (type === 'image') {
    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        {isHovered && (
          <div className="absolute top-2 right-2 flex gap-2">
            <ImageUpload
              category="images"
              currentImageUrl={imageUrl}
              onUploadSuccess={(url) => {
                if (onImageChange) {
                  onImageChange(url);
                }
              }}
              onUploadError={(error) => alert(error)}
              label=""
            />
          </div>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="relative">
        {type === 'text' ? (
          <Textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px]"
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
        )}
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            저장
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-1" />
            취소
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <button
          onClick={handleEdit}
          className="absolute -top-2 -right-2 bg-[#0B2447] text-white p-2 rounded-full shadow-lg hover:bg-[#0a1f3a] transition-colors opacity-0 group-hover:opacity-100"
          title="편집"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

