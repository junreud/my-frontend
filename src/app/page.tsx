// pages/index.jsx
import React from "react";
import HomepageHero from "../components/HomepageHero";
import { Container } from "@/components/ui/Container";
import Homepage from "@/components/Homepage";
import HomepageSection from "@/components/HomepageSection";
import IsItImposible from "@/components/IsItImposible";
import Page from "@/components/Dialog";
import Cheheom from "@/components/Cheheom";

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