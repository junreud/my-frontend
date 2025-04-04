import { KeywordRankingDetail } from '@/types';

// 차트 데이터로 변환하는 함수
export function transformToChartData(rankingDetails: KeywordRankingDetail[]) {
  // 방어 코드 추가
  if (!rankingDetails || !Array.isArray(rankingDetails) || rankingDetails.length === 0) {
    console.error('transformToChartData: 유효한 데이터가 아님', rankingDetails);
    return [];
  }
  // 날짜별로 데이터 정렬 (최신 데이터가 마지막에 오도록)
  const sortedData = [...rankingDetails].sort((a, b) => {
    return new Date(a.date_key).getTime() - new Date(b.date_key).getTime();
  });
  
  // 차트 데이터 형식으로 변환 (모든 데이터 타입 포함)
  return sortedData.map(item => ({
    date: item.date_key,
    ranking: item.ranking,
    uv: 300 - item.ranking, // 차트 표시용 반전 값
    blog_review_count: item.blog_review_count || 0,
    receipt_review_count: item.receipt_review_count || 0,
    savedCount: item.savedCount || 0,
    place_id: item.place_id,
  }));
}

// 현재 순위 데이터 추출
export function getCurrentRanking(rankingDetails: KeywordRankingDetail[]) {
  // 방어 코드 추가
  if (!rankingDetails || !Array.isArray(rankingDetails) || rankingDetails.length === 0) {
    console.error('getCurrentRanking: 유효한 데이터가 아님', rankingDetails);
    return null;
  }
}