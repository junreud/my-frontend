"use client";

import Navbar from "@/components/common/Navbar";
import { Container } from "@/components/common/Container";
import Footer from "@/components/common/Footer";
import EstimateHero from "@/components/EstimatePage/EstimateHero";
import EstimateProcess from "@/components/EstimatePage/EstimateProcess";
import EstimateForm from "@/components/EstimatePage/EstimateForm";
import { motion } from "framer-motion";

export default function EstimatePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container>
        <Navbar />
      </Container>
      <EstimateHero />
      <EstimateProcess />
      <EstimateForm />
      <Footer />
    </motion.div>
  );
}
