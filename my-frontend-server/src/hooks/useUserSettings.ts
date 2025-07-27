"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface UserSettings {
  // 기본 설정
  language: 'ko' | 'en';
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
  
  // 알림 설정
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    reviewAlerts: boolean;
    rankingChanges: boolean;
    weeklyReports: boolean;
  };
  
  // 마케팅 설정
  marketing: {
    autoReply: boolean;
    replyDelay: number; // 분 단위
    businessHours: {
      enabled: boolean;
      start: string; // HH:mm 형식
      end: string;   // HH:mm 형식
    };
  };
  
  // 사용자 정보
  profile: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
}

const defaultSettings: UserSettings = {
  language: 'ko',
  timezone: 'Asia/Seoul',
  theme: 'light',
  dateFormat: 'YYYY-MM-DD',
  notifications: {
    email: true,
    sms: false,
    push: true,
    reviewAlerts: true,
    rankingChanges: true,
    weeklyReports: false,
  },
  marketing: {
    autoReply: false,
    replyDelay: 30,
    businessHours: {
      enabled: false,
      start: '09:00',
      end: '18:00',
    },
  },
  profile: {
    name: '',
    email: '',
    phone: '',
    company: '',
  },
};

export function useUserSettings() {
  // 사용자 설정 조회
  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['user', 'settings'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/user/settings');
        return { ...defaultSettings, ...response.data };
      } catch (error) {
        console.warn('설정을 불러올 수 없어 기본값을 사용합니다:', error);
        return defaultSettings;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
  });

  const queryClient = useQueryClient();

  // 설정 업데이트 뮤테이션
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      const response = await apiClient.put('/user/settings', newSettings);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'settings'], data);
      queryClient.invalidateQueries({ queryKey: ['user', 'settings'] });
    },
    onError: (error) => {
      console.error('설정 업데이트 실패:', error);
    },
  });

  // 개별 설정 업데이트 함수들
  const updateBasicSettings = (basic: Partial<Pick<UserSettings, 'language' | 'timezone' | 'theme' | 'dateFormat'>>) => {
    const currentSettings = settings || defaultSettings;
    updateSettingsMutation.mutate({ ...currentSettings, ...basic });
  };

  const updateNotificationSettings = (notifications: Partial<UserSettings['notifications']>) => {
    const currentSettings = settings || defaultSettings;
    updateSettingsMutation.mutate({
      ...currentSettings,
      notifications: { ...currentSettings.notifications, ...notifications }
    });
  };

  const updateMarketingSettings = (marketing: Partial<UserSettings['marketing']>) => {
    const currentSettings = settings || defaultSettings;
    updateSettingsMutation.mutate({
      ...currentSettings,
      marketing: { ...currentSettings.marketing, ...marketing }
    });
  };

  const updateProfile = (profile: Partial<UserSettings['profile']>) => {
    const currentSettings = settings || defaultSettings;
    updateSettingsMutation.mutate({
      ...currentSettings,
      profile: { ...currentSettings.profile, ...profile }
    });
  };

  return {
    settings: settings || defaultSettings,
    isLoading,
    isError,
    isUpdating: updateSettingsMutation.isPending,
    updateBasicSettings,
    updateNotificationSettings,
    updateMarketingSettings,
    updateProfile,
    updateSettings: updateSettingsMutation.mutate,
  };
}

// 사용자 프로필 정보만 따로 관리하는 훅
export function useUserProfile() {
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get('/user/profile');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10분
  });

  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserSettings['profile']>) => {
      const response = await apiClient.put('/user/profile', profileData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'profile'], data);
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'settings'] });
    },
  });

  return {
    profile,
    isLoading,
    isError,
    isUpdating: updateProfileMutation.isPending,
    updateProfile: updateProfileMutation.mutate,
  };
}
