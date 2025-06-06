"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Import DialogDescription
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    name: "Free",
    price: "₩0",
    description: "개인 사용자 및 체험용",
    features: [
      "플레이스 1개 등록",
      "기본 리뷰 알림",
      "팀 초대 불가",
    ],
    cta: "무료 시작",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "₩9,900",
    description: "소상공인을 위한 시작 플랜",
    features: [
      "플레이스 최대 3개",
      "리뷰/방문자수 알림",
      "팀원 1명 초대",
      "자동화 일부 사용",
    ],
    cta: "Starter 업그레이드",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₩29,000",
    description: "마케팅 집중 관리용",
    features: [
      "플레이스 최대 10개",
      "리뷰 분석 및 응답 추천",
      "경쟁사 모니터링",
      "모든 자동화 기능",
      "팀원 최대 5명",
    ],
    cta: "Pro 업그레이드",
    highlighted: true,
  },
  {
    name: "Business",
    price: "맞춤형",
    description: "대행사/프랜차이즈 본사 전용",
    features: [
      "무제한 플레이스",
      "무제한 팀원",
      "API 연동 지원",
      "전용 고객지원",
    ],
    cta: "상담 요청",
    highlighted: false,
  },
];

export function PricingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
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
          <p className="text-center text-slate-600 mb-8 text-sm">
            귀하의 비즈니스 성장에 적합한 플랜을 선택하세요. <br /> 궁금한 점이 있으시면 언제든지 문의해주세요.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {plans.map(plan => (
              <Card 
                key={plan.name} 
                className={`flex flex-col ${plan.highlighted ? "border-blue-500 border-2 shadow-xl ring-2 ring-blue-500 ring-offset-1" : "border-slate-200 shadow-md hover:shadow-lg transition-shadow"}`}
              >
                <CardHeader className="pb-3 pt-5">
                  <CardTitle className="text-lg font-bold text-slate-800">{plan.name}</CardTitle>
                  <p className="text-xs text-slate-500 min-h-[30px]">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-3 flex flex-col flex-grow pt-2 pb-5">
                  <div className="text-3xl font-extrabold text-slate-900 mb-2">
                    {plan.price}
                    {plan.name !== "Free" && plan.name !== "Business" && <span className="text-sm font-medium text-slate-500">/월</span>}
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 flex-grow mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full text-sm py-2.5 ${plan.highlighted ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    onClick={() => toast.info(`${plan.name} 플랜의 '${plan.cta}' 액션이 여기에 연결됩니다.`)}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
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
