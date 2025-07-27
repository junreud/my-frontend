import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Plus, Trash2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createLogger } from "@/lib/logger";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import WorkHistoryModal from './WorkHistoryModal';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

const logger = createLogger("WorkHistoryTable");

interface WorkHistory {
  id: number;
  user_id: number;
  place_id: string;
  work_type: string;
  executor: string;
  contract_keyword: string | null;
  work_keyword: string | null;
  char_count: number | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  user_start_date: string | null;
  user_end_date: string | null;
  company_characteristics: string | null;
}

interface WorkTableProps {
  workHistories: WorkHistory[];
  isLoading: boolean;
  isError: boolean;
  refreshData?: () => Promise<void>;
}

interface UserWithPlaces {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  place_names: string[];
  place_ids: string[]; 
}

// useWorkOptions 훅 정의
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

// 빈 데이터 생성 함수 - 화면에 맞는 행 수만 생성
const createEmptyRows = (count: number) => {
  return Array(count).fill(null).map((_: unknown, index: number) => ({
    id: index,
    user_id: 0,
    place_id: '',
    work_type: '',
    executor: '',
    contract_keyword: null,
    work_keyword: null,
    char_count: null,
    actual_start_date: null,
    actual_end_date: null,
    user_start_date: null,
    user_end_date: null,
    company_characteristics: null
  }));
};

