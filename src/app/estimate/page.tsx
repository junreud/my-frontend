import InputArtboard from "@/components/ui/InputArtboard";
import Navbar from "@/components/common/Navbar";
import { Container } from "@/components/common/Container";
import Footer from "@/components/common/Footer";

export default function SomePage() {
  return (
    <div>
      <Container>
        <Navbar />
      </Container>
      {/* 다른 콘텐츠 위에 artboard 인풋 컴포넌트 */}
      <InputArtboard />
      <Footer />
    </div>
  );
}
