'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Folder, File, GripVertical, X } from 'lucide-react';

// 이미지 경로 처리를 위한 유틸 함수
const getImagePath = (imageName: string): string => {
  const cleanPath = imageName.trim();
  // 이미 http 또는 https로 시작하는 경우 그대로 반환
  if (cleanPath.startsWith('http')) {
    return cleanPath;
  }
  // 여러 경로 시도 (Next.js public 경로 구조에 맞춤)
  return `/images/datas/${cleanPath}`;
};

// 타입 정의
export type TemplateItem = {
  id: number;
  order: number;
  type: 'text' | 'image';
  content: string | string[];
};
export type Template = {
  id?: number;
  name: string;
  description: string;
  items: TemplateItem[];
};
interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (template: Template) => void;
  initialTemplate: Template;
}

function SortableItem({ id, item, onChange, onRemove, onSelectImage }: {
  id: number;
  item: TemplateItem;
  onChange: (id: number, patch: Partial<TemplateItem>) => void;
  onRemove: (id: number) => void;
  onSelectImage: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  // sensors for nested image DnD
  const imgSensors = useSensors(useSensor(PointerSensor));
  // 이미지 미리보기 상태
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center justify-between mb-2 bg-gray-50 rounded p-2"
    >
      {/* 순번 및 핸들 아이콘만 드래그 가능 */}
      <div className="flex items-center gap-1">
        <span className="w-6 text-xs text-gray-600 text-center">{item.order}</span>
        <GripVertical {...attributes} {...listeners} className="cursor-grab text-gray-400" />
      </div>
      <div className="flex items-center gap-2 ml-2">
        {item.type === 'text' ? (
          <textarea
            value={item.content as string}
            onChange={e => onChange(item.id, { content: e.target.value })}
            className="border rounded px-2 py-1 w-40 text-xs"
            placeholder="메시지 내용"
          />
        ) : (
          // 이미지 content가 있으면 preview, 없으면 placeholder
          Array.isArray(item.content) && item.content.length > 0 ? (
            <DndContext sensors={imgSensors} collisionDetection={closestCenter} onDragEnd={e => {
              const { active, over } = e;
              if (over && active.id !== over.id) {
                const files = Array.isArray(item.content) ? item.content : [item.content];
                const from = files.findIndex(f => `${id}-${f}` === active.id);
                const to = files.findIndex(f => `${id}-${f}` === over.id);
                const newFiles = arrayMove(files, from, to);
                onChange(item.id, { content: newFiles });
              }
            }}>
              <SortableContext items={item.content.map(f => `${id}-${f}`)} strategy={horizontalListSortingStrategy}>
                <div className="flex gap-1">
                  {item.content.map(name => {
                    // 이미지 경로 처리 방식 수정
                    const cleanPath = name.trim();
                    const imgSrc = getImagePath(name);

                    return (
                      <div 
                        key={name} 
                        id={`${id}-${name}`} 
                        className="h-10 w-10 cursor-pointer relative"
                        onClick={() => setPreviewImage(imgSrc)}
                      >
                        <Image 
                          src={imgSrc} 
                          alt={name} 
                          width={40} 
                          height={40}
                          className="object-cover rounded border"
                          style={{ width: '100%', height: '100%' }}
                          onError={(e) => {
                            // 이미지 로드 실패 시 대체 UI 표시
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            
                            // 부모 요소에 fallback UI 삽입
                            const parent = target.parentElement;
                            if (parent) {
                              const fallback = document.createElement('div');
                              fallback.className = 'h-full w-full bg-gray-100 flex items-center justify-center text-xs text-gray-400';
                              fallback.innerHTML = 'No Image';
                              parent.appendChild(fallback);
                            }
                          }}
                          unoptimized // 외부 또는 동적 이미지 경로를 위해 최적화 비활성화
                        />
                      </div>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="h-10 w-10 bg-gray-100 border rounded flex items-center justify-center text-xs text-gray-400">
              No Image
            </div>
          )
        )}
      </div>
      {/* 삭제 및 이미지선택 버튼 */}
      <div className="flex items-center gap-2 ml-auto">
        {item.type === 'image' ? (
          <button className="text-xs px-2 py-1 border rounded" onClick={() => onSelectImage(item.id)}>이미지 선택</button>
        ) : null}
        <button className="text-xs px-2 py-1 text-red-500" onClick={() => onRemove(item.id)}>삭제</button>
      </div>

      {/* 이미지 미리보기 모달 */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative bg-white p-3 rounded shadow-lg max-w-3xl">
            <button 
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
              onClick={() => setPreviewImage(null)}
            >
              <X size={20} className="text-gray-600" />
            </button>
            <Image
              src={previewImage}
              alt="이미지 미리보기"
              width={720}
              height={480}
              style={{ maxHeight: '80vh', width: 'auto' }}
              className="object-contain"
              unoptimized
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = '/placeholder-image.png'; // 기본 이미지로 대체
                target.style.width = '300px';
                target.style.height = '200px';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplateModal({ open, onClose, onSave, initialTemplate }: TemplateModalProps) {
  const [template, setTemplate] = useState<Template>(initialTemplate);
  const [dirty, setDirty] = useState(false);

  // 개별 이미지 항목 선택 모달 state
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [currentDir, setCurrentDir] = useState('');
  const [fileList, setFileList] = useState<{ name: string; isDir: boolean }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  // 디렉토리별 이미지 선택 제약: 첫 선택 시 폴더 고정
  const [selectionFolder, setSelectionFolder] = useState<string | null>(null);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  // 마우스 위치 저장 for preview
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectingItemId, setSelectingItemId] = useState<number | null>(null);
  // 현재 선택한 이미지 미리보기
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  // 메시지 리스트 컨테이너 ref for auto-scroll
  const listRef = useRef<HTMLDivElement>(null);

  // 아이템 업데이트 함수 추가
  const updateItem = (id: number, patch: Partial<TemplateItem>) => {
    setTemplate(t => ({
      ...t,
      items: t.items.map(item => item.id === id ? { ...item, ...patch } : item)
    }));
    setDirty(true);
  };

  // 새 이미지 메시지 항목 생성 후 바로 파일 선택 모달 열기
  const handleAddImageItem = () => {
    const newId = Date.now();
    setTemplate(t => ({
      ...t,
      items: [
        ...t.items,
        { id: newId, order: t.items.length + 1, type: 'image', content: [] }
      ]
    }));
    setDirty(true);
    setSelectingItemId(newId);
    setCurrentDir('');
    setFileModalOpen(true);
  };

  // 서버로부터 현재 디렉토리 파일 목록 조회
  useEffect(() => {
    if (fileModalOpen) {
      apiClient.get('/api/templates/image-files', { params: { path: currentDir } })
        .then(res => setFileList(res.data.items || []))
        .catch(() => setFileList([]));
    }
  }, [fileModalOpen, currentDir]);

  // fileModalOpen 시마다 폴더 선택 초기화
  useEffect(() => {
    if (fileModalOpen) {
      setSelectionFolder(null);
      setSelectedFiles([]);
    }
  }, [fileModalOpen]);

  // 모달이 열릴 때마다 초기값으로 리셋
  useEffect(() => {
    if (!open) return;
    // If editing an existing template, fetch full items from server to ensure data is loaded
    if (initialTemplate.id) {
      apiClient.get(`/api/templates/${initialTemplate.id}`)
        .then(res => {
          const tpl = res.data;
          setTemplate({
            ...tpl,
            items: Array.isArray(tpl.items)
              ? tpl.items.map(item => ({
                  ...item,
                  content: item.type === 'image' && typeof item.content === 'string'
                    ? item.content.split(',').map(s => s.trim())
                    : item.content
                }))
              : []
          });
          setDirty(false);
        });
    } else {
      setTemplate({
        ...initialTemplate,
        items: Array.isArray(initialTemplate.items)
          ? initialTemplate.items.map(item => ({
              ...item,
              content: item.type === 'image' && typeof item.content === 'string'
                ? item.content.split(',').map(s => s.trim())
                : item.content
            }))
          : []
      });
      setDirty(false);
    }
    // 이미지 선택 모달 초기화
    setCurrentDir('');
    setSelectedFiles([]);
  }, [open, initialTemplate]);

  // 메시지 시퀀스 추가/삭제/수정/순서변경
  const addItem = (type: 'text' | 'image', content = '') => {
    setTemplate(t => ({
      ...t,
      items: [
        ...t.items,
        { id: Date.now(), order: t.items.length + 1, type, content }
      ]
    }));
    setDirty(true);
  };
  // 아이템 수가 변할 때마다 리스트 하단으로 자동 스크롤
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [template.items.length]);
  const removeItem = (id: number) => {
    setTemplate(t => ({
      ...t,
      items: t.items.filter(item => item.id !== id).map((item, i) => ({ ...item, order: i + 1 }))
    }));
    setDirty(true);
  };

  // dnd-kit 드래그앤드랍
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTemplate(t => {
      const oldIndex = t.items.findIndex(i => i.id === active.id);
      const newIndex = t.items.findIndex(i => i.id === over.id);
      const newItems = arrayMove(t.items, oldIndex, newIndex).map((item, i) => ({ ...item, order: i + 1 }));
      return { ...t, items: newItems };
    });
    setDirty(true);
  };

  // 바깥 클릭 감지
  const modalRef = useRef<HTMLDivElement>(null);
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      if (dirty) {
        if (!window.confirm('저장되지 않았습니다. 정말 닫으시겠습니까?')) return;
      }
      onClose();
    }
  };

  // 닫기 버튼
  const handleClose = () => {
    if (dirty) {
      if (!window.confirm('저장되지 않았습니다. 정말 닫으시겠습니까?')) return;
    }
    onClose();
  };

  // 저장 버튼
  const handleSave = () => {
    if (!template.name.trim()) {
      alert('템플릿명을 입력하세요.');
      return;
    }
    if (!Array.isArray(template.items) || template.items.length === 0) {
      alert('최소 1개 이상의 메시지를 추가하세요.');
      return;
    }
    onSave(template);
    setDirty(false);
    onClose();
  };

  // 이미지 미리보기 표시 함수
  const showImagePreview = (imagePath: string) => {
    setSelectedImagePreview(getImagePath(imagePath));
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded shadow-lg w-full max-w-lg p-6 relative"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* 템플릿 폼 내용 */}
        <input
          className="border rounded px-2 py-1 w-full mb-2"
          placeholder="템플릿명"
          value={template.name}
          onChange={e => { setTemplate({ ...template, name: e.target.value }); setDirty(true); }}
        />
        <textarea
          className="border rounded px-2 py-1 w-full mb-2"
          placeholder="설명"
          value={template.description}
          onChange={e => { setTemplate({ ...template, description: e.target.value }); setDirty(true); }}
        />
        <div className="mb-2">
          <div className="font-bold mb-1">메시지</div>
          {Array.isArray(template.items) && template.items.length === 0 && <div className="text-xs text-gray-400">메시지를 추가하세요.</div>}
          <div ref={listRef} className="max-h-64 overflow-y-auto pr-1">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={template.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                {template.items.map(item => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    item={item}
                    onChange={updateItem}
                    onRemove={removeItem}
                    onSelectImage={(id) => { setSelectingItemId(id); setFileModalOpen(true); }}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => addItem('text')}
              className="border rounded px-2 h-8 text-xs"
            >텍스트 추가</button>
            <button
              type="button"
              onClick={handleAddImageItem}
              className="border rounded px-2 h-8 text-xs"
            >이미지 추가</button>
          </div>
        </div>
        {/* 하단 버튼 */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="border rounded px-4 py-2 text-xs"
            onClick={handleClose}
          >
            닫기
          </button>
          <button
            className="bg-blue-500 text-white rounded px-4 py-2 text-xs"
            onClick={handleSave}
          >
            저장
          </button>
        </div>
      </div>
      {/* 이미지 파일 브라우저 모달 */}
      {fileModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onMouseDown={() => setFileModalOpen(false)}
        >
          <div
            className="bg-white p-4 rounded shadow-lg max-w-md w-full"
            onMouseDown={e => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-2">이미지 선택</h3>
            {/* 상위 이동 버튼 */}
            <button onClick={() => setCurrentDir(dir => dir.split('/').slice(0,-1).join('/'))} disabled={!currentDir} className="text-sm underline mb-2">상위 폴더로 이동</button>
            <ul className="h-48 overflow-y-auto border p-2 mb-2">
              {fileList.map(item => {
                if (item.isDir) {
                  return (
                    <li key={item.name} className="flex items-center gap-2 p-1">
                      <Folder className="h-4 w-4 text-gray-600"/>
                      <span
                        className="cursor-pointer font-semibold text-blue-600"
                        onClick={() => setCurrentDir(prev => prev ? `${prev}/${item.name}` : item.name)}
                      >{item.name}</span>
                    </li>
                  );
                }
                return (
                  <li key={item.name}
                    className="flex items-center justify-between p-1 hover:bg-gray-100"
                    onMouseMove={e => {
                      setHoveredFile(item.name);
                      setHoverPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setHoveredFile(null)}
                  >
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-gray-400"/>
                      <span 
                        className="cursor-pointer"
                        onClick={() => showImagePreview(currentDir ? `${currentDir}/${item.name}` : item.name)}
                      >
                        {item.name}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      value={item.name}
                      checked={selectedFiles.includes(item.name)}
                      disabled={selectionFolder !== null && selectionFolder !== currentDir}
                      onChange={e => {
                        if (selectionFolder && selectionFolder !== currentDir) return;
                        const v = e.target.value;
                        if (!selectionFolder) setSelectionFolder(currentDir);
                        setSelectedFiles(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v]);
                      }}
                    />
                  </li>
                );
              })}
            </ul>
            {/* hover 파일 미리보기: 커서 위치 추적 */}
            {hoveredFile && (
              <Image
                src={`/images/datas/${currentDir ? `${currentDir}/` : ''}${hoveredFile}`}
                alt="preview"
                width={200}
                height={200}
                style={{
                  position: 'fixed',
                  left: hoverPos.x + 12,
                  top: hoverPos.y + 12,
                  maxHeight: '200px',
                  pointerEvents: 'none',
                  zIndex: 60,
                }}
                className="border shadow"
                onError={(e) => {
                  // 이미지 로드 실패 시 표시하지 않음
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                }}
                unoptimized // 외부 또는 동적 이미지 경로를 위해 최적화 비활성화
              />
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setFileModalOpen(false)} className="px-3 py-1 border text-xs">취소</button>
              <button
                onClick={() => {
                  if (selectingItemId !== null && selectedFiles.length > 0) {
                    const files = selectedFiles.map(name => currentDir ? `${currentDir}/${name}` : name);
                    updateItem(selectingItemId, { content: files });
                  }
                  setFileModalOpen(false);
                }}
                disabled={selectedFiles.length === 0}
                className={`px-3 py-1 text-xs ${selectedFiles.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
              >선택 적용</button>
            </div>

            {/* 이미지 파일 선택 모달 내 미리보기 */}
            {selectedImagePreview && (
              <div 
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]"
                onClick={() => setSelectedImagePreview(null)}
              >
                <div className="relative bg-white p-3 rounded shadow-lg max-w-3xl">
                  <button 
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImagePreview(null);
                    }}
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                  <Image
                    src={selectedImagePreview}
                    alt="이미지 미리보기"
                    width={720}
                    height={480}
                    style={{ maxHeight: '80vh', width: 'auto' }}
                    className="object-contain"
                    unoptimized
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = '/placeholder-image.png';
                      target.style.width = '300px';
                      target.style.height = '200px';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
