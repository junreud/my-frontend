// utils/keywordLimits.ts

export interface KeywordLimitInfo {
  limit: number;
  description: string;
  isPremium: boolean;
}

export function getKeywordLimitByRole(role?: string): KeywordLimitInfo {
  switch (role?.toLowerCase()) {
    case 'admin':
      return {
        limit: 99,
        description: 'ADMIN',
        isPremium: true
      };
    case 'plus':
      return {
        limit: 10,
        description: 'PLUS',
        isPremium: true
      };
    case 'user':
    default:
      return {
        limit: 2,
        description: 'FREE',
        isPremium: false
      };
  }
}

export function getKeywordUsageStatus(currentCount: number, role?: string) {
  const limitInfo = getKeywordLimitByRole(role);
  const percentage = Math.round((currentCount / limitInfo.limit) * 100);
  
  let status: 'normal' | 'warning' | 'danger' = 'normal';
  if (percentage >= 90) {
    status = 'danger';
  } else if (percentage >= 70) {
    status = 'warning';
  }
  
  return {
    ...limitInfo,
    currentCount,
    percentage,
    remaining: limitInfo.limit - currentCount,
    status,
    canAdd: currentCount < limitInfo.limit
  };
}
