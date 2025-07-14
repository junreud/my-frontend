"use client";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Container } from "@/components/common/Container";
import SupportHero from "@/components/SupportPage/SupportHero";
import FAQ from "@/components/SupportPage/FAQ";
import ContactForm from "@/components/SupportPage/ContactForm";
import SupportChannels from "@/components/SupportPage/SupportChannels";
import { motion } from "framer-motion";

export default function SupportPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container>
        <Navbar />
      </Container>
      <SupportHero />
      <SupportChannels />
      <FAQ />
      <ContactForm />
      <Footer />
    </motion.div>
  );
}
