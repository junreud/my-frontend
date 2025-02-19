import { Container } from "@/components/common/Container";
import LogInNavbar from "@/components/LogInPage/LogInNavbar";
import RegisterForm from "./RegisterForm";


export default function ResisterPage() {
  return (
    <div>
      <Container>
        <LogInNavbar />
      </Container>
      {/* 다른 콘텐츠 위에 artboard 인풋 컴포넌트 */}
      <div className="h-screen overflow-y-auto bg-gray-50 flex items-center justify-center px-4 py-10 sm:py-20">
        {/**
         * 가운데 박스:
         * - max-w-md: 박스 최대 너비 28rem(약 448px)
         * - w-full  : 모바일 등 작은 화면에서 100% 너비
         * - bg-white + border + rounded + shadow : 흰 배경, 테두리, 둥근 모서리, 그림자
         * - p-4 vs sm:p-6 : 모바일에서는 1rem(4), PC에서는 1.5rem(6) 패딩
         */}
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-md shadow p-4 sm:p-6">
        <RegisterForm />
      </div>
    </div>
    </div>
  );
}
