import { Container } from "@/components/common/Container";
import LogInNavbar from "@/components/ui/LogInNavbar";
import SignUpPage from "@/components/ui/Register";


export default function ResisterPage() {
  return (
    <div>
      <Container>
        <LogInNavbar />
      </Container>
      {/* 다른 콘텐츠 위에 artboard 인풋 컴포넌트 */}
      <SignUpPage />
    </div>
  );
}
