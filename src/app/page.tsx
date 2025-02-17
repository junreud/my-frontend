// pages/index.jsx
import React from "react";
import HomepageHero from "../components/HomePage/HomepageHero";
import { Container } from "@/components/common/Container";
import Homepage from "@/components/HomePage/Homepage";
import HomepageSection from "@/components/HomePage/HomepageSection";
import IsItImposible from "@/components/ui/IsItImposible";
import Page from "@/components/ui/Dialog";
import Cheheom from "@/components/HomePage/Cheheom";

const HomePage = () => {
  return (
    <>
    <HomepageHero />
    <HomepageSection />
    <Container>
      <Homepage />
    </Container>
    <IsItImposible />
    
    <Cheheom />
    
    <Page />
    </>
  );
};

export default HomePage;