// lib/getUser.ts

export async function fetchUserData() {
    const res = await fetch("https://localhost:4000/auth/me", {
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
