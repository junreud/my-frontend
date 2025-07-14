'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { BlogAdAnalyzer } from '@/components/Analysis/BlogAdAnalyzer';
import { useUserBusinesses } from '@/hooks/useUserBusinesses';
import { useReviewChanges } from '@/hooks/useReviewChanges';
import { useUser } from '@/hooks/useUser';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Building2, CheckCircle2, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Business } from '@/types';
import { formatChange, getChangeBadgeClass } from '@/services/businessServices';

export default function AnalysisPage() {
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [analyzingBusinesses, setAnalyzingBusinesses] = useState<Set<string>>(new Set());
  const [hasToken, setHasToken] = useState(false);
  const { data: userData } = useUser();
  const { businesses, isLoading, error } = useUserBusinesses(userData?.id?.toString());
  
  // 클라이언트 사이드에서만 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    setHasToken(!!token);
  }, []);
  
  // 모든 업체의 place_id 추출
  const placeIds = businesses?.map(b => b.place_id).filter(Boolean) as string[] || [];
  
  // 리뷰 변화량 데이터 조회 (토큰이 있을 때만)
  const { reviewChangesData, isLoading: isLoadingReviewChanges } = useReviewChanges(hasToken ? placeIds : []);

  // 리뷰 변화량 데이터 로드 완료 시 디버깅
  useEffect(() => {
    if (!isLoadingReviewChanges && Object.keys(reviewChangesData).length > 0) {
      console.log('리뷰 변화량 데이터 로드 완료:', reviewChangesData);
    }
  }, [reviewChangesData, isLoadingReviewChanges]);

  const handleBusinessToggle = (placeId: string, checked: boolean) => {
    if (checked) {
      setSelectedBusinesses(prev => [...prev, placeId]);
    } else {
      setSelectedBusinesses(prev => prev.filter(id => id !== placeId));
    }
  };

  const handleSelectAll = () => {
    if (selectedBusinesses.length === businesses?.length) {
      setSelectedBusinesses([]);
    } else {
      setSelectedBusinesses(businesses?.map(b => b.place_id || '') || []);
    }
  };

  const isAnalyzing = (placeId: string) => analyzingBusinesses.has(placeId);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">블로그 광고 분석</h1>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">블로그 광고 분석</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            업체 정보를 불러오는 중 오류가 발생했습니다.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          블로그 광고 분석
        </h1>
        <p className="text-gray-600">
          등록된 업체들의 블로그 리뷰에서 광고 여부를 AI로 분석합니다.
        </p>
      </div>

      {/* 업체 선택 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                분석할 업체 선택
              </CardTitle>
              <CardDescription>
                분석하고 싶은 업체들을 선택해주세요. ({selectedBusinesses.length}개 선택됨)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleSelectAll}
              disabled={!businesses?.length}
            >
              {selectedBusinesses.length === businesses?.length ? '전체 해제' : '전체 선택'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!businesses?.length ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                등록된 업체가 없습니다. 먼저 업체를 등록해주세요.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((business: Business) => {
                const isSelected = selectedBusinesses.includes(business.place_id || '');
                const isCurrentlyAnalyzing = isAnalyzing(business.place_id || '');
                
                return (
                  <Card 
                    key={business.place_id} 
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'hover:bg-gray-50'
                    } ${isCurrentlyAnalyzing ? 'opacity-75' : ''}`}
                    onClick={() => !isCurrentlyAnalyzing && handleBusinessToggle(business.place_id || '', !isSelected)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={isSelected}
                          disabled={isCurrentlyAnalyzing}
                          onChange={() => {}} // onClick으로 처리
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-2">
                            {business.place_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {business.platform}
                            </Badge>
                            
                            {/* 통합 리뷰 카드 - 블로그 + 카페 */}
                            {(business.blog_review_count || business.receipt_review_count) && (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  {(() => {
                                    const blogCount = business.blog_review_count || 0;
                                    const receiptCount = business.receipt_review_count || 0;
                                    const total = blogCount + receiptCount;
                                    return `총 ${total}개 (블로그 ${blogCount} | 카페 ${receiptCount})`;
                                  })()}
                                </Badge>
                                
                                {/* 변화량 표시 */}
                                {hasToken && business.place_id && reviewChangesData[business.place_id] && !isLoadingReviewChanges && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getChangeBadgeClass(reviewChangesData[business.place_id].totalChange)}`}
                                  >
                                    {formatChange(reviewChangesData[business.place_id].totalChange)}
                                    {reviewChangesData[business.place_id].totalChange > 0 && <TrendingUp className="h-3 w-3 ml-1" />}
                                    {reviewChangesData[business.place_id].totalChange < 0 && <TrendingDown className="h-3 w-3 ml-1" />}
                                    {reviewChangesData[business.place_id].totalChange === 0 && <Minus className="h-3 w-3 ml-1" />}
                                  </Badge>
                                )}
                                
                                {/* 변화량 로딩 표시 (토큰이 있을 때만) */}
                                {hasToken && isLoadingReviewChanges && business.place_id && (
                                  <div className="h-5 w-12 bg-gray-200 animate-pulse rounded"></div>
                                )}
                                
                                {/* 로그인 필요 안내 */}
                                {!hasToken && (
                                  <Badge variant="outline" className="text-xs text-gray-500">
                                    변화량: 로그인 필요
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {isCurrentlyAnalyzing && (
                              <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700">
                                분석 중
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 선택된 업체들의 분석기 */}
      {selectedBusinesses.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-semibold">
              선택된 업체 분석 ({selectedBusinesses.length}개)
            </h2>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {selectedBusinesses.map(placeId => {
              const business = businesses?.find(b => b.place_id === placeId);
              if (!business) return null;
              
              return (
                <BlogAdAnalyzer
                  key={placeId}
                  placeId={placeId}
                  placeName={business.place_name}
                  onAnalysisStart={() => {
                    setAnalyzingBusinesses(prev => new Set([...prev, placeId]));
                  }}
                  onAnalysisEnd={() => {
                    setAnalyzingBusinesses(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(placeId);
                      return newSet;
                    });
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      {selectedBusinesses.length === 0 && businesses && businesses.length > 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground space-y-2">
              <BarChart3 className="h-12 w-12 mx-auto opacity-50" />
              <p className="text-lg font-medium">업체를 선택해주세요</p>
              <p className="text-sm">
                위에서 분석하고 싶은 업체들을 선택하면 블로그 광고 분석을 시작할 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}