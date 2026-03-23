import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface PasswordResetPageProps {
  onNavigate: (page: string) => void;
}

export function PasswordResetPage({ onNavigate }: PasswordResetPageProps) {
  const [step, setStep] = useState(1); // 1: Account verification, 2: Verification code, 3: New password
  const [formData, setFormData] = useState({
    username: '',
    email: 'dartbofficial@naver.com',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = '아이디를 입력하세요';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Simulate sending verification code
      alert('인증번호가 이메일로 전송되었습니다.');
      setStep(2);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      newErrors.verificationCode = '6자리 인증번호를 입력하세요';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Simulate verification
      if (formData.verificationCode === '123456') {
        setStep(3);
      } else {
        setErrors({ verificationCode: '인증번호가 일치하지 않습니다' });
      }
    }
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = '새로운 비밀번호를 입력하세요';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '새로운 비밀번호를 입력하세요';
    }
    if (formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert('비밀번호 변경이 완료되었습니다.');
      setTimeout(() => {
        onNavigate('login');
      }, 1000);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#0B2447] mb-2">계정 정보 확인</h2>
        <p className="text-gray-600">아이디와 이메일을 입력하세요.</p>
      </div>

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

      <div>
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1"
          disabled
        />
      </div>

      <Button type="submit" className="w-full bg-[#0B2447] hover:bg-[#0a1f3a] text-white">
        인증번호 발급
      </Button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleStep2Submit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#0B2447] mb-2">인증번호를 입력하세요</h2>
      </div>

      <div>
        <Label htmlFor="verificationCode">인증번호 (6자리)</Label>
        <div className="flex space-x-2 mt-1">
          <Input
            id="verificationCode"
            name="verificationCode"
            type="text"
            value={formData.verificationCode}
            onChange={handleChange}
            className="flex-1"
            placeholder="123456"
            maxLength={6}
          />
          <Button type="submit" className="bg-[#0B2447] hover:bg-[#0a1f3a] text-white">
            확인
          </Button>
        </div>
        {errors.verificationCode && (
          <p className="text-red-500 text-sm mt-1">{errors.verificationCode}</p>
        )}
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleStep3Submit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#0B2447] mb-2">비밀번호 재발급</h2>
        <p className="text-gray-600">새로운 비밀번호를 입력하세요.</p>
      </div>

      <div>
        <Label htmlFor="newPassword">새로운 비밀번호</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
          className="mt-1"
          placeholder="새로운 비밀번호를 입력하세요"
        />
        {errors.newPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">새로운 비밀번호 확인</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="mt-1"
          placeholder="새로운 비밀번호를 입력하세요"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <Button type="submit" className="w-full bg-[#0B2447] hover:bg-[#0a1f3a] text-white">
        변경하기
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0B2447] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">DB</span>
            </div>
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Back to Login */}
          <div className="text-center mt-6">
            <button
              onClick={() => onNavigate('login')}
              className="text-sm text-[#0B2447] hover:underline"
            >
              로그인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}