import React from 'react';
import { PageBanner } from '../common/PageBanner';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

export function Rules() {
  const handlePDFDownload = () => {
    // In a real app, this would trigger PDF download
    alert('DArt-B 회칙 PDF 다운로드가 시작됩니다.');
  };

  return (
    <div className="min-h-screen">
      <PageBanner title="RULES" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0B2447]">DArt-B 회칙</h2>
          </div>

          {/* Chapter 1 - Visible Content */}
          <div className="bg-white rounded-[10px] shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-[#0B2447] text-center mb-8">제1장 총칙</h3>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <div>
                <h4 className="font-bold text-lg text-[#0B2447] mb-3">제1조 (명칭)</h4>
                <p>본 학회는 DArt-B(Data Analysis road to Business)라 한다.</p>
              </div>

              <div>
                <h4 className="font-bold text-lg text-[#0B2447] mb-3">제2조 (목적)</h4>
                <p>
                  본 학회는 데이터 분석을 통한 비즈니스 인사이트 도출 및 의사결정 역량 향상을 목적으로 하며, 
                  체계적인 교육과 실습을 통해 전문 인재 양성에 기여함을 목적으로 한다.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-lg text-[#0B2447] mb-3">제3조 (소재지)</h4>
                <p>본 학회의 소재지는 중앙대학교 서울캠퍼스로 한다.</p>
              </div>

              <div>
                <h4 className="font-bold text-lg text-[#0B2447] mb-3">제4조 (사업)</h4>
                <p>본 학회는 다음과 같은 사업을 수행한다:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>정규 세션 및 스터디 활동</li>
                  <li>프로젝트 및 대회 참여</li>
                  <li>학술제 및 발표회 개최</li>
                  <li>네트워킹 이벤트 및 특강 운영</li>
                  <li>기타 학회 목적 달성에 필요한 사업</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg text-[#0B2447] mb-3">제5조 (구성원)</h4>
                <p>
                  본 학회의 구성원은 중앙대학교 재학생으로서 학회의 목적에 동의하고 
                  정해진 절차를 거쳐 가입한 회원으로 한다.
                </p>
              </div>
            </div>
          </div>

          {/* PDF Download Section */}
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              전체 회칙은 PDF 파일로 다운로드하여 확인하실 수 있습니다.
            </p>
            <Button 
              onClick={handlePDFDownload}
              className="bg-[#0B2447] hover:bg-[#0a1f3a] text-white px-8 py-3"
            >
              <Download className="w-5 h-5 mr-2" />
              PDF 다운받기
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}