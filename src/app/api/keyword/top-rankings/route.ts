import { NextRequest, NextResponse } from 'next/server';

// Mock data for top-ranking businesses
const mockTopRankingData = [
  {
    placeId: "place_001",
    businessName: "부평 헬스장",
    keyword: "부평 헬스장",
    rankings: [
      { month: "12.04", 순위: 71, mobile: 80 },
      { month: "12.05", 순위: 68, mobile: 80 },
      { month: "12.06", 순위: 65, mobile: 80 },
      { month: "12.07", 순위: 62, mobile: 80 },
      { month: "12.08", 순위: 58, mobile: 80 },
      { month: "12.09", 순위: 55, mobile: 80 },
      { month: "12.10", 순위: 52, mobile: 80 },
      { month: "12.11", 순위: 48, mobile: 80 },
      { month: "12.12", 순위: 45, mobile: 80 },
      { month: "12.13", 순위: 42, mobile: 80 },
      { month: "12.14", 순위: 38, mobile: 80 },
      { month: "12.15", 순위: 35, mobile: 80 },
      { month: "12.16", 순위: 32, mobile: 80 },
      { month: "12.17", 순위: 28, mobile: 80 },
      { month: "12.18", 순위: 25, mobile: 80 },
      { month: "12.19", 순위: 22, mobile: 80 },
      { month: "12.20", 순위: 18, mobile: 80 },
      { month: "12.21", 순위: 15, mobile: 80 },
      { month: "12.22", 순위: 12, mobile: 80 },
      { month: "12.23", 순위: 8, mobile: 80 },
      { month: "12.24", 순위: 5, mobile: 80 },
      { month: "12.25", 순위: 4, mobile: 80 },
      { month: "12.26", 순위: 3, mobile: 80 },
      { month: "12.27", 순위: 2, mobile: 80 },
      { month: "12.28", 순위: 1, mobile: 80 },
      { month: "12.29", 순위: 1, mobile: 80 },
      { month: "12.30", 순위: 1, mobile: 80 },
      { month: "12.31", 순위: 1, mobile: 80 },
    ]
  },
  {
    placeId: "place_002",
    businessName: "송도 카페 로얄",
    keyword: "송도 카페",
    rankings: [
      { month: "12.04", 순위: 85, mobile: 80 },
      { month: "12.05", 순위: 82, mobile: 80 },
      { month: "12.06", 순위: 78, mobile: 80 },
      { month: "12.07", 순위: 75, mobile: 80 },
      { month: "12.08", 순위: 71, mobile: 80 },
      { month: "12.09", 순위: 68, mobile: 80 },
      { month: "12.10", 순위: 64, mobile: 80 },
      { month: "12.11", 순위: 61, mobile: 80 },
      { month: "12.12", 순위: 57, mobile: 80 },
      { month: "12.13", 순위: 54, mobile: 80 },
      { month: "12.14", 순위: 50, mobile: 80 },
      { month: "12.15", 순위: 47, mobile: 80 },
      { month: "12.16", 순위: 43, mobile: 80 },
      { month: "12.17", 순위: 40, mobile: 80 },
      { month: "12.18", 순위: 36, mobile: 80 },
      { month: "12.19", 순위: 33, mobile: 80 },
      { month: "12.20", 순위: 29, mobile: 80 },
      { month: "12.21", 순위: 26, mobile: 80 },
      { month: "12.22", 순위: 22, mobile: 80 },
      { month: "12.23", 순위: 19, mobile: 80 },
      { month: "12.24", 순위: 15, mobile: 80 },
      { month: "12.25", 순위: 12, mobile: 80 },
      { month: "12.26", 순위: 8, mobile: 80 },
      { month: "12.27", 순위: 5, mobile: 80 },
      { month: "12.28", 순위: 3, mobile: 80 },
      { month: "12.29", 순위: 2, mobile: 80 },
      { month: "12.30", 순위: 2, mobile: 80 },
      { month: "12.31", 순위: 1, mobile: 80 },
    ]
  },
  {
    placeId: "place_003",
    businessName: "인천 피트니스 센터",
    keyword: "인천 피트니스",
    rankings: [
      { month: "12.04", 순위: 92, mobile: 80 },
      { month: "12.05", 순위: 89, mobile: 80 },
      { month: "12.06", 순위: 86, mobile: 80 },
      { month: "12.07", 순위: 82, mobile: 80 },
      { month: "12.08", 순위: 79, mobile: 80 },
      { month: "12.09", 순위: 75, mobile: 80 },
      { month: "12.10", 순위: 72, mobile: 80 },
      { month: "12.11", 순위: 68, mobile: 80 },
      { month: "12.12", 순위: 65, mobile: 80 },
      { month: "12.13", 순위: 61, mobile: 80 },
      { month: "12.14", 순위: 58, mobile: 80 },
      { month: "12.15", 순위: 54, mobile: 80 },
      { month: "12.16", 순위: 51, mobile: 80 },
      { month: "12.17", 순위: 47, mobile: 80 },
      { month: "12.18", 순위: 44, mobile: 80 },
      { month: "12.19", 순위: 40, mobile: 80 },
      { month: "12.20", 순위: 37, mobile: 80 },
      { month: "12.21", 순위: 33, mobile: 80 },
      { month: "12.22", 순위: 30, mobile: 80 },
      { month: "12.23", 순위: 26, mobile: 80 },
      { month: "12.24", 순위: 23, mobile: 80 },
      { month: "12.25", 순위: 19, mobile: 80 },
      { month: "12.26", 순위: 16, mobile: 80 },
      { month: "12.27", 순위: 12, mobile: 80 },
      { month: "12.28", 순위: 9, mobile: 80 },
      { month: "12.29", 순위: 6, mobile: 80 },
      { month: "12.30", 순위: 4, mobile: 80 },
      { month: "12.31", 순위: 3, mobile: 80 },
    ]
  },
  {
    placeId: "place_004",
    businessName: "연수구 한식당",
    keyword: "연수구 맛집",
    rankings: [
      { month: "12.04", 순위: 76, mobile: 80 },
      { month: "12.05", 순위: 73, mobile: 80 },
      { month: "12.06", 순위: 70, mobile: 80 },
      { month: "12.07", 순위: 67, mobile: 80 },
      { month: "12.08", 순위: 63, mobile: 80 },
      { month: "12.09", 순위: 60, mobile: 80 },
      { month: "12.10", 순위: 57, mobile: 80 },
      { month: "12.11", 순위: 53, mobile: 80 },
      { month: "12.12", 순위: 50, mobile: 80 },
      { month: "12.13", 순위: 47, mobile: 80 },
      { month: "12.14", 순위: 43, mobile: 80 },
      { month: "12.15", 순위: 40, mobile: 80 },
      { month: "12.16", 순위: 37, mobile: 80 },
      { month: "12.17", 순위: 33, mobile: 80 },
      { month: "12.18", 순위: 30, mobile: 80 },
      { month: "12.19", 순위: 27, mobile: 80 },
      { month: "12.20", 순위: 23, mobile: 80 },
      { month: "12.21", 순위: 20, mobile: 80 },
      { month: "12.22", 순위: 17, mobile: 80 },
      { month: "12.23", 순위: 13, mobile: 80 },
      { month: "12.24", 순위: 10, mobile: 80 },
      { month: "12.25", 순위: 7, mobile: 80 },
      { month: "12.26", 순위: 5, mobile: 80 },
      { month: "12.27", 순위: 4, mobile: 80 },
      { month: "12.28", 순위: 3, mobile: 80 },
      { month: "12.29", 순위: 2, mobile: 80 },
      { month: "12.30", 순위: 2, mobile: 80 },
      { month: "12.31", 순위: 2, mobile: 80 },
    ]
  },
  {
    placeId: "place_005",
    businessName: "구월동 정형외과",
    keyword: "구월동 병원",
    rankings: [
      { month: "12.04", 순위: 64, mobile: 80 },
      { month: "12.05", 순위: 62, mobile: 80 },
      { month: "12.06", 순위: 59, mobile: 80 },
      { month: "12.07", 순위: 56, mobile: 80 },
      { month: "12.08", 순위: 54, mobile: 80 },
      { month: "12.09", 순위: 51, mobile: 80 },
      { month: "12.10", 순위: 48, mobile: 80 },
      { month: "12.11", 순위: 45, mobile: 80 },
      { month: "12.12", 순위: 43, mobile: 80 },
      { month: "12.13", 순위: 40, mobile: 80 },
      { month: "12.14", 순위: 37, mobile: 80 },
      { month: "12.15", 순위: 34, mobile: 80 },
      { month: "12.16", 순위: 32, mobile: 80 },
      { month: "12.17", 순위: 29, mobile: 80 },
      { month: "12.18", 순위: 26, mobile: 80 },
      { month: "12.19", 순위: 23, mobile: 80 },
      { month: "12.20", 순위: 21, mobile: 80 },
      { month: "12.21", 순위: 18, mobile: 80 },
      { month: "12.22", 순위: 15, mobile: 80 },
      { month: "12.23", 순위: 12, mobile: 80 },
      { month: "12.24", 순위: 10, mobile: 80 },
      { month: "12.25", 순위: 7, mobile: 80 },
      { month: "12.26", 순위: 5, mobile: 80 },
      { month: "12.27", 순위: 4, mobile: 80 },
      { month: "12.28", 순위: 3, mobile: 80 },
      { month: "12.29", 순위: 2, mobile: 80 },
      { month: "12.30", 순위: 1, mobile: 80 },
      { month: "12.31", 순위: 1, mobile: 80 },
    ]
  }
];

export async function GET() {
  try {
    // 실제 서비스에서는 여기서 백엔드 API를 호출하여 실제 데이터를 가져옵니다
    // const response = await fetch(`${process.env.BACKEND_URL}/api/keyword/top-rankings`);
    // const data = await response.json();
    
    // 지금은 mock 데이터를 반환
    const topRankings = mockTopRankingData.filter(item => 
      item.rankings[item.rankings.length - 1].순위 <= 5 // 최종 순위가 5위 이내인 업체만
    );

    return NextResponse.json(topRankings, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5분 캐시
      }
    });

  } catch (error) {
    console.error('Error fetching top rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top rankings' }, 
      { status: 500 }
    );
  }
}
