import React, { useState, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Loader2, Plus, Trash2, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createLogger } from "@/lib/logger";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import WorkHistoryModal from './WorkHistoryModal';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import * as XLSX from 'xlsx';

const logger = createLogger("WorkHistoryTableVirtualized");

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

interface WorkHistoryTableVirtualizedProps {
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
        return response.data;
      } catch (error) {
        logger.error('작업 옵션 조회 오류:', error);
        throw new Error('작업 옵션을 가져오는데 실패했습니다.');
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}

// 행 렌더링 컴포넌트
const RowRenderer = ({ 
  index, 
  style, 
  data 
}: { 
  index: number; 
  style: React.CSSProperties; 
  data: {
    workHistories: WorkHistory[];
    isExportMode: boolean;
    selectedRows: number[];
    onToggleRow: (id: number) => void;
    onDeleteWork: (id: number) => void;
    usersData: UserWithPlaces[];
    placesData: { [key: string]: string };
  }
}) => {
  const { 
    workHistories, 
    isExportMode, 
    selectedRows, 
    onToggleRow, 
    onDeleteWork,
    usersData,
    placesData
  } = data;
  
  const work = workHistories[index];
  
  if (!work) return null;

  // 유저 정보 찾기
  const user = usersData.find(u => u.user_id === work.user_id);
  const userName = user ? user.name : `사용자 ID: ${work.user_id}`;
  
  // 업체명 찾기
  const placeName = placesData[work.place_id] || work.place_id;

  return (
    <div 
      style={style} 
      className={`flex border-b text-xs ${index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}`}
    >
      {/* 선택 체크박스 */}
      {isExportMode && (
        <div className="w-10 p-2 flex items-center justify-center">
          <Checkbox 
            checked={selectedRows.includes(work.id)}
            onCheckedChange={() => onToggleRow(work.id)}
          />
        </div>
      )}

      {/* No. */}
      <div className="w-16 p-2 text-center flex items-center justify-center">
        {index + 1}
      </div>

      {/* 업체명 */}
      <div className="w-32 p-2 flex items-center">
        <span className="truncate">{placeName}</span>
      </div>

      {/* 유저 */}
      <div className="w-24 p-2 text-center flex items-center justify-center">
        <span className="truncate">{userName}</span>
      </div>

      {/* 작업 종류 */}
      <div className="w-24 p-2 text-center flex items-center justify-center">
        <span className="truncate">{work.work_type}</span>
      </div>

      {/* 실행사 */}
      <div className="w-20 p-2 text-center flex items-center justify-center">
        <span className="truncate">{work.executor}</span>
      </div>

      {/* 계약 키워드 */}
      <div className="w-28 p-2 text-center flex items-center justify-center">
        <span className="truncate">{work.contract_keyword || '-'}</span>
      </div>

      {/* 작업 키워드 */}
      <div className="w-28 p-2 text-center flex items-center justify-center">
        <span className="truncate">{work.work_keyword || '-'}</span>
      </div>

      {/* 타수 */}
      <div className="w-16 p-2 text-center flex items-center justify-center">
        {work.char_count || '-'}
      </div>

      {/* 실제 시작일 */}
      <div className="w-24 p-2 text-center flex items-center justify-center">
        <span className="truncate">
          {work.actual_start_date ? new Date(work.actual_start_date).toLocaleDateString() : '-'}
        </span>
      </div>

      {/* 실제 종료일 */}
      <div className="w-24 p-2 text-center flex items-center justify-center">
        <span className="truncate">
          {work.actual_end_date ? new Date(work.actual_end_date).toLocaleDateString() : '-'}
        </span>
      </div>

      {/* 유저 시작일 */}
      <div className="w-24 p-2 text-center flex items-center justify-center">
        <span className="truncate">
          {work.user_start_date ? new Date(work.user_start_date).toLocaleDateString() : '-'}
        </span>
      </div>

      {/* 유저 종료일 */}
      <div className="w-24 p-2 text-center flex items-center justify-center">
        <span className="truncate">
          {work.user_end_date ? new Date(work.user_end_date).toLocaleDateString() : '-'}
        </span>
      </div>

      {/* 업체 특성 */}
      <div className="w-32 p-2 flex items-center">
        <span className="truncate">{work.company_characteristics || '-'}</span>
      </div>

      {/* 액션 */}
      <div className="w-20 p-2 flex items-center justify-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteWork(work.id)}
          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

const WorkHistoryTableVirtualized: React.FC<WorkHistoryTableVirtualizedProps> = ({
  workHistories,
  isLoading,
  isError,
  refreshData
}) => {
  const [isExportMode, setIsExportMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteWorkId, setDeleteWorkId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // useWorkOptions 훅을 호출하여 workTypes와 executors 가져오기
  const { data: workOptions } = useWorkOptions();

  // 유저 데이터 가져오기
  const { data: usersData = [] } = useQuery<UserWithPlaces[]>({
    queryKey: ['users-with-places'],
    queryFn: async () => {
      const response = await apiClient.get('/api/admin/users-with-places');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 업체 데이터 가져오기
  const { data: placesData = {} } = useQuery<{ [key: string]: string }>({
    queryKey: ['places-data'],
    queryFn: async () => {
      const response = await apiClient.get('/api/admin/places');
      return response.data.reduce((acc: { [key: string]: string }, place: { place_id: string; place_name: string }) => {
        acc[place.place_id] = place.place_name;
        return acc;
      }, {});
    },
    staleTime: 5 * 60 * 1000,
  });

  // 행 선택 토글
  const toggleRow = (id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  // 전체 선택/해제
  const toggleAllRows = () => {
    if (selectedRows.length === workHistories.length && workHistories.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(workHistories.map(work => work.id));
    }
  };

  // Excel 내보내기
  const exportToExcel = async () => {
    if (selectedRows.length === 0) {
      alert('내보낼 항목을 선택해주세요.');
      return;
    }

    setIsExporting(true);
    try {
      const selectedWorks = workHistories.filter(work => selectedRows.includes(work.id));
      
      const excelData = selectedWorks.map((work, index) => {
        const user = usersData.find(u => u.user_id === work.user_id);
        const placeName = placesData[work.place_id] || work.place_id;
        
        return {
          'No.': index + 1,
          '업체명': placeName,
          '유저': user ? user.name : `사용자 ID: ${work.user_id}`,
          '작업 종류': work.work_type,
          '실행사': work.executor,
          '계약 키워드': work.contract_keyword || '',
          '작업 키워드': work.work_keyword || '',
          '타수': work.char_count || '',
          '실제 시작일': work.actual_start_date ? new Date(work.actual_start_date).toLocaleDateString() : '',
          '실제 종료일': work.actual_end_date ? new Date(work.actual_end_date).toLocaleDateString() : '',
          '유저 시작일': work.user_start_date ? new Date(work.user_start_date).toLocaleDateString() : '',
          '유저 종료일': work.user_end_date ? new Date(work.user_end_date).toLocaleDateString() : '',
          '업체 특성': work.company_characteristics || ''
        };
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'WorkHistory');
      
      const fileName = `work_history_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      alert(`${selectedRows.length}개 항목이 ${fileName}으로 내보내졌습니다.`);
    } catch (error) {
      logger.error('Excel 내보내기 오류:', error);
      alert('Excel 내보내기 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  // 작업 삭제
  const handleDeleteWork = async (id: number) => {
    if (!id) return;

    setIsDeleting(true);
    try {
      logger.info(`Deleting work history with ID: ${id}`);
      const response = await apiClient.delete(`/api/admin/work-histories/${id}`);

      if (response.data.success) {
        logger.info('Work history deleted successfully:', response.data);

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

  // 빈 행 데이터
  const emptyRows = useMemo(() => 
    Array(50).fill(null).map((_, index) => ({
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
    }))
  , []);

  // 표시할 데이터 결정
  const displayData = workHistories.length > 0 ? workHistories : emptyRows;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 text-lg font-medium">데이터 로드 중 오류가 발생했습니다</p>
        <p className="text-gray-500 mt-2">잠시 후 다시 시도해주세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 상단 컨트롤 */}
      <div className="flex justify-between items-center">
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
                  선택 항목 내보내기 ({selectedRows.length})
                </>
              )}
            </Button>
          )}
        </div>

        {isExportMode && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedRows.length}개 선택됨
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllRows}
            >
              {selectedRows.length === workHistories.length && workHistories.length > 0 ? "전체 해제" : "전체 선택"}
            </Button>
          </div>
        )}
      </div>

      {/* 통계 정보 */}
      <div className="text-sm text-gray-500">
        총 {workHistories.length}개의 작업 이력
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gray-100 text-gray-600 uppercase text-xs font-medium h-10 flex items-center border-b min-w-[1200px]">
          {isExportMode && (
            <div className="w-10 p-2 flex items-center justify-center">
              <Checkbox 
                checked={selectedRows.length === workHistories.length && workHistories.length > 0}
                onCheckedChange={toggleAllRows}
              />
            </div>
          )}
          <div className="w-16 p-2 text-center">No.</div>
          <div className="w-32 p-2">업체명</div>
          <div className="w-24 p-2 text-center">유저</div>
          <div className="w-24 p-2 text-center">작업 종류</div>
          <div className="w-20 p-2 text-center">실행사</div>
          <div className="w-28 p-2 text-center">계약 키워드</div>
          <div className="w-28 p-2 text-center">작업 키워드</div>
          <div className="w-16 p-2 text-center">타수</div>
          <div className="w-24 p-2 text-center">실제 시작일</div>
          <div className="w-24 p-2 text-center">실제 종료일</div>
          <div className="w-24 p-2 text-center">유저 시작일</div>
          <div className="w-24 p-2 text-center">유저 종료일</div>
          <div className="w-32 p-2">업체 특성</div>
          <div className="w-20 p-2 text-center">액션</div>
        </div>

        {/* 가상화된 리스트 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">데이터 로딩 중...</span>
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            데이터가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              <List
                height={600}
                width="100%"
                itemCount={displayData.length}
                itemSize={50}
                itemData={{
                  workHistories: displayData,
                  isExportMode,
                  selectedRows,
                  onToggleRow: toggleRow,
                  onDeleteWork: (id: number) => setDeleteWorkId(id),
                  usersData,
                  placesData
                }}
              >
                {RowRenderer}
              </List>
            </div>
          </div>
        )}
      </div>

      {/* 작업 추가/편집 모달 */}
      <WorkHistoryModal
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        refreshData={refreshData}
        workTypes={workOptions?.workTypes || []}
        executors={workOptions?.executors || []}
      />

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteWorkId} onOpenChange={() => setDeleteWorkId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>작업 이력 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업 이력을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteWorkId && handleDeleteWork(deleteWorkId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkHistoryTableVirtualized;
