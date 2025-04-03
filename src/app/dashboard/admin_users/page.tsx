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
import { useQueryClient } from "@tanstack/react-query";

const logger = createLogger("AdminWorkHistoryPage");

export default function Page() {
  const { data: userData, isLoading: userLoading } = useUser();
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [executors, setExecutors] = useState<string[]>([]);
  const queryClient = useQueryClient();

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
    workTypes: workTypes.length > 0 ? workTypes : undefined,
    executors: executors.length > 0 ? executors : undefined,
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

  // 사용 가능한 작업 타입과 실행사 옵션 생성
  const workTypeOptions = ["트래픽", "저장하기", "블로그배포"];

  // executorOptions 생성 방식 수정 - 방어적 코딩
  const executorOptions = React.useMemo(() => {
    if (!workHistories || !Array.isArray(workHistories)) return [];

    // null/undefined 체크와 중복 제거를 안전하게 수행
    const executors = workHistories
      .filter(history => history && history.executor) // null/undefined 값 필터링
      .map(history => history.executor)
      .filter((value, index, self) => self.indexOf(value) === index); // 중복 제거

    return executors;
  }, [workHistories]);

  if (userLoading) {
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
            options={workTypeOptions.map(type => ({
              label: type,
              value: type
            }))}
            selected={workTypes}
            onChange={setWorkTypes}
            placeholder="작업 종류 선택..."
          />
        </div>

        <div className="w-64">
          <label className="text-xs font-medium mb-1 block">실행사 필터</label>
          <MultiSelectCombobox
            options={(executorOptions || []).map(exec => ({
              label: exec || '',
              value: exec || ''
            }))}
            selected={executors}
            onChange={setExecutors}
            placeholder="실행사 선택..."
          />
        </div>

        <div className="flex items-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setWorkTypes([]);
              setExecutors([]);
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
          refreshData={refreshWorkHistories}
        />
      </Card>
    </div>
  );
}