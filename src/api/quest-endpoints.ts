/**
 * 퀘스트 시스템 타입 정의
 * 
 * 주의: 이 파일은 타입 정의만 포함하며, 실제 API 구현은 백엔드에서 이루어집니다.
 */

// 프론트엔드에서 사용할 퀘스트 관련 타입 정의
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'tutorial' | 'daily' | 'achievement';
  category: string;
  reward: {
    type: 'points' | 'badge' | 'unlock';
    value: number | string;
  };
  progress: {
    current: number;
    required: number;
  };
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface QuestProgress {
  quest_id: string;
  status: string;
  progress: number;
  started_at: string;
  completed_at: string | null;
}

export interface QuestReward {
  id: string;
  type: string;
  value: number | string;
  claimed: boolean;
  claimed_at: string | null;
}

export interface QuestStats {
  total_quests: number;
  completed_quests: number;
  in_progress_quests: number;
  total_points_earned: number;
  completion_rate: number;
}

// API 응답 타입
export interface QuestApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/*
백엔드 API 엔드포인트 참조:

GET /api/quests/progress/:userId - 사용자의 퀘스트 진행 상황 조회
POST /api/quests/initialize/:userId - 사용자에게 기본 퀘스트 할당
POST /api/quests/start - 퀘스트 시작
POST /api/quests/complete - 퀘스트 완료
PUT /api/quests/progress - 퀘스트 진행도 업데이트
GET /api/quests/stats/:userId - 사용자의 퀘스트 통계 조회

데이터베이스 스키마:
- quest_progress: 사용자별 퀘스트 진행 상황
- quest_logs: 퀘스트 관련 활동 로그
*/