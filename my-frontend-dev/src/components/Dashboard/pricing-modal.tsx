"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "개인 사용자 및 체험용",
    features: [
      "플레이스 1개 등록",
      "기본 리뷰 알림",
      "월 100개 키워드 추적",
      "기본 대시보드 접근",
    ],
    cta: "무료로 시작하기",
    highlighted: false,
    popular: false,
    badge: null,
  },
  {
    id: "starter",
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
    cta: "Starter 시작하기",
    highlighted: false,
    popular: false,
    badge: null,
  },
  {
    id: "pro",
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
    cta: "Pro 시작하기",
    highlighted: true,
    popular: true,
    badge: "인기",
  },
  {
    id: "business",
    name: "Business",
    price: { monthly: "맞춤형", yearly: "맞춤형" },
    description: "대행사/프랜차이즈 본사 전용",
    features: [
      "무제한 플레이스",
      "무제한 팀원",
      "API 연동 지원",
      "맞춤형 대시보드",
      "전담 계정 매니저",
      "24/7 전용 고객지원",
      "온사이트 교육",
    ],
    cta: "상담 요청하기",
    highlighted: false,
    popular: false,
    badge: "엔터프라이즈",
  },
];

export function PricingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [isYearly, setIsYearly] = React.useState(false);
  const router = useRouter();

  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') return price;
    return `₩${price.toLocaleString()}`;
  };

  const getCurrentPrice = (plan: typeof plans[0]) => {
    if (typeof plan.price === 'string') return plan.price;
    return isYearly ? plan.price.yearly : plan.price.monthly;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (typeof plan.price === 'string' || plan.price.monthly === 0) return null;
    if (typeof plan.price.monthly === 'string' || typeof plan.price.yearly === 'string') return null;
    
    const yearlyPrice = plan.price.yearly;
    const monthlyPrice = plan.price.monthly * 12;
    const savings = Math.round(((monthlyPrice - yearlyPrice) / monthlyPrice) * 100);
    return savings;
  };

  const handlePlanSelect = (plan: typeof plans[0]) => {
    if (plan.id === 'free') {
      toast.success('무료 플랜으로 시작하기');
      // 무료 플랜은 바로 시작
      onOpenChange(false);
    } else if (plan.id === 'business') {
      // 비즈니스 플랜은 상담 페이지로
      router.push('/contact?plan=business');
      onOpenChange(false);
    } else {
      // 유료 플랜은 결제 페이지로
      router.push(`/checkout?plan=${plan.id}&billing=${isYearly ? 'yearly' : 'monthly'}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-white sm:max-w-4xl max-h-[90vh] flex flex-col p-0"
        aria-describedby="pricing-modal-description" // aria-describedby 추가
      >
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-slate-800">요금제 안내</DialogTitle>
          {/* 스크린 리더를 위한 설명 추가 */}
          <DialogDescription id="pricing-modal-description" className="sr-only">
            다양한 요금제 플랜과 각 플랜의 기능을 확인하고 선택할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 flex-grow overflow-y-auto">
          <p className="text-center text-slate-600 mb-6 text-sm">
            귀하의 비즈니스 성장에 적합한 플랜을 선택하세요. <br /> 궁금한 점이 있으시면 언제든지 문의해주세요.
          </p>
          
          {/* 월간/연간 토글 */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 p-1 rounded-lg flex">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !isYearly 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                월간 결제
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  isYearly 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                연간 결제
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  2개월 할인
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map(plan => {
              const currentPrice = getCurrentPrice(plan);
              const savings = getSavings(plan);
              
              return (
                <Card 
                  key={plan.name} 
                  className={`flex flex-col relative transition-all duration-300 hover:scale-105 ${
                    plan.highlighted 
                      ? "border-blue-500 border-2 shadow-xl ring-2 ring-blue-500 ring-offset-2 bg-gradient-to-br from-blue-50 to-white" 
                      : "border-slate-200 shadow-md hover:shadow-xl hover:border-blue-300"
                  }`}
                >
                  {/* 배지 */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        {plan.badge}
                      </div>
                    </div>
                  )}
                  
                  {plan.badge && !plan.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-slate-700 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {savings && isYearly && (
                    <div className="absolute -top-2 right-4">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {savings}% 절약
                      </span>
                    </div>
                  )}

                  <CardHeader className="pb-3 pt-6">
                    <CardTitle className={`text-xl font-bold ${plan.highlighted ? 'text-blue-700' : 'text-slate-800'}`}>
                      {plan.name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 min-h-[40px] leading-relaxed">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 flex flex-col flex-grow pt-2 pb-6">
                    <div className="text-center">
                      <div className={`text-4xl font-extrabold mb-1 ${plan.highlighted ? 'text-blue-700' : 'text-slate-900'}`}>
                        {formatPrice(currentPrice)}
                      </div>
                      {plan.name !== "Free" && plan.name !== "Business" && (
                        <span className="text-sm font-medium text-slate-500">
                          /{isYearly ? '년' : '월'}
                        </span>
                      )}
                      {plan.name === "Free" && (
                        <p className="text-xs text-slate-500 mt-1">신용카드 불필요</p>
                      )}
                    </div>

                    <ul className="space-y-2 text-sm text-slate-700 flex-grow">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-blue-500' : 'text-green-500'}`} />
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className={`w-full text-sm py-3 font-semibold transition-all duration-200 ${
                        plan.highlighted 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl" 
                          : plan.name === "Business"
                          ? "bg-slate-800 text-white hover:bg-slate-900"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                      }`}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t mt-auto">
          <DialogClose asChild>
            <Button variant="outline" className="bg-slate-100 hover:bg-slate-200 text-slate-700">닫기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
