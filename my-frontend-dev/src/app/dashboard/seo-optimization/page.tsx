"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Camera, 
  Clock, 
  Star, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  TrendingUp,
  Phone,
  Gift,
  Calendar,
  Menu as MenuIcon,
  Navigation,
  Tag,
  FileText,
  Download
} from "lucide-react";
import { useBusinessContext } from "@/app/dashboard/BusinessContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { analyzeSEO, getSEOResult, crawlReviewsForSEO } from "@/services/seoService";

// 리뷰 상세 데이터 타입
interface ReviewData {
  totalReviews: number;
  totalReceiptReviews: number;
  totalBlogReviews: number;
  recent2WeeksReceipt: number;
  recent2WeeksBlog: number;
  replyRate: number;
  totalWithReply: number;
  hasReviewData?: boolean;
  needsCrawling?: boolean;
  lastReceiptReviewDate?: string | null;
  lastBlogReviewDate?: string | null;
}

// 메뉴 상세 데이터 타입
interface MenuData {
  hasMenuPage: boolean;
  totalMenus: number;
  menuWithImages: number;
  menuWithoutImages: number;
  menuBoardImages: number;
  imageRatio: number;
  categories: string[];
  averagePrice: number;
  priceRange: { min: number; max: number };
  menuItems: Array<{
    name: string;
    price: string;
    priceNumber: number;
    description: string;
    hasImage: boolean;
    imageUrl: string;
    category: string;
    position: number;
  }>;
  top4MenusWithoutImage?: Array<{
    position: number;
    name: string;
    price?: string;
  }>;
  warnings?: string[];
}

// SEO 분석 항목 타입
interface SEOAnalysisItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  score: number | null;
  status: 'good' | 'warning' | 'error' | 'loading' | 'not-checked';
  details: string;
  recommendations?: string[];
  menuData?: MenuData; // 메뉴 상세 데이터
  reviewData?: ReviewData; // 리뷰 상세 데이터
}

// 경쟁업체 분석 데이터 타입
interface CompetitorData {
  name: string;
  score: number;
  features: Record<string, boolean>;
}

