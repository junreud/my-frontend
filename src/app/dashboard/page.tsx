import { headers } from 'next/headers'; // headers import 유지
import { redirect } from "next/navigation"

import { ClientAnimatedNumber } from "@/components/animations/ClientAnimatedNumber" // 새로 만든 클라이언트 컴포넌트 import
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import DashboardChart from "@/components/Dashboard/DashboardChart" // !! 중요: 이 컴포넌트 파일 상단에 "use client" 필요

// --- 서버 측 데이터 타입 정의 (예시) ---
interface User {
  id: number;
  username: string;
  email: string;
  url_registration: number;
  // ... 기타 사용자 속성
}

interface MainKeywordStatus {
  keyword: string;
  currentRank: number;
  diff: number;
}
// --- ---

// --- 서버 측 데이터 Fetch 함수 (수정: 함수 내부에서 headers() 호출) ---

// fetchServerAPI 헬퍼 함수는 token을 받도록 유지 (호출하는 쪽에서 전달)
async function fetchServerAPI(endpoint: string, token: string | undefined | null) {
  if (!token) {
    console.warn(`Authorization header not found or empty for API call: ${endpoint}`);
    return null;
  }
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.error("API Base URL (NEXT_PUBLIC_API_BASE_URL) is not defined.");
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
      headers: {
        // 미들웨어에서 설정한 Authorization 헤더를 그대로 사용
        'Authorization': token, // token 변수에는 'Bearer xxx' 형태가 담겨있음
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${endpoint} on server: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint} on server:`, error);
    return null;
  }
}

// 각 함수가 token 파라미터를 제거하고 내부에서 headers() 호출
async function getUserData(): Promise<User | null> {
  const headersList = headers(); // 함수 내부에서 호출
  const token = headersList.get('Authorization');
  const data = await fetchServerAPI('/users/me', token);
  return data?.user || null;
}

async function getMainKeywordStatus(): Promise<MainKeywordStatus | null> {
  const headersList = headers(); // 함수 내부에서 호출
  const token = headersList.get('Authorization');
  const data = await fetchServerAPI('/keyword/main-status', token);
  return data?.data || null;
}

async function getDailyStats(): Promise<{ todayUsers: { count: number; description: string }; newClients: { count: number; description: string } } | null> {
  const headersList = headers(); // 함수 내부에서 호출
  const token = headersList.get('Authorization');
  const data = await fetchServerAPI('/stats/daily-summary', token); // !! 실제 엔드포인트 확인 !!
  if (!data) {
    return {
      todayUsers: { count: 0, description: '데이터 로딩 실패' },
      newClients: { count: 0, description: '데이터 로딩 실패' }
    };
  }
  return { // !! 실제 응답 구조 확인 !!
    todayUsers: data.todayUsers || { count: 0, description: '데이터 없음' },
    newClients: data.newClients || { count: 0, description: '데이터 없음' }
  };
}

async function getKeywordRankings(): Promise<{ keyword: string; rank: string }[]> {
  const headersList = headers(); // 함수 내부에서 호출
  const token = headersList.get('Authorization');
  const data = await fetchServerAPI('/keywords/rankings', token); // !! 실제 엔드포인트 확인 !!
  return data?.rankings || []; // !! 실제 응답 구조 확인 !!
}

async function getChartData(mainKeyword: string | undefined): Promise<any> {
  if (!mainKeyword) {
    console.warn("Main keyword is undefined, cannot fetch chart data.");
    return null;
  }
  const headersList = headers(); // 함수 내부에서 호출
  const token = headersList.get('Authorization');
  const encodedKeyword = encodeURIComponent(mainKeyword);
  const data = await fetchServerAPI(`/keywords/chart-data/${encodedKeyword}`, token); // !! 실제 엔드포인트 확인 !!
  return data?.chartData || null; // !! 실제 응답 구조 확인 !!
}
// --- ---


/**
 * /dashboard로 접근했을 때 (서버 컴포넌트):
 * 1) 서버에서 사용자 인증 및 데이터 로드 시도
 *   - 인증 실패 시 /login 리다이렉트
 *   - url_registration === 0 시 /welcomepage 리다이렉트
 * 2) 필요한 데이터 병렬 로드 (사용자 정보, 메인 키워드, 기타 카드/테이블 데이터)
 * 3) 데이터 로드 완료 후 "대시보드 UI" 렌더 (데이터는 props로 전달)
 */

// 페이지 컴포넌트를 async 함수로 변경
export default async function DashboardPage() {
  // 메인 키워드 상태 먼저 가져오기 (내부에서 headers() 사용)
  const mainKeywordStatus = await getMainKeywordStatus();
  const mainKeyword = mainKeywordStatus?.keyword;

  // 나머지 데이터 병렬 로딩 (내부에서 headers() 사용)
  const [
    user,
    dailyStats,
    keywordRankings,
    chartData
  ] = await Promise.all([
    getUserData(), // token 인자 제거
    getDailyStats(), // token 인자 제거
    getKeywordRankings(), // token 인자 제거
    getChartData(mainKeyword) // token 인자 제거
  ]);

  // (A) 사용자 인증 및 상태 확인 (서버 측)
  if (!user) {
    // 토큰이 없거나 유효하지 않아 사용자 정보를 가져오지 못한 경우
    console.log("User data fetch failed, likely due to missing or invalid token. Redirecting to login.");
    redirect("/login");
  }
  // url_registration 체크는 유지
  if (user.url_registration === 0) {
    redirect("/welcomepage");
  }

  // 데이터 로딩 실패 또는 null일 경우 기본값 설정
  const todaysUsersData = dailyStats?.todayUsers || { count: 0, description: '데이터 로딩 실패' };
  const newClientsData = dailyStats?.newClients || { count: 0, description: '데이터 로딩 실패' };


  // -------------------------
  // (이하: UI 렌더링 - 서버에서 로드한 데이터 사용)
  // -------------------------
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {/* 카드 1: Main Keyword Status */}
        <Card>
          <CardHeader>
            <CardTitle>Main Keyword</CardTitle>
            <CardDescription>
              {mainKeywordStatus
                ? `${mainKeywordStatus.diff > 0 ? '+' : ''}${mainKeywordStatus.diff}위 변동`
                : '데이터 없음' }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-indigo-600">
            {mainKeywordStatus
              ? `${mainKeywordStatus.currentRank}위`
              : 'N/A' }
            {mainKeywordStatus && (
              <div className="text-sm text-gray-500 mt-1">{mainKeywordStatus.keyword}</div>
            )}
          </CardContent>
        </Card>

        {/* 카드 2: Today’s Users */}
        <Card>
          <CardHeader>
            <CardTitle>Today’s Users</CardTitle>
            {/* 서버에서 가져온 설명 사용 */}
            <CardDescription>{todaysUsersData.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-blue-600">
            <ClientAnimatedNumber to={todaysUsersData.count} duration={1.5} />
          </CardContent>
        </Card>

        {/* 카드 3: New Clients */}
        <Card>
          <CardHeader>
            <CardTitle>New Clients</CardTitle>
            {/* 서버에서 가져온 설명 사용 */}
            <CardDescription>{newClientsData.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-orange-600">
             <ClientAnimatedNumber to={newClientsData.count} duration={1.5} />
          </CardContent>
        </Card>
      </div>

      {/* 아래쪽: 그래프 + 키워드 테이블 영역 */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {/* 그래프 - DashboardChart는 클라이언트 컴포넌트. 서버에서 가져온 데이터 전달 */}
        <DashboardChart initialData={chartData} />

        {/* 키워드 순위 테이블 - 서버에서 로드한 데이터 사용 */}
        <Card className="rounded-xl p-4">
          <h2 className="mb-2 text-lg font-semibold text-center">내 키워드 현재 순위</h2>
          <div className="w-full max-w-3xl mx-auto px-4 py-2">
            <table className="w-full table-auto text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-2 font-medium text-gray-600">키워드</th>
                  <th className="p-2 font-medium text-gray-600">현재순위</th>
                </tr>
              </thead>
              <tbody>
                {keywordRankings && keywordRankings.length > 0 ? (
                  keywordRankings.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-2">{item.keyword}</td>
                      <td className="p-2">{item.rank}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="p-2 text-center text-gray-500">키워드 데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}
