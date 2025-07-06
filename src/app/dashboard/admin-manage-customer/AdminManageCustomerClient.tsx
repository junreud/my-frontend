'use client';
import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomerTable from './CustomerTable';
import CustomerTableVirtualized from './CustomerTableVirtualized';
import TemplateModal, { Template } from './TemplateModal';
import apiClient from '@/lib/apiClient';

// 디바운스 유틸리티 함수 추가
function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

export default function AdminManageCustomerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // templates fetched via React Query
  const { data: templates = [], refetch: refetchTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/templates');
        const data = response.data;
        
        // 응답 데이터가 배열인지 확인
        if (!Array.isArray(data)) {
          console.warn('템플릿 응답이 배열이 아닙니다:', data);
          return [];
        }
        
        return data;
      } catch (error) {
        console.error('템플릿 로드 중 오류:', error);
        return [];
      }
    },
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
    refetch,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['customers', filters.search, filters.sortBy, pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      params.set('page', String(pageParam));
      params.set('pageSize', String(pageSize));
      const res = await apiClient.get(`/api/customer/data?${params.toString()}`);
      console.log('Customer API response:', res.data); // 디버그 로그 추가
      
      // 백엔드 응답 구조 확인 및 처리
      let customerData;
      if (res.data.success && res.data.data) {
        // sendSuccess로 래핑된 응답인 경우
        customerData = res.data.data;
      } else {
        // 직접 데이터인 경우
        customerData = res.data;
      }
      
      const customers = customerData.data || customerData || [];
      const totalPages = customerData.totalPages || 1;
      
      console.log('Customer data structure:', customers.slice(0, 2)); // 첫 2개 고객 데이터 구조 확인
      return { customers, totalPages, page: pageParam };
    },
    initialPageParam: 1,
    getNextPageParam: last => last.page < last.totalPages ? last.page + 1 : undefined,
    staleTime: 60000
  });

  // aggregate loaded pages with deduplication
  const allCustomers = useMemo(() => {
    const customers = data?.pages.flatMap(p => p.customers) || [];
    
    // 중복 제거: customer.id 기준으로 중복 제거
    const uniqueCustomers = customers.filter((customer, index, array) => 
      array.findIndex(c => c.id === customer.id) === index
    );
    
    console.log('Total customers before dedup:', customers.length);
    console.log('Total customers after dedup:', uniqueCustomers.length);
    
    return uniqueCustomers;
  }, [data]);

  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [templateDraft, setTemplateDraft] = useState<Template>({ id: undefined, name: '', description: '', items: [] });
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>();
  const [useVirtualization, setUseVirtualization] = useState(false);
  
  // 스크롤 이벤트 처리를 위한 상태
  const [loadingMore, setLoadingMore] = useState(false);

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
        router.push(`/dashboard/admin-manage-customer?${params.toString()}`);
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

  // 최적화된 무한 스크롤 핸들러
  const handleScroll = useCallback(() => {
    // 현재 화면의 높이, 스크롤 위치 및 문서 전체 높이 계산
    const windowHeight = window.innerHeight;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const docHeight = document.documentElement.scrollHeight;
    
    // 스크롤이 하단에서 200px 이내에 도달했을 때 추가 데이터 로드
    // 이를 통해 사용자가 페이지 끝에 도달하기 전에 미리 데이터를 로드
    if (windowHeight + scrollTop >= docHeight - 200) {
      if (hasNextPage && !isFetchingNextPage && !loadingMore) {
        setLoadingMore(true);
        fetchNextPage().finally(() => {
          setLoadingMore(false);
        });
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, loadingMore]);
  
  // 디바운스된 스크롤 핸들러 생성
  const debouncedHandleScroll = useMemo(
    () => debounce(handleScroll, 100), 
    [handleScroll]
  );
  
  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener('scroll', debouncedHandleScroll);
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [debouncedHandleScroll]);

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
            {Array.isArray(templates) ? templates.map((t: Template) => (
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
                    await apiClient.post(`/api/templates/${t.id}/copy`);
                    refetchTemplates();
                  }}>복사</Button>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    await apiClient.delete(`/api/templates/${t.id}`);
                    refetchTemplates();
                  }}>삭제</Button>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-4">
                템플릿이 없습니다.
              </div>
            )}
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
          <Button size="sm" onClick={() => startTransition(() => { setFilters({ search: '', sortBy: 'recent' }); router.push('/dashboard/admin-manage-customer'); })} disabled={isPending}>초기화</Button>
        </form>
      </div>

      {/* Template controls */}
      <div className="mb-6 bg-white p-4 rounded shadow flex items-center gap-2">
        <label className="text-sm font-medium">템플릿:</label>
        <select value={selectedTemplateId ?? ''} onChange={e => setSelectedTemplateId(e.target.value ? Number(e.target.value) : undefined)} className="border rounded px-2 h-8 text-xs">
          <option value="">템플릿 선택</option>
          {Array.isArray(templates) ? templates.map((t: Template) => <option key={t.id!} value={t.id!}>{t.name}</option>) : null}
        </select>
        <Button size="sm" onClick={() => setTemplateManagerOpen(true)}>템플릿 관리</Button>
        
        {/* 가상화 토글 */}
        <div className="ml-4 flex items-center gap-2">
          <label className="text-sm font-medium">성능 모드:</label>
          <Button
            variant={useVirtualization ? "default" : "outline"}
            size="sm"
            onClick={() => setUseVirtualization(!useVirtualization)}
          >
            {useVirtualization ? "가상화 ON" : "가상화 OFF"}
          </Button>
        </div>
      </div>

      <TemplateManagerModal open={templateManagerOpen} onClose={() => setTemplateManagerOpen(false)} />
      <TemplateModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={async tpl => { await (tpl.id ? apiClient.put(`/api/templates/${tpl.id}`, tpl) : apiClient.post('/api/templates', tpl)); refetchTemplates(); setModalOpen(false); }} initialTemplate={templateDraft} />

      {/* Customer table */}
      {useVirtualization ? (
        <CustomerTableVirtualized
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
      ) : (
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
      )}
      
      {/* 로딩 인디케이터 추가 */}
      {(isFetchingNextPage || isLoading) && (
        <div className="flex justify-center items-center py-4">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-500">데이터 로딩 중...</span>
        </div>
      )}
    </div>
  );
}