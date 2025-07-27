"use client";

import React, { useState } from 'react';
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Container } from "@/components/common/Container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  ChevronRight, 
  Lock, 
  CheckCircle2,
  MessageSquare,
  Mail,
  Database,
  Settings,
  UserCheck,
  Globe,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const sections = [
  { id: 'overview', title: '제1조 (개인정보의 처리목적)', icon: '🎯' },
  { id: 'collection', title: '제2조 (개인정보의 수집 및 이용)', icon: '📊' },
  { id: 'retention', title: '제3조 (개인정보의 보유 및 이용기간)', icon: '📅' },
  { id: 'security', title: '제4조 (개인정보의 안전성 확보조치)', icon: '🔒' },
  { id: 'rights', title: '제5조 (정보주체의 권리·의무)', icon: '⚖️' },
  { id: 'officer', title: '제6조 (개인정보 보호책임자)', icon: '👨‍💼' },
];

export default function PrivacyPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');

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
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-16">
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
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              개인정보처리방침
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              고객의 개인정보를 안전하게 보호하기 위한 처리방침입니다
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">최종 업데이트: 2025년 1월 1일</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">읽는 시간: 약 8분</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="text-sm">GDPR 준수</span>
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
                  <Shield className="w-4 h-4 text-green-500" />
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
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800 text-sm">개인정보 보호</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    최고 수준의 보안으로 고객의 개인정보를 안전하게 보호합니다.
                  </p>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800 text-sm">국제 표준 준수</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    GDPR, CCPA 등 국제 개인정보보호 법령을 준수합니다.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="prose prose-lg max-w-none">
              {/* Important Notice */}
              <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">개인정보보호 약속</h3>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      저희는 고객님의 개인정보를 중요하게 생각하며, 관련 법령에 따라 안전하게 처리하고 보호하기 위해 최선을 다하고 있습니다. 
                      본 개인정보처리방침을 통해 수집하는 개인정보의 항목, 처리 목적, 보유 기간 등을 투명하게 공개합니다.
                    </p>
                  </div>
                </div>
              </div>

              <section id="overview" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🎯</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제1조 (개인정보의 처리목적)</h2>
                  <Badge variant="outline" className="text-xs">필수</Badge>
                </div>
                <Card className="p-6">
                  <p className="text-slate-700 mb-4 leading-relaxed">
                    회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
                    이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        회원 관리
                      </h4>
                      <p className="text-blue-700 text-sm">회원가입, 회원제 서비스 이용, 본인확인, 개인식별, 불량회원 부정이용 방지</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        서비스 제공
                      </h4>
                      <p className="text-blue-700 text-sm">콘텐츠 제공, 맞춤서비스 제공, 본인인증, 연령인증</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        마케팅 활용
                      </h4>
                      <p className="text-blue-700 text-sm">신규 서비스 개발, 이벤트 및 광고성 정보 제공, 인구통계학적 특성에 따른 서비스 제공</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        고객 지원
                      </h4>
                      <p className="text-blue-700 text-sm">고객상담, 불만처리, 공지사항 전달, 문의사항 응답</p>
                    </div>
                  </div>
                </Card>
              </section>

              <section id="collection" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📊</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제2조 (개인정보의 수집 및 이용)</h2>
                  <Badge className="bg-blue-600">중요</Badge>
                </div>
                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">1. 필수 수집 정보</h4>
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <ul className="space-y-2 text-amber-800 text-sm">
                          <li>• <strong>회원가입:</strong> 이메일, 비밀번호, 이름, 연락처</li>
                          <li>• <strong>결제 시:</strong> 결제 정보, 청구지 주소</li>
                          <li>• <strong>사업자:</strong> 사업자등록번호, 회사명, 담당자 정보</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">2. 선택 수집 정보</h4>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <ul className="space-y-2 text-blue-800 text-sm">
                          <li>• 마케팅 수신 동의, 프로필 사진, 관심 분야</li>
                          <li>• 서비스 개선을 위한 설문조사 응답</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">3. 자동 수집 정보</h4>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <ul className="space-y-2 text-slate-700 text-sm">
                          <li>• IP주소, 쿠키, 방문기록, 서비스 이용기록</li>
                          <li>• 접속 로그, 접속 브라우저 정보</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              <section id="retention" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제3조 (개인정보의 보유 및 이용기간)</h2>
                </div>
                <Card className="p-6">
                  <div className="space-y-4">
                    <p className="text-slate-700">
                      개인정보는 수집·이용 목적이 달성되면 지체없이 파기됩니다. 단, 다음의 경우에는 명시한 기간 동안 보존합니다.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">회원 정보</h4>
                        <p className="text-blue-700 text-sm">회원 탈퇴 시까지 (법정 보존 의무 제외)</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">결제 정보</h4>
                        <p className="text-blue-700 text-sm">전자상거래법에 따라 5년간 보존</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">서비스 이용기록</h4>
                        <p className="text-blue-700 text-sm">통신비밀보호법에 따라 3개월간 보존</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">부정이용 기록</h4>
                        <p className="text-blue-700 text-sm">부정 이용 방지를 위해 1년간 보존</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              <section id="security" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🔒</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제4조 (개인정보의 안전성 확보조치)</h2>
                  <Badge className="bg-blue-600">보안</Badge>
                </div>
                <Card className="p-6">
                  <div className="space-y-6">
                    <p className="text-slate-700">
                      회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          기술적 보호조치
                        </h4>
                        <ul className="text-blue-700 text-sm space-y-1">
                          <li>• SSL 암호화 통신</li>
                          <li>• 개인정보 암호화 저장</li>
                          <li>• 해킹 등 침입차단 시스템</li>
                          <li>• 백신프로그램 운영</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          관리적 보호조치
                        </h4>
                        <ul className="text-green-700 text-sm space-y-1">
                          <li>• 개인정보보호 교육</li>
                          <li>• 접근권한 관리</li>
                          <li>• 개인정보보호 담당자 지정</li>
                          <li>• 정기적 보안점검</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          물리적 보호조치
                        </h4>
                        <ul className="text-purple-700 text-sm space-y-1">
                          <li>• 전산실 출입통제</li>
                          <li>• 문서보관함 잠금장치</li>
                          <li>• CCTV 설치 운영</li>
                          <li>• 보안카드 출입통제</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          사고 대응체계
                        </h4>
                        <ul className="text-orange-700 text-sm space-y-1">
                          <li>• 24/7 보안관제</li>
                          <li>• 침해사고 대응절차</li>
                          <li>• 개인정보 유출신고</li>
                          <li>• 피해 최소화 조치</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              <section id="rights" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⚖️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제5조 (정보주체의 권리·의무)</h2>
                  <Badge className="bg-blue-600">권리</Badge>
                </div>
                <Card className="p-6">
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-3">고객님의 권리</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="text-blue-700 text-sm">✅ 개인정보 열람 요구</div>
                        <div className="text-blue-700 text-sm">✅ 오류 등이 있을 경우 정정·삭제 요구</div>
                        <div className="text-blue-700 text-sm">✅ 처리정지 요구</div>
                        <div className="text-blue-700 text-sm">✅ 손해배상 청구</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">권리 행사 방법</h4>
                      <p className="text-slate-700 text-sm mb-3">
                        개인정보보호법 제35조에 따른 개인정보의 열람 청구를 아래의 부서에 할 수 있습니다.
                      </p>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-slate-700 text-sm">
                          📧 <strong>이메일:</strong> privacy@yourcompany.com<br/>
                          📞 <strong>전화:</strong> 1588-1234<br/>
                          🕒 <strong>접수시간:</strong> 평일 09:00 - 18:00
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              <section id="officer" className="mb-12 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">👨‍💼</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">제6조 (개인정보 보호책임자)</h2>
                </div>
                <Card className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-3">개인정보 보호책임자</h4>
                      <div className="space-y-2 text-blue-700 text-sm">
                        <p><strong>성명:</strong> 홍길동</p>
                        <p><strong>직책:</strong> 개인정보보호팀장</p>
                        <p><strong>연락처:</strong> 02-1234-5678</p>
                        <p><strong>이메일:</strong> privacy@yourcompany.com</p>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-3">개인정보 보호담당자</h4>
                      <div className="space-y-2 text-blue-700 text-sm">
                        <p><strong>성명:</strong> 김철수</p>
                        <p><strong>직책:</strong> 정보보안팀 과장</p>
                        <p><strong>연락처:</strong> 02-1234-5679</p>
                        <p><strong>이메일:</strong> security@yourcompany.com</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Contact Section */}
              <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">개인정보보호 문의</h3>
                  <p className="text-slate-600 mb-6">개인정보 처리에 대해 궁금한 점이나 신고할 사항이 있으시면 언제든지 연락주세요.</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      개인정보보호센터
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      privacy@yourcompany.com
                    </Button>
                  </div>
                  <div className="mt-6 text-sm text-slate-500">
                    <p>개인정보보호 전담팀 운영 | 24시간 신고접수</p>
                    <p className="mt-1">📧 privacy@yourcompany.com | 📞 1588-1234</p>
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