"use client"

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, User, RefreshCw, Receipt, Image as ImageIcon, Download, MessageSquare, Bot } from "lucide-react";
import { useBusinessContext } from "@/app/dashboard/BusinessContext";
import { useReceiptReviews, useCrawlReviews, useGenerateReplies } from "@/hooks/useReviews";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AIReplySettingsModal from "@/components/AIReplySettingsModal";
import CrawlingConfirmModal from "@/components/CrawlingConfirmModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

export default function ReceiptReviewPage() {
  const { activeBusiness, manualTriggerCrawling } = useBusinessContext();
  const queryClient = useQueryClient();
  const placeId = activeBusiness?.place_id;
  const [showReplySettings, setShowReplySettings] = useState(false);
  
  // 크롤링 필요 여부 상태
  const [shouldShowCrawlSuggestion, setShouldShowCrawlSuggestion] = useState(false);
  
  // 크롤링 확인 모달 상태
  const [showCrawlingModal, setShowCrawlingModal] = useState(false);

  // 대시보드 리뷰 현황 조회 (크롤링 시간 정보 포함)
  const { data: dashboardReviewStatus } = useQuery({
    queryKey: ['dashboardReviewStatus', placeId],
    enabled: !!placeId,
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/reviews/dashboard-status/${placeId}`);
        return response.data?.data || null;
      } catch (error) {
        console.error('대시보드 리뷰 현황 조회 실패:', error);
        return null;
      }
    }
  });

  // 크롤링 필요 여부 확인
  useEffect(() => {
    if (!dashboardReviewStatus || !placeId) return;
    
    const checkCrawlingNeeded = () => {
      // 12시간 동안 보지 않기 설정 확인
      const hiddenUntil = localStorage.getItem('crawlingModalHidden_receipt');
      if (hiddenUntil && new Date(hiddenUntil) > new Date()) {
        return; // 12시간 동안 보지 않기 설정이 유효하면 모달 표시하지 않음
      }
      
      const lastCrawledAt = dashboardReviewStatus.receiptReviews?.lastCrawledAt;
      
      if (!lastCrawledAt) {
        // 한 번도 크롤링하지 않았다면 모달 표시
        setShowCrawlingModal(true);
        return;
      }
      
      const lastCrawledDate = new Date(lastCrawledAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastCrawledDate.getTime()) / (1000 * 60 * 60);
      
      // 6시간 이상 지났다면 모달 표시
      if (hoursDiff > 6) {
        setShowCrawlingModal(true);
      }
    };
    
    checkCrawlingNeeded();
  }, [dashboardReviewStatus, placeId]);

  // 크롤링 실행 함수
  const handleCrawlReviews = async () => {
    if (!placeId) return;
    
    // 이미 크롤링 중이면 무시
    if (crawlReviews.isPending) {
      console.log('크롤링이 이미 진행 중입니다.');
      return;
    }
    
    try {
      await crawlReviews.mutateAsync({ 
        placeId, 
        sortType: 'recommend', 
        maxPages: 3 
      });
      
      // 크롤링 성공 시 로컬 스토리지 업데이트
      const now = new Date().toISOString();
      const lastAutoKey = `lastAutoCrawl_${placeId}_receipt`;
      localStorage.setItem(lastAutoKey, now);
      
      // 대시보드 상태 쿼리 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({ 
        queryKey: ['dashboardReviewStatus', placeId] 
      });
      
    } catch (error) {
      console.error('크롤링 실패:', error);
    }
  };

  // 수동 크롤링 실행
  const handleManualCrawling = async () => {
    if (!activeBusiness) return;
    
    try {
      await manualTriggerCrawling(activeBusiness);
      setShouldShowCrawlSuggestion(false);
    } catch (error) {
      console.error('수동 크롤링 실행 실패:', error);
    }
  };

  // placeId가 없으면 훅 호출을 하지 않음
  const {
    data: reviewData,
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch: refetchReviews
  } = useReceiptReviews(placeId, { enabled: !!placeId && !!activeBusiness });

  const crawlReviews = useCrawlReviews();
  const generateReplies = useGenerateReplies();

  // 마지막 크롤링 시간 계산 (대시보드 API 우선, 로컬 스토리지 대체)
  const getLastCrawlTime = () => {
    // 1순위: 대시보드 API에서 제공하는 정확한 크롤링 시간
    const lastCrawledAt = dashboardReviewStatus?.receiptReviews?.lastCrawledAt;
    if (lastCrawledAt) {
      const lastCrawled = new Date(lastCrawledAt);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastCrawled.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return '방금 전';
      if (diffMinutes < 60) return `${diffMinutes}분 전`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
      return `${Math.floor(diffMinutes / 1440)}일 전`;
    }
    
    // 2순위: 로컬 스토리지 기록
    const lastAutoKey = `lastAutoCrawl_${placeId}_receipt`;
    const lastAutoTime = localStorage.getItem(lastAutoKey);
    
    if (lastAutoTime) {
      const lastTime = new Date(lastAutoTime);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastTime.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return '방금 전';
      if (diffMinutes < 60) return `${diffMinutes}분 전`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
      return `${Math.floor(diffMinutes / 1440)}일 전`;
    }
    
    // 3순위: 리뷰 데이터 기반으로 추정
    if (!reviews.length) return '데이터 없음';
    const latestReview = reviews.reduce((latest, review) => {
      const reviewTime = new Date(review.createdAt || 0);
      const latestTime = new Date(latest.createdAt || 0);
      return reviewTime > latestTime ? review : latest;
    });
    const lastCrawled = new Date(latestReview.createdAt || 0);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastCrawled.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
    return `${Math.floor(diffMinutes / 1440)}일 전`;
  };

  // 크롤링 추천 여부 (대시보드 API 우선, 로컬 스토리지 대체)
  const shouldRecommendCrawl = () => {
    // 1순위: 대시보드 API에서 제공하는 정확한 크롤링 시간
    const lastCrawledAt = dashboardReviewStatus?.receiptReviews?.lastCrawledAt;
    if (lastCrawledAt) {
      const lastCrawled = new Date(lastCrawledAt);
      const now = new Date();
      const diffHours = (now.getTime() - lastCrawled.getTime()) / (1000 * 60 * 60);
      return diffHours >= 6; // 6시간 이상 지났으면 크롤링 권장
    }
    
    // 2순위: 로컬 스토리지 기록
    const lastAutoKey = `lastAutoCrawl_${placeId}_receipt`;
    const lastAutoTime = localStorage.getItem(lastAutoKey);
    
    if (lastAutoTime) {
      const lastTime = new Date(lastAutoTime);
      const now = new Date();
      const diffHours = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
      return diffHours >= 6; // 6시간 이상 지났으면 크롤링 권장
    }
    
    // 3순위: 리뷰 데이터 기반으로 판단
    if (!reviews.length) return true; // 데이터가 없으면 크롤링 권장
    const latestReview = reviews.reduce((latest, review) => {
      const reviewTime = new Date(review.createdAt || 0);
      const latestTime = new Date(latest.createdAt || 0);
      return reviewTime > latestTime ? review : latest;
    });
    const lastCrawled = new Date(latestReview.createdAt || 0);
    const now = new Date();
    const diffHours = (now.getTime() - lastCrawled.getTime()) / (1000 * 60 * 60);
    return diffHours > 24; // 24시간 이상 지났으면 크롤링 권장
  };

  // 네이버 URL을 직접 생성
  const naverUrl = placeId ? `https://m.place.naver.com/place/${placeId}/review/ugc` : null;

  // 로딩 상태
  if (reviewsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">영수증 리뷰 관리</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // 선택된 업체가 없는 경우
  if (!activeBusiness) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            업체를 선택해주세요. 사이드바에서 업체를 선택하면 해당 업체의 영수증 리뷰를 확인할 수 있습니다.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // 에러 상태
  if (reviewsError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">영수증 리뷰 관리</h1>
          <Button onClick={() => refetchReviews()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            영수증 리뷰 데이터를 불러오는데 실패했습니다.
            <br />
            다시 시도해주세요.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const reviews = reviewData?.reviews || [];
  const totalCount = reviewData?.totalCount || 0;
  const unansweredCount = reviewData?.unansweredCount || 0;

  return (
    <div className="p-6 space-y-6">
      {/* 크롤링 제안 알림 */}
      {shouldShowCrawlSuggestion && (
        <Alert className="border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <span>
                영수증 리뷰 데이터가 오래되었습니다. 최신 리뷰를 가져오시겠습니까?
                {dashboardReviewStatus?.receiptReviews?.lastCrawledAt && (
                  <span className="text-sm text-blue-600 ml-2">
                    (마지막 업데이트: {new Date(dashboardReviewStatus.receiptReviews.lastCrawledAt).toLocaleString('ko-KR')})
                  </span>
                )}
              </span>
              <div className="flex gap-2 ml-4">
                <Button 
                  onClick={handleManualCrawling}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  리뷰 업데이트
                </Button>
                <Button 
                  onClick={() => setShouldShowCrawlSuggestion(false)}
                  size="sm"
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  나중에
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">영수증 리뷰 관리</h1>
          <div className="flex items-center gap-4 mt-1">
            

            <p className="text-gray-600">
              {activeBusiness.place_name}의 영수증 리뷰를 관리합니다
            </p>
            {reviews.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                마지막 업데이트: {getLastCrawlTime()}
              </Badge>
            )}
            {shouldRecommendCrawl() && !crawlReviews.isPending && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                업데이트 권장
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleCrawlReviews}
            disabled={crawlReviews.isPending}
            variant="default"
          >
            <Download className="h-4 w-4 mr-2" />
            {crawlReviews.isPending ? '크롤링 중...' : '리뷰 수집'}
          </Button>
          {naverUrl && (
            <Button variant="outline" asChild>
              <a href={naverUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                네이버 플레이스
              </a>
            </Button>
          )}
          <Button onClick={() => refetchReviews()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-purple-900">총 리뷰 수</div>
                <div className="text-sm text-gray-600 font-normal">등록된 영수증 리뷰</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {totalCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">개의 리뷰</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-orange-900">답변 필요</div>
                  <div className="text-sm text-gray-600 font-normal">사업자 답변이 없는 리뷰</div>
                </div>
              </div>
              <Button 
                size="sm" 
                className="h-8 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => setShowReplySettings(true)}
                disabled={generateReplies.isPending}
              >
                {generateReplies.isPending ? '생성 중...' : '답변 생성'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {unansweredCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              답변률: <span className="font-semibold text-gray-700">{totalCount > 0 ? Math.round(((totalCount - unansweredCount) / totalCount) * 100) : 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 리뷰 목록 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">최신 영수증 리뷰</CardTitle>
          <CardDescription className="text-gray-600">
            최근 등록된 영수증 리뷰 목록입니다
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">등록된 영수증 리뷰가 없습니다</h3>
              <p className="text-sm text-gray-600">네이버 플레이스에서 리뷰가 수집되면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div
                  key={review.id || index}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {review.title || '영수증 리뷰'}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{review.author || '익명'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(review.date).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 font-medium">
                        <Receipt className="h-3 w-3 mr-1" />
                        영수증
                      </Badge>
                      {review.images && review.images.length > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1 border-gray-300">
                          <ImageIcon className="h-3 w-3" />
                          {review.images.length}
                        </Badge>
                      )}
                      {review.url && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                          <a href={review.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {review.content && (
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed line-clamp-4">
                        {review.content}
                      </p>
                    </div>
                  )}

                  {/* 이미지 미리보기 */}
                  {review.images && review.images.length > 0 && (
                    <div className="mb-4">
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {review.images.slice(0, 4).map((image, imgIndex) => (
                          <div key={imgIndex} className="flex-shrink-0">
                            <Image 
                              src={image} 
                              alt={`리뷰 이미지 ${imgIndex + 1}`}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                            />
                          </div>
                        ))}
                        {review.images.length > 4 && (
                          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-sm text-gray-500 font-medium">
                            +{review.images.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 답변 표시 - 실제 사업자 답변이나 AI 답변 내용이 있을 때만 표시 */}
                  {((review.has_owner_reply && review.owner_reply_content) || (!review.has_owner_reply && review.reply)) && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-blue-900">사업자 답변</span>
                        </div>
                        
                        {/* 실제 사업자 답변이 없고 AI가 생성한 경우에만 AI 배지 표시 */}
                        {!review.has_owner_reply && review.reply_generated_by_ai && (
                          <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 font-medium">
                            <Bot className="h-3 w-3 mr-1" />
                            AI 생성
                          </Badge>
                        )}
                        
                        {/* 실제 사업자 답변이 없고 임시저장 상태인 경우 */}
                        {!review.has_owner_reply && review.reply_status === 'draft' && (
                          <Badge variant="outline" className="bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-700 border-amber-200 font-medium">
                            임시저장
                          </Badge>
                        )}
                      </div>
                      
                      {/* 실제 사업자 답변이 있으면 해당 답변 표시, 없으면 AI 답변 표시 */}
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {review.has_owner_reply && review.owner_reply_content
                            ? review.owner_reply_content
                            : review.reply
                          }
                        </p>
                        
                        {review.reply_date && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(review.reply_date).toLocaleDateString('ko-KR')} 답변
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* AI 답변 설정 모달 */}
      {showReplySettings && placeId && activeBusiness && (
        <AIReplySettingsModal
          isOpen={showReplySettings}
          onClose={() => setShowReplySettings(false)}
          placeId={placeId}
          businessName={activeBusiness.place_name}
        />
      )}

      {/* 크롤링 확인 모달 */}
      <CrawlingConfirmModal
        isOpen={showCrawlingModal}
        onClose={() => setShowCrawlingModal(false)}
        onConfirm={handleManualCrawling}
        reviewType="receipt"
        lastCrawledAt={dashboardReviewStatus?.receiptReviews?.lastCrawledAt}
      />
    </div>
  );
}