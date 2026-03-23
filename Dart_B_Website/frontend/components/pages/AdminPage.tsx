import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { memberApi, Member, MemberCreate, MemberUpdate, uploadApi, getImageUrl, settingsApi, syncApi, SyncStatus } from '../../src/api';
import { Upload, Download, Plus, Edit, Trash2, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from '../common/ImageUpload';
import { ImageGallery } from '../common/ImageGallery';
import { SiteImageManager } from '../common/SiteImageManager';
import { SiteTextManager } from '../common/SiteTextManager';
import { DataThonManager } from '../common/DataThonManager';
import { DynamicListManager } from '../common/DynamicListManager';

interface AdminPageProps {
  onNavigate: (page: string) => void;
  onLogin: (status: boolean) => void;
}

export function AdminPage({ onNavigate, onLogin }: AdminPageProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<MemberCreate>({
    name: '',
    generation: 5,
    position: '',
    major: '',
    student_id: '',
    email: '',
    github: '',
    linkedin: '',
    instagram: '',
    profile_image_url: '',
    is_executive: false,
    is_active: true,
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadMembers();
    loadSyncStatus();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, selectedGeneration]);

  const loadSyncStatus = async () => {
    try {
      const response = await syncApi.getStatus();
      if (response.data) {
        setSyncStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const handleQuickSync = async () => {
    if (!syncStatus?.configured) {
      alert('Google Sheets 동기화가 설정되지 않았습니다.\n\n백엔드 .env 파일에 다음 환경변수가 필요합니다:\n- GOOGLE_SHEETS_ID\n- GOOGLE_SHEETS_API_KEY (또는 GOOGLE_API_KEY)');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await syncApi.syncMembers();
      if (response.data) {
        const { created, updated, count } = response.data;
        alert(`동기화 완료!\n\n총 ${count}명 동기화됨\n- 신규 생성: ${created}명\n- 업데이트: ${updated}명`);
        await loadMembers();
      } else {
        alert(`동기화 실패: ${response.error}`);
      }
    } catch (error) {
      alert('동기화 중 오류가 발생했습니다.');
    } finally {
      setIsSyncing(false);
    }
  };

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const response = await memberApi.getAll();
      if (response.data) {
        setMembers(response.data);
      } else {
        alert(response.error || '멤버 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterMembers = () => {
    if (selectedGeneration === 'all') {
      setFilteredMembers(members);
    } else {
      setFilteredMembers(members.filter(m => m.generation === parseInt(selectedGeneration)));
    }
  };

  const handleCreateMember = async () => {
    // 필수 필드 검증
    if (!formData.name || !formData.generation) {
      alert('이름과 기수는 필수 입력 항목입니다.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await memberApi.create(formData);
      if (response.data) {
        alert('멤버가 성공적으로 추가되었습니다.');
        await loadMembers();
        setIsDialogOpen(false);
        resetForm();
      } else {
        alert(response.error || '멤버 추가에 실패했습니다.');
        console.error('Create member error:', response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '오류가 발생했습니다.';
      alert(`멤버 추가 중 오류: ${errorMessage}`);
      console.error('Create member exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;
    
    // 필수 필드 검증
    if (!formData.name || !formData.generation) {
      alert('이름과 기수는 필수 입력 항목입니다.');
      return;
    }
    
    setIsLoading(true);
    try {
      const updateData: MemberUpdate = { ...formData };
      const response = await memberApi.update(editingMember.id, updateData);
      if (response.data) {
        alert('멤버 정보가 성공적으로 수정되었습니다.');
        await loadMembers();
        setIsDialogOpen(false);
        setEditingMember(null);
        resetForm();
      } else {
        alert(response.error || '멤버 수정에 실패했습니다.');
        console.error('Update member error:', response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '오류가 발생했습니다.';
      alert(`멤버 수정 중 오류: ${errorMessage}`);
      console.error('Update member exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    const member = members.find(m => m.id === id);
    const memberName = member ? member.name : '이 멤버';
    
    if (!confirm(`정말 ${memberName}을(를) 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    
    setIsLoading(true);
    try {
      const response = await memberApi.delete(id);
      if (response.data) {
        alert('멤버가 성공적으로 삭제되었습니다.');
        await loadMembers();
      } else {
        alert(response.error || '멤버 삭제에 실패했습니다.');
        console.error('Delete member error:', response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '오류가 발생했습니다.';
      alert(`멤버 삭제 중 오류: ${errorMessage}`);
      console.error('Delete member exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadPDF = async () => {
    if (!pdfFile) {
      alert('PDF 파일을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await memberApi.uploadPDF(pdfFile);
      if (response.data) {
        alert(`PDF 업로드 완료!\n생성: ${response.data.members_created}명\n업데이트: ${response.data.members_updated}명`);
        await loadMembers();
        setPdfFile(null);
      } else {
        alert(response.error || 'PDF 업로드에 실패했습니다.');
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      generation: 5,
      position: '',
      major: '',
      student_id: '',
      email: '',
      github: '',
      linkedin: '',
      instagram: '',
      profile_image_url: '',
      is_executive: false,
      is_active: true,
    });
  };

  const openEditDialog = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      generation: member.generation,
      position: member.position || '',
      major: member.major || '',
      student_id: member.student_id || '',
      email: member.email || '',
      github: member.github || '',
      linkedin: member.linkedin || '',
      instagram: member.instagram || '',
      profile_image_url: member.profile_image_url || '',
      is_executive: member.is_executive,
      is_active: member.is_active,
    });
    setIsDialogOpen(true);
  };


  const generations = Array.from(new Set(members.map(m => m.generation))).sort((a, b) => b - a);

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0B2447]">관리자 페이지</h1>
            <p className="text-gray-600 mt-2">멤버 정보를 관리할 수 있습니다.</p>
          </div>
          <div className="flex gap-4">
            {/* Quick Sync Button - Always visible */}
            <Button
              onClick={handleQuickSync}
              disabled={isSyncing || isLoading}
              className={syncStatus?.configured
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-400 hover:bg-gray-500 text-white"}
              title={syncStatus?.configured
                ? "Google Sheets에서 멤버 데이터 동기화"
                : "환경변수 설정 필요 (GOOGLE_SHEETS_ID, GOOGLE_SHEETS_API_KEY)"}
            >
              <Download className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? '동기화 중...' : 'Sync Members from Google Sheets'}
            </Button>
            <Button onClick={loadMembers} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-[#0B2447] mb-4">멤버 관리</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Add Member */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingMember(null); resetForm(); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  멤버 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingMember ? '멤버 수정' : '새 멤버 추가'}</DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>이름 *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="이름"
                    />
                  </div>
                  <div>
                    <Label>기수 *</Label>
                    <Input
                      type="number"
                      value={formData.generation}
                      onChange={(e) => setFormData({ ...formData, generation: parseInt(e.target.value) || 0 })}
                      placeholder="기수"
                    />
                  </div>
                  <div>
                    <Label>직책</Label>
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="직책"
                    />
                  </div>
                  <div>
                    <Label>전공</Label>
                    <Select
                      value={formData.major || ''}
                      onValueChange={(value) => setFormData({ ...formData, major: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="전공 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="경영학과">경영학과</SelectItem>
                        <SelectItem value="응용통계학과">응용통계학과</SelectItem>
                        <SelectItem value="경제학과">경제학과</SelectItem>
                        <SelectItem value="경영정보학과">경영정보학과</SelectItem>
                        <SelectItem value="산업경영공학과">산업경영공학과</SelectItem>
                        <SelectItem value="컴퓨터공학부">컴퓨터공학부</SelectItem>
                        <SelectItem value="소프트웨어학부">소프트웨어학부</SelectItem>
                        <SelectItem value="데이터사이언스학과">데이터사이언스학과</SelectItem>
                        <SelectItem value="수학과">수학과</SelectItem>
                        <SelectItem value="통계학과">통계학과</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>학번</Label>
                    <Input
                      value={formData.student_id}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      placeholder="학번"
                    />
                  </div>
                  <div>
                    <Label>이메일</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="이메일"
                    />
                  </div>
                  <div>
                    <Label>GitHub</Label>
                    <Input
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="GitHub URL"
                    />
                  </div>
                  <div>
                    <Label>LinkedIn</Label>
                    <Input
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    <Input
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="Instagram URL"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageUpload
                      category="members"
                      currentImageUrl={formData.profile_image_url}
                      onUploadSuccess={(url) => setFormData({ ...formData, profile_image_url: url })}
                      onUploadError={(error) => alert(error)}
                      customFilename={formData.name ? `${formData.name}_${formData.generation}기` : undefined}
                      label="프로필 이미지"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_executive}
                        onChange={(e) => setFormData({ ...formData, is_executive: e.target.checked })}
                      />
                      임원
                    </Label>
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                      활성 멤버
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    취소
                  </Button>
                  <Button
                    onClick={editingMember ? handleUpdateMember : handleCreateMember}
                    disabled={isLoading || !formData.name || !formData.generation}
                  >
                    {editingMember ? '수정' : '추가'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Upload PDF */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  PDF 업로드
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>PDF 파일 업로드</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <Label>PDF 파일 선택</Label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                  <Button
                    onClick={handleUploadPDF}
                    disabled={!pdfFile || isLoading}
                    className="mt-4 w-full"
                  >
                    업로드
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Image Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-[#0B2447] mb-4">이미지 관리</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Logo Upload */}
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">로고 관리</h3>
              <LogoUploadComponent />
            </div>

            {/* General Images */}
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">일반 이미지</h3>
              <ImageUpload
                category="images"
                onUploadSuccess={(url) => {
                  alert(`이미지가 업로드되었습니다: ${url}`);
                }}
                onUploadError={(error) => alert(error)}
                label="이미지 업로드"
              />
            </div>

            {/* Image Gallery */}
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">업로드된 이미지</h3>
              <ImageGallery />
            </div>
          </div>
        </div>

        {/* Site Image Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <SiteImageManager />
        </div>

        {/* Site Text Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <SiteTextManager />
        </div>

        {/* DataThon Timeline Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <DataThonManager />
        </div>

        {/* Dynamic Section Managers */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-bold text-[#0B2447] mb-6">페이지 섹션 관리</h3>
          <div className="space-y-8">

            {/* About Us — 연혁 */}
            <div className="border rounded-lg p-4">
              <DynamicListManager
                title="About Us — 연혁"
                settingKey="about.history"
                defaults={[
                  { id: '1', year: '2019', title: '1기 창립', description: '중앙대학교 경영학부 데이터 분석 학회 DArt-B 창립' },
                  { id: '2', year: '2020', title: '2기-3기 활동', description: '온라인 세션 도입 및 정규 커리큘럼 체계화' },
                  { id: '3', year: '2021', title: '4기-5기 활동', description: '연합 데이터톤 참여 시작 및 대외 활동 확대' },
                  { id: '4', year: '2024', title: '6기 현재', description: 'DArt-B의 밤 네트워킹 이벤트 신설 및 웹사이트 구축' },
                ]}
                fields={[
                  { key: 'year', label: '연도', placeholder: '예: 2024' },
                  { key: 'title', label: '제목', placeholder: '예: 6기 창립' },
                  { key: 'description', label: '설명', multiline: true, placeholder: '이 연도의 주요 활동을 입력하세요' },
                ]}
                renderPreview={(item) => ({ primary: `${item.year}  ${item.title}`, secondary: String(item.description ?? '') })}
              />
            </div>

            {/* Curriculum — 활동 항목 */}
            <div className="border rounded-lg p-4">
              <DynamicListManager
                title="커리큘럼 활동 항목"
                settingKey="curriculum.items"
                defaults={[
                  { id: '1', title: '토이프로젝트', description: '학기 중 진행되는 토이프로젝트를 통해 실제 데이터를 활용한 분석 경험을 쌓습니다.', imageKey: 'curriculum.assignment' },
                  { id: '2', title: '학술제', description: '매 학기 말에 진행되는 학술제에서는 한 학기 동안의 학습 성과를 발표합니다.', imageKey: 'curriculum.study' },
                  { id: '3', title: '지도교수님/연사 특강', description: '지도교수님과 외부 전문가를 모신 특강을 통해 최신 트렌드와 실무 노하우를 학습합니다.', imageKey: 'home.curriculum.session' },
                ]}
                fields={[
                  { key: 'title', label: '제목', placeholder: '예: 토이프로젝트' },
                  { key: 'description', label: '설명', multiline: true, placeholder: '이 커리큘럼 항목에 대한 설명' },
                  { key: 'imageKey', label: '이미지 키', placeholder: '예: curriculum.assignment' },
                ]}
              />
            </div>

            {/* Recruiting — FAQ */}
            <div className="border rounded-lg p-4">
              <DynamicListManager
                title="모집 FAQ"
                settingKey="recruiting.faq"
                defaults={[
                  { id: '1', question: 'DArt-B 지원 자격이 어떻게 되나요?', answer: '중앙대학교 재학생이면 학과 제한 없이 누구나 지원 가능합니다.' },
                  { id: '2', question: '프로그래밍 경험이 없어도 지원할 수 있나요?', answer: '네, 가능합니다. 기초부터 체계적으로 학습할 수 있는 커리큘럼을 제공합니다.' },
                  { id: '3', question: '학회 활동 시간은 어떻게 되나요?', answer: '매주 화요일 오후 7시에 정규 세션이 있으며, 스터디는 팀별로 조정합니다.' },
                  { id: '4', question: '학회비는 얼마인가요?', answer: '학기당 5만원이며, 교재비와 네트워킹 이벤트 비용이 포함됩니다.' },
                ]}
                fields={[
                  { key: 'question', label: '질문', placeholder: '예: 지원 자격이 어떻게 되나요?' },
                  { key: 'answer', label: '답변', multiline: true, placeholder: '답변을 입력하세요' },
                ]}
                renderPreview={(item) => ({ primary: `Q. ${item.question}`, secondary: `A. ${String(item.answer ?? '')}` })}
              />
            </div>

          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4">
            <Label>기수 필터:</Label>
            <Select value={selectedGeneration} onValueChange={setSelectedGeneration}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {generations.map((gen) => (
                  <SelectItem key={gen} value={gen.toString()}>
                    {gen}기
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-gray-600">
              총 {filteredMembers.length}명
            </span>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {isLoading && !members.length ? (
            <div className="text-center py-12">로딩 중...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">멤버가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">이름</th>
                    <th className="text-left p-2">기수</th>
                    <th className="text-left p-2">직책</th>
                    <th className="text-left p-2">전공</th>
                    <th className="text-left p-2">이메일</th>
                    <th className="text-left p-2">임원</th>
                    <th className="text-left p-2">활성</th>
                    <th className="text-left p-2">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{member.name}</td>
                      <td className="p-2">{member.generation}기</td>
                      <td className="p-2">{member.position || '-'}</td>
                      <td className="p-2">{member.major || '-'}</td>
                      <td className="p-2">{member.email || '-'}</td>
                      <td className="p-2">{member.is_executive ? '✓' : '-'}</td>
                      <td className="p-2">{member.is_active ? '✓' : '-'}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(member)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 로고 업로드 컴포넌트
function LogoUploadComponent() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 확인 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.');
      return;
    }

    setIsUploading(true);
    try {
      const response = await settingsApi.uploadLogo(file);
      if (response.error) {
        alert(`업로드 실패: ${response.error}`);
      } else if (response.data) {
        alert('로고가 업로드되었습니다! 페이지를 새로고침하면 변경사항이 적용됩니다.');
        // 페이지 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      alert('업로드 중 오류가 발생했습니다.');
      console.error('Logo upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
        id="logo-upload"
      />
      <label htmlFor="logo-upload">
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          className="w-full cursor-pointer"
          asChild
        >
          <span>
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? '업로드 중...' : '로고 업로드'}
          </span>
        </Button>
      </label>
      <p className="text-xs text-gray-500 mt-2">
        JPG, PNG, GIF, WEBP, SVG (최대 10MB)
      </p>
      <p className="text-xs text-gray-400 mt-1">
        업로드 후 페이지가 자동으로 새로고침됩니다.
      </p>
    </div>
  );
}

