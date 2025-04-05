// app/co-info/page.tsx 예시 (라우트 위치는 상황에 따라 다를 수 있음)


import { Container } from '@/components/common/Container';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
// import CoInfoHero from '@/components/CoInfoPage/CoInfoHero';
// import CoInfoSection from '@/components/CoInfoPage/CoInfoSection';

// 3. 서버 컴포넌트로 작성 (async function)
export default async function CoInfoPage() {
  return (
    <>
      <Container>
        <Navbar/>
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
