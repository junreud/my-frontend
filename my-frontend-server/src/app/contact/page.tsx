"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MessageSquare, 
  Mail, 
  Phone, 
  User,
  Clock,
  CheckCircle2,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

const consultationTypes = [
  { value: 'demo', label: '제품 데모 요청' },
  { value: 'pricing', label: '맞춤 견적 상담' },
  { value: 'migration', label: '기존 시스템 마이그레이션' },
  { value: 'integration', label: 'API 연동 상담' },
  { value: 'training', label: '팀 교육 및 온보딩' },
  { value: 'enterprise', label: '엔터프라이즈 솔루션' },
];

const companySize = [
  { value: '1-10', label: '1-10명' },
  { value: '11-50', label: '11-50명' },
  { value: '51-200', label: '51-200명' },
  { value: '201-1000', label: '201-1000명' },
  { value: '1000+', label: '1000명 이상' },
];

function ContactContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    phone: '',
    companySize: '',
    consultationType: '',
    places: '',
    currentSolution: '',
    message: '',
    preferredTime: '',
  });

  const planType = searchParams.get('plan');

  useEffect(() => {
    if (planType === 'business') {
      setFormData(prev => ({
        ...prev,
        consultationType: 'enterprise'
      }));
    }
  }, [planType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 실제 상담 요청 처리
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('상담 요청이 성공적으로 접수되었습니다!');
      router.push('/dashboard?consultation=requested');
    } catch {
      toast.error('상담 요청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
          <h1 className="text-2xl font-bold text-slate-800">상담 요청</h1>
          {planType === 'business' && (
            <Badge className="bg-slate-700 text-white">
              <Star className="w-3 h-3 mr-1" />
              엔터프라이즈
            </Badge>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* 상담 안내 */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                무료 상담 안내
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 상담 혜택 */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-slate-800 mb-4">상담을 통해 받을 수 있는 혜택</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-slate-800">맞춤형 솔루션 제안</div>
                      <div className="text-sm text-slate-600">귀하의 비즈니스에 최적화된 플랜과 기능 추천</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-slate-800">실시간 제품 데모</div>
                      <div className="text-sm text-slate-600">실제 화면을 통한 기능 시연 및 질의응답</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-slate-800">마이그레이션 지원</div>
                      <div className="text-sm text-slate-600">기존 시스템에서 무료 데이터 이전 지원</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-slate-800">특별 할인 혜택</div>
                      <div className="text-sm text-slate-600">상담 고객 전용 할인 코드 제공</div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* 상담 프로세스 */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">상담 진행 과정</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">상담 요청 접수</div>
                      <div className="text-sm text-slate-600">요청서 작성 후 24시간 이내 연락</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">일정 조율</div>
                      <div className="text-sm text-slate-600">편리한 시간에 온라인 또는 오프라인 상담</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">맞춤 제안</div>
                      <div className="text-sm text-slate-600">상세한 견적서와 도입 계획 제공</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 연락처 정보 */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-800 mb-3">긴급 문의</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>1588-1234</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>sales@yourcompany.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>평일 09:00 - 18:00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 상담 요청 폼 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                상담 요청서
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 기본 정보 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800">기본 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">이름 *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="홍길동"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">이메일 *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">회사명 *</Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="회사명"
                        value={formData.company}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">직책</Label>
                      <Input
                        id="position"
                        name="position"
                        placeholder="직책/부서"
                        value={formData.position}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">연락처 *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="010-1234-5678"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="companySize">회사 규모</Label>
                      <Select onValueChange={(value) => handleSelectChange('companySize', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="회사 규모 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {companySize.map(size => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 상담 내용 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800">상담 내용</h3>
                  <div>
                    <Label htmlFor="consultationType">상담 유형 *</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange('consultationType', value)}
                      value={formData.consultationType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="상담 유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {consultationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="places">관리 예정 플레이스 수</Label>
                      <Input
                        id="places"
                        name="places"
                        placeholder="예: 5개"
                        value={formData.places}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferredTime">희망 상담 시간</Label>
                      <Input
                        id="preferredTime"
                        name="preferredTime"
                        placeholder="예: 평일 오후 2-4시"
                        value={formData.preferredTime}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="currentSolution">현재 사용 중인 솔루션</Label>
                    <Input
                      id="currentSolution"
                      name="currentSolution"
                      placeholder="예: 수기 관리, 엑셀, 기타 솔루션"
                      value={formData.currentSolution}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">상세 문의 내용</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="궁금한 점이나 특별한 요구사항을 자세히 작성해주세요."
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* 제출 버튼 */}
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 text-lg font-semibold hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        상담 요청 중...
                      </div>
                    ) : (
                      '상담 요청하기'
                    )}
                  </Button>

                  <p className="text-xs text-slate-500 text-center">
                    상담 요청 시 <a href="/terms" className="text-blue-600 hover:underline">이용약관</a> 및{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline">개인정보처리방침</a>에 동의하게 됩니다.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">상담 페이지를 로딩 중...</p>
        </div>
      </div>
    }>
      <ContactContent />
    </Suspense>
  );
}
