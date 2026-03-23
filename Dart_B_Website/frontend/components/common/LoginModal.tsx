import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { authApi, setToken } from '../../src/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  /** 로그인 모달이 어디서 트리거되었는지 (admin-gate: admin 페이지 접근 시) */
  triggerReason?: 'admin-gate' | 'general';
}

export function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  triggerReason = 'general',
}: LoginModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    general: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { username: '', password: '', general: '' };

    if (!formData.username) {
      newErrors.username = '아이디를 입력하세요';
    }
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력하세요';
    }

    setErrors(newErrors);

    if (!newErrors.username && !newErrors.password) {
      setIsLoading(true);
      try {
        const response = await authApi.login({
          username: formData.username,
          password: formData.password,
        });

        if (response.error) {
          setErrors({ ...newErrors, general: response.error });
        } else if (response.data) {
          setToken(response.data.access_token);
          // 로그인 성공 시 폼 초기화
          setFormData({ username: '', password: '' });
          setErrors({ username: '', password: '', general: '' });
          onLoginSuccess();
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '로그인 중 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
        setErrors({ ...newErrors, general: errorMessage });
        console.error('Login error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when user starts typing
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // 모달이 닫힐 때 폼 초기화
      setFormData({ username: '', password: '' });
      setErrors({ username: '', password: '', general: '' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="w-16 h-16 bg-[#0B2447] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">DB</span>
            </div>
            <span className="text-2xl font-bold text-[#0B2447]">LOGIN</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Username Field */}
          <div>
            <Label htmlFor="modal-username">아이디</Label>
            <Input
              id="modal-username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="mt-1"
              placeholder="아이디를 입력하세요"
              autoFocus
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="modal-password">비밀번호</Label>
            <Input
              id="modal-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1"
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-[#0B2447] hover:bg-[#0a1f3a] text-white"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>

          {/* General Error */}
          {errors.general && (
            <p className="text-red-500 text-sm text-center mt-2">
              {errors.general}
            </p>
          )}

          {/* Info for admin-gate */}
          {triggerReason === 'admin-gate' && (
            <p className="text-gray-500 text-sm text-center">
              관리자 페이지에 접근하려면 로그인이 필요합니다.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
