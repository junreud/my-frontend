// pages.jsx
import HomepageHero from "../components/HomePage/HomepageHero";
import { Container } from "@/components/common/Container";
import Homepage from "@/components/HomePage/Homepage";
import HomepageSection from "@/components/HomePage/HomepageSection";
import IsItImposible from "@/components/ui/IsItImposible";

import Cheheom from "@/components/HomePage/Cheheom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import "./globals.css"
const HomePage = () => {
  return (
    <>
      <Container>
        {/* Pass a placeholder user prop */}
        <Navbar user={null} />
      </Container>
      <HomepageHero />
      <HomepageSection />
      <Container>
        <Homepage />
      </Container>
      <IsItImposible />
      <Cheheom />
      <Footer />
    </>
  );
};

export default HomePage;