// lib/getUser.ts
// 예: 쿠키나 세션을 함께 보내야 한다면, fetch 옵션에 credentials/헤더 등을 추가해야 합니다.
// 여기서는 간단히 사용자 정보만 가져온다고 가정.

export async function fetchUserData() {
    const res = await fetch("http://localhost:4000/auth/me", {
      // SSR에서 쿠키가 필요하다면, 아래와 같이 설정 (Next.js 13의 request cookies는 별도 처리)
      // credentials: "include",
      // headers: {...}
      cache: "no-store", // 매번 fresh하게 가져오기
    });
  
    if (!res.ok) {
      throw new Error("Failed to fetch user data");
    }
  
    const data = await res.json();
    // data = { id: 123, role: 'admin' } 등
    return data;
  }
  