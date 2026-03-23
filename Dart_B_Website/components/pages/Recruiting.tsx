import React, { useState } from 'react';
import { PageBanner } from '../common/PageBanner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Download, Bell } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function Recruiting() {
  const [email, setEmail] = useState('');
  const [isRecruitingPeriod] = useState(false); // Change this based on actual recruiting period
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a database
    console.log('Email submitted:', email);
    setEmailSubmitted(true);
    setTimeout(() => {
      setShowEmailDialog(false);
      setEmailSubmitted(false);
      setEmail('');
    }, 2000);
  };

  const handleDownload = () => {
    if (!isRecruitingPeriod) {
      alert('모집 기간이 아닙니다.');
      return;
    }
    // In a real app, this would trigger file download
    alert('지원서 다운로드가 시작됩니다.');
  };

  const faqItems = [
    {
      question: 'DArt-B 지원 자격이 어떻게 되나요?',
      answer: '중앙대학교 재학생이면 학과 제한 없이 누구나 지원 가능합니다.'
    },
    {
      question: '프로그래밍 경험이 없어도 지원할 수 있나요?',
      answer: '네, 가능합니다. 기초부터 체계적으로 학습할 수 있는 커리큘럼을 제공합니다.'
    },
    {
      question: '학회 활동 시간은 어떻게 되나요?',
      answer: '매주 화요일 오후 7시에 정규 세션이 있으며, 스터디는 팀별로 조정합니다.'
    },
    {
      question: '학회비는 얼마인가요?',
      answer: '학기당 5만원이며, 교재비와 네트워킹 이벤트 비용이 포함됩니다.'
    }
  ];

  return (
    <div className="min-h-screen">
      <PageBanner title="RECRUITING" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Process Overview */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0B2447] mb-8">PROCESS OVERVIEW</h2>
            
            {/* Process Infographic */}
            <div className="bg-gray-50 rounded-[10px] p-8 mb-8">
              <div className="grid md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#0B2447] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">지원서 제출</h3>
                  <p className="text-gray-600 text-sm">온라인 지원서 작성 및 제출</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#0B2447] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">서류 심사</h3>
                  <p className="text-gray-600 text-sm">지원서 기반 1차 심사</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#0B2447] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">사전 과제 제출</h3>
                  <p className="text-gray-600 text-sm">1차 합격자 한정 사전과제 검토</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#0B2447] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">면접</h3>
                  <p className="text-gray-600 text-sm">개별 면접 진행</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#0B2447] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">5</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">최종 합격</h3>
                  <p className="text-gray-600 text-sm">합격자 발표 및 OT</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mb-16">
              {isRecruitingPeriod ? (
                <Button 
                  onClick={handleDownload}
                  className="bg-[#0B2447] hover:bg-[#0a1f3a] text-white px-8 py-3 text-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  지원서 다운받기
                </Button>
              ) : (
                <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#0B2447] hover:bg-[#0a1f3a] text-white px-8 py-3 text-lg">
                      <Bell className="w-5 h-5 mr-2" />
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
                        </div>
                        <Button type="submit" className="w-full bg-[#0B2447] hover:bg-[#0a1f3a]">
                          신청하기
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-green-600 font-bold">신청이 완료되었습니다!</p>
                        <p className="text-gray-600 text-sm mt-2">모집 시작 시 알림을 보내드립니다.</p>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-3xl font-bold text-[#0B2447] text-center mb-8">FAQ</h2>
            <div className="max-w-4xl mx-auto space-y-6">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-white rounded-[10px] shadow-lg p-6">
                  <h3 className="font-bold text-lg text-[#0B2447] mb-3">
                    Q. {item.question}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    A. {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}