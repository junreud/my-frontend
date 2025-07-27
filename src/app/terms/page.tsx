"use client";

import React, { useState } from 'react';
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Container } from "@/components/common/Container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Shield, 
  CheckCircle2,
  ArrowLeft,
  MessageSquare,
  Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const sections = [
  { id: 'purpose', title: '제1조 (목적)', icon: '🎯' },
  { id: 'definitions', title: '제2조 (정의)', icon: '📋' },
  { id: 'terms-effect', title: '제3조 (약관의 효력 및 변경)', icon: '⚖️' },
  { id: 'service-provision', title: '제4조 (서비스의 제공 및 변경)', icon: '🚀' },
  { id: 'service-interruption', title: '제5조 (서비스의 중단)', icon: '⏸️' },
  { id: 'membership', title: '제6조 (회원가입)', icon: '👤' },
  { id: 'member-obligations', title: '제7조 (회원의 의무)', icon: '📜' },
  { id: 'company-obligations', title: '제8조 (회사의 의무)', icon: '🏢' },
  { id: 'payment', title: '제9조 (요금 및 결제)', icon: '💳' },
  { id: 'cancellation', title: '제10조 (계약 해지)', icon: '❌' },
  { id: 'liability', title: '제11조 (손해배상)', icon: '⚠️' },
  { id: 'disputes', title: '제12조 (분쟁 해결)', icon: '🤝' },
];

