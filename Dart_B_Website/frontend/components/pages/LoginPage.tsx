import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { authApi, setToken } from '../../src/api';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (status: boolean) => void;
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    general: ''
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
          onLogin(true);
          onNavigate('admin');
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
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
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0B2447] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">DB</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B2447]">LOGIN</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="mt-1"
                placeholder="아이디를 입력하세요"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
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
              <p className="text-red-500 text-sm text-center mt-2">{errors.general}</p>
            )}

            {/* Password Reset Link */}
            <div className="text-left">
              <button
                type="button"
                onClick={() => onNavigate('password-reset')}
                className="text-sm text-[#0B2447] hover:underline"
              >
                비밀번호 재발급
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}