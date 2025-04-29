'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomerTable from './CustomerTable';
import apiClient from '@/lib/apiClient';
import TemplateModal, { Template } from './TemplateModal';

interface FilterState {
  search: string;
  sortBy: string;
}

// 템플릿 관리 모달 Props 타입
interface TemplateManagerModalProps {
  open: boolean;
  onClose: () => void;
  templates: Template[];
  onEdit: (tpl: Template) => void | Promise<void>;
  onCopy: (tpl: Template) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

// 템플릿 관리 모달 컴포넌트
function TemplateManagerModal({ open, onClose, templates, onEdit, onCopy, onDelete, onAdd }: TemplateManagerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>템플릿 관리</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {templates.map(t => (
            <div key={t.id!} className="flex items-center justify-between">
              <span>{t.name}</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onEdit(t)}>수정</Button>
                <Button size="sm" onClick={() => onCopy(t)}>복사</Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(t.id!)}>삭제</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" onClick={onAdd}>추가</Button>
          <Button size="sm" variant="outline" onClick={onClose}>닫기</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminManageCustomerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'recent',
  });

  const [parsingFilters, setParsingFilters] = useState<string[]>([]);
  // 파싱종류 옵션 목록
  const [parsingOptions, setParsingOptions] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [excludeBlacklist, setExcludeBlacklist] = useState(false);

  const [pageSize, setPageSize] = useState(50);

  const [modalOpen, setModalOpen] = useState(false);
  const [templateDraft, setTemplateDraft] = useState<Template>({ id: undefined, name: '', description: '', items: [] });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>();
  // 템플릿 관리 모달 상태
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);

  // 템플릿 목록 불러오기
  useEffect(() => {
    apiClient.get('/api/templates').then(res => setTemplates(res.data));
  }, []);

  // 템플릿 저장
  const handleSaveTemplate = async (template: Template) => {
    if (!template.name) return;
    if (template.id) {
      await apiClient.put(`/api/templates/${template.id}`, template);
    } else {
      await apiClient.post('/api/templates', template);
    }
    const res = await apiClient.get('/api/templates');
    setTemplates(res.data);
  };

  // 템플릿 복사 핸들러
  const handleCopyTemplate = async (template: Template) => {
    // 실제 복사 API 호출
    const res = await apiClient.post(`/api/templates/${template.id}/copy`);
    setTemplates(prev => [res.data, ...prev]);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // debounce auto-apply filters for better UX
  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.sortBy !== 'recent') params.set('sortBy', filters.sortBy);
        router.push(`/dashboard/admin_manage_customer?${params.toString()}`);
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [filters.search, filters.sortBy, router, startTransition]);

  // infinite load: fetch pages as user scrolls
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: ['customers', filters.search, filters.sortBy, pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      params.set('page', String(pageParam));
      params.set('pageSize', String(pageSize));
      const res = await apiClient.get(`/api/customer/data?${params.toString()}`);
      return {
        customers: res.data.data || [],
        totalPages: res.data.totalPages || 1,
        page: pageParam
      };
    },
    initialPageParam: 1,
    getNextPageParam: last => last.page < last.totalPages ? last.page + 1 : undefined,
    staleTime: 60 * 1000,
  });

  // combine all loaded pages
  const allCustomers = useMemo(
    () => data?.pages.flatMap(p => p.customers) || [],
    [data?.pages]
  );

  // parsing option from all loaded customers
  useEffect(() => {
    if (allCustomers.length) {
      const opts = Array.from(new Set(allCustomers.map(c => c.source_filter).filter(Boolean))) as string[];
      setParsingOptions(opts);
    }
  }, [allCustomers]);

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || 'recent',
    });
  }, [searchParams]);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50
          && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
  };

  // 필터링된 모든 고객
  const filteredCustomers = parsingFilters.length
    ? allCustomers.filter(c => c.source_filter && parsingFilters.includes(c.source_filter))
    : allCustomers;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 bg-white p-4 rounded shadow">
        <form className="flex flex-row flex-wrap items-end gap-2 w-full">
          <div className="flex flex-row gap-2 flex-1 min-w-0 items-center">
            <input
              type="text"
              placeholder="업체명, 담당자 또는 전화번호 검색"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              disabled={isPending}
              className="border rounded px-2 h-8 w-56 text-xs placeholder:text-xs"
              style={{ minWidth: 180, maxWidth: 220 }}
            />
            <div className="w-56" style={{ minWidth: 180, maxWidth: 220 }}>
              <div className="h-8 text-xs">
                <MultiSelectCombobox
                  options={parsingOptions.map(opt => ({ value: opt, label: opt }))}
                  selected={parsingFilters}
                  onChange={setParsingFilters}
                  placeholder="파싱종류"
                  multiSelect
                />
              </div>
            </div>
            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="h-8 px-3 text-xs"
            >
              {showFavoritesOnly ? '전체보기' : '즐겨찾기만 보기'}
            </Button>
            <Button
              variant={excludeBlacklist ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExcludeBlacklist(!excludeBlacklist)}
              className="h-8 px-3 text-xs"
            >
              {excludeBlacklist ? '전체보기' : '블랙리스트 제외'}
            </Button>
          </div>
          <div className="flex-0 ml-auto pl-4">
            <Button
              type="button"
              onClick={() => {
                startTransition(() => {
                  setFilters({
                    search: '',
                    sortBy: 'recent',
                  });
                  router.push('/dashboard/admin_manage_customer');
                });
              }}
              className="border rounded px-4 h-8 text-xs"
              disabled={isPending}
            >
              초기화
            </Button>
          </div>
        </form>
      </div>
      {/* 템플릿 관리/선택 UI */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* 템플릿 선택 및 미리보기 */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className="text-sm font-medium mr-2">발송 템플릿</label>
            <select
              className="border rounded px-2 h-8 text-xs min-w-[180px] max-w-[220px]"
              value={selectedTemplateId ?? ''}
              onChange={e => {
                const val = e.target.value;
                setSelectedTemplateId(val ? Number(val) : undefined);
              }}
            >
              <option value="">템플릿을 선택하세요</option>
              {templates.map(t => (
                <option key={t.id!} value={t.id!}>{t.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="border rounded px-2 h-8 text-xs"
              onClick={() => setTemplateManagerOpen(true)}
            >템플릿 관리</button>
          </div>
        </div>
      </div>
      <TemplateManagerModal
        open={templateManagerOpen}
        onClose={() => setTemplateManagerOpen(false)}
        templates={templates}
        onEdit={async (tpl) => {
          // close manager modal and load full template with items
          setTemplateManagerOpen(false);
          const res = await apiClient.get(`/api/templates/${tpl.id}`);
          setTemplateDraft(res.data);
          setModalOpen(true);
        }}
        onCopy={handleCopyTemplate}
        onDelete={async (id) => { await apiClient.delete(`/api/templates/${id}`); const res = await apiClient.get('/api/templates'); setTemplates(res.data); }}
        onAdd={() => { setTemplateDraft({ id: undefined, name: '', description: '', items: [] }); setModalOpen(true); }}
      />
      <TemplateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTemplate}
        initialTemplate={templateDraft}
      />
      <CustomerTable
        customers={filteredCustomers}
        currentPage={1}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        onRefresh={refetch}
        parsingFilters={parsingFilters}
        showFavoritesOnly={showFavoritesOnly}
        excludeBlacklist={excludeBlacklist}
        selectedTemplateId={selectedTemplateId}
        templates={templates}
      />
    </div>
  );
}