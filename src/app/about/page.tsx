import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Container } from "@/components/common/Container";
import CompanyInfo from "@/components/AboutPage/CompanyInfo";
import TeamSection from "@/components/AboutPage/TeamSection";
import CompanyHistory from "@/components/AboutPage/CompanyHistory";
import CompanyValues from "@/components/AboutPage/CompanyValues";

export default function AboutPage() {
  return (
    <>
      <Container>
        <Navbar />
      </Container>
      <CompanyInfo />
      <CompanyValues />
      <CompanyHistory />
      <TeamSection />
      <Footer />
    </>
  );
}
