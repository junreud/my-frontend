"use client";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Container } from "@/components/common/Container";
import CompanyOverview from "@/components/CompanyInfoPage/CompanyOverview";
import CompanyStats from "@/components/CompanyInfoPage/CompanyStats";
import CompanyMission from "@/components/CompanyInfoPage/CompanyMission";
import CompanyAwards from "@/components/CompanyInfoPage/CompanyAwards";
import CompanyContact from "@/components/CompanyInfoPage/CompanyContact";

export default function CompanyInfoPage() {
  return (
    <>
      <Container>
        <Navbar />
      </Container>
      
      <main role="main" aria-label="회사 정보">
        <CompanyOverview />
        <CompanyStats />
        <CompanyMission />
        <CompanyAwards />
        <CompanyContact />
      </main>
      
      <Footer />
    </>
  );
}
