import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/adminPopover";
import { Loader2, Edit2, PlusCircle, Save, X, Trash2 } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import apiClient from '@/lib/apiClient';
import { createLogger } from "@/lib/logger";
import { DateRange } from "react-day-picker";
import { useQuery } from '@tanstack/react-query';

const logger = createLogger("WorkHistoryModal");

interface WorkHistoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  refreshData?: () => Promise<void>;
  workTypes: string[];
  executors: string[];
}

interface UserWithPlaces {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  place_names: string[];
  place_ids: string[];
  selected_place_id?: string;
  selected_place_name?: string;
}

// 선택된 유저-업체 정보를 추적하기 위한 새로운 인터페이스
interface SelectedUserPlace {
  userId: string;
  placeId: string;
  userName: string;
  userEmail: string;
  placeName: string;
}

const WorkHistoryModal: React.FC<WorkHistoryModalProps> = ({
  isOpen,
  onOpenChange,
  refreshData,
  workTypes,
  executors
}) => {
  // 로컬 스토리지에서 커스텀 실행사 목록 가져오기
  const [customExecutors, setCustomExecutors] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customExecutors');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // 커스텀 실행사 추가
  const addCustomExecutor = (executor: string) => {
    if (!executor || customExecutors.includes(executor)) return;
    
    const newExecutors = [...customExecutors, executor];
    setCustomExecutors(newExecutors);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('customExecutors', JSON.stringify(newExecutors));
    }
  };

  // 커스텀 실행사 삭제
  const removeCustomExecutor = (executor: string) => {
    const newExecutors = customExecutors.filter(e => e !== executor);
    setCustomExecutors(newExecutors);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('customExecutors', JSON.stringify(newExecutors));
    }
  };

  // 커스텀 실행사 업데이트
  const updateCustomExecutor = (oldName: string, newName: string) => {
    if (!newName || (oldName !== newName && customExecutors.includes(newName))) return;
    
    const newExecutors = customExecutors.map(e => e === oldName ? newName : e);
    setCustomExecutors(newExecutors);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('customExecutors', JSON.stringify(newExecutors));
    }
  };

  // 서버에서 받은 실행사 목록과 사용자 정의 실행사 목록 합치기
  const allExecutors = React.useMemo(() => {
    const serverExecutors = executors || [];
    // 중복 제거
    return [...new Set([...serverExecutors, ...customExecutors])];
  }, [executors, customExecutors]);

  // 모달 폼 상태
  const [userId, setUserId] = useState<string[]>([]);
  const [workType, setWorkType] = useState<string>("");
  const [executor, setExecutor] = useState<string>("");
  const [contractKeyword, setContractKeyword] = useState("");
  const [workKeyword, setWorkKeyword] = useState("");
  const [charCount, setCharCount] = useState<number | undefined>();
  const [actualDateRange, setActualDateRange] = useState<DateRange | undefined>();
  const [userDateRange, setUserDateRange] = useState<DateRange | undefined>();
  const [tempActualDateRange, setTempActualDateRange] = useState<DateRange | undefined>();
  const [tempUserDateRange, setTempUserDateRange] = useState<DateRange | undefined>();
  const [isActualCalendarOpen, setIsActualCalendarOpen] = useState(false);
  const [isUserCalendarOpen, setIsUserCalendarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserWithPlaces | null>(null);
  const [isManagingExecutors, setIsManagingExecutors] = useState(false);
  const [newExecutorName, setNewExecutorName] = useState("");
  const [executorToEdit, setExecutorToEdit] = useState<{name: string, newName: string} | null>(null);

  // 선택된 유저-업체 정보 목록을 저장할 상태 추가
  const [selectedUserPlaces, setSelectedUserPlaces] = useState<SelectedUserPlace[]>([]);

  // 날짜 범위 설정 함수
  const handleActualDateConfirm = () => {
    setActualDateRange(tempActualDateRange);
    setIsActualCalendarOpen(false);
  };

  const handleUserDateConfirm = () => {
    setUserDateRange(tempUserDateRange);
    setIsUserCalendarOpen(false);
  };

  // 작업 추가 제출 핸들러
  const handleSubmit = async () => {
    if (userId.length === 0 || !workType || !executor) {
      alert("유저, 작업 종류, 실행사는 필수 입력 항목입니다.");
      return;
    }
  
    // 사용자 ID와 업체 ID 추출 (값 형식: "user_id:place_id" 또는 "user_id")
    const idParts = userId[0].split(':');
    const userIdValue = idParts[0];
    const placeIdValue = idParts.length > 1 ? idParts[1] : null;

    // 업체 ID가 없는 경우 저장 방지
    if (!placeIdValue) {
      alert("업체가 등록되지 않은 사용자는 작업 이력을 저장할 수 없습니다. 먼저 사용자에게 업체를 등록해주세요.");
      return;
    }
    
    // 상세 로깅 추가
    logger.debug('Submit data:', {
      userId,
      userIdValue,
      placeIdValue,
      workType,
      executor,
      selectedUserDetails
    });
  
    // place_id 관련 방어적 코딩 개선
    if (!selectedUserDetails) {
      alert("선택된 사용자 정보를 찾을 수 없습니다.");
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
  
      const payload = {
        user_id: parseInt(userIdValue),
        place_id: placeIdValue,
        work_type: workType,
        executor: executor,
        contract_keyword: contractKeyword || null,
        work_keyword: workKeyword || null,
        char_count: charCount || null,
        actual_start_date: actualDateRange?.from ? formatDate(actualDateRange.from) : null,
        actual_end_date: actualDateRange?.to ? formatDate(actualDateRange.to) : null,
        user_start_date: userDateRange?.from ? formatDate(userDateRange.from) : null,
        user_end_date: userDateRange?.to ? formatDate(userDateRange.to) : null,
        company_characteristics: null,
      };
  
      // Validate work_type
      if (!workTypes.includes(payload.work_type)) {
        alert(`작업 종류는 등록된 작업 종류 중 하나여야 합니다. 현재 값: ${payload.work_type}`);
        setIsSaving(false);
        return;
      }
  
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
          onOpenChange(false); // 성공 시 다이얼로그 닫기
          resetForm(); // 폼 초기화
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
    setWorkType(""); 
    setExecutor(""); 
    setContractKeyword("");
    setWorkKeyword("");
    setCharCount(undefined);
    setActualDateRange(undefined);
    setUserDateRange(undefined);
    setTempActualDateRange(undefined);
    setTempUserDateRange(undefined);
    setIsActualCalendarOpen(false);
    setIsUserCalendarOpen(false);
    setSelectedUserDetails(null);
    setSelectedUserPlaces([]); // 선택된 유저-업체 목록 초기화 추가
  };

  // handleReset 함수 추가
  const handleReset = () => {
    resetForm();
  };

  // 모달이 열리고 닫힐 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때는 추가 작업 필요없음
    } else {
      // 모달이 닫힐 때 상태 초기화
      resetForm();
    }
  }, [isOpen]);

  // 사용자 정보 가져오기 (modal 열릴 때만 초기 fetch)
  const { 
    data: users, 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery<UserWithPlaces[]>({
    queryKey: ['admin-users-with-places'],
    queryFn: async () => {
      const res = await apiClient.get('/api/admin/users-with-places');
      if (res.data.success) {
        return res.data.data.map((user: UserWithPlaces) => ({ ...user, place_ids: user.place_ids || [], place_names: user.place_names || [] }));
      }
      throw new Error(res.data.message || '사용자 정보를 불러오는데 실패했습니다');
    },
    enabled: isOpen,  // only fetch when modal is open
    staleTime: 5 * 60 * 1000,
  });

  const selectedUserId = userId.length > 0 ? userId[0].split(':')[0] : null;
  const { data: userDetail, refetch: fetchUserDetail } = useQuery({
    queryKey: ['admin-user-detail', selectedUserId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/admin/users/${selectedUserId}`);
      if (res.data.success) return res.data.data;
      throw new Error(res.data.message || '사용자 상세 정보를 불러오는데 실패했습니다');
    },
    enabled: false,
  });

  // fetch selected user detail when selection changes
  useEffect(() => {
    if (selectedUserId) {
      fetchUserDetail();
    } else {
      setSelectedUserDetails(null);
    }
  }, [selectedUserId, fetchUserDetail]);

  // update selectedUserDetails from fetched detail
  useEffect(() => {
    if (userDetail) {
      setSelectedUserDetails({
        ...userDetail,
        place_ids: userDetail.place_ids || [],
        place_names: userDetail.place_names || []
      });
    }
  }, [userDetail]);

  const userOptions = React.useMemo(() => {
    if (!users || !Array.isArray(users)) {
      logger.debug('No users available or users is not an array');
      return [];
    }

    const options: { value: string; label: string; userData: UserWithPlaces & { place_id: string; place_name: string } }[] = [];

    users.forEach(user => {
      logger.debug('Processing user:', { id: user.user_id, name: user.name, places: user.place_names });
      
      // 업체 정보가 있는 경우만 처리 (백엔드에서 이미 필터링되었으나 방어적 코딩)
      if (user.place_names && user.place_names.length > 0 && user.place_ids && user.place_ids.length > 0) {
        // 각 업체마다 별도의 옵션 생성
        user.place_names.forEach((placeName, index) => {
          // place_id가 유효한 경우만 추가
          if (user.place_ids && index < user.place_ids.length) {
            const placeId = user.place_ids[index];
            
            options.push({
              value: `${user.user_id}:${placeId}`,
              label: `${user.name} (${user.email}) - ${placeName}`,
              userData: {
                ...user,
                place_id: placeId,
                place_name: placeName
              }
            });
          }
        });
      }
    });

    logger.debug(`Generated ${options.length} user options`);
    return options;
  }, [users]);

  // 사용자 선택이 변경될 때 selectedUserDetails 업데이트하는 useEffect 수정
  useEffect(() => {
    if (userId.length > 0) {
      // 새로운 형식 (user_id:place_id)에서 사용자 ID 추출
      const [userIdValue] = userId[0].split(':');
      
      // users 배열에서 선택된 사용자 ID와 일치하는 사용자 정보 찾기
      if (users) {
        const userDetail = users.find(user => user.user_id.toString() === userIdValue);
        
        if (userDetail) {
          // 사용자 정보가 있으면 상세정보 업데이트
          // place_ids가 없는 경우 빈 배열로 초기화하여 TypeScript 오류 방지
          const normalizedUserDetail = {
            ...userDetail,
            place_ids: userDetail.place_ids || [],
            place_names: userDetail.place_names || []
          };
          
          // 선택한 옵션의 userData 가져오기
          const selectedOption = userOptions.find(option => option.value === userId[0]);
          if (selectedOption && selectedOption.userData) {
            // 선택된 특정 업체 정보 활용
            setSelectedUserDetails({
              ...normalizedUserDetail,
              // 선택된 특정 업체 정보 추가
              selected_place_id: selectedOption.userData.place_id,
              selected_place_name: selectedOption.userData.place_name
            });
          } else {
            setSelectedUserDetails(normalizedUserDetail);
          }
        } else {
          setSelectedUserDetails(null);
        }
      }
    } else {
      setSelectedUserDetails(null);
    }
  }, [userId, users, userOptions]);

  // 사용자 선택이 변경될 때 selectedUserPlaces 업데이트하는 함수
  const updateSelectedUserPlaces = (selectedValues: string[]) => {
    // 선택된 모든 값에 대한 정보를 수집
    const updatedPlaces: SelectedUserPlace[] = selectedValues.map(value => {
      // 값에서 user_id와 place_id 추출
      const [userId, placeId] = value.split(':');
      
      // userOptions에서 해당 값에 맞는 옵션 찾기
      const option = userOptions.find(opt => opt.value === value);
      
      if (option && option.userData) {
        return {
          userId,
          placeId,
          userName: option.userData.name,
          userEmail: option.userData.email,
          placeName: option.userData.place_name || '업체 미등록'
        };
      }
      
      // 찾지 못한 경우 기본값
      return {
        userId,
        placeId,
        userName: '알 수 없음',
        userEmail: '',
        placeName: '업체 미등록'
      };
    });
    
    setSelectedUserPlaces(updatedPlaces);
  };

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
              onChange={(newSelected) => {
                setUserId(newSelected);
                updateSelectedUserPlaces(newSelected);
              }}
              placeholder="유저 선택"
              position="right"
              displayMode="text" // Use text display mode to match placeholder style
              multiSelect={true} // 다중 선택 모드 활성화
            />
            
            {/* 선택된 유저-업체명 조합 표시 */}
            {selectedUserPlaces.length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 flex justify-between items-center">
                  <span>선택된 유저-업체 목록 ({selectedUserPlaces.length}개)</span>
                  {selectedUserPlaces.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs text-gray-500 hover:text-red-500"
                      onClick={() => {
                        setUserId([]);
                        setSelectedUserPlaces([]);
                      }}
                    >
                      전체 해제
                    </Button>
                  )}
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {selectedUserPlaces.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded text-sm border">
                      <div>
                        <div className="font-medium text-gray-800">{item.userName}</div>
                        <div className="text-xs text-gray-600 flex items-center gap-2">
                          <span>{item.userEmail}</span>
                          <span className="text-gray-400">|</span>
                          <span className="font-medium text-blue-600">{item.placeName}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        onClick={() => {
                          const newSelected = userId.filter(id => id !== `${item.userId}:${item.placeId}`);
                          setUserId(newSelected);
                          updateSelectedUserPlaces(newSelected);
                        }}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Native JS date formatter
  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return "기간 선택";
    
    const formatDate = (date: Date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    if (!range.to) return formatDate(range.from);
    return `${formatDate(range.from)} ~ ${formatDate(range.to)}`;
  };

  const renderDateRangeCalendar = (
    tempRange: DateRange | undefined,
    setTempRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>,
    handleConfirm: () => void
  ) => {
    const today = new Date();
    
    // Custom day rendering function - 시작일/종료일 상대적 날짜 텍스트 제거
    const renderDay = (day: Date) => {
      const isStart = tempRange?.from && 
                     day.getDate() === tempRange.from.getDate() && 
                     day.getMonth() === tempRange.from.getMonth() && 
                     day.getFullYear() === tempRange.from.getFullYear();
      const isEnd = tempRange?.to && 
                    day.getDate() === tempRange.to.getDate() && 
                    day.getMonth() === tempRange.to.getMonth() && 
                    day.getFullYear() === tempRange.to.getFullYear();
      const isTodayDate = day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear();
      // Show label for start, end, or today
      const shouldShowLabel = isStart || isEnd || isTodayDate;
      const labelText = isStart ? '시작일' : isEnd ? '종료일' : isTodayDate ? '오늘' : '';
      const labelColor = isStart ? 'text-blue-600' : isEnd ? 'text-green-600' : 'text-indigo-600';
      return (
        <div className="relative">
          <div>{day.getDate()}</div>
          {shouldShowLabel && (
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap">
              <span className={labelColor}>{labelText}</span>
            </div>
          )}
        </div>
      );
    };
    
    const customStyles = `
      /* Minimal calendar styling */
      .rdp-range-calendar {
        font-family: inherit;
        color: #1f2937;
        border: none;
      }
      .rdp-day {
        width: 36px;
        height: 36px;
        padding: 0;
      }
      .rdp-day button {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: inherit;
        transition: background 0.2s;
      }
      .rdp-day:not(.rdp-day_selected):hover button {
        background-color: #f3f4f6;
      }
      .rdp-day_selected button,
      .rdp-day_range_start button,
      .rdp-day_range_end button {
        background-color: #3b82f6 !important;
        color: #fff !important;
        font-weight: 500;
      }
      .rdp-day_range_middle button {
        background-color: #bfdbfe !important;
        color: #1f2937 !important;
      }
      .rdp-day_today:not(.rdp-day_selected) button {
        border: 1px solid #3b82f6 !important;
      }
      .rdp-tbody {
        margin-bottom: 4px;
      }
    `;
    
    // 범위 내 날짜인지 확인하는 함수
    const isInRange = (day: Date) => {
      if (!tempRange?.from) return false;
      if (!tempRange.to) return false;
      
      const date = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const from = new Date(tempRange.from.getFullYear(), tempRange.from.getMonth(), tempRange.from.getDate());
      const to = new Date(tempRange.to.getFullYear(), tempRange.to.getMonth(), tempRange.to.getDate());
      
      return date >= from && date <= to;
    };
    
    // 시작일 또는 종료일인지 확인
    const isStartOrEnd = (day: Date) => {
      if (tempRange?.from && 
          day.getDate() === tempRange.from.getDate() && 
          day.getMonth() === tempRange.from.getMonth() && 
          day.getFullYear() === tempRange.from.getFullYear()) {
        return 'start';
      }
      
      if (tempRange?.to && 
          day.getDate() === tempRange.to.getDate() && 
          day.getMonth() === tempRange.to.getMonth() && 
          day.getFullYear() === tempRange.to.getFullYear()) {
        return 'end';
      }
      
      return false;
    };

    // 날짜 클릭 핸들러
    const handleDayClick = (day: Date) => {
      // 상태가 저장되지 않는 문제 해결을 위해 직접 날짜 객체 처리
      if (!tempRange || !tempRange.from) {
        // 시작일이 없는 경우, 첫 번째 클릭은 시작일로 설정
        setTempRange({ from: day, to: undefined });
      } else if (!tempRange.to) {
        // 시작일이 있고 종료일이 없는 경우, 두 번째 클릭은 종료일로 설정
        if (day < tempRange.from) {
          // 선택된 날짜가 시작일보다 이전인 경우, 선택된 날짜를 시작일로, 기존 시작일을 종료일로 설정
          setTempRange({ from: day, to: tempRange.from });
        } else {
          // 선택된 날짜가 시작일 이후인 경우, 종료일로 설정
          setTempRange({ from: tempRange.from, to: day });
        }
      } else {
        // 시작일과 종료일이 모두 있는 경우, 다시 시작일부터 선택 시작
        setTempRange({ from: day, to: undefined });
      }
    };
    
    return (
      <div>
        <style>{customStyles}</style>
        <div className="rdp-range">
          <DayPicker
            mode="range"
            selected={tempRange}
            numberOfMonths={1}
            className="rdp-range-calendar"
            modifiers={{
              today,
              start: tempRange?.from ? [tempRange.from] : [],
              end: tempRange?.to ? [tempRange.to] : [],
              range_middle: tempRange?.from && tempRange?.to ? { from: tempRange.from, to: tempRange.to } : []
            }}
            components={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              Day: (props: any) => {
                const { date, className } = props;
                const startOrEnd = isStartOrEnd(date);
                // base classes for range
                const rangeCls = startOrEnd === 'start'
                  ? 'rdp-day_range_start'
                  : startOrEnd === 'end'
                    ? 'rdp-day_range_end'
                    : isInRange(date)
                      ? 'rdp-day_range_middle'
                      : '';
                // highlight today
                const todayCls = date.toDateString() === today.toDateString() ? 'rdp-day_today' : '';
                const cls = `${className || ''} ${rangeCls} ${todayCls}`.trim();
                return (
                  <button onClick={() => handleDayClick(date)} className={cls}>
                    {renderDay(date)}
                  </button>
                );
              }
            }}
          />
        </div>
        <div className="p-3 border-t border-border flex items-center justify-between bg-gray-50">
          <span className="text-sm text-gray-600">
            {!tempRange?.from ? (
              <span className="text-blue-600 font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                시작일을 선택하세요
              </span>
            ) : !tempRange?.to ? (
              <span className="text-green-600 font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                종료일을 선택하세요
              </span>
            ) : (
              <span className="font-medium flex items-center text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {formatDateRange(tempRange)}
              </span>
            )}
          </span>
          <Button 
            size="sm" 
            onClick={handleConfirm}
            disabled={!tempRange?.from}
            className={`${!tempRange?.from ? 'opacity-50' : 'text-white bg-indigo-600 hover:bg-indigo-700'}`}
          >
            설정
          </Button>
        </div>
      </div>
    );
  };

  const tooltipStyles = `
  .tooltip {
    position: relative;
    display: inline-block;
  }
  .tooltip:before {
    content: attr(data-tip);
    position: absolute;
    background-color: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    max-width: 300px;
    white-space: pre-wrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
  }
  .tooltip:hover:before {
    opacity: 1;
    visibility: visible;
  }
`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <style>{tooltipStyles}</style>
        <DialogHeader className="bg-white pb-4 border-b">
          <DialogTitle className="text-black font-semibold">새 작업 이력 추가</DialogTitle>
          <DialogDescription className="text-gray-600">
            새로운 작업 이력 정보를 입력해주세요. 완료 후 저장 버튼을 클릭하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 bg-white">
          {renderUserIdField()}
          
          {/* 작업 종류 - 백엔드에서 가져온 옵션으로 수정 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="work-type" className="text-right">
              작업 종류
            </Label>
            <div className="col-span-3">
              <MultiSelectCombobox
                options={workTypes.map(type => ({
                  value: type,
                  label: type
                }))}
                selected={workType}
                onChange={setWorkType}
                placeholder="작업 종류 선택"
                position="right"
                multiSelect={false}
              />
            </div>
          </div>

          {/* 실행사 - 백엔드에서 가져온 옵션으로 수정 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="executor" className="text-right">
              실행사
            </Label>
            <div className="col-span-3">
              <div className="space-y-2">
                <div className="flex items-center">
                  <MultiSelectCombobox
                    options={allExecutors.map(exec => ({
                      value: exec,
                      label: exec
                    }))}
                    selected={executor}
                    onChange={setExecutor}
                    placeholder="실행사 선택"
                    position="right"
                    multiSelect={false}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-9 px-2"
                    onClick={() => setIsManagingExecutors(!isManagingExecutors)}
                    title="실행사 관리"
                  >
                    <Edit2 size={16} />
                  </Button>
                </div>
                
                {isManagingExecutors && (
                  <div className="border rounded-md p-3 bg-gray-50">
                    <h4 className="text-sm font-medium mb-2">실행사 관리</h4>
                    
                    {/* 새 실행사 추가 */}
                    <div className="flex mb-3">
                      <Input 
                        placeholder="새 실행사 이름"
                        value={newExecutorName}
                        onChange={e => setNewExecutorName(e.target.value)}
                        className="rounded-r-none"
                      />
                      <Button
                        onClick={() => {
                          if (newExecutorName.trim()) {
                            addCustomExecutor(newExecutorName.trim());
                            setNewExecutorName("");
                          }
                        }}
                        disabled={!newExecutorName.trim() || allExecutors.includes(newExecutorName.trim())}
                        className="rounded-l-none"
                      >
                        <PlusCircle size={16} className="mr-1" />
                        추가
                      </Button>
                    </div>
                    
                    {/* 커스텀 실행사 목록 */}
                    {customExecutors.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto">
                        <div className="text-xs text-gray-500 mb-1">사용자 추가 실행사 목록</div>
                        <div className="space-y-1">
                          {customExecutors.map((exec, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border">
                              {executorToEdit && executorToEdit.name === exec ? (
                                <div className="flex flex-1 items-center">
                                  <Input 
                                    value={executorToEdit.newName}
                                    onChange={e => setExecutorToEdit({...executorToEdit, newName: e.target.value})}
                                    className="h-8 text-sm"
                                    autoFocus
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-green-600"
                                    onClick={() => {
                                      if (executorToEdit.newName.trim() && executorToEdit.name !== executorToEdit.newName) {
                                        updateCustomExecutor(executorToEdit.name, executorToEdit.newName.trim());
                                        
                                        // 편집 중인 실행사가 현재 선택된 실행사인 경우, 선택된 실행사도 업데이트
                                        if (executor === executorToEdit.name) {
                                          setExecutor(executorToEdit.newName.trim());
                                        }
                                      }
                                      setExecutorToEdit(null);
                                    }}
                                    title="저장"
                                  >
                                    <Save size={14} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-gray-500"
                                    onClick={() => setExecutorToEdit(null)}
                                    title="취소"
                                  >
                                    <X size={14} />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm">{exec}</span>
                                  <div className="flex space-x-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-blue-500"
                                      onClick={() => setExecutorToEdit({name: exec, newName: exec})}
                                      title="수정"
                                    >
                                      <Edit2 size={14} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-red-500"
                                      onClick={() => {
                                        if (confirm(`'${exec}' 실행사를 삭제하시겠습니까?`)) {
                                          removeCustomExecutor(exec);
                                          
                                          // 삭제된 실행사가 현재 선택된 실행사인 경우 선택 해제
                                          if (executor === exec) {
                                            setExecutor('');
                                          }
                                        }
                                      }}
                                      title="삭제"
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3 text-gray-500 text-sm">
                        아직 추가된 실행사가 없습니다.
                      </div>
                    )}
                    
                    {customExecutors.length > 0 && (
                      <div className="mt-2 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 text-xs hover:text-red-700"
                          onClick={() => {
                            if (confirm('모든 사용자 정의 실행사를 삭제하시겠습니까?')) {
                              // 로컬 스토리지 초기화
                              if (typeof window !== 'undefined') {
                                localStorage.removeItem('customExecutors');
                              }
                              
                              // 커스텀 실행사 목록 초기화
                              for (const exec of customExecutors) {
                                removeCustomExecutor(exec);
                              }
                              
                              // 현재 선택된 실행사가 커스텀 목록에 있는 경우 선택 해제
                              if (customExecutors.includes(executor)) {
                                setExecutor('');
                              }
                            }
                          }}
                        >
                          목록 초기화
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 계약 키워드 - Fixed the div structure */}
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
            onOpenChange(false);
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
  );
};

export default WorkHistoryModal;