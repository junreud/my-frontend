import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Container } from "@/components/common/Container";
import SupportHero from "@/components/SupportPage/SupportHero";
import FAQ from "@/components/SupportPage/FAQ";
import ContactForm from "@/components/SupportPage/ContactForm";
import SupportChannels from "@/components/SupportPage/SupportChannels";

export default function SupportPage() {
  return (
    <>
      <Container>
        <Navbar />
      </Container>
      <SupportHero />
      <SupportChannels />
      <FAQ />
      <ContactForm />
      <Footer />
    </>
  );
}
