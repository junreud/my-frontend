"use client";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Container } from "@/components/common/Container";
import CompanyInfo from "@/components/AboutPage/CompanyInfo";
import TeamSection from "@/components/AboutPage/TeamSection";
import CompanyHistory from "@/components/AboutPage/CompanyHistory";
import CompanyValues from "@/components/AboutPage/CompanyValues";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Container>
        <Navbar />
      </Container>
      <CompanyInfo />
      <CompanyValues />
      <CompanyHistory />
      <TeamSection />
      <Footer />
    </motion.div>
  );
}
