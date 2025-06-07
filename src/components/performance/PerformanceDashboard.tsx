'use client';

import React, { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  customMetrics: Record<string, number>;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
    pressure: boolean;
  };
  networkInfo?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics;
  isVisible?: boolean;
  onToggle?: () => void;
}

/**
 * Enterprise-level performance monitoring dashboard
 * Displays real-time performance metrics for debugging and optimization
 */
export const PerformanceDashboard = memo<PerformanceDashboardProps>(({
  metrics,
  isVisible = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToggle
}) => {
  const [isExpanded, setIsExpanded] = useState(isVisible);

  // Calculate performance scores
  const getPerformanceScore = (metric: string, value: number): { score: number; status: 'good' | 'needs-improvement' | 'poor' } => {
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return { score: 0, status: 'good' };

    if (value <= threshold.good) return { score: 90, status: 'good' };
    if (value <= threshold.poor) return { score: 50, status: 'needs-improvement' };
    return { score: 25, status: 'poor' };
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    return `${ms.toFixed(2)}ms`;
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg border-2 border-blue-200 hover:border-blue-400"
        >
          📊 성능 지표
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <Card className="shadow-xl border-2 border-blue-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-semibold">성능 모니터링</CardTitle>
            <Button
              onClick={() => setIsExpanded(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Core Web Vitals */}
          <div>
            <h4 className="font-medium mb-2 text-gray-700">Core Web Vitals</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'fcp', label: 'FCP', value: metrics.fcp },
                { key: 'lcp', label: 'LCP', value: metrics.lcp },
                { key: 'fid', label: 'FID', value: metrics.fid },
                { key: 'cls', label: 'CLS', value: metrics.cls }
              ].map(({ key, label, value }) => {
                const { status } = getPerformanceScore(key, value);
                const badgeColor = status === 'good' ? 'bg-green-100 text-green-800' : 
                                 status === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' : 
                                 'bg-red-100 text-red-800';
                
                return (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-600">{label}:</span>
                    <Badge className={`text-xs px-1 py-0 ${badgeColor}`}>
                      {key === 'cls' ? value.toFixed(3) : formatTime(value)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Metrics */}
          {Object.keys(metrics.customMetrics).length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-gray-700">사용자 정의 지표</h4>
              <div className="space-y-1">
                {Object.entries(metrics.customMetrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-600 truncate">{key}:</span>
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {formatTime(value)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Memory Usage */}
          {metrics.memoryUsage && (
            <div>
              <h4 className="font-medium mb-2 text-gray-700">메모리 사용량</h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">사용중:</span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {formatBytes(metrics.memoryUsage.used)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">전체:</span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {formatBytes(metrics.memoryUsage.total)}
                  </Badge>
                </div>
                {metrics.memoryUsage.pressure && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">상태:</span>
                    <Badge className="text-xs px-1 py-0 bg-red-100 text-red-800">
                      메모리 부족
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Network Information */}
          {metrics.networkInfo && (
            <div>
              <h4 className="font-medium mb-2 text-gray-700">네트워크 정보</h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">연결 속도:</span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {metrics.networkInfo.effectiveType}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">다운링크:</span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {metrics.networkInfo.downlink} Mbps
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">RTT:</span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {metrics.networkInfo.rtt}ms
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tips */}
          <div>
            <h4 className="font-medium mb-2 text-gray-700">최적화 제안</h4>
            <div className="text-xs text-gray-500 space-y-1">
              {metrics.lcp > 2500 && (
                <div>• LCP 개선: 이미지 최적화 필요</div>
              )}
              {metrics.fid > 100 && (
                <div>• FID 개선: JavaScript 번들 크기 축소</div>
              )}
              {metrics.cls > 0.1 && (
                <div>• CLS 개선: 레이아웃 시프트 방지</div>
              )}
              {metrics.memoryUsage?.pressure && (
                <div>• 메모리 최적화: 불필요한 데이터 정리</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';

export default PerformanceDashboard;
