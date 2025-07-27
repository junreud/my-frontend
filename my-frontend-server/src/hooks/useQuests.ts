import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Quest } from '@/types/quest';
import { QuestManager, defaultQuests } from '@/lib/questManager';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';

export function useQuests(userId?: string) {
  const queryClient = useQueryClient();

  // 사용자의 퀘스트 진행 상황 가져오기
  const { data: userProgress = [], isLoading: isProgressLoading } = useQuery({
    queryKey: ['questProgress', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const response = await apiClient.get(`/api/quests/progress/${userId}`);
        return response.data?.data || [];
      } catch (error) {
        console.error('Failed to fetch quest progress:', error);
        return [];
      }
    },
    enabled: !!userId,
  });

  // 퀘스트 시작
  const startQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await apiClient.post(`/api/quests/${questId}/start`, {
        userId,
      });
      return response.data;
    },
    onSuccess: (data, questId) => {
      queryClient.invalidateQueries({ queryKey: ['questProgress', userId] });
      const quest = QuestManager.getQuestById(questId);
      toast.success(`퀘스트 시작: ${quest?.title}`, {
        description: '퀘스트를 완료하고 포인트를 획득하세요!',
      });
    },
    onError: (error) => {
      console.error('Failed to start quest:', error);
      toast.error('퀘스트 시작에 실패했습니다.');
    },
  });

  // 퀘스트 완료
  const completeQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await apiClient.post(`/api/quests/${questId}/complete`, {
        userId,
      });
      return response.data;
    },
    onSuccess: (data, questId) => {
      queryClient.invalidateQueries({ queryKey: ['questProgress', userId] });
      const quest = QuestManager.getQuestById(questId);
      toast.success(`퀘스트 완료: ${quest?.title}`, {
        description: `${quest?.points}포인트를 획득했습니다! 🎉`,
      });
    },
    onError: (error) => {
      console.error('Failed to complete quest:', error);
      toast.error('퀘스트 완료 처리에 실패했습니다.');
    },
  });

  // 퀘스트 진행률 업데이트
  const updateProgressMutation = useMutation({
    mutationFn: async ({ questId, progress }: { questId: string; progress: number }) => {
      const response = await apiClient.patch(`/api/quests/${questId}/progress`, {
        userId,
        progress,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questProgress', userId] });
    },
    onError: (error) => {
      console.error('Failed to update quest progress:', error);
    },
  });

  // 퀘스트 데이터를 사용자 진행 상황과 결합
  const getUserQuests = (): Quest[] => {
    return defaultQuests.map(quest => {
      const progress = userProgress.find((p: { questId: string; status: string; progress: number; completedAt?: string }) => p.questId === quest.id);
      return {
        ...quest,
        status: progress?.status || 'incomplete',
        progress: progress?.progress || 0,
        completedAt: progress?.completedAt ? new Date(progress.completedAt) : undefined,
      };
    });
  };

  const quests = getUserQuests();
  const stats = QuestManager.getUserStats(userProgress);

  return {
    quests,
    stats,
    isLoading: isProgressLoading,
    startQuest: startQuestMutation.mutate,
    completeQuest: completeQuestMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
    isStartingQuest: startQuestMutation.isPending,
    isCompletingQuest: completeQuestMutation.isPending,
  };
}

// 특정 액션에 따른 퀘스트 자동 진행률 업데이트
export function useQuestTrigger(userId?: string) {
  const { updateProgress } = useQuests(userId);

  const triggerQuestProgress = (trigger: string, value: number = 1) => {
    if (!userId) return;

    // 트리거에 따른 퀘스트 진행률 업데이트
    const questTriggers: Record<string, string[]> = {
      'business_added': ['welcome-setup'],
      'keyword_added': ['first-keyword-add'],
      'seo_analyzed': ['seo-first-analysis', 'weekly-seo-improvement'],
      'dashboard_visited': ['daily-dashboard-check'],
      'keyword_checked': ['weekly-keyword-check'],
      'review_replied': ['weekly-review-response'],
      'performance_reviewed': ['monthly-performance-review'],
    };

    const affectedQuests = questTriggers[trigger] || [];
    
    affectedQuests.forEach(questId => {
      updateProgress({ questId, progress: value });
    });
  };

  return { triggerQuestProgress };
}

// 퀘스트 시스템 초기화 (신규 사용자용)
export function useQuestInitialization(userId?: string) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!userId || isInitialized) return;

    const initializeQuests = async () => {
      try {
        await apiClient.post(`/api/quests/initialize`, { userId });
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize quests:', error);
      }
    };

    initializeQuests();
  }, [userId, isInitialized]);

  return { isInitialized };
}
