import RankSeoTabs from "@/components/RankSeoTabs";
import ServiceHero from "@/components/ServiceHero";
import { Container } from "@/components/ui/Container";

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
