'use client';
import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomerTable from './CustomerTable';
import TemplateModal, { Template } from './TemplateModal';
import apiClient from '@/lib/apiClient';

export default function AdminManageCustomerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // templates fetched via React Query
  const { data: templates = [], refetch: refetchTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => apiClient.get('/api/templates').then(res => res.data),
  });

  // filters and UI states
  const [filters, setFilters] = useState<{ search: string; sortBy: string }>({
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'recent',
  });
  const [parsingFilters, setParsingFilters] = useState<string[]>([]);
  const [parsingOptions, setParsingOptions] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [excludeBlacklist, setExcludeBlacklist] = useState(false);

  // pagination and infinite query
  const [pageSize, setPageSize] = useState(50);
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
      return { customers: res.data.data || [], totalPages: res.data.totalPages || 1, page: pageParam };
    },
    initialPageParam: 1,
    getNextPageParam: last => last.page < last.totalPages ? last.page + 1 : undefined,
    staleTime: 60000
  });

  // aggregate loaded pages
  const allCustomers = useMemo(() => data?.pages.flatMap(p => p.customers) || [], [data]);

  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [templateDraft, setTemplateDraft] = useState<Template>({ id: undefined, name: '', description: '', items: [] });
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>();

  // load parsing options from customer data
  useEffect(() => {
    const opts = Array.from(new Set(allCustomers.map(c => c.source_filter).filter(Boolean))) as string[];
    setParsingOptions(opts);
  }, [allCustomers]);

  // sync filters with URL
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
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || 'recent',
    });
  }, [searchParams]);

  // infinite scroll at window level
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

  const handlePageSizeChange = (newSize: number) => setPageSize(newSize);

  // filtered customers
  const filteredCustomers = parsingFilters.length
    ? allCustomers.filter(c => c.source_filter && parsingFilters.includes(c.source_filter))
    : allCustomers;

  // Template Manager Modal
  function TemplateManagerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle>템플릿 관리</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {templates.map(t => (
              <div key={t.id!} className="flex items-center justify-between">
                <span>{t.name}</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => {
                    setTemplateManagerOpen(false);
                    apiClient.get(`/api/templates/${t.id}`).then(res => {
                      setTemplateDraft(res.data);
                      setModalOpen(true);
                    });
                  }}>수정</Button>
                  <Button size="sm" onClick={async () => {
                    const res = await apiClient.post(`/api/templates/${t.id}/copy`);
                    refetchTemplates();
                  }}>복사</Button>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    await apiClient.delete(`/api/templates/${t.id}`);
                    refetchTemplates();
                  }}>삭제</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button size="sm" onClick={() => {
              setTemplateDraft({ id: undefined, name: '', description: '', items: [] });
              setModalOpen(true);
            }}>추가</Button>
            <Button size="sm" variant="outline" onClick={() => setTemplateManagerOpen(false)}>닫기</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <form className="flex flex-wrap gap-2">
          <input
            className="border rounded px-2 h-8 text-xs"
            placeholder="업체명, 담당자 또는 전화번호 검색"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            disabled={isPending}
          />
          <div className="w-56">
            <MultiSelectCombobox
              options={parsingOptions.map(o => ({ value: o, label: o }))}
              selected={parsingFilters}
              onChange={setParsingFilters}
              placeholder="파싱종류"
              multiSelect
            />
          </div>
          <Button variant={showFavoritesOnly ? 'default' : 'outline'} size="sm" onClick={() => setShowFavoritesOnly(v => !v)}>즐겨찾기만 보기</Button>
          <Button variant={excludeBlacklist ? 'default' : 'outline'} size="sm" onClick={() => setExcludeBlacklist(v => !v)}>블랙리스트 제외</Button>
          <Button size="sm" onClick={() => startTransition(() => { setFilters({ search: '', sortBy: 'recent' }); router.push('/dashboard/admin_manage_customer'); })} disabled={isPending}>초기화</Button>
        </form>
      </div>

      {/* Template controls */}
      <div className="mb-6 bg-white p-4 rounded shadow flex items-center gap-2">
        <label className="text-sm font-medium">템플릿:</label>
        <select value={selectedTemplateId ?? ''} onChange={e => setSelectedTemplateId(e.target.value ? Number(e.target.value) : undefined)} className="border rounded px-2 h-8 text-xs">
          <option value="">템플릿 선택</option>
          {templates.map(t => <option key={t.id!} value={t.id!}>{t.name}</option>)}
        </select>
        <Button size="sm" onClick={() => setTemplateManagerOpen(true)}>템플릿 관리</Button>
      </div>

      <TemplateManagerModal open={templateManagerOpen} onClose={() => setTemplateManagerOpen(false)} />
      <TemplateModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={async tpl => { await (tpl.id ? apiClient.put(`/api/templates/${tpl.id}`, tpl) : apiClient.post('/api/templates', tpl)); refetchTemplates(); setModalOpen(false); }} initialTemplate={templateDraft} />

      {/* Customer table */}
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