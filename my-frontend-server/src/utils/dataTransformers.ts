import { KeywordRankingDetail } from '@/types';

// 차트 데이터로 변환하는 함수
export function transformToChartData(rankingDetails: KeywordRankingDetail[]) {
  if (!rankingDetails || !Array.isArray(rankingDetails) || rankingDetails.length === 0) {
    // 빈 데이터의 경우 빈 배열을 반환합니다
    return [];
  }

  // 현재 백엔드 구조에 맞게 변환 (date_key 대신 crawled_at 사용)
  const transformedData = rankingDetails.map(item => {
    const dateKey = item.date_key || item.crawled_at || new Date().toISOString().split('T')[0];
    
    return {
      date: dateKey,
      date_key: dateKey,
      ranking: item.ranking ?? null,
      uv: item.ranking != null ? 300 - item.ranking : null,
      blog_review_count: item.blog_review_count ?? null,
      receipt_review_count: item.receipt_review_count ?? null,
      savedCount: item.savedCount ?? null,
      place_id: item.place_id,
      keyword: item.keyword, // 키워드 정보도 포함
    };
  });

  // 날짜순으로 정렬
  return transformedData.sort((a, b) => {
    return new Date(a.date_key).getTime() - new Date(b.date_key).getTime();
  });
}

// 현재 순위 데이터 추출
export function getCurrentRanking(rankingDetails: KeywordRankingDetail[]) {
  if (!rankingDetails || !Array.isArray(rankingDetails) || rankingDetails.length === 0) {
    // 빈 데이터의 경우 null 반환
    return null;
  }

  // 최신 날짜의 데이터에서 ranking 추출 (crawled_at 기준)
  const sortedData = rankingDetails.sort((a, b) => {
    const dateA = new Date(a.date_key || a.crawled_at || 0);
    const dateB = new Date(b.date_key || b.crawled_at || 0);
    return dateB.getTime() - dateA.getTime();
  });

  return sortedData[0].ranking ?? null;
}