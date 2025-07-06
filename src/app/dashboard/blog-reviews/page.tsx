"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Calendar, User, RefreshCw, MessageSquare, Download, CheckCircle2 } from "lucide-react";
import { useBusinessContext } from "@/app/dashboard/BusinessContext";
import { useBlogReviews, useCrawlReviews, useReanalyzeAllAds, useAnalyzeSelectedReviews } from "@/hooks/useReviews";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import CrawlingProgressModal from "@/components/CrawlingProgressModal";
import CrawlingConfirmModal from "@/components/CrawlingConfirmModal";
import apiClient from "@/lib/apiClient";

export default function BlogReviewsPage() {
  const { activeBusiness, crawlingStatus: businessCrawlingStatus, manualTriggerCrawling } = useBusinessContext();
  const placeId = activeBusiness?.place_id;
  
  // 선택된 리뷰들 관리
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  
  // 각 리뷰별 분석 상태 관리
  const [analyzingReviews, setAnalyzingReviews] = useState<Set<string>>(new Set());
  
  // 크롤링 필요 여부 상태
  const [shouldShowCrawlSuggestion, setShouldShowCrawlSuggestion] = useState(false);
  
  // 크롤링 확인 모달 상태
  const [showCrawlingModal, setShowCrawlingModal] = useState(false);
  
  // 크롤링 진행 상태 관리 (크롤링용으로만 사용)
  const [crawlingProgress, setCrawlingProgress] = useState({
    isOpen: false,
    title: '',
    message: '',
    progress: 0,
    showProgress: false,
    allowCancel: false
  });
  
  const queryClient = useQueryClient();

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

  const {
    data: reviewData,
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch: refetchReviews
  } = useBlogReviews(placeId, { enabled: !!placeId });

  const crawlReviews = useCrawlReviews();
  const reanalyzeAllAds = useReanalyzeAllAds();
  const analyzeSelectedReviews = useAnalyzeSelectedReviews();

  // Socket.IO 연결 및 실시간 업데이트
  useEffect(() => {
    if (!placeId) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    console.log(`[Socket.IO] 연결 시도 중... placeId: ${placeId}`);
    const socket = io('https://localhost:4000', {
      auth: { token },
      transports: ['websocket'],
      rejectUnauthorized: false // 개발 환경에서 자체 서명 인증서 허용
    });

    socket.on('connect', () => {
      console.log(`[Socket.IO] 연결 성공! ID: ${socket.id}, placeId: ${placeId}`);
    });

    // 광고 분석 시작 이벤트
    socket.on('adAnalysisStarted', (data) => {
      console.log('[Socket.IO] 광고 분석 시작:', data);
      if (data.placeId === placeId) {
        // 분석 대상 리뷰들을 분석 중 상태로 설정
        const reviewIds = data.reviews?.map((r: { id: string | number }) => String(r.id)) || [];
        setAnalyzingReviews(new Set(reviewIds));
      }
    });

    // 개별 리뷰 분석 시작 이벤트
    socket.on('reviewAnalysisStarted', (data) => {
      console.log('[Socket.IO] 리뷰 분석 시작:', data);
      if (data.placeId === placeId) {
        setAnalyzingReviews(prev => new Set([...prev, String(data.reviewId)]));
      }
    });

    // 개별 리뷰 분석 완료 이벤트
    socket.on('reviewAnalysisComplete', (data) => {
      console.log('[Socket.IO] 리뷰 분석 완료:', data);
      if (data.placeId === placeId) {
        // 분석 중 상태에서 제거
        setAnalyzingReviews(prev => {
          const newSet = new Set(prev);
          newSet.delete(String(data.reviewId));
          return newSet;
        });
        
        // 쿼리 무효화로 UI 업데이트
        queryClient.invalidateQueries({ 
          queryKey: ['blog-reviews', placeId],
          exact: true,
          refetchType: 'active'
        });
      }
    });

    // 리뷰 분석 오류 이벤트
    socket.on('reviewAnalysisError', (data) => {
      console.log('[Socket.IO] 리뷰 분석 오류:', data);
      if (data.placeId === placeId) {
        // 분석 중 상태에서 제거
        setAnalyzingReviews(prev => {
          const newSet = new Set(prev);
          newSet.delete(String(data.reviewId));
          return newSet;
        });
      }
    });

    // 전체 분석 완료 이벤트
    socket.on('adAnalysisCompleted', (data) => {
      console.log('[Socket.IO] 전체 분석 완료:', data);
      if (data.placeId === placeId) {
        // 모든 분석 중 상태 초기화
        setAnalyzingReviews(new Set());
        
        // 선택 모드였다면 선택 해제
        if (data.analysisType === 'selected') {
          setSelectedReviews(new Set());
          setSelectMode(false);
        }
      }
    });

    // 기존 이벤트는 호환성을 위해 유지
    socket.on('blogAdAnalysisComplete', (data) => {
      console.log('[Socket.IO] 기존 광고 분석 완료 이벤트 (호환성):', data);
      if (data.placeId === placeId) {
        queryClient.invalidateQueries({ 
          queryKey: ['blog-reviews', placeId],
          exact: true,
          refetchType: 'active'
        });
      }
    });

    socket.on('crawlingProgress', (data) => {
      console.log('[Socket.IO] 크롤링 진행 상황:', data);
      if (data.placeId === placeId) {
        // 비즈니스 컨텍스트의 크롤링이 활성화되어 있으면 페이지 레벨 모달은 표시하지 않음
        if (!businessCrawlingStatus.isActive) {
          setCrawlingProgress(prev => ({
            ...prev,
            progress: data.progress,
            message: data.message,
            isOpen: data.status !== 'completed'
          }));
          
          // 완료시 1.5초 후 모달 닫기
          if (data.status === 'completed') {
            setTimeout(() => {
              setCrawlingProgress(prev => ({ ...prev, isOpen: false }));
            }, 1500);
          }
        } else {
          console.log('[Socket.IO] 비즈니스 크롤링이 활성화되어 있으므로 페이지 레벨 모달 스킵');
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] 연결 종료 - placeId: ${placeId}`);
    });

    socket.on('connect_error', (error) => {
      console.error(`[Socket.IO] 연결 오류 - placeId: ${placeId}:`, error);
    });

    return () => {
      console.log(`[Socket.IO] 연결 해제 - placeId: ${placeId}`);
      socket.disconnect();
    };
  }, [placeId, queryClient, businessCrawlingStatus.isActive, setAnalyzingReviews]);

  // placeId가 변경될 때 선택 상태 초기화
  useEffect(() => {
    // 업체 변경 시 선택 상태 및 분석 상태 초기화
    setSelectedReviews(new Set());
    setSelectMode(false);
    setAnalyzingReviews(new Set());
  }, [placeId]);

  // 리뷰 데이터가 변경될 때 선택 상태 초기화 (크롤링 후 등)
  useEffect(() => {
    const currentReviews = reviewData?.reviews || [];
    
    if (currentReviews.length === 0) {
      setSelectedReviews(new Set());
      setSelectMode(false);
    } else {
      // 기존 선택된 리뷰 중 현재 존재하지 않는 리뷰 제거
      const currentReviewIds = new Set(currentReviews.map(r => r.id));
      setSelectedReviews(prev => {
        const filtered = new Set(Array.from(prev).filter(id => currentReviewIds.has(id)));
        // 선택된 리뷰가 모두 사라졌으면 선택 모드도 해제
        if (filtered.size === 0 && selectMode) {
          setSelectMode(false);
        }
        return filtered;
      });
    }
  }, [reviewData?.reviews, selectMode]);

  // 크롤링 필요 여부 확인
  useEffect(() => {
    if (!dashboardReviewStatus || !placeId) return;
    
    const checkCrawlingNeeded = () => {
      // 12시간 동안 보지 않기 설정 확인
      const hiddenUntil = localStorage.getItem('crawlingModalHidden_blog');
      if (hiddenUntil && new Date(hiddenUntil) > new Date()) {
        return; // 12시간 동안 보지 않기 설정이 유효하면 모달 표시하지 않음
      }
      
      const lastCrawledAt = dashboardReviewStatus.blogReviews?.lastCrawledAt;
      
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

  // 크롤링 실행 함수
  const handleCrawlReviews = async () => {
    if (!placeId) return;
    
    // 이미 크롤링 중이면 무시
    if (crawlReviews.isPending) {
      console.log('크롤링이 이미 진행 중입니다.');
      return;
    }
    
    // 크롤링 시작 - 모달 표시
    setCrawlingProgress({
      isOpen: true,
      title: '블로그 리뷰 수집',
      message: '네이버 블로그에서 최신 리뷰를 수집하고 있습니다.',
      progress: 0,
      showProgress: true,
      allowCancel: false
    });
    
    try {
      // 진행률 업데이트
      setCrawlingProgress(prev => ({ ...prev, progress: 25, message: '페이지 1 수집 중...' }));
      
      await crawlReviews.mutateAsync({ 
        placeId, 
        sortType: 'recommend', 
        maxPages: 3 
      });
      
      // 완료
      setCrawlingProgress(prev => ({ ...prev, progress: 100, message: '크롤링이 완료되었습니다!' }));
      
      // 잠시 후 모달 닫기
      setTimeout(() => {
        setCrawlingProgress(prev => ({ ...prev, isOpen: false }));
      }, 1500);
      
    } catch (error: unknown) {
      console.error('크롤링 실패:', error);
      
      // 409 에러 (이미 크롤링 중)인 경우 사용자에게 알림
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 409) {
          setCrawlingProgress({
            isOpen: true,
            title: '크롤링 진행 중',
            message: '다른 크롤링이 진행 중입니다. 잠시 후 다시 시도해주세요.',
            progress: 0,
            showProgress: false,
            allowCancel: true
          });
        } else {
          setCrawlingProgress({
            isOpen: true,
            title: '크롤링 실패',
            message: '크롤링 중 오류가 발생했습니다. 다시 시도해주세요.',
            progress: 0,
            showProgress: false,
            allowCancel: true
          });
        }
      } else {
        setCrawlingProgress({
          isOpen: true,
          title: '크롤링 실패',
          message: '크롤링 중 오류가 발생했습니다. 다시 시도해주세요.',
          progress: 0,
          showProgress: false,
          allowCancel: true
        });
      }
    }
  };

  // 광고 재분석 실행 함수
  const handleReanalyzeAds = async () => {
    if (!placeId) return;
    
    if (reanalyzeAllAds.isPending) {
      console.log('광고 재분석이 이미 진행 중입니다.');
      return;
    }
    
    try {
      // 분석 중 상태는 Socket.IO 이벤트에서 관리
      await reanalyzeAllAds.mutateAsync({ 
        placeId, 
        limit: 50,
        onlyUnchecked: false // 모든 리뷰 재분석
      });
      
    } catch (error: unknown) {
      console.error('광고 재분석 실패:', error);
      // 분석 중 상태 초기화
      setAnalyzingReviews(new Set());
    }
  };

  // 선택된 리뷰 광고 분석 실행 함수
  const handleAnalyzeSelectedReviews = async () => {
    if (!placeId || selectedReviews.size === 0) return;
    
    if (analyzeSelectedReviews.isPending) {
      console.log('선택된 리뷰 광고 분석이 이미 진행 중입니다.');
      return;
    }
    
    // 선택된 리뷰 ID 배열 생성
    const reviewIds = Array.from(selectedReviews);
    
    try {
      // 분석 중 상태는 Socket.IO 이벤트에서 관리
      await analyzeSelectedReviews.mutateAsync({ 
        placeId, 
        reviewIds
      });
      
    } catch (error: unknown) {
      console.error('선택된 리뷰 광고 분석 실패:', error);
      // 분석 중 상태 및 선택 상태 초기화
      setAnalyzingReviews(new Set());
      setSelectedReviews(new Set());
      setSelectMode(false);
    }
  };

  // 리뷰 선택 관련 함수들
  const handleSelectReview = (reviewId: string) => {
    setSelectedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedReviews.size === reviews.length) {
      // 모두 선택된 상태면 전체 해제
      setSelectedReviews(new Set());
    } else {
      // 전체 선택
      setSelectedReviews(new Set(reviews.map(r => r.id)));
    }
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    if (!selectMode) {
      // 선택 모드 진입 시 선택 초기화
      setSelectedReviews(new Set());
    }
  };

  // 모달 닫기 함수
  const closeCrawlingModal = () => {
    setCrawlingProgress(prev => ({ ...prev, isOpen: false }));
  };

  // 마지막 크롤링 시간 계산 (대시보드 API에서 가져온 정확한 크롤링 시간 사용)
  const getLastCrawlTime = () => {
    const lastCrawledAt = dashboardReviewStatus?.blogReviews?.lastCrawledAt;
    if (!lastCrawledAt) return '데이터 없음';
    
    const lastCrawled = new Date(lastCrawledAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastCrawled.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
    return `${Math.floor(diffMinutes / 1440)}일 전`;
  };

  // 크롤링 추천 여부 (대시보드 API 우선)
  const shouldRecommendCrawl = () => {
    // 1순위: 대시보드 API에서 제공하는 정확한 크롤링 시간
    const lastCrawledAt = dashboardReviewStatus?.blogReviews?.lastCrawledAt;
    if (lastCrawledAt) {
      const lastCrawled = new Date(lastCrawledAt);
      const now = new Date();
      const diffHours = (now.getTime() - lastCrawled.getTime()) / (1000 * 60 * 60);
      return diffHours >= 6; // 6시간 이상 지났으면 크롤링 권장
    }
    
    // 2순위: 데이터가 없으면 크롤링 권장
    if (!reviews.length) return true;
    
    // 3순위: 리뷰 데이터 기반으로 판단
    const latestReview = reviews.reduce((latest, review) => {
      const reviewTime = new Date(review.date || 0);
      const latestTime = new Date(latest.date || 0);
      return reviewTime > latestTime ? review : latest;
    });
    const lastCrawled = new Date(latestReview.date || 0);
    const now = new Date();
    const diffHours = (now.getTime() - lastCrawled.getTime()) / (1000 * 60 * 60);
    return diffHours > 24; // 24시간 이상 지났으면 크롤링 권장
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
  // @ts-expect-error - platformCounts는 백엔드에서 추가로 제공되는 필드
  const platformCounts = reviewData?.platformCounts || { blog: 0, cafe: 0, other: 0 };

  return (
    <div className="p-6 space-y-6">
      {/* 크롤링 제안 알림 */}
      {shouldShowCrawlSuggestion && (
        <Alert className="border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <span>
                블로그 리뷰 데이터가 오래되었습니다. 최신 리뷰를 가져오시겠습니까?
                {dashboardReviewStatus?.blogReviews?.lastCrawledAt && (
                  <span className="text-sm text-blue-600 ml-2">
                    (마지막 업데이트: {new Date(dashboardReviewStatus.blogReviews.lastCrawledAt).toLocaleString('ko-KR')})
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
            {shouldRecommendCrawl() && !crawlReviews.isPending && analyzingReviews.size === 0 && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                업데이트 권장
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {/* 선택 모드 관련 버튼들 */}
          {selectMode ? (
            <>
              <Button 
                onClick={handleAnalyzeSelectedReviews}
                disabled={selectedReviews.size === 0 || analyzeSelectedReviews.isPending || analyzingReviews.size > 0}
                variant="default"
                className="bg-orange-600 hover:bg-orange-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {analyzingReviews.size > 0
                  ? `분석 중... (${analyzingReviews.size}개)`
                  : analyzeSelectedReviews.isPending
                  ? '분석 중...'
                  : `선택 리뷰 분석 (${selectedReviews.size})`
                }
              </Button>
              <Button 
                onClick={handleSelectAll}
                disabled={reviews.length === 0 || analyzingReviews.size > 0}
                variant="outline"
              >
                {selectedReviews.size === reviews.length ? '전체 해제' : '전체 선택'}
              </Button>
              <Button 
                onClick={toggleSelectMode}
                disabled={analyzingReviews.size > 0}
                variant="ghost"
              >
                취소
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={toggleSelectMode}
                disabled={reviews.length === 0 || analyzingReviews.size > 0}
                variant="outline"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                리뷰 선택
              </Button>
              <Button 
                onClick={handleCrawlReviews}
                disabled={crawlReviews.isPending || crawlingProgress.isOpen || analyzingReviews.size > 0}
                variant="default"
              >
                <Download className="h-4 w-4 mr-2" />
                {crawlReviews.isPending ? '크롤링 중...' : '리뷰 수집'}
              </Button>
              <Button 
                onClick={handleReanalyzeAds}
                disabled={reanalyzeAllAds.isPending || analyzingReviews.size > 0}
                variant="secondary"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {analyzingReviews.size > 0 
                  ? `광고 분석 중... (${analyzingReviews.size}개)`
                  : reanalyzeAllAds.isPending 
                  ? '광고 분석 중...' 
                  : '전체 광고 재분석'
                }
              </Button>
            </>
          )}
          {naverUrl && (
            <Button variant="outline" asChild disabled={crawlingProgress.isOpen || analyzingReviews.size > 0}>
              <a href={naverUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                네이버 플레이스
              </a>
            </Button>
          )}
          <Button 
            onClick={() => refetchReviews()} 
            variant="outline"
            disabled={crawlingProgress.isOpen || analyzingReviews.size > 0}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-blue-900">총 리뷰 수</div>
                <div className="text-sm text-gray-600 font-normal">등록된 블로그 리뷰</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {totalCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">개의 리뷰</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-purple-900">플랫폼별 분포</div>
                <div className="text-sm text-gray-600 font-normal">블로그 / 카페 리뷰</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">블로그</span>
                </div>
                <div className="text-xl font-bold text-blue-600">
                  {platformCounts.blog}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">카페</span>
                </div>
                <div className="text-xl font-bold text-purple-600">
                  {platformCounts.cafe}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-green-900">최근 업데이트</div>
                <div className="text-sm text-gray-600 font-normal">마지막 리뷰 수집</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-green-600 mb-1">
              {reviews.length > 0 
                ? new Date(reviews[0].date).toLocaleDateString('ko-KR')
                : '데이터 없음'
              }
            </div>
            <div className="text-sm text-gray-500">
              {reviews.length > 0 ? '업데이트됨' : '리뷰 없음'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 리뷰 목록 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">최신 블로그 리뷰</CardTitle>
              <CardDescription className="text-gray-600">
                최근 등록된 블로그 리뷰 목록입니다
                {selectMode && selectedReviews.size > 0 && (
                  <span className="ml-2 text-orange-600 font-medium">
                    ({selectedReviews.size}개 선택됨)
                  </span>
                )}
              </CardDescription>
            </div>
            {selectMode && reviews.length > 0 && (
              <div className="text-sm text-gray-500">
                리뷰를 선택하여 원하는 리뷰만 광고 분석할 수 있습니다
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">등록된 블로그 리뷰가 없습니다</h3>
              <p className="text-sm text-gray-600">네이버 플레이스에서 리뷰가 수집되면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div
                  key={review.id || index}
                  className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-all duration-200 ${
                    selectMode 
                      ? selectedReviews.has(review.id) 
                        ? 'bg-orange-50 border-orange-200 shadow-md'
                        : 'hover:bg-gray-50 cursor-pointer border-gray-200 hover:shadow-md'
                      : 'hover:shadow-md border-gray-200'
                  }`}
                  onClick={selectMode ? () => handleSelectReview(review.id) : undefined}
                >
                  <div className="flex items-start gap-4">
                    {/* 선택 모드일 때 체크박스 표시 */}
                    {selectMode && (
                      <div className="pt-1 flex-shrink-0">
                        <Checkbox
                          checked={selectedReviews.has(review.id)}
                          onCheckedChange={() => handleSelectReview(review.id)}
                          className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                            {review.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
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
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          {/* 분석 상태 및 광고 배지 */}
                          {analyzingReviews.has(String(review.id)) ? (
                            <Badge 
                              variant="outline" 
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs animate-pulse"
                            >
                              분석중...
                            </Badge>
                          ) : (
                            <>
                              {/* 광고 표시 */}
                              {review.isAd && (
                                <Badge 
                                  variant="outline" 
                                  className="bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200 text-xs font-medium"
                                >
                                  광고 {review.adConfidence && `(${review.adConfidence}%)`}
                                </Badge>
                              )}
                              {review.adAnalyzedAt && !review.isAd && (
                                <Badge 
                                  variant="outline" 
                                  className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 text-xs font-medium"
                                >
                                  일반
                                </Badge>
                              )}
                            </>
                          )}
                          
                          {/* 플랫폼 타입 표시 */}
                          <Badge 
                            variant="secondary"
                            className={
                              review.platform_type === 'cafe'
                                ? "bg-purple-100 text-purple-700 font-medium"
                                : review.platform_type === 'other'
                                ? "bg-gray-100 text-gray-700 font-medium"
                                : "bg-blue-100 text-blue-700 font-medium" // 기본값을 블로그로
                            }
                          >
                            {review.platform_type === 'cafe'
                              ? '카페'
                              : review.platform_type === 'other'
                              ? '기타'
                              : '블로그' // 기본값을 블로그로
                            }
                          </Badge>
                          
                          {review.url && !selectMode && (
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 크롤링 진행 상태 모달 */}
      <CrawlingProgressModal
        isOpen={crawlingProgress.isOpen}
        title={crawlingProgress.title}
        message={crawlingProgress.message}
        progress={crawlingProgress.progress}
        showProgress={crawlingProgress.showProgress}
        allowCancel={crawlingProgress.allowCancel}
        onCancel={crawlingProgress.allowCancel ? closeCrawlingModal : undefined}
      />

      {/* 크롤링 확인 모달 */}
      <CrawlingConfirmModal
        isOpen={showCrawlingModal}
        onClose={() => setShowCrawlingModal(false)}
        onConfirm={handleManualCrawling}
        reviewType="blog"
        lastCrawledAt={dashboardReviewStatus?.blogReviews?.lastCrawledAt}
      />
    </div>
  );
}
