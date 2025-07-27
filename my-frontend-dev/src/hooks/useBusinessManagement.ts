"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { Business } from '@/types';

export interface BusinessManagement extends Business {
  id: number; // 추가: 업체 고유 ID
  // 추가 관리 정보
  status: 'active' | 'inactive' | 'pending';
  lastCrawled?: string;
  keywordCount?: number;
  reviewCount?: number;
  averageRating?: number;
  isVerified?: boolean;
  address?: string; // 주소 추가
  settings?: {
    autoReply: boolean;
    notificationsEnabled: boolean;
    crawlingEnabled: boolean;
  };
}

export interface AddBusinessData {
  place_name: string;
  place_id: string;
  category?: string;
  address?: string;
  phone?: string;
  website?: string;
}

export function useBusinessManagement(userId?: number) {
  const queryClient = useQueryClient();

  // 사용자의 모든 업체 조회 (관리 정보 포함)
  const { data: businesses, isLoading, isError } = useQuery({
    queryKey: ['businesses', 'management', userId],
    queryFn: async () => {
      const response = await apiClient.get(`/user/${userId}/businesses/management`);
      return response.data as BusinessManagement[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 업체 추가 뮤테이션
  const addBusinessMutation = useMutation({
    mutationFn: async (businessData: AddBusinessData) => {
      const response = await apiClient.post(`/user/${userId}/businesses`, businessData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', 'management', userId] });
      queryClient.invalidateQueries({ queryKey: ['businesses', userId] }); // 기존 비즈니스 목록도 갱신
    },
  });

  // 업체 정보 업데이트 뮤테이션
  const updateBusinessMutation = useMutation({
    mutationFn: async ({ businessId, data }: { businessId: number; data: Partial<BusinessManagement> }) => {
      const response = await apiClient.put(`/businesses/${businessId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', 'management', userId] });
      queryClient.invalidateQueries({ queryKey: ['businesses', userId] });
    },
  });

  // 업체 삭제 뮤테이션
  const deleteBusinessMutation = useMutation({
    mutationFn: async (businessId: number) => {
      await apiClient.delete(`/businesses/${businessId}`);
      return businessId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', 'management', userId] });
      queryClient.invalidateQueries({ queryKey: ['businesses', userId] });
    },
  });

  // 업체 설정 업데이트 뮤테이션
  const updateBusinessSettingsMutation = useMutation({
    mutationFn: async ({ 
      businessId, 
      settings 
    }: { 
      businessId: number; 
      settings: BusinessManagement['settings'] 
    }) => {
      const response = await apiClient.put(`/businesses/${businessId}/settings`, settings);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', 'management', userId] });
    },
  });

  // 업체 상태 변경 (활성화/비활성화)
  const toggleBusinessStatusMutation = useMutation({
    mutationFn: async ({ businessId, status }: { businessId: number; status: 'active' | 'inactive' }) => {
      const response = await apiClient.patch(`/businesses/${businessId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', 'management', userId] });
    },
  });

  // 업체 크롤링 수동 실행
  const triggerCrawlingMutation = useMutation({
    mutationFn: async (businessId: number) => {
      const response = await apiClient.post(`/businesses/${businessId}/crawl`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', 'management', userId] });
    },
  });

  return {
    businesses: businesses || [],
    isLoading,
    isError,
    
    // 업체 추가
    addBusiness: addBusinessMutation.mutate,
    isAddingBusiness: addBusinessMutation.isPending,
    addBusinessError: addBusinessMutation.error,
    
    // 업체 업데이트
    updateBusiness: updateBusinessMutation.mutate,
    isUpdatingBusiness: updateBusinessMutation.isPending,
    
    // 업체 삭제
    deleteBusiness: deleteBusinessMutation.mutate,
    isDeletingBusiness: deleteBusinessMutation.isPending,
    
    // 업체 설정 업데이트
    updateBusinessSettings: updateBusinessSettingsMutation.mutate,
    isUpdatingSettings: updateBusinessSettingsMutation.isPending,
    
    // 업체 상태 변경
    toggleBusinessStatus: toggleBusinessStatusMutation.mutate,
    isTogglingStatus: toggleBusinessStatusMutation.isPending,
    
    // 크롤링 실행
    triggerCrawling: triggerCrawlingMutation.mutate,
    isTriggeringCrawling: triggerCrawlingMutation.isPending,
  };
}

// 네이버 플레이스 검색 및 정보 가져오기
export function useNaverPlaceSearch() {
  const searchPlaceMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await apiClient.get(`/naver/search-place?query=${encodeURIComponent(searchQuery)}`);
      return response.data;
    },
  });

  const getPlaceDetailsMutation = useMutation({
    mutationFn: async (placeId: string) => {
      const response = await apiClient.get(`/naver/place-details/${placeId}`);
      return response.data;
    },
  });

  return {
    searchPlace: searchPlaceMutation.mutate,
    isSearching: searchPlaceMutation.isPending,
    searchResults: searchPlaceMutation.data,
    searchError: searchPlaceMutation.error,
    
    getPlaceDetails: getPlaceDetailsMutation.mutate,
    isGettingDetails: getPlaceDetailsMutation.isPending,
    placeDetails: getPlaceDetailsMutation.data,
    detailsError: getPlaceDetailsMutation.error,
  };
}
