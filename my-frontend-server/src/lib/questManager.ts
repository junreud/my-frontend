import { Quest, QuestCategory, QuestProgress, UserQuestStats } from '@/types/quest';

// 퀘스트 카테고리 정의
export const questCategories: QuestCategory[] = [
  {
    id: 'setup',
    name: '계정 설정',
    description: '기본 설정을 완료하세요',
    icon: '⚙️',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'keyword',
    name: '키워드 관리',
    description: '키워드 순위를 관리하세요',
    icon: '🔍',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'seo',
    name: 'SEO 최적화',
    description: 'SEO 점수를 개선하세요',
    icon: '📈',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'review',
    name: '리뷰 관리',
    description: '리뷰를 관리하세요',
    icon: '⭐',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'blog',
    name: '블로그 마케팅',
    description: '블로그 콘텐츠를 관리하세요',
    icon: '📝',
    color: 'bg-pink-100 text-pink-800'
  }
];

// 기본 퀘스트 목록
export const defaultQuests: Quest[] = [
  // 초기 설정 퀘스트
  {
    id: 'welcome-setup',
    title: '첫 번째 업체 등록하기',
    description: '라카비 서비스를 시작하기 위해 첫 번째 업체를 등록해보세요.',
    category: 'setup',
    type: 'onetime',
    difficulty: 'easy',
    points: 100,
    icon: '🏪',
    status: 'incomplete',
    progress: 0,
    maxProgress: 1,
    requirements: ['업체 정보 입력', '네이버 플레이스 연결'],
    actionUrl: '/dashboard/business/add',
    actionText: '업체 등록하기'
  },
  {
    id: 'first-keyword-add',
    title: '첫 번째 키워드 등록하기',
    description: '추적할 키워드를 등록하고 순위 모니터링을 시작하세요.',
    category: 'keyword',
    type: 'onetime',
    difficulty: 'easy',
    points: 50,
    icon: '🎯',
    status: 'incomplete',
    progress: 0,
    maxProgress: 1,
    requirements: ['키워드 검색', '키워드 선택', '추적 시작'],
    actionUrl: '/dashboard/marketing-keywords',
    actionText: '키워드 등록하기'
  },
  {
    id: 'seo-first-analysis',
    title: '첫 번째 SEO 분석하기',
    description: '업체의 SEO 상태를 분석하고 개선점을 찾아보세요.',
    category: 'seo',
    type: 'onetime',
    difficulty: 'medium',
    points: 75,
    icon: '🔍',
    status: 'incomplete',
    progress: 0,
    maxProgress: 1,
    requirements: ['SEO 분석 실행', '결과 확인'],
    actionUrl: '/dashboard/seo-analysis',
    actionText: 'SEO 분석하기'
  },
  
  // 주간 반복 퀘스트
  {
    id: 'weekly-keyword-check',
    title: '주간 키워드 순위 확인하기',
    description: '이번 주 키워드 순위 변화를 확인하고 분석해보세요.',
    category: 'keyword',
    type: 'weekly',
    difficulty: 'easy',
    points: 25,
    icon: '📊',
    status: 'incomplete',
    progress: 0,
    maxProgress: 1,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    actionUrl: '/dashboard/marketing-keywords',
    actionText: '순위 확인하기'
  },
  {
    id: 'weekly-seo-improvement',
    title: '주간 SEO 개선 작업',
    description: 'SEO 점수를 5점 이상 개선해보세요.',
    category: 'seo',
    type: 'weekly',
    difficulty: 'medium',
    points: 50,
    icon: '🚀',
    status: 'incomplete',
    progress: 0,
    maxProgress: 5,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    requirements: ['SEO 분석 실행', '개선 사항 적용', '점수 향상 확인'],
    actionUrl: '/dashboard/seo-analysis',
    actionText: 'SEO 개선하기'
  },
  {
    id: 'weekly-review-response',
    title: '주간 리뷰 답변하기',
    description: '신규 리뷰에 답변을 작성하고 고객과 소통하세요.',
    category: 'review',
    type: 'weekly',
    difficulty: 'easy',
    points: 30,
    icon: '💬',
    status: 'incomplete',
    progress: 0,
    maxProgress: 3,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    actionUrl: '/dashboard/reviews',
    actionText: '리뷰 답변하기'
  },
  
  // 일일 퀘스트
  {
    id: 'daily-dashboard-check',
    title: '일일 대시보드 확인하기',
    description: '오늘의 키워드 순위와 SEO 상태를 확인하세요.',
    category: 'keyword',
    type: 'daily',
    difficulty: 'easy',
    points: 10,
    icon: '📱',
    status: 'incomplete',
    progress: 0,
    maxProgress: 1,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    actionUrl: '/dashboard',
    actionText: '대시보드 확인하기'
  },
  
  // 월간 퀘스트
  {
    id: 'monthly-performance-review',
    title: '월간 성과 리뷰',
    description: '이번 달 키워드 순위 변화와 SEO 개선 사항을 종합적으로 분석하세요.',
    category: 'seo',
    type: 'monthly',
    difficulty: 'hard',
    points: 200,
    icon: '📈',
    status: 'incomplete',
    progress: 0,
    maxProgress: 1,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    requirements: ['키워드 순위 분석', 'SEO 점수 변화 확인', '개선 계획 수립'],
    actionUrl: '/dashboard/analytics',
    actionText: '성과 분석하기'
  }
];

