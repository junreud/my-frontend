// app/co-info/page.tsx 예시 (라우트 위치는 상황에 따라 다를 수 있음)

// 1. React import 제거(서버 컴포넌트는 필요 없음)
// import React from 'react';

// 2. 필요한 라이브러리/컴포넌트 import
import { Container } from '@/components/common/Container';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
// import CoInfoHero from '@/components/CoInfoPage/CoInfoHero';
// import CoInfoSection from '@/components/CoInfoPage/CoInfoSection';

// (선택) 서버에서 유저 정보 가져오는 함수 (lib/fetchUser.ts 예시)
import { fetchUserData } from '@/lib/getUser';

// 3. 서버 컴포넌트로 작성 (async function)
export default async function CoInfoPage() {
  // (A) 서버 측에서 로그인/유저 정보 조회 (백엔드 API 호출 or DB 직접 연결)
  let user = null;
  try {
    user = await fetchUserData(); 
    // 예: { id: 123, role: 'admin' } 이런 형태가 반환된다고 가정
  } catch (error) {
    console.error('유저 정보 가져오기 실패:', error);
    // user = null → 미로그인 취급
  }

  // (B) 서버에서 받아온 user를 Navbar에 props로 넘겨줌
  return (
    <>
      <Container>
        <Navbar user={user} />
      </Container>

      {/* 필요하면 CoInfoHero, CoInfoSection 등을 여기에 배치 */}
      {/* <CoInfoHero /> */}
      {/* <Container> */}
      {/*   <CoInfoSection /> */}
      {/* </Container> */}

      <Footer />
    </>
  );
}
