"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  ArrowLeft, 
  CreditCard, 
  User,
  Shield,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

const plans = {
  starter: {
    name: "Starter",
    price: { monthly: 9900, yearly: 99000 },
    description: "소상공인을 위한 시작 플랜",
    features: [
      "플레이스 최대 3개",
      "리뷰/방문자수 실시간 알림",
      "팀원 1명 초대",
      "월 500개 키워드 추적",
      "자동화 기본 기능",
      "이메일 지원",
    ],
    popular: false
  },
  pro: {
    name: "Pro",
    price: { monthly: 29000, yearly: 290000 },
    description: "마케팅 집중 관리용",
    features: [
      "플레이스 최대 10개",
      "AI 리뷰 분석 & 응답 추천",
      "경쟁사 모니터링",
      "무제한 키워드 추적",
      "고급 자동화 기능",
      "팀원 최대 5명",
      "우선 고객지원",
    ],
    popular: true
  }
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingName: '',
  });

  const planId = searchParams.get('plan') as keyof typeof plans;
  const billing = searchParams.get('billing') as 'monthly' | 'yearly';
  
  const plan = plans[planId];
  
  useEffect(() => {
    if (!plan) {
      router.push('/dashboard');
    }
  }, [plan, router]);

  if (!plan) {
    return null;
  }

  const price = plan.price[billing || 'monthly'];
  const isYearly = billing === 'yearly';
  const monthlyPrice = plan.price.monthly;
  const savings = isYearly ? Math.round(((monthlyPrice * 12 - plan.price.yearly) / (monthlyPrice * 12)) * 100) : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 실제 결제 처리는 여기에 구현
      // 예: 포트원(아임포트) 연동
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션
      
      toast.success('결제가 완료되었습니다!');
      router.push('/dashboard?upgrade=success');
    } catch {
      toast.error('결제 처리 중 오류가 발생했습니다.');
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
          <h1 className="text-2xl font-bold text-slate-800">결제하기</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* 플랜 정보 */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-slate-800">
                  {plan.name} 플랜
                </CardTitle>
                {plan.popular && (
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    인기
                  </Badge>
                )}
              </div>
              <p className="text-slate-600">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 가격 정보 */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  ₩{price.toLocaleString()}
                </div>
                <div className="text-slate-600">
                  /{isYearly ? '년' : '월'}
                </div>
                {isYearly && savings > 0 && (
                  <div className="mt-2">
                    <Badge className="bg-green-500 text-white">
                      {savings}% 절약 (연간 ₩{(monthlyPrice * 12 - plan.price.yearly).toLocaleString()} 할인)
                    </Badge>
                  </div>
                )}
              </div>

              {/* 포함 기능 */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">포함된 기능</h3>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 보안 정보 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800">안전한 결제</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• SSL 암호화로 보호되는 안전한 결제</li>
                  <li>• 언제든지 취소 가능</li>
                  <li>• 7일 무료 체험 기간</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 결제 폼 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                결제 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 개인 정보 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    계정 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">이메일</Label>
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
                    <div>
                      <Label htmlFor="name">이름</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="홍길동"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">회사명 (선택)</Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="회사명"
                        value={formData.company}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">연락처</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="010-1234-5678"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 결제 정보 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800">결제 수단</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">카드 번호</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">만료일</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="billingName">카드 소유자명</Label>
                      <Input
                        id="billingName"
                        name="billingName"
                        placeholder="카드에 표시된 이름"
                        value={formData.billingName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 결제 버튼 */}
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                      <span>{plan.name} 플랜 ({isYearly ? '연간' : '월간'})</span>
                      <span>₩{price.toLocaleString()}</span>
                    </div>
                    {isYearly && savings > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600 mb-2">
                        <span>연간 할인</span>
                        <span>-₩{(monthlyPrice * 12 - plan.price.yearly).toLocaleString()}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center font-semibold">
                      <span>총 결제 금액</span>
                      <span>₩{price.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 text-lg font-semibold hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        결제 처리 중...
                      </div>
                    ) : (
                      `₩${price.toLocaleString()} 결제하기`
                    )}
                  </Button>

                  <p className="text-xs text-slate-500 text-center">
                    결제 시 <a href="/terms" className="text-blue-600 hover:underline">이용약관</a> 및{' '}
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">결제 페이지를 로딩 중...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
