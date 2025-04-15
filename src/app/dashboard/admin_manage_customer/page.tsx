'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomerTable from './CustomerTable';
import apiClient from '@/lib/apiClient';
import { ICustomerInfo } from '@/types/index';

interface FilterState {
  search: string;
  status: string;
  sortBy: string;
}

export default function AdminManageCustomerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    sortBy: searchParams.get('sortBy') || 'recent',
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.sortBy !== 'recent') params.set('sortBy', filters.sortBy);
    router.push(`/dashboard/admin_manage_customer?${params.toString()}`);
  };

  const generateQueryParams = () => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    return params.toString();
  };

  const { data, refetch } = useQuery<{
    customers: ICustomerInfo[];
    total: number;
    pages: number;
  }>({
    queryKey: ['customers', page, pageSize, filters.search, filters.status, filters.sortBy],
    queryFn: async () => {
      const queryParams = generateQueryParams();
      const response = await apiClient.get(`/api/customer/data?${queryParams}`);
      return {
        customers: response.data.data || [],  // data 필드에서 가져옴
        total: response.data.total || 0,
        pages: response.data.totalPages || 1,  // totalPages에서 가져옴
      };
    },
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || 'all',
      sortBy: searchParams.get('sortBy') || 'recent',
    });
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.status, filters.sortBy]);

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 bg-white p-4 rounded shadow">
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">검색</label>
            <input
              type="text"
              placeholder="업체명, 담당자 또는 전화번호 검색"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">상태</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="all">모든 상태</option>
              <option value="active">활성</option>
              <option value="pending">대기중</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">정렬</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="recent">최신순</option>
              <option value="company">업체명순</option>
              <option value="contact">담당자순</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => {
                setFilters({
                  search: '',
                  status: 'all',
                  sortBy: 'recent',
                });
                router.push('/dashboard/admin_manage_customer');
              }}
              className="border rounded px-4 py-2"
            >
              초기화
            </button>
            <button type="submit" className="border rounded px-4 py-2 bg-blue-500 text-white">
              필터 적용
            </button>
          </div>
        </form>
      </div>
      <CustomerTable
        customers={data?.customers || []}
        totalCustomers={data?.total || 0}
        totalPages={data?.pages || 1}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRefresh={refetch}
      />
    </div>
  );
}