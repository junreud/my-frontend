// pages/index.jsx
import React from "react";
import HomepageHero from "../components/HomePage/HomepageHero";
import { Container } from "@/components/common/Container";
import Homepage from "@/components/HomePage/Homepage";
import HomepageSection from "@/components/HomePage/HomepageSection";
import IsItImposible from "@/components/ui/IsItImposible";
import Page from "@/components/ui/Dialog";
import Cheheom from "@/components/HomePage/Cheheom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

const HomePage = () => {
  return (
    <>
    <Container>
    <Navbar />
    </Container>
    <HomepageHero />
    <HomepageSection />
    <Container>
      <Homepage />
    </Container>
    <IsItImposible />
    
    <Cheheom />
    
    <Page />
    <Footer />
    </>
  );
};

export default HomePage;