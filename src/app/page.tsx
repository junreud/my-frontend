// pages.jsx
import HomepageHero from "../components/HomePage/HomepageHero";
import { Container } from "@/components/common/Container";
import Homepage from "@/components/HomePage/Homepage";
import HomepageSection from "@/components/HomePage/HomepageSection";
import IsItImposible from "@/components/ui/IsItImposible";
import Cheheom from "@/components/HomePage/Cheheom";
import CustomerTestimonials from "@/components/HomePage/CustomerTestimonials";
import CompanyIntro from "@/components/HomePage/CompanyIntro";
import ServiceAdvantages from "@/components/HomePage/ServiceAdvantages";
import ContactSection from "@/components/HomePage/ContactSection";
import NewsSection from "@/components/HomePage/NewsSection";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import "./globals.css"

const HomePage = () => {
  return (
    <>
      <Container>
        {/* Pass a placeholder user prop */}
        <Navbar />
      </Container>
      <HomepageHero />
      <HomepageSection />
      <Container>
        <Homepage />
      </Container>
      <ServiceAdvantages />
      <CustomerTestimonials />
      <IsItImposible />
      <Cheheom />
      <CompanyIntro />
      <NewsSection />
      <ContactSection />
      <Footer />
    </>
  );
};

export default HomePage;