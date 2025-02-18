import RankSeoTabs from "@/components/ui/RankSeoTabs";
import ServiceHero from "@/components/ServicePage/ServiceHero";
import { Container } from "@/components/common/Container";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export default function ServicePage() {
  return (
    <>
      <Container>
        <Navbar />
      </Container>
      <ServiceHero />
      <Container>
        <RankSeoTabs />
      </Container>
      <Footer />
    </>
  );
}
