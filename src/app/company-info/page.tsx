"use client";

import { Suspense } from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Container } from "@/components/common/Container";
import CompanyOverview from "@/components/CompanyInfoPage/CompanyOverview";
import CompanyStats from "@/components/CompanyInfoPage/CompanyStats";
import CompanyMission from "@/components/CompanyInfoPage/CompanyMission";
import CompanyAwards from "@/components/CompanyInfoPage/CompanyAwards";
import CompanyContact from "@/components/CompanyInfoPage/CompanyContact";
import LoadingSpinner from "@/components/ui/LoadingStates/LoadingSpinner";
import ErrorMessage from "@/components/ui/LoadingStates/ErrorMessage";

// 섹션별 로딩 컴포넌트
const SectionSkeleton = () => (
  <div className="animate-pulse py-16">
    <div className="max-w-7xl mx-auto px-4">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

export default function CompanyInfoPage() {
  return (
    <>
      <Container>
        <Navbar />
      </Container>
      
      <main role="main" aria-label="회사 정보">
        <Suspense fallback={<SectionSkeleton />}>
          <CompanyOverview />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <CompanyStats />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <CompanyMission />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <CompanyAwards />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <CompanyContact />
        </Suspense>
      </main>
      
      <Footer />
    </>
  );
}
