import { Container } from "@/components/common/Container";
import LogInHeader from "@/components/LogInPage/LogInHeader";
import IdentityVerificationForm from "@/components/SignUp/IdentityVerificationForm";

export default function ResisterPage() {
  return (
    // 화면 전체 높이를 차지하고, 라이트/다크 모두 흰 배경 유지
    <div className="min-h-screen bg-white dark:bg-white flex flex-col">

      {/* 상단 헤더 */}
      <Container>
        <LogInHeader />
      </Container>

      {/* 본문 컨텐츠 (여기서는 폼) */}
      <div className="pt-6 px-4 max-w-2xl w-full mx-auto mt-36 mb-28">
        <IdentityVerificationForm />
      </div>

      {/*
        만약 하단에 추가 컨텐츠(푸터 등)가 필요 없다면 여기서 끝.
        "flex flex-col" + "min-h-screen"으로 
        페이지가 내용에 맞게 늘어나며, 배경은 전부 흰색입니다.
      */}
    </div>
  );
}