const WorkTable: React.FC<WorkTableProps> = ({
  workHistories,
  isLoading,
  isError,
  refreshData
}) => {
  const [visibleItems, setVisibleItems] = useState(50);
  const loaderRef = useRef<HTMLDivElement>(null);
  const emptyRows = createEmptyRows(15); // 한 화면에 적당한 행 수로 변경
  const [isExportMode, setIsExportMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteWorkId, setDeleteWorkId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 모달 관련 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // useWorkOptions 훅을 호출하여 workTypes와 executors 가져오기
  const { data: workOptions, isLoading: optionsLoading, isError: optionsError } = useWorkOptions();
  
  // workOptions에서 필요한 데이터 추출 (useMemo로 최적화)
  const workTypes = React.useMemo(() => workOptions?.workTypes || [], [workOptions?.workTypes]);
  const executors = React.useMemo(() => workOptions?.executors || [], [workOptions?.executors]);
  
  // 디버깅 로그 추가
  useEffect(() => {
    logger.debug('WorkTable - Work options data:', {
      workOptions,
      workTypes,
      executors,
      optionsLoading,
      optionsError
    });
  }, [workOptions, workTypes, executors, optionsLoading, optionsError]);
  
  // users 데이터 로드
  const { data: users } = useQuery({
    queryKey: ['admin-users-with-places'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/admin/users-with-places');
        // API 응답은 {success, message, data} 형태이므로 data 필드를 추출
        const apiResponse = response.data;
        logger.debug('[WorkHistoryTable] 사용자 데이터 API 응답:', apiResponse);
        
        // API 응답에서 data 필드 추출
        const data = apiResponse?.data || apiResponse;
        
        // 응답 데이터가 배열인지 확인
        if (!Array.isArray(data)) {
          logger.warn('[WorkHistoryTable] 사용자 데이터가 배열이 아닙니다:', data);
          return [];
        }
        
        logger.debug('[WorkHistoryTable] 사용자 데이터 로드 성공:', data.length, '명');
        return data.map((user: UserWithPlaces) => ({
          ...user,
          place_ids: user.place_ids || [],
          place_names: user.place_names || []
        }));
      } catch (error) {
        logger.error('사용자 정보 불러오기 오류:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const currentLoaderRef = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting && visibleItems < workHistories.length) {
          setVisibleItems(prev => Math.min(prev + 100, workHistories.length));
        }
      },
      { threshold: 0.1 }
    );

    if (currentLoaderRef && workHistories.length > 0) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [visibleItems, workHistories.length]);

  const visibleData = workHistories.length > 0 
    ? workHistories.slice(0, visibleItems) 
    : emptyRows;

  // Delete work history handler
  const handleDeleteWork = async (id: number) => {
    if (!id) return;

    setIsDeleting(true);
    try {
      logger.info(`Deleting work history with ID: ${id}`);
      const response = await apiClient.delete(`/api/admin/work-histories/${id}`);

      if (response.data.success) {
        logger.info('Work history deleted successfully:', response.data);

        // Refresh data after deletion
        if (refreshData) {
          await refreshData();
          logger.info('Data refreshed after deletion');
        }
      } else {
        logger.error('API returned failure on delete:', response.data);
        alert(response.data.message || "작업 이력 삭제에 실패했습니다.");
      }
    } catch (error) {
      logger.error("작업 이력 삭제 오류:", error);
      alert("작업 이력 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
      setDeleteWorkId(null);
    }
  };

  // Toggle all rows selection
  const toggleAllRows = () => {
    if (selectedRows.length === workHistories.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(workHistories.map(item => item.id));
    }
  };

  // Toggle single row selection
  const toggleRowSelection = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Export selected rows to Excel
  const exportToExcel = async () => {
    if (selectedRows.length === 0) {
      alert("내보낼 항목을 선택해주세요.");
      return;
    }

    setIsExporting(true);
    try {
      logger.info(`Exporting ${selectedRows.length} rows to Excel`);

      // Filter the selected work histories
      const selectedHistories = workHistories.filter(history => 
        selectedRows.includes(history.id)
      );

      // Group work histories by executor
      const groupedByExecutor: Record<string, WorkHistory[]> = {};

      selectedHistories.forEach(history => {
        // Split multiple executors if comma separated
        const executors = history.executor.split(',').map(e => e.trim());

        executors.forEach(exec => {
          if (!groupedByExecutor[exec]) {
            groupedByExecutor[exec] = [];
          }
          groupedByExecutor[exec].push(history);
        });
      });

      // Export each group as a separate file
      for (const [executor, histories] of Object.entries(groupedByExecutor)) {
        logger.info(`Creating Excel file for executor: ${executor} with ${histories.length} records`);

        // Create CSV content
        let csvContent = "ID,User ID,Place ID,Work Type,Executor,Contract Keyword,Work Keyword,Char Count,Actual Start Date,Actual End Date,User Start Date,User End Date,Company Characteristics\n";

        histories.forEach(h => {
          csvContent += `${h.id},${h.user_id},"${h.place_id}","${h.work_type}","${h.executor}","${h.contract_keyword || ''}","${h.work_keyword || ''}",${h.char_count || 0},"${h.actual_start_date || ''}","${h.actual_end_date || ''}","${h.user_start_date || ''}","${h.user_end_date || ''}","${h.company_characteristics || ''}"\n`;
        });

        // Create current date string for filename using native JS
        const now = new Date();
        const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `work_histories_${executor}_${dateString}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Reset export mode after export
      setIsExportMode(false);
      setSelectedRows([]);

      logger.info('Export completed successfully');
    } catch (error) {
      logger.error("엑셀 내보내기 오류:", error);
      alert("엑셀 파일 생성 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  // Native JS date formatter
  const formatDateString = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 개선된 툴팁 스타일 (글자색 검정, 배경색 흰색)
  const tooltipStyles = `
    .tooltip {
      position: relative;
      display: inline-block;
    }
    .tooltip:before {
      content: attr(data-tip);
      position: absolute;
      background-color: white;
      color: black;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      max-width: 300px;
      white-space: pre-wrap;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s;
      z-index: 100;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      border: 1px solid #eaeaea;
      bottom: 125%;
      left: 50%;
      transform: translateX(-50%);
    }
    
    /* 첫 번째 행에 대한 특별한 처리 - 툴팁이 위로 튀어나오지 않고 아래로 표시되도록 */
    tr:first-child .tooltip:before,
    tr:nth-child(-n+2) .tooltip:before {
      bottom: auto;
      top: 125%;
    }
    
    .tooltip:hover:before {
      opacity: 1;
      visibility: visible;
      z-index: 1000; /* 더 높은 z-index 설정으로 항상 위에 표시 */
    }
  `;

  return (
    <div className="space-y-4">
      {/* 툴팁 스타일 추가 */}
      <style>{tooltipStyles}</style>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            작업 추가
          </Button>
          
          <Button
            variant={isExportMode ? "default" : "outline"}
            className={isExportMode ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setIsExportMode(!isExportMode)}
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            {isExportMode ? "선택 모드 해제" : "Excel 내보내기"}
          </Button>
          
          {isExportMode && (
            <Button 
              variant="outline" 
              onClick={exportToExcel}
              disabled={isExporting || selectedRows.length === 0}
              className="flex items-center"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  내보내는 중...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  선택한 {selectedRows.length}개 항목 내보내기
                </>
              )}
            </Button>
          )}
        </div>
        
        {isExportMode && selectedRows.length > 0 && (
          <div className="text-sm text-gray-600">
            {selectedRows.length}개 항목 선택됨
          </div>
        )}
      </div>

      {/* WorkHistoryModal 컴포넌트 */}
      <WorkHistoryModal
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        refreshData={refreshData}
        workTypes={workTypes}
        executors={executors}
      />

      <div className="table-container relative">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 bg-white z-20">
            {/* z-index 변경 (10 -> 20) */}
            <tr className="border-b border-gray-200">
              {isExportMode && (
                <th className="p-2 font-medium w-10">
                  <Checkbox 
                    checked={selectedRows.length === workHistories.length && workHistories.length > 0}
                    onCheckedChange={toggleAllRows}
                  />
                </th>
              )}
              <th className="p-2 font-medium">No.</th>
              <th className="p-2 font-medium">업체명</th>
              <th className="p-2 font-medium">유저</th>
              <th className="p-2 font-medium">작업 종류</th>
              <th className="p-2 font-medium">실행사</th>
              <th className="p-2 font-medium">계약 키워드</th>
              <th className="p-2 font-medium">작업 키워드</th>
              <th className="p-2 font-medium">타수</th>
              <th className="p-2 font-medium">실제 작업기간</th>
              <th className="p-2 font-medium">유저 작업기간</th>
              {!isExportMode && <th className="p-2 font-medium w-16">관리</th>}
            </tr>
          </thead>
          <tbody className={`${(isLoading || workHistories.length === 0) ? 'opacity-30' : ''}`}>
            {visibleData.map((item, index) => {
              const userInfo = users?.find((u: UserWithPlaces) => u.user_id === item.user_id);
              const tooltipContent = userInfo ? 
                `이름: ${userInfo.name}\n이메일: ${userInfo.email}\n업체: ${
                  userInfo.place_names && userInfo.place_names.length > 0 
                    ? userInfo.place_names.join(', ') 
                    : '업체 미등록'
                }` : '사용자 정보 없음';

              return (
                <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-50">
                  {isExportMode && (
                    <td className="p-2">
                      <Checkbox 
                        checked={selectedRows.includes(item.id)}
                        onCheckedChange={() => toggleRowSelection(item.id)}
                      />
                    </td>
                  )}
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">
                    {(() => {
                      // place_<id>에 해당하는 업체명 찾기
                      if (userInfo && userInfo.place_ids && userInfo.place_names) {
                        const placeIndex = userInfo.place_ids.findIndex((id: string) => id === item.place_id);
                        if (placeIndex !== -1) {
                          return userInfo.place_names[placeIndex];
                        }
                      }
                      // 일치하는 place_id가 없거나 임시 ID인 경우
                      if (item.place_id && item.place_id.startsWith('temp_id_')) {
                        return '임시 업체';
                      }
                      // 기본 값
                      return userInfo?.place_names?.[0] || '-';
                    })()}
                  </td>
                  <td className="p-2">
                    <div className={`tooltip ${index < 2 ? 'tooltip-bottom' : ''}`} data-tip={tooltipContent}>
                      <span className="cursor-help border-dotted border-b border-gray-500">
                        {userInfo?.name || `User ${item.user_id}`}
                      </span>
                    </div>
                  </td>
                  <td className="p-2">{item.work_type}</td>
                  <td className="p-2">{item.executor}</td>
                  <td className="p-2">{item.contract_keyword || '-'}</td>
                  <td className="p-2">{item.work_keyword || '-'}</td>
                  <td className="p-2">{item.char_count || '-'}</td>
                  <td className="p-2">
                    {item.actual_start_date && `${formatDateString(item.actual_start_date)} ~ ${formatDateString(item.actual_end_date)}`}
                  </td>
                  <td className="p-2">
                    {item.user_start_date && `${formatDateString(item.user_start_date)} ~ ${formatDateString(item.user_end_date)}`}
                  </td>
                  {!isExportMode && (
                    <td className="p-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setDeleteWorkId(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className='bg-white'>
                          <AlertDialogHeader>
                            <AlertDialogTitle>작업 이력 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              선택한 작업 이력을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteWork(item.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                              disabled={isDeleting}
                            >
                              {isDeleting && deleteWorkId === item.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  삭제 중...
                                </>
                              ) : (
                                "삭제"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {(isLoading || workHistories.length === 0 || isError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <span className="mt-2 font-medium">데이터 로딩 중...</span>
              </div>
            ) : isError ? (
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <span className="text-lg font-medium text-red-500">오류가 발생했습니다</span>
                <p className="mt-2 text-sm text-gray-500">잠시 후 다시 시도해주세요.</p>
              </div>
            ) : (
              <div className="text-center p-6 bg-white rounded-lg shadow-lg">
                <span className="text-lg font-medium text-gray-700">작업 데이터가 없습니다</span>
                <p className="mt-2 text-sm text-gray-500">관리자에게 문의하세요.</p>
              </div>
            )}
          </div>
        )}

        {!isLoading && !isError && workHistories.length > 0 && visibleItems < workHistories.length && (
          <div ref={loaderRef} className="py-4 text-center text-gray-500 text-sm">
            스크롤하여 더 보기...
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkTable;