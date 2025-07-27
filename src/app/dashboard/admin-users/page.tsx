"use client";

import React, { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { createLogger } from "@/lib/logger";
import WorkTable from "./WorkHistoryTable";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { useWorkHistories } from "@/hooks/useWorkHistories";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

const logger = createLogger("AdminWorkHistoryPage");

// 작업 옵션을 가져오는 커스텀 훅
function useWorkOptions() {
  return useQuery({
    queryKey: ['work-history-options'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/admin/work-histories/options');
        const responseData = response.data;
        
        // 백엔드 응답 구조 확인
        if (!responseData.success) {
          logger.warn('작업 옵션 API 요청 실패:', responseData);
          return { workTypes: [], executors: [] };
        }
        
        const data = responseData.data;
        logger.debug('작업 옵션 데이터 로드됨:', data);
        return data;
      } catch (error) {
        logger.error('작업 옵션 조회 오류:', error);
        throw new Error('작업 옵션을 가져오는데 실패했습니다.');
      }
    },
    staleTime: 10 * 60 * 1000, // 10분 동안 캐시 유지
  });
}

export default function Page() {
  const { data: userData, isLoading: userLoading } = useUser();
  // Changed from array to string for single selection
  const [workType, setWorkType] = useState<string>("");
  const [executor, setExecutor] = useState<string>("");
  const queryClient = useQueryClient();

  // 백엔드에서 작업 종류와 실행사 목록 가져오기
  const { data: workOptions, isLoading: optionsLoading } = useWorkOptions();

  // 관리자 권한 확인
  const isAdmin = userData?.role === "admin";

  // 관리자인 경우에만 API 호출 활성화
  const {
    data: workHistories,
    isLoading,
    isError,
    refetch
  } = useWorkHistories({
    enabled: isAdmin,
    workTypes: workType ? [workType] : undefined, // Convert single value to array if present
    executors: executor ? [executor] : undefined, // Convert single value to array if present
    userId: userData?.id
  });

  // Improved refresh function
  const refreshWorkHistories = async () => {
    logger.info('Refreshing work histories...');
    try {
      // Force a hard invalidation of the query cache
      await queryClient.invalidateQueries({
        queryKey: ['work-histories'],
        exact: false,
        refetchType: 'all'
      });

      // Force a refetch
      const result = await refetch();
      logger.info('Refetch completed with data:', result.data ? 'data present' : 'no data');

      return result;
    } catch (error) {
      logger.error('Error refreshing work histories:', error);
      throw error;
    }
  };

  // Add debug effect
  React.useEffect(() => {
    logger.debug('Work histories data updated:', {
      count: workHistories?.length || 0,
      firstItem: workHistories?.[0] || null
    });
  }, [workHistories]);

  // workTypeOptions와 executorOptions에 백엔드에서 받은 데이터 사용
  const workTypeOptions = workOptions?.workTypes || [];
  const executorOptions = workOptions?.executors || [];

  if (userLoading || optionsLoading) {
    return <div className="p-6 text-center">로딩 중...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>접근 권한 없음</AlertTitle>
          <AlertDescription>
            이 페이지는 관리자 전용입니다. 권한이 필요하시면 관리자에게 문의하세요.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">작업 이력 관리</h1>
      </div>

      <div className="flex items-start gap-4 flex-wrap">
        <div className="w-64">
          <label className="text-xs font-medium mb-1 block">작업 종류 필터</label>
          <MultiSelectCombobox
            options={workTypeOptions.map((type: string) => ({
              label: type,
              value: type
            }))}
            selected={workType}
            onChange={setWorkType}
            placeholder="작업 종류 선택..."
            multiSelect={false} // Set to single select mode
          />
        </div>

        <div className="w-64">
          <label className="text-xs font-medium mb-1 block">실행사 필터</label>
          <MultiSelectCombobox
            options={executorOptions.map((exec: string) => ({
              label: exec,
              value: exec
            }))}
            selected={executor}
            onChange={setExecutor}
            placeholder="실행사 선택..."
            multiSelect={false} // Set to single select mode
          />
        </div>

        <div className="flex items-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setWorkType("");
              setExecutor("");
            }}
          >
            필터 초기화
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <WorkTable
          workHistories={workHistories || []}
          isLoading={isLoading}
          isError={isError}
          refreshData={async () => {
            await refreshWorkHistories();
          }}        
        />
      </Card>
    </div>
  );
}