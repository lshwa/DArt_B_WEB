import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useDatathons, DatathonEntry, DEFAULT_DATATHONS } from '../../src/useDatathons';
import { Plus, Edit2, Trash2, RefreshCw, Check, GripVertical, Star, StarOff } from 'lucide-react';

// ─── Blank entry factory ───────────────────────────────────────────────────────
const blankEntry = (): DatathonEntry => ({
  id: Date.now().toString(),
  title: '',
  date: '',
  description: '',
  imageKey: 'datathon.angnal',
  latest: false,
  participants: '',
  achievement: '',
});

// ─── Component ────────────────────────────────────────────────────────────────
export function DataThonManager() {
  const { entries, isLoading, refresh, save } = useDatathons();
  const [editingEntry, setEditingEntry] = useState<DatathonEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);

  // ─── Open dialog ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingEntry(blankEntry());
    setIsDialogOpen(true);
  };

  const openEdit = (entry: DatathonEntry) => {
    setEditingEntry({ ...entry });
    setIsDialogOpen(true);
  };

  // ─── Save (add or update) ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editingEntry) return;
    if (!editingEntry.title.trim() || !editingEntry.date.trim()) {
      alert('제목과 날짜는 필수 입력 항목입니다.');
      return;
    }

    setIsSaving(true);
    const isNew = !entries.find(e => e.id === editingEntry.id);
    const updated = isNew
      ? [editingEntry, ...entries]
      : entries.map(e => e.id === editingEntry.id ? editingEntry : e);

    const err = await save(updated);
    setIsSaving(false);
    if (err) { alert(`저장 실패: ${err}`); return; }

    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); setIsDialogOpen(false); }, 1200);
  };

  // ─── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!confirm(`"${entry?.title}" 항목을 삭제하시겠습니까?`)) return;
    const err = await save(entries.filter(e => e.id !== id));
    if (err) alert(`삭제 실패: ${err}`);
  };

  // ─── Toggle latest ───────────────────────────────────────────────────────────
  const toggleLatest = async (id: string) => {
    const updated = entries.map(e => ({ ...e, latest: e.id === id ? !e.latest : e.latest }));
    const err = await save(updated);
    if (err) alert(`수정 실패: ${err}`);
  };

  // ─── Drag-to-reorder ────────────────────────────────────────────────────────
  const handleDrop = async (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    const from = entries.findIndex(e => e.id === draggedId);
    const to = entries.findIndex(e => e.id === targetId);
    const reordered = [...entries];
    const [removed] = reordered.splice(from, 1);
    reordered.splice(to, 0, removed);
    setDragOver(null);
    const err = await save(reordered);
    if (err) alert(`순서 변경 실패: ${err}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-gray-500">데이터톤 목록 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#0B2447]">데이터톤 연혁 관리</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            size="sm"
            className="bg-[#0B2447] hover:bg-[#0a1f3a] text-white"
            onClick={openAdd}
          >
            <Plus className="w-4 h-4 mr-1" />
            새 항목 추가
          </Button>
        </div>
      </div>

      <p className="text-xs text-gray-400">드래그하여 순서를 변경할 수 있습니다.</p>

      {/* Entry list */}
      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
          아직 데이터톤 항목이 없습니다. <br />「새 항목 추가」 버튼을 눌러 추가하세요.
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('id', entry.id)}
              onDragOver={(e) => { e.preventDefault(); setDragOver(entry.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => { e.preventDefault(); handleDrop(e.dataTransfer.getData('id'), entry.id); }}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-grab active:cursor-grabbing
                ${dragOver === entry.id ? 'border-[#0B2447] bg-blue-50' : 'bg-gray-50 hover:bg-gray-100 border-transparent'}`}
            >
              <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />

              {/* Latest badge dot */}
              <div className={`w-3 h-3 rounded-full shrink-0 ${entry.latest ? 'bg-red-500' : 'bg-gray-300'}`} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 truncate">{entry.title || '(제목 없음)'}</p>
                <p className="text-xs text-gray-500">{entry.date || '날짜 미정'}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  title={entry.latest ? '최신 표시 해제' : '최신으로 표시'}
                  onClick={() => toggleLatest(entry.id)}
                  className={entry.latest ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-600'}
                >
                  {entry.latest ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(entry)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(entry.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntry && entries.find(e => e.id === editingEntry.id) ? '데이터톤 항목 편집' : '새 데이터톤 항목 추가'}
            </DialogTitle>
          </DialogHeader>

          {editingEntry && (
            <div className="space-y-4 mt-2">
              {/* Title */}
              <div>
                <Label htmlFor="dt-title">제목 *</Label>
                <Input
                  id="dt-title"
                  value={editingEntry.title}
                  onChange={e => setEditingEntry({ ...editingEntry, title: e.target.value })}
                  placeholder="예: 앵날다쏘 (중앙대 DArt-B x 서강대 Parrot)"
                  className="mt-1"
                />
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="dt-date">날짜 *</Label>
                <Input
                  id="dt-date"
                  value={editingEntry.date}
                  onChange={e => setEditingEntry({ ...editingEntry, date: e.target.value })}
                  placeholder="예: 2024.11"
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="dt-desc">설명</Label>
                <textarea
                  id="dt-desc"
                  value={editingEntry.description}
                  onChange={e => setEditingEntry({ ...editingEntry, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2447] resize-y"
                  placeholder="이 데이터톤에 대한 간략한 설명"
                />
              </div>

              {/* Image Key */}
              <div>
                <Label htmlFor="dt-imgkey">이미지 키 (사이트 이미지 관리에서 설정)</Label>
                <Input
                  id="dt-imgkey"
                  value={editingEntry.imageKey}
                  onChange={e => setEditingEntry({ ...editingEntry, imageKey: e.target.value })}
                  placeholder="예: datathon.angnal"
                  className="mt-1 font-mono text-xs"
                />
                <p className="text-xs text-gray-400 mt-1">
                  위 이미지 관리 섹션에서 해당 키의 이미지를 업로드하세요.
                </p>
              </div>

              {/* Participants */}
              <div>
                <Label htmlFor="dt-participants">참가 팀 수</Label>
                <Input
                  id="dt-participants"
                  value={editingEntry.participants ?? ''}
                  onChange={e => setEditingEntry({ ...editingEntry, participants: e.target.value })}
                  placeholder="예: 15개 팀"
                  className="mt-1"
                />
              </div>

              {/* Achievement */}
              <div>
                <Label htmlFor="dt-achievement">성과</Label>
                <Input
                  id="dt-achievement"
                  value={editingEntry.achievement ?? ''}
                  onChange={e => setEditingEntry({ ...editingEntry, achievement: e.target.value })}
                  placeholder="예: DArt-B 팀 성과: 우수상 수상"
                  className="mt-1"
                />
              </div>

              {/* Latest toggle */}
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <input
                  type="checkbox"
                  id="dt-latest"
                  checked={editingEntry.latest}
                  onChange={e => setEditingEntry({ ...editingEntry, latest: e.target.checked })}
                  className="w-4 h-4 accent-red-500"
                />
                <Label htmlFor="dt-latest" className="cursor-pointer text-sm">
                  <span className="font-semibold text-red-600">최신 항목으로 표시</span>
                  <span className="text-gray-500 ml-2">(빨간 "최신" 배지가 표시됩니다)</span>
                </Label>
              </div>

              {/* Success */}
              {saveSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">저장되었습니다!</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !editingEntry.title.trim() || !editingEntry.date.trim()}
                  className="bg-[#0B2447] hover:bg-[#0a1f3a] text-white"
                >
                  {isSaving ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
