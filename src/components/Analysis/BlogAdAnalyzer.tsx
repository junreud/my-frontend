'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Loader2, Play, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReanalyzeAllAds } from '@/hooks/useReviews';
import { logger } from '@/lib/logger';
import { io, Socket } from 'socket.io-client';
import { ReanalysisResponse } from '@/types';

import { AnalysisResultDetail } from './AnalysisResultDetail';

interface BlogAdAnalyzerProps {
  placeId: string;
  placeName?: string;
  onAnalysisStart?: () => void;
  onAnalysisEnd?: () => void;
}

const LIMIT_OPTIONS = [
  { value: '10', label: '10개' },
  { value: '20', label: '20개' },
  { value: '50', label: '50개' },
  { value: '100', label: '100개' },
  { value: '200', label: '200개' },
  { value: '0', label: '전체' }
];

export function BlogAdAnalyzer({ placeId, placeName, onAnalysisStart, onAnalysisEnd }: BlogAdAnalyzerProps) {
  const [limit, setLimit] = useState('50');
  const [onlyUnchecked, setOnlyUnchecked] = useState(true);
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<ReanalysisResponse | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const reanalyzeAllMutation = useReanalyzeAllAds();

  // Socket.IO 연결 설정
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      logger.info('Socket.IO 연결됨');
      setIsConnected(true);
      // 특정 장소 룸에 참여
      newSocket.emit('join', `place-${placeId}`);
    });

    // 블로그 광고 분석 완료 이벤트 수신
    newSocket.on('blogAdAnalysisComplete', (data) => {
      if (data.placeId === placeId && data.analysisType === 'bulk') {
        const progressPercent = (data.progress.current / data.progress.total) * 100;
        setProgress(progressPercent);
        
        logger.info('실시간 분석 진행률 업데이트', {
          current: data.progress.current,
          total: data.progress.total,
          progress: progressPercent
        });
      }
    });

    newSocket.on('disconnect', () => {
      logger.info('Socket.IO 연결 해제됨');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [placeId]);

  const handleAnalyze = async () => {
    try {
      logger.info('블로그 광고 분석 시작', { placeId, limit, onlyUnchecked });
      
      setProgress(0);
      setAnalysisResults(null);
      onAnalysisStart?.(); // 분석 시작 콜백 호출

      const result = await reanalyzeAllMutation.mutateAsync({
        placeId,
        limit: limit === '0' ? undefined : parseInt(limit),
        onlyUnchecked
      });

      setAnalysisResults(result);
      setProgress(100);
      onAnalysisEnd?.(); // 분석 종료 콜백 호출
      
      logger.info('블로그 광고 분석 완료', result);
    } catch (error) {
      logger.error('블로그 광고 분석 실패:', error);
      setProgress(0); // 에러 시 진행률 초기화
      onAnalysisEnd?.(); // 에러 시에도 분석 종료 콜백 호출
    }
  };

  const handleCancel = () => {
    // 뮤테이션 취소 (React Query 내장 기능)
    reanalyzeAllMutation.reset();
    setProgress(0);
    setAnalysisResults(null);
    onAnalysisEnd?.();
    logger.info('분석 취소됨');
  };

  const isAnalyzing = reanalyzeAllMutation.isPending;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <RefreshCw className="h-4 w-4" />
          {placeName}
          {isConnected && (
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" title="실시간 연결됨" />
          )}
        </CardTitle>
        <CardDescription className="text-sm">
          블로그 리뷰의 광고 여부를 AI로 분석합니다.
          {!isConnected && (
            <span className="text-orange-600 ml-2">• 실시간 연결 안됨</span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 분석 설정 - 컴팩트하게 */}
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`limit-select-${placeId}`} className="text-sm">분석할 리뷰 개수</Label>
            <Select
              value={limit}
              onValueChange={setLimit}
              disabled={isAnalyzing}
            >
              <SelectTrigger id={`limit-select-${placeId}`} className="h-9">
                <SelectValue placeholder="개수 선택" />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id={`only-unchecked-${placeId}`}
              checked={onlyUnchecked}
              onCheckedChange={setOnlyUnchecked}
              disabled={isAnalyzing}
            />
            <Label htmlFor={`only-unchecked-${placeId}`} className="text-sm">
              미분석 리뷰만
            </Label>
          </div>
        </div>

        {/* 분석 버튼 */}
        <div className="flex gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex-1"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                분석 시작
              </>
            )}
          </Button>
          
          {isAnalyzing && (
            <Button
              onClick={handleCancel}
              variant="outline"
              size="default"
            >
              취소
            </Button>
          )}
        </div>

        {/* 진행률 표시 */}
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>분석 진행 중</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
          </div>
        )}

        {/* 분석 결과 요약 */}
        {analysisResults && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              분석 완료: {analysisResults.processed}개 / {analysisResults.total}개 리뷰 분석됨
            </AlertDescription>
          </Alert>
        )}

        {/* 에러 표시 */}
        {reanalyzeAllMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              분석 실패: {reanalyzeAllMutation.error?.message}</AlertDescription>
          </Alert>
        )}

        {/* 상세 결과 - 축약된 형태 */}
        {analysisResults?.results && analysisResults.results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">분석 결과</Label>
              <span className="text-xs text-muted-foreground">
                {analysisResults.results.length}개 결과
              </span>
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {analysisResults.results.slice(0, 5).map((result) => (
                <AnalysisResultDetail 
                  key={result.reviewId}
                  result={result}
                />
              ))}
              {analysisResults.results.length > 5 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  ... 및 {analysisResults.results.length - 5}개 더
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
