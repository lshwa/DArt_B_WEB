import React, { useState, useEffect } from 'react';
import { PageBanner } from '../common/PageBanner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Bell, ExternalLink, RefreshCw, Check } from 'lucide-react';
import { useDynamicList, DynamicItem } from '../../src/useDynamicList';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api/v1';

interface FormInfo {
  id: string;
  name: string;
  generation: number | null;
  form_url: string;
}

export function Recruiting() {
  const [email, setEmail] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  const [formInfo, setFormInfo] = useState<FormInfo | null>(null);
  const [formLoading, setFormLoading] = useState(true);

  interface FaqItem extends DynamicItem { question: string; answer: string; }
  const DEFAULT_FAQ: FaqItem[] = [
    { id: '1', question: 'DArt-B 지원 자격이 어떻게 되나요?', answer: '중앙대학교 재학생이면 학과 제한 없이 누구나 지원 가능합니다.' },
    { id: '2', question: '프로그래밍 경험이 없어도 지원할 수 있나요?', answer: '네, 가능합니다. 기초부터 체계적으로 학습할 수 있는 커리큘럼을 제공합니다.' },
    { id: '3', question: '학회 활동 시간은 어떻게 되나요?', answer: '매주 화요일 오후 7시에 정규 세션이 있으며, 스터디는 팀별로 조정합니다.' },
    { id: '4', question: '학회비는 얼마인가요?', answer: '학기당 5만원이며, 교재비와 네트워킹 이벤트 비용이 포함됩니다.' },
  ];
  const { items: faqItems } = useDynamicList<FaqItem>('recruiting.faq', DEFAULT_FAQ);

  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch(`${API_BASE_URL}/recruiting/form`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFormInfo(data.form ?? null);
      } catch {
        setFormInfo(null);
      } finally {
        setFormLoading(false);
      }
    }
    fetchForm();
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setIsSubmittingEmail(true);
    try {
      const res = await fetch(`${API_BASE_URL}/recruiting/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.detail || '오류가 발생했습니다.');
        return;
      }
      setEmailSubmitted(true);
      setTimeout(() => {
        setShowEmailDialog(false);
        setEmailSubmitted(false);
        setEmail('');
      }, 2000);
    } catch {
      setEmailError('서버 연결 오류가 발생했습니다.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const isRecruitingOpen = !!formInfo;

  return (
    <div className="min-h-screen">
      <PageBanner title="RECRUITING" />

      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Process Overview */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0B2447] mb-8">PROCESS OVERVIEW</h2>

            <div className="bg-gray-50 rounded-[10px] p-8 mb-8">
              <div className="grid md:grid-cols-5 gap-6">
                {[
                  { step: 1, title: '지원서 제출', desc: '온라인 지원서 작성 및 제출' },
                  { step: 2, title: '서류 심사', desc: '지원서 기반 1차 심사' },
                  { step: 3, title: '사전 과제 제출', desc: '1차 합격자 한정 사전과제 검토' },
                  { step: 4, title: '면접', desc: '개별 면접 진행' },
                  { step: 5, title: '최종 합격', desc: '합격자 발표 및 OT' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="text-center">
                    <div className="w-16 h-16 bg-[#0B2447] rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">{step}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-4">
              {formLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-[#0B2447]" />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  {isRecruitingOpen ? (
                    <a href={formInfo!.form_url} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-[#0B2447] hover:bg-[#0a1f3a] text-white px-10 py-3 text-lg">
                        <ExternalLink className="w-5 h-5 mr-2" />
                        {formInfo!.generation ? `${formInfo!.generation}기 지원하기` : '지원하기'}
                      </Button>
                    </a>
                  ) : (
                    <p className="text-gray-500 text-lg">현재 모집 기간이 아닙니다.</p>
                  )}

                  {/* 모집알림 신청 - 항상 표시 */}
                  <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="px-8 py-3 text-base border-[#0B2447] text-[#0B2447] hover:bg-[#0B2447] hover:text-white">
                        <Bell className="w-4 h-4 mr-2" />
                        모집알림 신청하기
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-center">모집알림 신청</DialogTitle>
                      </DialogHeader>
                      {!emailSubmitted ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="email">이메일 주소</Label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="이메일을 입력하세요"
                              required
                              className="mt-1"
                            />
                            {emailError && (
                              <p className="text-red-500 text-sm mt-1">{emailError}</p>
                            )}
                          </div>
                          <Button
                            type="submit"
                            disabled={isSubmittingEmail}
                            className="w-full bg-[#0B2447] hover:bg-[#0a1f3a]"
                          >
                            {isSubmittingEmail ? '신청 중...' : '신청하기'}
                          </Button>
                        </form>
                      ) : (
                        <div className="text-center py-6">
                          <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                          <p className="text-green-600 font-bold">신청이 완료되었습니다!</p>
                          <p className="text-gray-600 text-sm mt-2">모집 시작 시 알림을 보내드립니다.</p>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-[#0B2447] text-center mb-8">FAQ</h2>
            <div className="max-w-4xl mx-auto space-y-6">
              {faqItems.length === 0 ? (
                <p className="text-center text-gray-400 py-8">등록된 FAQ가 없습니다.</p>
              ) : (
                faqItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-[10px] shadow-lg p-6">
                    <h3 className="font-bold text-lg text-[#0B2447] mb-3">Q. {item.question}</h3>
                    <p className="text-gray-700 leading-relaxed">A. {item.answer}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