export default function SEOOptimizationPage() {
  const { activeBusiness } = useBusinessContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [seoItems, setSeoItems] = useState<SEOAnalysisItem[]>([]);
  const [competitorData, setCompetitorData] = useState<CompetitorData[]>([]);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [currentPlaceId, setCurrentPlaceId] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // SEO 분석 항목 초기화
  useEffect(() => {
    const initialItems: SEOAnalysisItem[] = [
      {
        id: 'representative_photo',
        name: '대표사진',
        icon: Camera,
        score: null,
        status: 'not-checked',
        details: '아직 분석하지 않았습니다.',
        recommendations: []
      },
      {
        id: 'business_info',
        name: '업체명 & 업종',
        icon: FileText,
        score: null,
        status: 'not-checked',
        details: '아직 분석하지 않았습니다.',
        recommendations: []
      },
      {
        id: 'reservation',
        name: '예약',
        icon: Phone,
        score: null,
        status: 'not-checked',
        details: '아직 분석하지 않았습니다.',
        recommendations: []
      },
      {
        id: 'talk',
        name: '톡톡',
        icon: Phone,
        score: null,
        status: 'not-checked',
        details: '아직 분석하지 않았습니다.',
        recommendations: []
      },
      {
        id: 'coupon',
        name: '쿠폰',
        icon: Gift,
        score: null,
        status: 'not-checked',
        details: '아직 분석하지 않았습니다.',
        recommendations: []
      },
      {
        id: 'notice',
        name: '공지사항',
        icon: Calendar,
        score: null,
        status: 'not-checked',
        details: '아직 분석하지 않았습니다.',
        recommendations: []
      },
      {
        id: 'business_hours',
        name: '영업시간',
        icon: Clock,
        score: null,
        status: 'not-checked',
        details: '아직 분석하지 않았습니다.',
        recommendations: []
      },
      {
        id: 'menu_setting',
        name: '메뉴 설정',
        icon: MenuIcon,
        score: null,
        status: 'not-checked',
        details: '아직 분석하지 않았습니다.',
        recommendations: []
      },
      {
        id: 'directions',
        name: '찾아오는길',
        icon: Navigation,
        score: null,
        status: 'not-checked',
        details: '아직 분석하지 않았습니다.',
        recommendations: []
      },
      {
        id: 'keywords',
        name: '대표키워드',
        icon: Tag,
        score: null,
        status: 'not-checked',
        details: '아직 분석하지 않았습니다.',
        recommendations: []
      },
      {
        id: 'reviews',
        name: '리뷰 관리',
        icon: Star,
        score: null,
        status: 'not-checked',
        details: '아직 분석하지 않았습니다.',
        recommendations: []
      }
    ];

    setSeoItems(initialItems);
  }, []);

  // 기존 SEO 분석 결과 로드
  const loadExistingSEOResult = useCallback(async () => {
    if (!activeBusiness) return;
    
    const placeId = String(activeBusiness.place_id);
    
    // 이미 로드한 place_id면 중복 로드 방지
    if (currentPlaceId === placeId) return;

    try {
      const existingResult = await getSEOResult(placeId);
      
      if (existingResult.hasResult && existingResult.seoAnalysis) {
        // 기존 분석 결과를 state에 반영 - 함수형 업데이트 사용
        setSeoItems(prevItems => {
          return prevItems.map(item => {
            const apiResult = existingResult.seoAnalysis![item.id as keyof typeof existingResult.seoAnalysis];
            if (apiResult) {
              return {
                ...item,
                score: apiResult.score,
                status: apiResult.status,
                details: apiResult.details,
                menuData: item.id === 'menu_setting' ? {
                  hasMenuPage: true, // 기본값 추가
                  ...apiResult.menuData
                } as MenuData : undefined,
                reviewData: item.id === 'reviews' ? (apiResult.reviewData as ReviewData) : undefined,
                recommendations: apiResult.score >= 80 ? [] : 
                  apiResult.score >= 50 ? [
                    `${item.name} 점수를 더 높이기 위한 세부 개선이 필요합니다.`,
                    '경쟁업체 대비 우위를 확보하세요.'
                  ] : [
                    `${item.name}이 심각하게 부족한 상태입니다.`,
                    '즉시 개선 조치가 필요합니다.',
                    '이 항목은 SEO에 중요한 영향을 미칩니다.'
                  ]
              } as SEOAnalysisItem;
            }
            return item;
          });
        });
        
        if (existingResult.overallScore) {
          setOverallScore(existingResult.overallScore);
        }
        
        if (existingResult.competitorAnalysis) {
          setCompetitorData(existingResult.competitorAnalysis);
        }
        
        console.log('기존 SEO 분석 결과를 로드했습니다:', existingResult.analyzedAt);
      }
      
      // 로드 완료 후 현재 placeId 저장
      setCurrentPlaceId(placeId);
    } catch (error) {
      console.error('기존 SEO 결과 로드 실패:', error);
      // 에러가 발생해도 현재 placeId 저장 (중복 시도 방지)
      setCurrentPlaceId(placeId);
    }
  }, [activeBusiness, currentPlaceId]); // currentPlaceId를 의존성에 추가

  // activeBusiness가 변경될 때와 초기 로드 시에만 기존 결과 로드 (의존성 배열 단순화)
  useEffect(() => {
    // activeBusiness가 변경되면 데이터 초기화
    if (activeBusiness) {
      const newPlaceId = String(activeBusiness.place_id);
      if (currentPlaceId !== newPlaceId) {
        // 다른 업체로 변경된 경우 데이터 초기화
        setOverallScore(null);
        setCompetitorData([]);
        setSeoItems(prevItems => 
          prevItems.map(item => ({
            ...item,
            score: null,
            status: 'not-checked',
            details: '아직 분석하지 않았습니다.',
            recommendations: []
          }))
        );
        setCurrentPlaceId(null); // 초기화
        
        // 새로운 데이터 로드
        loadExistingSEOResult();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBusiness?.place_id]); // place_id만 의존성으로 사용해서 무한루프 방지

  // SEO 분석 시작
  const startSEOAnalysis = async () => {
    if (!activeBusiness) {
      alert('분석할 업체를 선택해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStep('분석 준비 중...');

    // 모든 항목을 loading 상태로 설정
    setSeoItems(prevItems => 
      prevItems.map(item => ({
        ...item,
        status: 'loading' as const,
        details: '분석 중...'
      }))
    );

    try {
      // 단계별 진행률 업데이트 (더 상세한 단계)
      const steps = [
        { step: '업체 정보 확인 중...', progress: 8, estimatedTime: '2초' },
        { step: '대표키워드 조회 중...', progress: 15, estimatedTime: '3초' },
        { step: '네이버 플레이스 접속 중...', progress: 25, estimatedTime: '4초' },
        { step: '기본 정보 수집 중...', progress: 35, estimatedTime: '3초' },
        { step: '대표사진 분석 중...', progress: 45, estimatedTime: '2초' },
        { step: '메뉴 정보 분석 중...', progress: 55, estimatedTime: '4초' },
        { step: '리뷰 데이터 분석 중...', progress: 70, estimatedTime: '3초' },
        { step: '예약/톡톡 확인 중...', progress: 80, estimatedTime: '2초' },
        { step: '최종 점수 계산 중...', progress: 90, estimatedTime: '2초' },
        { step: '분석 완료!', progress: 100, estimatedTime: '완료' }
      ];

      // 순차적으로 진행률 업데이트
      let currentStepIndex = 0;
      const updateProgress = () => {
        if (currentStepIndex < steps.length - 2) { // 마지막 2단계 전까지만 자동 진행
          const currentStep = steps[currentStepIndex];
          setAnalysisStep(currentStep.step);
          setAnalysisProgress(currentStep.progress);
          currentStepIndex++;
        }
      };

      // 초기 단계 시작
      updateProgress();
      const progressInterval = setInterval(updateProgress, 1800); // 1.8초마다 진행

      // 실제 API 호출
      const analysisResult = await analyzeSEO(String(activeBusiness.place_id));
      
      // 진행률 완료
      clearInterval(progressInterval);
      setAnalysisStep('분석 완료!');
      setAnalysisProgress(100);

      // SEO 분석 결과를 state에 반영
      const updatedItems = seoItems.map(item => {
        const apiResult = analysisResult.seoAnalysis[item.id as keyof typeof analysisResult.seoAnalysis];
        if (apiResult) {
          return {
            ...item,
            score: apiResult.score,
            status: apiResult.status,
            details: apiResult.details,
            menuData: item.id === 'menu_setting' ? {
              hasMenuPage: true, // 기본값 추가
              ...apiResult.menuData
            } as MenuData : undefined,
            reviewData: item.id === 'reviews' ? (apiResult.reviewData as ReviewData) : undefined,
            recommendations: apiResult.score >= 80 ? [] : 
              apiResult.score >= 50 ? [
                `${item.name} 점수를 더 높이기 위한 세부 개선이 필요합니다.`,
                '경쟁업체 대비 우위를 확보하세요.'
              ] : [
                `${item.name}이 심각하게 부족한 상태입니다.`,
                '즉시 개선 조치가 필요합니다.',
                '이 항목은 SEO에 중요한 영향을 미칩니다.'
              ]
          } as SEOAnalysisItem;
        }
        return item;
      });

      setSeoItems(updatedItems);

      // 백엔드에서 계산된 전체 점수 사용
      setOverallScore(analysisResult.overallScore);

      // 경쟁업체 데이터 설정
      setCompetitorData(analysisResult.competitorAnalysis);

    } catch (error) {
      console.error('SEO 분석 오류:', error);
      alert('분석 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setIsAnalyzing(false);
      // 3초 후 진행률 초기화 (사용자가 결과를 볼 시간 제공)
      setTimeout(() => {
        setAnalysisProgress(0);
        setAnalysisStep('');
      }, 3000);
    }
  };

  // 메뉴 상세 정보 컴포넌트
  const MenuDetailsCard = ({ menuData }: { menuData: MenuData }) => {
    if (!menuData) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
        <h4 className="font-semibold flex items-center gap-2">
          <MenuIcon className="h-4 w-4" />
          메뉴 상세 정보
        </h4>
        
        {/* 경고 메시지 */}
        {menuData.warnings && menuData.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">경고</span>
            </div>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              {menuData.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 상위 4개 메뉴 이미지 누락 */}
        {menuData.top4MenusWithoutImage && menuData.top4MenusWithoutImage.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">상위 메뉴 이미지 누락</span>
            </div>
            <div className="mt-2 text-sm text-red-700">
              <p className="mb-2">다음 상위 메뉴에 이미지가 없습니다:</p>
              <ul className="space-y-1">
                {menuData.top4MenusWithoutImage.map((menu) => (
                  <li key={menu.position} className="font-medium">
                    {menu.position}번째: {menu.name}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs">상위 4개 메뉴 이미지는 고객 선택에 매우 중요합니다.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">전체 메뉴:</span>
            <span className="ml-2 font-medium">{menuData.totalMenus}개</span>
          </div>
          <div>
            <span className="text-gray-600">이미지 비율:</span>
            <span className="ml-2 font-medium">{menuData.imageRatio}%</span>
          </div>
          <div>
            <span className="text-gray-600">메뉴판 이미지:</span>
            <span className="ml-2 font-medium">{menuData.menuBoardImages}개</span>
          </div>
          <div>
            <span className="text-gray-600">평균 가격:</span>
            <span className="ml-2 font-medium">
              {menuData.averagePrice > 0 ? `${menuData.averagePrice.toLocaleString()}원` : '-'}
            </span>
          </div>
        </div>

        {menuData.categories && menuData.categories.length > 0 && (
          <div>
            <span className="text-gray-600 text-sm">카테고리:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {menuData.categories.map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {menuData.menuItems && menuData.menuItems.length > 0 && (
          <div>
            <span className="text-gray-600 text-sm">주요 메뉴 (최대 5개):</span>
            <div className="mt-2 space-y-2">
              {menuData.menuItems.slice(0, 5).map((menu, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{menu.name}</div>
                    {menu.description && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {menu.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{menu.price}</span>
                    {menu.hasImage ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 리뷰 상세 정보 컴포넌트
  const ReviewDetailsCard = ({ reviewData }: { reviewData: ReviewData }) => {
    const [isCrawling, setIsCrawling] = useState(false);
    
    if (!reviewData) return null;

    const handleCrawlReviews = async () => {
      if (!activeBusiness?.place_id) return;
      
      setIsCrawling(true);
      try {
        await crawlReviewsForSEO(String(activeBusiness.place_id));
        
        // 크롤링 완료 후 SEO 분석 결과 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
      } catch (error) {
        console.error('리뷰 크롤링 실패:', error);
        alert('리뷰 크롤링 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
      } finally {
        setIsCrawling(false);
      }
    };

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
        <h4 className="font-semibold flex items-center gap-2">
          <Star className="h-4 w-4" />
          리뷰 상세 정보
        </h4>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">전체 리뷰:</span>
            <span className="ml-2 font-medium">{reviewData.totalReviews}개</span>
          </div>
          <div>
            <span className="text-gray-600">답변률:</span>
            <span className="ml-2 font-medium">
              {reviewData.replyRate}% ({reviewData.totalWithReply || 0}/{reviewData.totalReceiptReviews})
            </span>
          </div>
          <div>
            <span className="text-gray-600">영수증 리뷰:</span>
            <span className="ml-2 font-medium">{reviewData.totalReceiptReviews}개</span>
          </div>
          <div>
            <span className="text-gray-600">블로그 리뷰:</span>
            <span className="ml-2 font-medium">{reviewData.totalBlogReviews}개</span>
          </div>
        </div>

        <div className="border-t pt-3">
          <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            최근 2주간 리뷰 현황
          </h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <span className="text-gray-600">영수증 리뷰:</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">{reviewData.recent2WeeksReceipt}개</span>
                {reviewData.recent2WeeksReceipt === 0 ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : reviewData.recent2WeeksReceipt >= 5 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <span className="text-gray-600">블로그 리뷰:</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">{reviewData.recent2WeeksBlog}개</span>
                {reviewData.recent2WeeksBlog === 0 ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : reviewData.recent2WeeksBlog >= 3 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
          
          {reviewData.needsCrawling && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <Download className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-orange-700 space-y-1">
                    <p className="font-medium">최신 리뷰 수집이 필요합니다</p>
                    <p>최근 2주간 데이터가 부족합니다. 최신 리뷰를 수집하여 정확한 분석을 받으세요.</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleCrawlReviews}
                  disabled={isCrawling}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex-shrink-0"
                >
                  {isCrawling ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      수집 중...
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 mr-1" />
                      리뷰 수집
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {(reviewData.recent2WeeksReceipt === 0 || reviewData.recent2WeeksBlog === 0) && !reviewData.needsCrawling && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-700 space-y-1">
                  <p className="font-medium">리뷰 관리 개선이 필요합니다</p>
                  <ul className="space-y-1 ml-2">
                    {reviewData.recent2WeeksReceipt === 0 && (
                      <li>• 최근 2주간 영수증 리뷰가 등록되지 않았습니다</li>
                    )}
                    {reviewData.recent2WeeksBlog === 0 && (
                      <li>• 최근 2주간 블로그 리뷰가 등록되지 않았습니다</li>
                    )}
                    <li>• 지속적인 고객 서비스와 리뷰 유도 활동을 권장합니다</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {reviewData.replyRate < 50 && reviewData.totalReceiptReviews > 0 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700 space-y-1">
                  <p className="font-medium">리뷰 답변률 개선 권장</p>
                  <p>현재 답변률이 50% 미만입니다. 고객과의 소통을 늘려 브랜드 신뢰도를 높이세요.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 상태별 아이콘과 색상 반환
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'good':
        return { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'warning':
        return { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      case 'error':
        return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' };
      case 'loading':
        return { icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-50' };
      default:
        return { icon: Search, color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  if (!activeBusiness) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            SEO 분석을 진행하려면 먼저 업체를 선택해주세요.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO 최적화 분석</h1>
          <p className="text-muted-foreground">
            {activeBusiness.place_name}의 네이버 플레이스 SEO 최적화 상태를 분석합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              const placeUrl = `https://pcmap.place.naver.com/place/${activeBusiness.place_id}`;
              window.open(placeUrl, '_blank', 'noopener,noreferrer');
            }}
            className="min-w-[140px]"
          >
            <Navigation className="mr-2 h-4 w-4" />
            네이버 플레이스
          </Button>
          <Button 
            onClick={startSEOAnalysis} 
            disabled={isAnalyzing}
            className="min-w-[120px]"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                SEO 분석 시작
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 분석 진행률 */}
      {isAnalyzing && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                  <div className="absolute -inset-1 rounded-full border-2 border-blue-200 animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{analysisStep}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600">{analysisProgress}%</span>
                      <div className="text-xs text-gray-500">
                        ({Math.round(analysisProgress)} / 100)
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={analysisProgress} 
                    className="w-full h-3 bg-blue-100" 
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-gray-500">
                      예상 소요 시간: 약 18-25초
                    </div>
                    <div className="text-xs text-blue-600 font-medium">
                      {analysisProgress === 100 ? '완료!' : `${Math.max(0, Math.round((100 - analysisProgress) * 0.2))}초 남음`}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 분석 단계 표시 */}
              <div className="bg-white/50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          analysisProgress >= (i + 1) * 10 
                            ? 'bg-blue-500 scale-110' 
                            : analysisProgress >= i * 10 
                            ? 'bg-blue-300 animate-pulse' 
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 전체 점수 */}
      {(overallScore !== null || isAnalyzing) && (
        <Card className={isAnalyzing ? "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50" : ""}>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">전체 SEO 점수</h3>
              {isAnalyzing ? (
                <div className="space-y-3">
                  <div className="text-4xl font-bold text-blue-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                      <span>계산 중...</span>
                    </div>
                  </div>
                  <div className="text-sm text-blue-600">
                    모든 항목 분석 완료 후 점수가 계산됩니다
                  </div>
                  <div className="flex justify-center">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{animationDelay: `${i * 0.1}s`}}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : overallScore !== null ? (
                <>
                  <div className="text-4xl font-bold text-primary">{overallScore}/100</div>
                  <Badge variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "secondary" : "destructive"}>
                    {overallScore >= 80 ? "우수" : overallScore >= 60 ? "보통" : "개선 필요"}
                  </Badge>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">SEO 분석 결과</TabsTrigger>
          <TabsTrigger value="competitors">경쟁업체 비교</TabsTrigger>
          <TabsTrigger value="recommendations">개선 권장사항</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {seoItems.map((item) => {
              const { icon: StatusIcon, color, bgColor } = getStatusDisplay(item.status);
              const ItemIcon = item.icon;
              const isMenuSetting = item.id === 'menu_setting';
              const isReviews = item.id === 'reviews';
              const isExpanded = expandedCard === item.id;

              return (
                <Card key={item.id} className={`${isMenuSetting && item.menuData ? "md:col-span-2 lg:col-span-3" : ""} ${item.status === 'loading' ? 'ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg' : ''} transition-all duration-300`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${bgColor} ${item.status === 'loading' ? 'animate-pulse bg-blue-100' : ''} transition-all duration-300`}>
                          <ItemIcon className={`h-4 w-4 ${item.status === 'loading' ? 'text-blue-600' : ''}`} />
                        </div>
                        <h3 className={`font-semibold ${item.status === 'loading' ? 'text-blue-700' : ''}`}>{item.name}</h3>
                        {item.status === 'loading' && (
                          <div className="flex items-center gap-1">
                            <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                            <span className="text-xs text-blue-600 font-medium">분석중</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.score !== null && item.status !== 'loading' && (
                          <span className="text-sm font-medium">{item.score}/100</span>
                        )}
                        {item.status === 'loading' ? (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        ) : (
                          <StatusIcon className={`h-4 w-4 ${color}`} />
                        )}
                        {/* 메뉴나 리뷰 카드에 확장 버튼 추가 */}
                        {(isMenuSetting && item.menuData) || (isReviews && item.reviewData) ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedCard(isExpanded ? null : item.id)}
                            className="p-1 h-6 w-6"
                          >
                            {isExpanded ? '−' : '+'}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    
                    {/* Loading 상태일 때 특별한 UI */}
                    {item.status === 'loading' ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-medium">분석 중...</span>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 rounded-full animate-pulse"></div>
                          <div className="h-2 bg-blue-100 rounded-full animate-pulse w-3/4"></div>
                        </div>
                        <div className="text-xs text-blue-500 italic">
                          {item.name} 데이터를 수집하고 분석하고 있습니다...
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground mb-2">{item.details}</p>
                        {item.score !== null && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500">점수</span>
                              <span className="font-medium">{item.score}/100</span>
                            </div>
                            <Progress value={item.score} className="w-full h-2" />
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* 메뉴 상세 정보 표시 */}
                    {isMenuSetting && item.menuData && isExpanded && (
                      <MenuDetailsCard menuData={item.menuData} />
                    )}
                    
                    {/* 리뷰 상세 정보 표시 */}
                    {isReviews && item.reviewData && isExpanded && (
                      <ReviewDetailsCard reviewData={item.reviewData} />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          {competitorData.length > 0 ? (
            <div className="grid gap-4">
              {competitorData.map((competitor, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{competitor.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">{competitor.score}/100</span>
                        <Badge variant={competitor.score >= 80 ? "default" : "secondary"}>
                          {competitor.score >= 80 ? "상위권" : "일반"}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={competitor.score} className="w-full mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">SEO 분석을 먼저 실행해주세요.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {seoItems.length > 0 ? (
            <div className="space-y-6">
              {/* 우수한 항목들 */}
              {seoItems.filter(item => item.score !== null && item.score >= 80).length > 0 && (
                <Card className="border-green-200">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="flex items-center space-x-2 text-green-800">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>잘 관리되고 있는 항목</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {seoItems.filter(item => item.score !== null && item.score >= 80).length}개
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid gap-3">
                      {seoItems.filter(item => item.score !== null && item.score >= 80).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">{item.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-green-600">{item.score}점</Badge>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 개선이 필요한 항목들 */}
              {seoItems.filter(item => item.score !== null && item.score < 80).length > 0 && (
                <Card className="border-red-200">
                  <CardHeader className="bg-red-50">
                    <CardTitle className="flex items-center space-x-2 text-red-800">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span>개선이 필요한 항목</span>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {seoItems.filter(item => item.score !== null && item.score < 80).length}개
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {seoItems.filter(item => item.score !== null && item.score < 80).map((item) => (
                        <div key={item.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <item.icon className="h-4 w-4 text-red-600" />
                              <span className="font-medium text-red-800">{item.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive">{item.score}점</Badge>
                              {(item.score ?? 0) < 50 ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              <strong>현재 상태:</strong> {item.details}
                            </div>
                            
                            {item.recommendations && item.recommendations.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">💡 개선 방법:</p>
                                <ul className="space-y-1">
                                  {item.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start space-x-2 text-sm">
                                      <TrendingUp className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                                      <span className="text-gray-700">{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 아직 분석되지 않은 항목들 */}
              {seoItems.filter(item => item.score === null || item.status === 'not-checked').length > 0 && (
                <Card className="border-gray-200">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="flex items-center space-x-2 text-gray-800">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <span>분석 대기 중인 항목</span>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        {seoItems.filter(item => item.score === null || item.status === 'not-checked').length}개
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid gap-2">
                      {seoItems.filter(item => item.score === null || item.status === 'not-checked').map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded border border-gray-200">
                          <item.icon className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{item.name}</span>
                          <Badge variant="outline" className="text-gray-600">분석 필요</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        💡 위 탭에서 &quot;SEO 분석 시작&quot; 버튼을 클릭하여 전체 분석을 시작하세요.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">SEO 분석을 먼저 실행해주세요.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