// 퀘스트 관리 유틸리티 함수들
export class QuestManager {
  static getQuestsByCategory(category: string): Quest[] {
    return defaultQuests.filter(quest => quest.category === category);
  }

  static getQuestsByType(type: Quest['type']): Quest[] {
    return defaultQuests.filter(quest => quest.type === type);
  }

  static getActiveQuests(): Quest[] {
    return defaultQuests.filter(quest => 
      quest.status === 'incomplete' || quest.status === 'in_progress'
    );
  }

  static getCompletedQuests(): Quest[] {
    return defaultQuests.filter(quest => quest.status === 'completed');
  }

  static getQuestById(id: string): Quest | undefined {
    return defaultQuests.find(quest => quest.id === id);
  }

  static calculateProgress(quest: Quest): number {
    return Math.round((quest.progress / quest.maxProgress) * 100);
  }

  static isQuestExpired(quest: Quest): boolean {
    if (!quest.dueDate) return false;
    return new Date() > quest.dueDate;
  }

  static getQuestPriority(quest: Quest): number {
    const difficultyWeight = { easy: 1, medium: 2, hard: 3 };
    const typeWeight = { daily: 4, weekly: 3, monthly: 2, onetime: 1 };
    
    return (difficultyWeight[quest.difficulty] + typeWeight[quest.type]) * 
           (quest.status === 'in_progress' ? 1.5 : 1);
  }

  static getUserStats(userProgress: QuestProgress[]): UserQuestStats {
    const completed = userProgress.filter(p => p.status === 'completed');
    const totalPoints = completed.reduce((sum, p) => {
      const quest = this.getQuestById(p.questId);
      return sum + (quest?.points || 0);
    }, 0);

    // 주간 진행률 계산
    const weeklyQuests = this.getQuestsByType('weekly');
    const weeklyCompleted = completed.filter(p => {
      const quest = this.getQuestById(p.questId);
      return quest?.type === 'weekly';
    });

    return {
      totalCompleted: completed.length,
      totalPoints,
      currentStreak: this.calculateCurrentStreak(userProgress),
      longestStreak: this.calculateLongestStreak(userProgress),
      weeklyProgress: {
        completed: weeklyCompleted.length,
        total: weeklyQuests.length
      }
    };
  }

  private static calculateCurrentStreak(userProgress: QuestProgress[]): number {
    // 연속 완료 일수 계산 로직
    const dailyQuests = userProgress
      .filter(p => p.status === 'completed' && p.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

    let streak = 0;
    const currentDate = new Date();
    
    for (const quest of dailyQuests) {
      const questDate = new Date(quest.completedAt!);
      const diffDays = Math.floor((currentDate.getTime() - questDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private static calculateLongestStreak(userProgress: QuestProgress[]): number {
    // 최장 연속 완료 일수 계산 로직
    // 실제 구현에서는 더 복잡한 로직이 필요할 수 있습니다
    return Math.max(this.calculateCurrentStreak(userProgress), 0);
  }
}
