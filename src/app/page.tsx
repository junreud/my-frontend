// pages/index.jsx
import React from "react";
import HomepageHero from "../components/HomepageHero";
import { Container } from "@/components/ui/Container";
import Homepage from "@/components/Homepage";

const HomePage = () => {
  return (
    <>
    <HomepageHero />
    <Container>
      <Homepage />
    </Container>
    </>
  );
};

export default HomePage;
