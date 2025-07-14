
"use client";

import ServiceHero from "@/components/ServicePage/ServiceHero";
import ServiceOverview from "@/components/ServicePage/ServiceOverview";
import ServiceFeatures from "@/components/ServicePage/ServiceFeatures";
import ServicePricing from "@/components/ServicePage/ServicePricing";
import ServiceCTA from "@/components/ServicePage/ServiceCTA";
import Navbar from "@/components/common/Navbar";
import { Container } from "@/components/common/Container";
import Footer from "@/components/common/Footer";
import { motion } from "framer-motion";

export default function ServicePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container>
        <Navbar />
      </Container>
      <ServiceHero />
      <ServiceOverview />
      <ServiceFeatures />
      <ServicePricing />
      <ServiceCTA />
      <Footer />
    </motion.div>
  );
}
