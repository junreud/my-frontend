"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, User, RefreshCw, MessageSquare, Download } from "lucide-react";
import { useBusinessContext } from "@/app/dashboard/BusinessContext";
import { useBlogReviews, useCrawlReviews } from "@/hooks/useReviews";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BlogReviewsPage() {
  const { activeBusiness } = useBusinessContext();
  const placeId = activeBusiness?.place_id;
  const [hasAutoExecuted, setHasAutoExecuted] = useState(false);

  const {
    data: reviewData,
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch: refetchReviews
  } = useBlogReviews(placeId, { enabled: !!placeId });

  const crawlReviews = useCrawlReviews();

  // placeId가 변경될 때 hasAutoExecuted 리셋
  useEffect(() => {
    setHasAutoExecuted(false);
  }, [placeId]);

  // 자동 크롤링 함수를 useCallback으로 메모이제이션
  const executeAutoCrawl = useCallback(async (placeId: string) => {
    // 이미 크롤링 중이면 무시
    if (crawlReviews.isPending) {
      console.log('크롤링이 이미 진행 중입니다.');
      return;
    }
    
    try {
      await crawlReviews.mutateAsync({ 
        placeId, 
        sortType: 'recommend', 
        maxPages: 2 
      });
      const now = new Date();
      const lastAutoKey = `lastAutoCrawl_${placeId}_blog`;
      localStorage.setItem(lastAutoKey, now.toISOString());
      setHasAutoExecuted(true);
    } catch (error) {
      console.error('자동 크롤링 실패:', error);
    }
  }, [crawlReviews]);

  // 자동 크롤링 체크 (하루에 한번만)
  useEffect(() => {
    // 조건 체크: placeId가 없거나, 이미 자동 실행했거나, 리뷰 로딩 중이거나, 크롤링이 진행 중이면 무시
    if (!placeId || hasAutoExecuted || reviewsLoading || crawlReviews.isPending) return;

    const checkAndAutoExecute = async () => {
      // 로컬 스토리지에서 마지막 자동 크롤링 시간 확인
      const lastAutoKey = `lastAutoCrawl_${placeId}_blog`;
      const lastAutoTime = localStorage.getItem(lastAutoKey);
      const now = new Date();
      
      let shouldAutoExecute = false;
      
      if (!lastAutoTime) {
        // 처음 방문하는 경우
        shouldAutoExecute = true;
      } else {
        // 마지막 자동 크롤링으로부터 24시간이 지났는지 확인
        const lastTime = new Date(lastAutoTime);
        const diffHours = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
        shouldAutoExecute = diffHours >= 24;
      }
      
      if (shouldAutoExecute) {
        console.log('자동 크롤링 조건 만족, 실행 중...');
        await executeAutoCrawl(placeId);
      }
    };

    // 리뷰 데이터가 로드된 후에 자동 크롤링 체크
    const timer = setTimeout(checkAndAutoExecute, 1000);
    return () => clearTimeout(timer);
  }, [placeId, hasAutoExecuted, reviewsLoading, executeAutoCrawl, crawlReviews.isPending]);

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
    } catch (error) {
      console.error('크롤링 실패:', error);
    }
  };

  // 마지막 크롤링 시간 계산 (로컬 스토리지 기반)
  const getLastCrawlTime = () => {
    const lastAutoKey = `lastAutoCrawl_${placeId}_blog`;
    const lastAutoTime = localStorage.getItem(lastAutoKey);
    
    if (!lastAutoTime) {
      // 로컬 스토리지에 기록이 없으면 리뷰 데이터 기반으로 추정
      if (!reviews.length) return null;
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
    }
    
    // 로컬 스토리지 기록 기반 계산 (더 정확함)
    const lastTime = new Date(lastAutoTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
    return `${Math.floor(diffMinutes / 1440)}일 전`;
  };

  // 크롤링 추천 여부 (로컬 스토리지 기반)
  const shouldRecommendCrawl = () => {
    const lastAutoKey = `lastAutoCrawl_${placeId}_blog`;
    const lastAutoTime = localStorage.getItem(lastAutoKey);
    
    if (!lastAutoTime) {
      // 로컬 스토리지에 기록이 없으면 리뷰 데이터 기반으로 판단
      if (!reviews.length) return true;
      const latestReview = reviews.reduce((latest, review) => {
        const reviewTime = new Date(review.createdAt || 0);
        const latestTime = new Date(latest.createdAt || 0);
        return reviewTime > latestTime ? review : latest;
      });
      const lastCrawled = new Date(latestReview.createdAt || 0);
      const now = new Date();
      const diffHours = (now.getTime() - lastCrawled.getTime()) / (1000 * 60 * 60);
      return diffHours > 24;
    }
    
    // 로컬 스토리지 기록 기반 판단 (더 정확함)
    const lastTime = new Date(lastAutoTime);
    const now = new Date();
    const diffHours = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
    return diffHours >= 24; // 24시간 이상 지났으면 크롤링 권장
  };

  // 네이버 URL을 직접 생성
  const naverUrl = placeId ? `https://m.place.naver.com/place/${placeId}/review/visitor` : null;

  // 로딩 상태
  if (reviewsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">블로그 리뷰 관리</h1>
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
            업체를 선택해주세요. 사이드바에서 업체를 선택하면 해당 업체의 블로그 리뷰를 확인할 수 있습니다.
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
          <h1 className="text-2xl font-bold">블로그 리뷰 관리</h1>
          <Button onClick={() => refetchReviews()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            블로그 리뷰 데이터를 불러오는데 실패했습니다.
            <br />
            다시 시도해주세요.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const reviews = reviewData?.reviews || [];
  const totalCount = reviewData?.totalCount || 0;

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">블로그 리뷰 관리</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-600">
              {activeBusiness.place_name}의 블로그 리뷰를 관리합니다
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              총 리뷰 수
            </CardTitle>
            <CardDescription>등록된 블로그 리뷰</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {totalCount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              최근 업데이트
            </CardTitle>
            <CardDescription>마지막 리뷰 수집</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-green-600">
              {reviews.length > 0 
                ? new Date(reviews[0].date).toLocaleDateString('ko-KR')
                : '데이터 없음'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 리뷰 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>최신 블로그 리뷰</CardTitle>
          <CardDescription>
            최근 등록된 블로그 리뷰 목록입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>등록된 블로그 리뷰가 없습니다.</p>
              <p className="text-sm">네이버 플레이스에서 리뷰가 수집되면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div
                  key={review.id || index}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg line-clamp-1">
                      {review.title}
                    </h3>
                    <div className="flex items-center gap-2 ml-4">
                      {review.url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={review.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {review.content && (
                    <p className="text-gray-600 line-clamp-3 mb-3">
                      {review.content}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {review.author || '익명'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(review.date).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <Badge variant="outline">블로그</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