export default function TermsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('purpose');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Container>
        <Navbar />
      </Container>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              이용약관
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              안전하고 투명한 서비스 이용을 위한 약관을 확인해보세요
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">최종 업데이트: 2025년 1월 1일</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">읽는 시간: 약 10분</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">법적 구속력 있음</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              PDF 다운로드
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              인쇄하기
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  목차
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base">{section.icon}</span>
                      <span className="text-xs leading-tight">{section.title}</span>
                      <ChevronRight className="w-3 h-3 ml-auto" />
                    </button>
                  ))}
                </nav>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800 text-sm">안전한 서비스</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    투명하고 공정한 약관으로 고객의 권익을 보호합니다.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="prose prose-lg max-w-none">
              {/* Important Notice */}
              <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-sm">⚠️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-2">중요 공지</h3>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      본 이용약관은 법적 구속력을 가지는 계약입니다. 서비스 이용 전 반드시 전문을 읽고 이해하시기 바랍니다. 
                      약관에 동의하지 않으시면 서비스 이용이 제한될 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <section id="purpose" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🎯</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제1조 (목적)</h2>
                  <Badge variant="outline" className="text-xs">필수</Badge>
                </div>
                <Card className="p-6 bg-slate-50">
                  <p className="text-slate-700 leading-relaxed">
                    이 약관은 <strong>회사가 제공하는 네이버 플레이스 마케팅 서비스</strong>의 이용과 관련하여 회사와 이용자간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                  </p>
                </Card>
              </section>

              <section id="definitions" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📋</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제2조 (정의)</h2>
                  <Badge variant="outline" className="text-xs">필수</Badge>
                </div>
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-slate-900 mb-1">1. &ldquo;서비스&rdquo;</h4>
                      <p className="text-slate-700 text-sm">회사가 제공하는 네이버 플레이스 마케팅 관련 모든 서비스를 의미합니다.</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-slate-900 mb-1">2. &ldquo;회원&rdquo;</h4>
                      <p className="text-slate-700 text-sm">회사와 서비스 이용계약을 체결하고 이용자 아이디(ID)를 부여받은 자를 의미합니다.</p>
                    </div>
                    <div className="border-l-4 border-blue-600 pl-4">
                      <h4 className="font-semibold text-slate-900 mb-1">3. &ldquo;이용자 아이디(ID)&rdquo;</h4>
                      <p className="text-slate-700 text-sm">회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.</p>
                    </div>
                    <div className="border-l-4 border-blue-700 pl-4">
                      <h4 className="font-semibold text-slate-900 mb-1">4. &ldquo;비밀번호&rdquo;</h4>
                      <p className="text-slate-700 text-sm">회원이 부여받은 이용자 아이디와 일치되는 회원임을 확인하고 비밀보호를 위해 회원 자신이 정한 문자 또는 숫자의 조합을 의미합니다.</p>
                    </div>
                  </div>
                </Card>
              </section>

              <section id="terms-effect" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⚖️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제3조 (약관의 효력 및 변경)</h2>
                </div>
                <Card className="p-6">
                  <ol className="space-y-4 list-decimal list-inside">
                    <li className="text-slate-700">이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력을 발생합니다.</li>
                    <li className="text-slate-700">회사는 합리적인 사유가 발생할 경우에는 이 약관을 변경할 수 있으며, 약관이 변경되는 경우 변경된 약관의 내용과 시행일을 명시하여 현행약관과 함께 그 시행일의 <strong className="text-blue-600">7일 이전부터 공지</strong>합니다.</li>
                  </ol>
                </Card>
              </section>

              <section id="service-provision" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🚀</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제4조 (서비스의 제공 및 변경)</h2>
                </div>
                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">1. 회사는 회원에게 아래와 같은 서비스를 제공합니다:</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">네이버 플레이스 정보 관리</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">리뷰 모니터링 및 응답 지원</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">방문자 수 및 검색 순위 분석</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">마케팅 자동화 도구</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">성과 분석 및 리포트</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-slate-600" />
                          <span className="text-sm text-slate-800">기타 회사가 정하는 서비스</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-700">2. 회사는 서비스의 품질 향상을 위해 서비스의 전부 또는 일부를 변경할 수 있습니다.</p>
                    </div>
                  </div>
                </Card>
              </section>

              <section id="service-interruption" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⏸️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제5조 (서비스의 중단)</h2>
                </div>
                <Card className="p-6">
                  <div className="space-y-4">
                    <p className="text-slate-700">
                      1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
                    </p>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-amber-800 text-sm">
                        <strong>📢 공지:</strong> 계획된 서비스 중단의 경우 사전에 공지드리며, 
                        불가피한 긴급 상황의 경우 최대한 신속하게 복구하도록 노력하겠습니다.
                      </p>
                    </div>
                  </div>
                </Card>
              </section>

              <section id="membership" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제6조 (회원가입)</h2>
                </div>
                <Card className="p-6">
                  <div className="space-y-4">
                    <p className="text-slate-700">
                      1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
                    </p>
                    <p className="text-slate-700">
                      2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각호에 해당하지 않는 한 회원으로 등록합니다.
                    </p>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-800 mb-2">가입 제한 사유</h4>
                      <ul className="space-y-1 text-amber-700 text-sm">
                        <li>• 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                        <li>• 등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                        <li>• 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </section>

              <section id="member-obligations" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📜</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제7조 (회원의 의무)</h2>
                </div>
                <Card className="p-6">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          정보 보안
                        </h4>
                        <p className="text-blue-700 text-sm">아이디와 비밀번호의 관리 책임은 회원에게 있으며, 이를 제3자가 이용하도록 하여서는 안됩니다.</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          정확한 정보
                        </h4>
                        <p className="text-blue-700 text-sm">회원은 정확하고 최신의 정보를 제공해야 하며, 변경사항이 있을 때 즉시 수정해야 합니다.</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-2">금지 행위</h4>
                      <ul className="space-y-1 text-slate-700 text-sm">
                        <li>• 서비스의 안정적 운영에 지장을 주는 행위</li>
                        <li>• 타인의 권리나 명예를 침해하는 행위</li>
                        <li>• 법령에 위반되거나 미풍양속에 반하는 행위</li>
                        <li>• 허위 정보의 유포나 스팸 전송</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </section>

              <section id="payment" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💳</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제9조 (요금 및 결제)</h2>
                  <Badge className="bg-blue-600">중요</Badge>
                </div>
                <Card className="p-6">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-2xl mb-2">💳</div>
                        <h4 className="font-semibold text-slate-800 mb-1">결제 방법</h4>
                        <p className="text-slate-600 text-sm">카드, 계좌이체, 가상계좌</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-2xl mb-2">🔄</div>
                        <h4 className="font-semibold text-slate-800 mb-1">자동 갱신</h4>
                        <p className="text-slate-600 text-sm">구독 서비스 자동 연장</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-2xl mb-2">📄</div>
                        <h4 className="font-semibold text-slate-800 mb-1">영수증</h4>
                        <p className="text-slate-600 text-sm">세금계산서 발행 가능</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">환불 정책</h4>
                      <p className="text-blue-700 text-sm">
                        서비스 이용 시작 후 7일 이내 취소 시 전액 환불이 가능합니다. 
                        부분 사용 후에는 사용 기간을 제외한 잔여 기간에 대해 환불됩니다.
                      </p>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Contact Section */}
              <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">약관 관련 문의</h3>
                  <p className="text-slate-600 mb-6">이용약관에 대해 궁금한 점이 있으시면 언제든지 문의해주세요.</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      고객센터 문의
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      이메일 문의
                    </Button>
                  </div>
                  <div className="mt-6 text-sm text-slate-500">
                    <p>평일 09:00 - 18:00 | 주말 및 공휴일 휴무</p>
                    <p className="mt-1">📧 legal@yourcompany.com | 📞 1588-1234</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
 