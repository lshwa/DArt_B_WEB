import React, { useState } from 'react';
import { PageBanner } from '../common/PageBanner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Download, Bell, FileText, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useDynamicList, DynamicItem } from '../../src/useDynamicList';

export function Recruiting() {
  const [email, setEmail] = useState('');
  const [isRecruitingPeriod] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  interface FaqItem extends DynamicItem { question: string; answer: string; }

  const DEFAULT_FAQ: FaqItem[] = [
    { id: '1', question: 'DArt-B 지원 자격이 어떻게 되나요?', answer: '중앙대학교 재학생이면 학과 제한 없이 누구나 지원 가능합니다.' },
    { id: '2', question: '프로그래밍 경험이 없어도 지원할 수 있나요?', answer: '네, 가능합니다. 기초부터 체계적으로 학습할 수 있는 커리큘럼을 제공합니다.' },
    { id: '3', question: '학회 활동 시간은 어떻게 되나요?', answer: '매주 화요일 오후 7시에 정규 세션이 있으며, 스터디는 팀별로 조정합니다.' },
    { id: '4', question: '학회비는 얼마인가요?', answer: '학기당 5만원이며, 교재비와 네트워킹 이벤트 비용이 포함됩니다.' },
  ];
  const { items: faqItems } = useDynamicList<FaqItem>('recruiting.faq', DEFAULT_FAQ);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');

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
    if (!isRecruitingPeriod && !pdfUrl && !pdfFile) {
      alert('모집 기간이 아닙니다.');
      return;
    }
    
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = '지원서.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert('지원서 파일이 없습니다.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setShowPdfPreview(true);
      // PDF 페이지 수 계산 (간단한 방법)
      setTotalPages(1); // 실제로는 PDF.js를 사용해야 함
    } else {
      alert('PDF 파일만 업로드 가능합니다.');
    }
  };

  const handleGoogleDriveLoad = () => {
    if (!googleDriveUrl) {
      alert('Google Drive URL을 입력해주세요.');
      return;
    }
    
    // Google Drive URL에서 파일 ID 추출
    const match = googleDriveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      const fileId = match[1];
      // Google Drive 공유 링크를 직접 다운로드 링크로 변환
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      setPdfUrl(downloadUrl);
      setShowPdfPreview(true);
    } else {
      alert('올바른 Google Drive URL을 입력해주세요.');
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };


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
            <div className="mb-16 space-y-4">
              {/* PDF 미리보기 및 다운로드 */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4">
                  <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-[#0B2447] hover:bg-[#0a1f3a] text-white px-8 py-3 text-lg"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        지원서 미리보기
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle>지원서 미리보기</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-auto bg-gray-100 p-4">
                        {pdfUrl ? (
                          <div className="flex justify-center">
                            <iframe
                              src={pdfUrl}
                              className="w-full border-0"
                              style={{ height: `${600 * (zoomLevel / 100)}px` }}
                              title="PDF Preview"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-96 text-gray-500">
                            PDF 파일을 선택하거나 Google Drive URL을 입력해주세요.
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={handleZoomOut}>
                            <ZoomOut className="w-4 h-4" />
                          </Button>
                          <span className="text-sm">{zoomLevel}%</span>
                          <Button variant="outline" size="sm" onClick={handleZoomIn}>
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-sm">{currentPage} / {totalPages}</span>
                          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button onClick={handleDownload}>
                          <Download className="w-4 h-4 mr-2" />
                          다운로드
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {isRecruitingPeriod && (
                    <Button 
                      onClick={handleDownload}
                      variant="outline"
                      className="px-8 py-3 text-lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      지원서 다운받기
                    </Button>
                  )}
                </div>

                {/* PDF 업로드 및 Google Drive 연동 */}
                <div className="flex gap-4 items-center">
                  <div>
                    <Label htmlFor="pdf-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <FileText className="w-4 h-4 mr-2" />
                          파일 선택
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Google Drive URL 입력"
                      value={googleDriveUrl}
                      onChange={(e) => setGoogleDriveUrl(e.target.value)}
                      className="w-64"
                    />
                    <Button onClick={handleGoogleDriveLoad} variant="outline">
                      불러오기
                    </Button>
                  </div>
                </div>
              </div>

              {!isRecruitingPeriod && (
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
              {faqItems.length === 0 ? (
                <p className="text-center text-gray-400 py-8">등록된 FAQ가 없습니다.</p>
              ) : (
                faqItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-[10px] shadow-lg p-6">
                    <h3 className="font-bold text-lg text-[#0B2447] mb-3">
                      Q. {item.question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      A. {item.answer}
                    </p>
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