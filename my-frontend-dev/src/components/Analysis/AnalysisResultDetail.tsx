'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, ImageIcon, MessageSquare, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { DetailedAnalysisResult } from '@/types';

interface AnalysisResultDetailProps {
  result: DetailedAnalysisResult;
}

export function AnalysisResultDetail({ result }: AnalysisResultDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (result.error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-700">{result.title}</p>
              <p className="text-sm text-red-600">오류: {result.error}</p>
            </div>
            <Badge variant="destructive">오류</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-red-600';
    if (confidence >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getConfidenceBadge = (confidence: number, isAd: boolean) => {
    if (isAd) {
      return confidence >= 70 ? 'destructive' : 'secondary';
    }
    return 'outline';
  };

  return (
    <Card className={`border ${result.isAd ? 'border-red-200 bg-red-50/30' : 'border-green-200 bg-green-50/30'}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium">{result.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{result.finalReason}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getConfidenceBadge(result.confidence, result.isAd)}>
                    {result.isAd ? '광고' : '일반'}
                  </Badge>
                  <span className={`text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                    {result.confidence}%
                  </span>
                </div>
              </div>
            </CardHeader>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* 텍스트 분석 결과 - 비활성화됨 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <h4 className="font-medium text-gray-500">텍스트 분석</h4>
                <Badge variant="outline" className="text-gray-500">
                  비활성화됨
                </Badge>
              </div>
              
              <div className="pl-6">
                <p className="text-sm text-muted-foreground">
                  이미지 중심 분석으로 전환되어 텍스트 분석은 비활성화되었습니다.
                </p>
              </div>
            </div>

            {/* 이미지 분석 결과 */}
            {result.analysis.imageAnalysis.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium">이미지 분석 (블로그 구조 기반)</h4>
                  <span className="text-sm text-muted-foreground">
                    ({result.analysis.imageAnalysis.length}개 이미지)
                  </span>
                </div>
                
                <div className="pl-6 space-y-3">
                  {result.analysis.imageAnalysis.map((imageResult, idx) => {
                    // 이미지 유형 및 우선순위 결정
                    let imageTypeLabel = `${imageResult.imageIndex + 1}번째 이미지`;
                    let imageTypeColor = 'bg-gray-100 text-gray-700';
                    let priorityLevel = '';
                    
                    if (imageResult.imageIndex === 0 && result.analysis.imageAnalysis.length === 1) {
                      imageTypeLabel += ' (프로필 또는 본문)';
                      imageTypeColor = 'bg-yellow-100 text-yellow-700';
                      priorityLevel = '불확실';
                    } else if (imageResult.imageIndex === 0) {
                      imageTypeLabel += ' (프로필)';
                      imageTypeColor = 'bg-blue-100 text-blue-700';
                      priorityLevel = '낮음';
                    } else if (imageResult.imageIndex === 1) {
                      imageTypeLabel += ' (본문 첫 번째)';
                      imageTypeColor = 'bg-red-100 text-red-700';
                      priorityLevel = '최우선';
                    } else if (imageResult.imageIndex === 2) {
                      imageTypeLabel += ' (본문 두 번째)';
                      imageTypeColor = 'bg-orange-100 text-orange-700';
                      priorityLevel = '우선';
                    } else if (imageResult.imageIndex >= 3) {
                      imageTypeLabel += ' (보조)';
                      imageTypeColor = 'bg-gray-100 text-gray-700';
                      priorityLevel = '보조';
                    }
                    
                    // 신뢰도 색상 및 상태
                    const confidenceClass = imageResult.confidence >= 70 
                      ? 'border-red-200 bg-red-50/30' 
                      : imageResult.confidence >= 40 
                        ? 'border-yellow-200 bg-yellow-50/30' 
                        : 'border-green-200 bg-green-50/30';
                    
                    return (
                      <div key={idx} className={`border rounded-lg p-3 ${confidenceClass}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{imageTypeLabel}</span>
                            <Badge variant="outline" className={`text-xs ${imageTypeColor}`}>
                              {priorityLevel}
                            </Badge>
                            {result.analysis.summary.bestImageIndex === imageResult.imageIndex && (
                              <Badge variant="outline" className="ml-1 text-xs bg-yellow-100 text-yellow-700">
                                최고 점수
                              </Badge>
                            )}
                            {imageResult.imageIndex === 1 && (
                              <Badge variant="outline" className="ml-1 text-xs bg-purple-100 text-purple-700">
                                🎯 핵심 분석
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant={imageResult.isAd ? "destructive" : "outline"}>
                              {imageResult.isAd ? '광고' : '일반'}
                            </Badge>
                            <span className={`text-sm font-medium ${
                              imageResult.confidence >= 70 ? 'text-red-600' : 
                              imageResult.confidence >= 40 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {imageResult.confidence}%
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {imageResult.reason}
                        </p>
                        
                        {/* 이미지 타입 정보 표시 */}
                        {imageResult.imageType && (
                          <div className="text-xs text-muted-foreground mb-2">
                            <span className="font-medium">이미지 특성:</span> {
                              imageResult.imageType === 'product_showcase' ? '제품 전시' :
                              imageResult.imageType === 'lifestyle' ? '라이프스타일' :
                              imageResult.imageType === 'mixed' ? '혼합형' : '기타'
                            }
                          </div>
                        )}
                        
                        {imageResult.detectedKeywords.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-1">발견된 키워드:</p>
                            <div className="flex flex-wrap gap-1">
                              {imageResult.detectedKeywords.map((keyword, kidx) => (
                                <Badge key={kidx} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 점수 계산 요약 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-500" />
                <h4 className="font-medium">점수 계산 (이미지 기반)</h4>
              </div>
              
              <div className="pl-6 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">텍스트 점수:</span>
                    <span className="font-medium ml-2 text-gray-500">비활성화됨</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">이미지 점수:</span>
                    <span className="font-medium ml-2">{result.analysis.summary.imageScore}%</span>
                  </div>
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">최종 계산:</span>
                  <span className="font-medium ml-2">
                    {result.analysis.summary.imageScore > 0
                      ? `이미지 최고점: ${result.analysis.summary.imageScore}%`
                      : '분석 불가'
                    } = {result.confidence}%
                  </span>
                </div>
                
                <div className="bg-blue-50 p-3 rounded text-sm">
                  <h5 className="font-medium text-blue-800 mb-2">🎯 이미지 중심 분석 방식</h5>
                  <div className="space-y-1 text-blue-700">
                    <p><strong>1번째 이미지:</strong> 프로필 (신뢰도 60% 적용)</p>
                    <p><strong>2번째 이미지:</strong> 본문 첫 번째 (최우선 분석, 신뢰도 120% 부스팅)</p>
                    <p><strong>3번째 이미지:</strong> 본문 두 번째 (우선 분석, 신뢰도 110% 부스팅)</p>
                    <p><strong>4번째 이상:</strong> 보조 이미지 (일반 분석)</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-600">
                    💡 블로그 구조상 본문 첫 번째~두 번째 이미지에 광고 표시가 주로 나타납니다.
                  </div>
                </div>
              </div>
            </div>

            {/* 탐지 세부사항 */}
            {result.analysis.summary.detectionDetails.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  탐지된 광고 요소
                </h4>
                
                <div className="pl-6 space-y-2">
                  {result.analysis.summary.detectionDetails.map((detail, idx) => (
                    <div key={idx} className="border-l-2 border-orange-200 pl-3 py-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {detail.type === 'text' ? '텍스트' : `이미지 ${(detail.imageIndex || 0) + 1}`}
                        </Badge>
                        {detail.type === 'image' && detail.imageIndex === 1 && (
                          <Badge variant="outline" className="text-xs bg-red-100 text-red-700">
                            🎯 본문 첫 번째 (최우선)
                          </Badge>
                        )}
                        {detail.type === 'image' && detail.imageIndex === 2 && (
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
                            본문 두 번째 (우선)
                          </Badge>
                        )}
                        {detail.type === 'image' && detail.imageIndex === 0 && (
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                            프로필 (낮은 신뢰도)
                          </Badge>
                        )}
                        <span className={`text-sm font-medium ${
                          detail.confidence >= 70 ? 'text-red-600' : 
                          detail.confidence >= 40 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {detail.confidence}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{detail.reason}</p>
                      {detail.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {detail.keywords.map((keyword, kidx) => (
                            <Badge key={kidx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
