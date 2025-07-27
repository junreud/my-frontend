import { Container } from "@/components/common/Container";
import LogInHeader from "@/components/LogInPage/LogInHeader";
import IdentityVerificationForm from "@/components/SignUp/IdentityVerificationForm";

export default function ResisterPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-white flex flex-col">
      {/* 상단 헤더 */}
      <Container>
        <LogInHeader />
      </Container>

      {/* 본문 컨텐츠 (여기서는 폼) */}
      <div className="min-h-screen flex items-center justify-center">
        {/* 가로폭 조절용 래퍼 */}
        <div className="w-full max-w-md px-4">
          <IdentityVerificationForm />
        </div>
      </div>
    </div>
  );
}
