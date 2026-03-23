import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useDynamicList, DynamicItem } from '../../src/useDynamicList';
import { Plus, Edit2, Trash2, RefreshCw, Check, GripVertical } from 'lucide-react';

// ─── Field schema (drives the editor form) ────────────────────────────────────
export interface FieldDef {
  key: string;
  label: string;
  multiline?: boolean;
  placeholder?: string;
}

export interface DynamicListManagerProps {
  /** Title shown in the admin panel */
  title: string;
  /** DB setting key, e.g. "history.entries" */
  settingKey: string;
  /** Default items (used when DB has nothing) */
  defaults: DynamicItem[];
  /** Field schema for the editor dialog */
  fields: FieldDef[];
  /** How to render a row preview in the list */
  renderPreview?: (item: DynamicItem) => { primary: string; secondary?: string };
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DynamicListManager({
  title,
  settingKey,
  defaults,
  fields,
  renderPreview,
}: DynamicListManagerProps) {
  const { items, isLoading, refresh, save } = useDynamicList(settingKey, defaults);
  const [editingItem, setEditingItem] = useState<DynamicItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const blankItem = (): DynamicItem => ({
    id: Date.now().toString(),
    ...Object.fromEntries(fields.map(f => [f.key, ''])),
  });

  const openAdd = () => { setEditingItem(blankItem()); setIsDialogOpen(true); };
  const openEdit = (item: DynamicItem) => { setEditingItem({ ...item }); setIsDialogOpen(true); };

  const handleSave = async () => {
    if (!editingItem) return;
    // validate first required field
    const firstField = fields[0];
    if (firstField && !String(editingItem[firstField.key] ?? '').trim()) {
      alert(`${firstField.label}은(는) 필수 입력 항목입니다.`);
      return;
    }
    setIsSaving(true);
    const isNew = !items.find(i => i.id === editingItem.id);
    const updated = isNew
      ? [...items, editingItem]
      : items.map(i => i.id === editingItem.id ? editingItem : i);

    const err = await save(updated);
    setIsSaving(false);
    if (err) { alert(`저장 실패: ${err}`); return; }
    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); setIsDialogOpen(false); }, 1200);
  };

  const handleDelete = async (id: string) => {
    const item = items.find(i => i.id === id);
    const label = item ? String(item[fields[0]?.key] ?? id) : id;
    if (!confirm(`"${label}" 항목을 삭제하시겠습니까?`)) return;
    const err = await save(items.filter(i => i.id !== id));
    if (err) alert(`삭제 실패: ${err}`);
  };

  const handleDrop = async (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    const from = items.findIndex(i => i.id === draggedId);
    const to = items.findIndex(i => i.id === targetId);
    const reordered = [...items];
    const [removed] = reordered.splice(from, 1);
    reordered.splice(to, 0, removed);
    setDragOver(null);
    const err = await save(reordered);
    if (err) alert(`순서 변경 실패: ${err}`);
  };

  const getPreview = (item: DynamicItem) => {
    if (renderPreview) return renderPreview(item);
    return {
      primary: String(item[fields[0]?.key] ?? '(항목)'),
      secondary: fields[1] ? String(item[fields[1].key] ?? '') : undefined,
    };
  };

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-gray-400" />
        <p className="text-sm text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-[#0B2447]">{title}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            size="sm"
            className="bg-[#0B2447] hover:bg-[#0a1f3a] text-white"
            onClick={openAdd}
          >
            <Plus className="w-3 h-3 mr-1" />
            추가
          </Button>
        </div>
      </div>

      <p className="text-xs text-gray-400">← 드래그하여 순서 변경 가능</p>

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-6 text-gray-400 border-2 border-dashed rounded-lg text-sm">
          항목이 없습니다. 「추가」 버튼으로 추가하세요.
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((item) => {
            const { primary, secondary } = getPreview(item);
            return (
              <div
                key={item.id}
                draggable
                onDragStart={e => e.dataTransfer.setData('id', item.id)}
                onDragOver={e => { e.preventDefault(); setDragOver(item.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => { e.preventDefault(); handleDrop(e.dataTransfer.getData('id'), item.id); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-grab active:cursor-grabbing
                  ${dragOver === item.id ? 'border-[#0B2447] bg-blue-50' : 'bg-gray-50 hover:bg-gray-100 border-transparent'}`}
              >
                <GripVertical className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{primary || '(비어 있음)'}</p>
                  {secondary && <p className="text-xs text-gray-500 truncate">{secondary}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(item)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem && items.find(i => i.id === editingItem.id) ? `${title} 편집` : `${title} 추가`}
            </DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-3 mt-2">
              {fields.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={`field-${field.key}`} className="text-sm">
                    {field.label}
                  </Label>
                  {field.multiline ? (
                    <textarea
                      id={`field-${field.key}`}
                      value={String(editingItem[field.key] ?? '')}
                      onChange={e => setEditingItem({ ...editingItem, [field.key]: e.target.value })}
                      rows={3}
                      disabled={isSaving}
                      placeholder={field.placeholder}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2447] resize-y"
                    />
                  ) : (
                    <Input
                      id={`field-${field.key}`}
                      value={String(editingItem[field.key] ?? '')}
                      onChange={e => setEditingItem({ ...editingItem, [field.key]: e.target.value })}
                      disabled={isSaving}
                      placeholder={field.placeholder}
                      className="mt-1"
                    />
                  )}
                </div>
              ))}

              {saveSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">저장되었습니다!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>취소</Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
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
