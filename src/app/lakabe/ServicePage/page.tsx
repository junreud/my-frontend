import RankSeoTabs from "@/components/ui/RankSeoTabs";
import ServiceHero from "@/components/ServicePage/ServiceHero";
import { Container } from "@/components/common/Container";

export default function ServicePage() {
  return (
    <main>
      <ServiceHero />
      <Container>
        <RankSeoTabs />
      </Container>
    </main>
  );
}
