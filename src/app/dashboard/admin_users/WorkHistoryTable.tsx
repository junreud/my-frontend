import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Plus, Trash2, FileSpreadsheet, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/adminPopover";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { Badge } from "@/components/ui/badge";
import { createLogger } from "@/lib/logger";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  place_ids: string[]; // Added place_ids to store actual place IDs
  place_count: number;
}

// Native JS date formatter
const formatDateString = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 날짜 범위를 문자열로 포맷팅 (without date-fns)
const formatDateRange = (range: DateRange | undefined) => {
  if (!range?.from) return "기간 선택";
  
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  if (!range.to) return formatDate(range.from);
  return `${formatDate(range.from)} ~ ${formatDate(range.to)}`;
};

// 빈 데이터 생성 함수 - 100개의 빈 행 생성
const createEmptyRows = (count: number) => {
  return Array(count).fill(null).map((_, index) => ({
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
  const emptyRows = createEmptyRows(50);

  // 작업 추가 다이얼로그 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Keep userId as array since we may need multiple selection for users
  const [userId, setUserId] = useState<string[]>([]);
  // Change these to string for single selection
  const [workType, setWorkType] = useState<string>("");
  const [executor, setExecutor] = useState<string>("");
  const [contractKeyword, setContractKeyword] = useState("");
  const [workKeyword, setWorkKeyword] = useState("");
  const [charCount, setCharCount] = useState<number | undefined>();

  // 날짜 범위 선택으로 변경
  const [actualDateRange, setActualDateRange] = useState<DateRange | undefined>();
  const [userDateRange, setUserDateRange] = useState<DateRange | undefined>();

  // 임시 날짜 범위 (설정 전)
  const [tempActualDateRange, setTempActualDateRange] = useState<DateRange | undefined>();
  const [tempUserDateRange, setTempUserDateRange] = useState<DateRange | undefined>();

  // 실제 작업기간 캘린더 상태
  const [isActualCalendarOpen, setIsActualCalendarOpen] = useState(false);
  const [isUserCalendarOpen, setIsUserCalendarOpen] = useState(false);

  // 날짜 범위 설정 함수
  const handleActualDateConfirm = () => {
    setActualDateRange(tempActualDateRange);
    setIsActualCalendarOpen(false);
  };

  const handleUserDateConfirm = () => {
    setUserDateRange(tempUserDateRange);
    setIsUserCalendarOpen(false);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 작업 추가 제출 핸들러
  const handleSubmit = async () => {
    if (userId.length === 0 || !workType || !executor) {
      alert("유저, 작업 종류, 실행사는 필수 입력 항목입니다.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Format dates using native JS
      const formatDate = (date: Date | undefined) => {
        if (!date) return null;
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      };

      // Use the actual place_id instead of the place name
      const selectedPlaceId = selectedUserDetails?.place_ids?.[0] || "";

      const payload = {
        user_id: parseInt(userId[0]),
        place_id: selectedPlaceId, // Updated to use place_id
        work_type: workType, // Changed from array join to single string
        executor: executor, // Changed from array join to single string
        contract_keyword: contractKeyword || null,
        work_keyword: workKeyword || null,
        char_count: charCount || null,
        actual_start_date: actualDateRange?.from ? formatDate(actualDateRange.from) : null,
        actual_end_date: actualDateRange?.to ? formatDate(actualDateRange.to) : null,
        user_start_date: userDateRange?.from ? formatDate(userDateRange.from) : null,
        user_end_date: userDateRange?.to ? formatDate(userDateRange.to) : null,
        company_characteristics: null,
      };

      // Log the payload to verify data format
      logger.info('Submitting work history data:', payload);

      const response = await apiClient.post("/api/admin/work-histories", payload);

      if (response.data.success) {
        logger.info('Work history added successfully:', response.data);
        setSaveSuccess(true);

        // Ensure refreshData is called and awaited
        if (refreshData) {
          try {
            await refreshData();
            logger.info('Data refresh completed after adding work history');
          } catch (refreshError) {
            logger.error('Error during data refresh:', refreshError);
          }
        } else {
          logger.warn('refreshData function not available');
        }

        setTimeout(() => {
          setSaveSuccess(false);
        }, 2000);
      } else {
        logger.error('API returned failure:', response.data);
        alert(response.data.message || "작업 이력 저장에 실패했습니다.");
      }
    } catch (error) {
      logger.error("작업 이력 저장 오류:", error);
      alert("작업 이력 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 폼 초기화 함수 수정
  const resetForm = () => {
    setUserId([]);
    setWorkType(""); // Changed to empty string
    setExecutor(""); // Changed to empty string
    setContractKeyword("");
    setWorkKeyword("");
    setCharCount(undefined);
    setActualDateRange(undefined);
    setUserDateRange(undefined);
    setTempActualDateRange(undefined);
    setTempUserDateRange(undefined);
    setIsActualCalendarOpen(false);
    setIsUserCalendarOpen(false);

    // 유저 상세정보 초기화
    setSelectedUserDetails(null);
    setShowUserDetails(false);
  };

  const handleReset = () => {
    resetForm();
  };

  const { 
    data: users, 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery<UserWithPlaces[]>({
    queryKey: ['admin-users-with-places'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/admin/users-with-places');
        if (res.data.success) {
          return res.data.data;
        } else {
          throw new Error(res.data.message || '사용자 정보를 불러오는데 실패했습니다');
        }
      } catch (error) {
        logger.error('사용자 정보 불러오기 오류:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const userOptions = React.useMemo(() => {
    if (!users || !Array.isArray(users)) return [];
    return users.map(user => {
      const primaryPlace = user.place_names.length > 0 ? user.place_names[0] : '업체 미등록';
      const additionalPlaces = user.place_names.length > 1 
        ? ` 외 ${user.place_names.length - 1}곳` 
        : '';
      return {
        value: user.user_id.toString(),
        label: `${user.name} (${primaryPlace}${additionalPlaces}) ${user.phone}`,
        userData: user
      };
    });
  }, [users]);

  const [selectedUserDetails, setSelectedUserDetails] = useState<UserWithPlaces | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const renderUserIdField = () => (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="user-id" className="text-right text-gray-700 font-medium">
        유저
      </Label>
      <div className="col-span-3">
        {usersLoading ? (
          <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
        ) : usersError ? (
          <div className="text-red-500 text-sm">사용자 정보를 불러오는데 실패했습니다</div>
        ) : (
          <>
            <MultiSelectCombobox
              options={userOptions}
              selected={userId}
              onChange={setUserId}
              placeholder="유저 선택"
              position="right"
              displayMode="text" // Use text display mode to match placeholder style
            />
            {selectedUserDetails && (
              <div className="mt-2 p-1 bg-gray-50 rounded-md text-sm">
                <div className="flex justify-between items-center mb-1">
                  {/* 업체명 우선 표시 */}
                  <span className="font-medium">
                    {selectedUserDetails.place_names.length > 0 
                      ? selectedUserDetails.place_names[0] 
                      : '업체 미등록'} 
                    {selectedUserDetails.place_names.length > 1 && 
                      <span className="text-xs text-gray-500">외 {selectedUserDetails.place_names.length - 1}곳</span>
                    }
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2"
                    onClick={() => setShowUserDetails(!showUserDetails)}
                  >
                    {showUserDetails ? '간략히' : '상세정보'}
                  </Button>
                </div>
                {showUserDetails && (
                  <>
                    <div className="text-gray-600 mb-1">
                      <div className="font-medium text-gray-700 mb-1">{selectedUserDetails.name}</div>
                      📧 {selectedUserDetails.email} | 📞 {selectedUserDetails.phone}
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-gray-500 mr-1">등록 업체:</span>
                      {selectedUserDetails.place_names.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedUserDetails.place_names.map((place, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {place}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">등록된 업체가 없습니다</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

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

  // Export to Excel related states
  const [isExportMode, setIsExportMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Delete work history dialog state
  const [deleteWorkId, setDeleteWorkId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const renderDateRangeCalendar = (
    tempRange: DateRange | undefined,
    setTempRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>,
    handleConfirm: () => void
  ) => {
    // Get today's date for the modifier
    const today = new Date();
    
    return (
      <div>
        <div className="rdp-range">
          <DayPicker
            mode="range"
            selected={tempRange}
            onSelect={setTempRange}
            numberOfMonths={1}
            className="rdp-range-calendar"
            modifiers={{ today: today }}
            modifiersStyles={{
              today: {
                backgroundColor: '#edf2f7', // Light blue background
                color: '#2563eb', // Blue text color
                fontWeight: 'bold',
                borderRadius: '50%',
                border: '2px solid #2563eb', // Blue border
              }
            }}
          />
        </div>
        <div className="p-3 border-t border-border flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {!tempRange?.from ? "시작일 선택" : 
             !tempRange?.to ? "종료일 선택" :
             formatDateRange(tempRange)}
          </span>
          <Button 
            size="sm" 
            onClick={handleConfirm}
            disabled={!tempRange?.from}
          >
            설정
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto relative">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {workHistories.length > 0 
            ? `전체 ${workHistories.length}개 중 ${Math.min(visibleItems, workHistories.length)}개 표시` 
            : '작업 이력'}
        </span>

        <div className="flex space-x-2">
          {/* Excel Export Controls */}
          {isExportMode ? (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center"
                onClick={toggleAllRows}
              >
                <Checkbox 
                  className="mr-1" 
                  checked={selectedRows.length === workHistories.length && workHistories.length > 0}
                />
                전체 {selectedRows.length > 0 ? `(${selectedRows.length}/${workHistories.length})` : ''}
              </Button>

              <Button 
                size="sm" 
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={exportToExcel}
                disabled={isExporting || selectedRows.length === 0}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    내보내는 중...
                  </>
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    저장
                  </>
                )}
              </Button>

              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setIsExportMode(false);
                  setSelectedRows([]);
                }}
                disabled={isExporting}
              >
                <X className="mr-1 h-4 w-4" />
                취소
              </Button>
            </>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsExportMode(true)}
            >
              <FileSpreadsheet className="mr-1 h-4 w-4" />
              엑셀로 저장하기
            </Button>
          )}

          {/* 작업 추가 버튼 및 다이얼로그 */}
          {!isExportMode && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  작업 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-white">
                <DialogHeader>
                  <DialogTitle className="text-black font-semibold">새 작업 이력 추가</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    새로운 작업 이력 정보를 입력해주세요. 완료 후 저장 버튼을 클릭하세요.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 bg-white">
                  {renderUserIdField()}
                  {/* 작업 종류 */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="work-type" className="text-right">
                      작업 종류
                    </Label>
                    <div className="col-span-3">
                      <MultiSelectCombobox
                        options={[
                          { value: "트래픽", label: "트래픽" },
                          { value: "저장하기", label: "저장하기" },
                          { value: "블로그배포", label: "블로그배포" },
                        ]}
                        selected={workType}
                        onChange={setWorkType}
                        placeholder="작업 종류 선택"
                        position="right" // Add position prop to open to the right
                        multiSelect={false} // Add this to make it single-select
                      />
                    </div>
                  </div>

                  {/* 실행사 */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="executor" className="text-right">
                      실행사
                    </Label>
                    <div className="col-span-3">
                      <MultiSelectCombobox
                        options={[
                          { value: "토스", label: "토스" },
                          { value: "호올스", label: "호올스" },
                        ]}
                        selected={executor}
                        onChange={setExecutor}
                        placeholder="실행사 선택"
                        position="right" // Add position prop to open to the right
                        multiSelect={false} // Add this to make it single-select
                      />
                    </div>
                  </div>

                  {/* 계약 키워드 */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contract-keyword" className="text-right">
                      계약 키워드
                    </Label>
                    <Input 
                      id="contract-keyword" 
                      value={contractKeyword}
                      onChange={(e) => setContractKeyword(e.target.value)}
                      className="col-span-3" 
                    />
                  </div>

                  {/* 작업 키워드 */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="work-keyword" className="text-right">
                      작업 키워드
                    </Label>
                    <Input 
                      id="work-keyword" 
                      value={workKeyword}
                      onChange={(e) => setWorkKeyword(e.target.value)}
                      className="col-span-3" 
                    />
                  </div>

                  {/* 타수 */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="char-count" className="text-right">
                      타수
                    </Label>
                    <Input 
                      id="char-count" 
                      type="number"
                      value={charCount || ''}
                      onChange={(e) => setCharCount(e.target.valueAsNumber || undefined)}
                      className="col-span-3" 
                    />
                  </div>

                  {/* 실제 작업 기간 */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      실제 작업기간
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Popover open={isActualCalendarOpen} onOpenChange={setIsActualCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {formatDateRange(actualDateRange)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          {renderDateRangeCalendar(
                            tempActualDateRange,
                            setTempActualDateRange,
                            handleActualDateConfirm
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* 유저 작업 기간 */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      유저 작업기간
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Popover open={isUserCalendarOpen} onOpenChange={setIsUserCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {formatDateRange(userDateRange)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          {renderDateRangeCalendar(
                            tempUserDateRange,
                            setTempUserDateRange,
                            handleUserDateConfirm
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <DialogFooter className="bg-white pt-2 border-t border-gray-100">
                  {saveSuccess && (
                    <div className="mr-auto text-sm text-green-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      저장되었습니다!
                    </div>
                  )}

                  <Button variant="outline" onClick={handleReset} className="bg-gray-50">
                    초기화
                  </Button>

                  <Button variant="outline" onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}>
                    취소
                  </Button>

                  <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      "저장하기"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="table-container relative">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-gray-200">
              {isExportMode && (
                <th className="p-2 font-medium w-10">
                  <Checkbox 
                    checked={selectedRows.length === workHistories.length && workHistories.length > 0}
                    onCheckedChange={toggleAllRows}
                  />
                </th>
              )}
              <th className="p-2 font-medium">ID</th>
              <th className="p-2 font-medium">유저 ID</th>
              <th className="p-2 font-medium">업체 ID</th>
              <th className="p-2 font-medium">작업 종류</th>
              <th className="p-2 font-medium">실행사</th>
              <th className="p-2 font-medium">계약 키워드</th>
              <th className="p-2 font-medium">작업 키워드</th>
              <th className="p-2 font-medium">타수</th>
              <th className="p-2 font-medium">실제 시작일</th>
              <th className="p-2 font-medium">실제 종료일</th>
              <th className="p-2 font-medium">유저 시작일</th>
              <th className="p-2 font-medium">유저 종료일</th>
              <th className="p-2 font-medium">업체 특징</th>
              {!isExportMode && <th className="p-2 font-medium w-16">관리</th>}
            </tr>
          </thead>
          <tbody className={`${(isLoading || workHistories.length === 0) ? 'opacity-30' : ''}`}>
            {visibleData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-50">
                {isExportMode && (
                  <td className="p-2">
                    <Checkbox 
                      checked={selectedRows.includes(item.id)}
                      onCheckedChange={() => toggleRowSelection(item.id)}
                    />
                  </td>
                )}
                <td className="p-2">{item.id}</td>
                <td className="p-2">{item.user_id}</td>
                <td className="p-2">{item.place_id}</td>
                <td className="p-2">{item.work_type}</td>
                <td className="p-2">{item.executor}</td>
                <td className="p-2">{item.contract_keyword || '-'}</td>
                <td className="p-2">{item.work_keyword || '-'}</td>
                <td className="p-2">{item.char_count || '-'}</td>
                <td className="p-2">{formatDateString(item.actual_start_date)}</td>
                <td className="p-2">{formatDateString(item.actual_end_date)}</td>
                <td className="p-2">{formatDateString(item.user_start_date)}</td>
                <td className="p-2">{formatDateString(item.user_end_date)}</td>
                <td className="p-2 max-w-xs truncate">{item.company_characteristics || '-'}</td>
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
                      <AlertDialogContent>
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
            ))}
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