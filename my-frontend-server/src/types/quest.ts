export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'seo' | 'keyword' | 'review' | 'blog' | 'setup';
  type: 'daily' | 'weekly' | 'monthly' | 'onetime';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  icon: string;
  status: 'incomplete' | 'in_progress' | 'completed';
  progress: number; // 0-100
  maxProgress: number;
  dueDate?: Date;
  completedAt?: Date;
  requirements?: string[];
  actionUrl?: string; // 퀘스트 수행을 위한 링크
  actionText?: string; // 액션 버튼 텍스트
}

export interface QuestProgress {
  userId: string;
  questId: string;
  status: Quest['status'];
  progress: number;
  completedAt?: Date;
  startedAt?: Date;
}

export interface QuestCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface UserQuestStats {
  totalCompleted: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: {
    completed: number;
    total: number;
  };
}
