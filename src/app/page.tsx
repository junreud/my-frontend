// pages/index.jsx
import React from "react";
import HomepageHero from "../components/HomepageHero";
import { Container } from "@/components/ui/Container";
import Homepage from "@/components/Homepage";
import HomepageSection from "@/components/HomepageSection";

const HomePage = () => {
  return (
    <>
    <HomepageHero />
    <HomepageSection />
    <Container>
      <Homepage />
    </Container>
    </>
  );
};

export default HomePage;
