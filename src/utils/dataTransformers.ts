import { KeywordRankingDetail } from '@/types';

// 차트 데이터로 변환하는 함수
export function transformToChartData(rankingDetails: KeywordRankingDetail[]) {
  if (!rankingDetails || !Array.isArray(rankingDetails) || rankingDetails.length === 0) {
    console.error('transformToChartData: 유효한 데이터가 아님', rankingDetails);
    return [];
  }

  const sortedData = [...rankingDetails].sort((a, b) => {
    return new Date(a.date_key).getTime() - new Date(b.date_key).getTime();
  });

  return sortedData.map(item => ({
    date: item.date_key,
    ranking: item.ranking ?? null,  // ✅ ranking은 null 허용
    uv: item.ranking != null ? 300 - item.ranking : null,  // ✅ 명확히 처리
    blog_review_count: item.blog_review_count ?? null,     // ✅ null처리 명확히
    receipt_review_count: item.receipt_review_count ?? null, // ✅ 명확히 처리
    savedCount: item.savedCount ?? null,                   // ✅ 명확히 처리
    place_id: item.place_id,
  }));
}

// 현재 순위 데이터 추출
export function getCurrentRanking(rankingDetails: KeywordRankingDetail[]) {
  if (!rankingDetails || !Array.isArray(rankingDetails) || rankingDetails.length === 0) {
    console.error('getCurrentRanking: 유효한 데이터가 아님', rankingDetails);
    return null;
  }

  // 최신 날짜의 데이터에서 ranking 추출
  const sortedData = rankingDetails.sort((a, b) => {
    return new Date(b.date_key).getTime() - new Date(a.date_key).getTime();
  });

  return sortedData[0].ranking ?? null;
}