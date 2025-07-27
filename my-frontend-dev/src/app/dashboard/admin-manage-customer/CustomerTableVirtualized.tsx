'use client';

import { FixedSizeList as List } from 'react-window';
import { Button } from '@/components/ui/button';
import { ICustomerInfo, IContactInfo } from '@/types/index';
import { Trash2, Copy, Star, Ban, UserPlus, UserCheck, UserX } from 'lucide-react';
import { toast } from "sonner";
import { useState, useEffect, useMemo } from 'react';
import apiClient from '@/lib/apiClient';

// 연락처에 회사명을 포함한 타입
type ContactWithCompany = IContactInfo & { company_name: string };

// TemplateItem 타입 정의
interface TemplateItem {
  id: number;
  order: number;
  type: 'text' | 'image';
  content: string | string[];
}

// Template 타입 정의
interface Template {
  id?: number;
  name: string;
  description?: string;
  items: TemplateItem[];
}

// 플랫된 행 데이터 타입
interface FlattenedRow {
  type: 'customer' | 'contact';
  customerId: number;
  customer: ICustomerInfo;
  contact?: IContactInfo;
  contactIndex?: number;
  totalContacts?: number;
  rowIndex: number;
}

interface CustomerTableVirtualizedProps {
  customers: ICustomerInfo[];
  currentPage: number;
  pageSize: number;
  onPageSizeChange: (newSize: number) => void;
  onRefresh: () => void;
  parsingFilters: string[];
  showFavoritesOnly: boolean;
  excludeBlacklist: boolean;
  selectedTemplateId?: number;
  templates?: Template[];
}

// 친구명 생성 함수
function makeKakaoFriendName(company: string | undefined, person: string | undefined): string {
  if (!company && person) return person;
  if (!company) return '';
  if (!person) return company;
  const combined = `${company}-${person}`;
  const maxLen = 20;
  if (combined.length <= maxLen) return combined;
  const cutLen = maxLen - (person.length + 1);
  if (cutLen > 0) return `${company.substring(0, cutLen)}-${person}`;
  return person.substring(0, maxLen);
}

// 주소 요약 함수
function shortenAddress(address: string, maxLength = 40): string {
  if (address.length <= maxLength) return address;
  return address.substring(0, maxLength) + '...';
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
    rows: FlattenedRow[];
    isSelectionMode: boolean;
    selectedCustomers: ICustomerInfo[];
    onToggleCustomer: (customer: ICustomerInfo) => void;
    onToggleFavorite: (contactId: number, current: boolean) => Promise<void>;
    onToggleBlacklist: (contactId: number, current: boolean) => Promise<void>;
    onAddFriend: (companyName: string, contact: IContactInfo) => Promise<void>;
    onDeleteCustomer: (customer: ICustomerInfo) => void;
    copyToClipboard: (text: string) => Promise<void>;
    currentPage: number;
    pageSize: number;
    isWideScreen: boolean;
  }
}) => {
  const row = data.rows[index];
  const { 
    isSelectionMode, 
    selectedCustomers, 
    onToggleCustomer,
    onToggleFavorite,
    onToggleBlacklist,
    onAddFriend,
    onDeleteCustomer,
    copyToClipboard,
    currentPage,
    pageSize,
    isWideScreen
  } = data;

  if (!row) return null;

  const { customer, contact, contactIndex = 0 } = row;
  const isFirstContact = contactIndex === 0;

  return (
    <div 
      style={style} 
      className={`flex border-b ${contactIndex % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}`}
    >
      {/* 선택 체크박스 */}
      {isSelectionMode && isFirstContact && (
        <div className="px-2 text-center py-2 w-12 flex items-center justify-center">
          <input 
            type="checkbox"
            checked={selectedCustomers.some(c => c.id === customer.id)}
            onChange={() => onToggleCustomer(customer)}
            className="h-3 w-3"
          />
        </div>
      )}

      {/* No. */}
      {isFirstContact && (
        <div className="px-2 py-2 text-center w-16 flex items-center justify-center text-xs">
          {(currentPage - 1) * pageSize + row.rowIndex + 1}
        </div>
      )}

      {/* 업체명 */}
      {isFirstContact && (
        <div className="px-3 py-2 w-32 flex items-center text-xs">
          {customer.company_name}
        </div>
      )}

      {/* 담당자명 */}
      <div className="px-3 py-2 w-24 text-center flex items-center justify-center text-xs">
        {contact?.contact_person ? (
          <div className="relative group w-max mx-auto">
            <span className="cursor-pointer underline text-black">
              {contact.contact_person}
            </span>
            <div className="absolute bottom-full left-0 mb-0 hidden group-hover:block hover:block bg-white border rounded shadow-lg p-2 min-w-[200px] max-w-xs whitespace-nowrap z-10 flex items-center justify-between gap-2">
              <span className="break-all text-gray-800">
                {makeKakaoFriendName(customer.company_name, contact.contact_person ?? undefined)}
              </span>
              <button
                className="ml-2 p-1 hover:bg-gray-100 rounded"
                onClick={() => copyToClipboard(makeKakaoFriendName(customer.company_name, contact.contact_person ?? undefined))}
              >
                <Copy className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        ) : ('-')}
      </div>

      {/* 전화번호 */}
      <div className="px-3 py-2 w-28 text-center flex items-center justify-center text-xs">
        {contact?.phone_number || '-'}
      </div>

      {/* 주소 */}
      {isFirstContact && (
        <div className={`px-3 py-2 ${isWideScreen ? 'w-36' : 'w-36'} flex items-center text-xs`}>
          <div className="relative group w-full">
            <span className="block truncate w-full">{shortenAddress(customer.address || '-')}</span>
            {customer.address && (
              <div className="absolute bottom-full left-0 mb-0 hidden group-hover:block hover:block bg-white text-xs text-gray-800 border rounded px-2 py-1 shadow-lg z-10 max-w-xs">
                <span className="break-words">{customer.address}</span>
                <button onClick={() => copyToClipboard(customer.address || '')} className="ml-2 p-1 hover:bg-gray-100 rounded">
                  <Copy className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
          {customer.naverplace_url && (
            <a
              href={customer.naverplace_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline block text-[0.6rem] ml-2"
            >
              네이버 플레이스
            </a>
          )}
        </div>
      )}

      {/* 필터설정 */}
      {isFirstContact && (
        <div className="px-3 py-2 w-24 flex items-center text-xs">
          <span className="inline-block w-full truncate">{customer.source_filter || '-'}</span>
        </div>
      )}

      {/* 액션 버튼들 */}
      {isFirstContact && (
        <div className="px-3 py-2 w-20 text-center flex items-center justify-center">
          <div className="flex flex-row items-center gap-1 justify-center">
            <button
              className="p-1 h-5 w-5 flex items-center justify-center"
              onClick={() => onDeleteCustomer(customer)}
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </button>
            <div className="relative inline-flex flex-col-reverse items-center group">
              <button
                className={`p-1 h-5 w-5 flex items-center justify-center rounded-full transition-colors
                  ${contact?.favorite ? 'bg-yellow-100' : ''}`}
                onClick={() => contact && onToggleFavorite(contact.id, contact.favorite ?? false)}
              >
                <Star className={`${contact?.favorite ? 'fill-current text-yellow-400' : 'text-gray-400'} h-3 w-3`} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-xs text-gray-800 border rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
                {contact?.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              </div>
            </div>
            <div className="relative inline-flex flex-col-reverse items-center group">
              <button
                className={`p-1 h-5 w-5 flex items-center justify-center rounded-full transition-colors
                  ${contact?.blacklist ? 'bg-red-100' : ''}`}
                onClick={() => contact && onToggleBlacklist(contact.id, contact.blacklist ?? false)}
              >
                <Ban className={`${contact?.blacklist ? 'text-red-500' : 'text-gray-400'} h-3 w-3`} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-xs text-gray-800 border rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
                {contact?.blacklist ? '블랙리스트 해제' : '블랙리스트 추가'}
              </div>
            </div>
            <div className="relative inline-flex flex-col-reverse items-center group">
              <button
                className={`p-1 h-5 w-5 flex items-center justify-center rounded-full transition-colors
                  ${contact?.friend_add_status === 'success' || contact?.friend_add_status === 'already_registered' ? 'bg-green-100'
                  : contact?.friend_add_status === 'fail' ? 'bg-red-100'
                  : ''}`}
                onClick={() => contact?.friend_add_status === 'pending' && contact && onAddFriend(customer.company_name, contact)}
              >
                {contact?.friend_add_status === 'success' || contact?.friend_add_status === 'already_registered' ? (
                  <UserCheck className="text-green-500 h-3 w-3" />
                ) : contact?.friend_add_status === 'fail' ? (
                  <UserX className="text-red-500 h-3 w-3" />
                ) : (
                  <UserPlus className="text-gray-400 h-3 w-3" />
                )}
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-xs text-gray-800 border rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
                {contact?.friend_add_status === 'success' ? '친구입니다!'
                  : contact?.friend_add_status === 'already_registered' ? '친구입니다!'
                  : contact?.friend_add_status === 'fail' ? '친구추가가 거부되었습니다!'
                  : '친구추가하기'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CustomerTableVirtualized({
  customers,
  currentPage,
  pageSize,
  onRefresh,
  parsingFilters,
  showFavoritesOnly,
  excludeBlacklist,
  selectedTemplateId,
  templates
}: CustomerTableVirtualizedProps) {
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<ICustomerInfo[]>([]);

  // 화면 크기 감지
  useEffect(() => {
    const checkScreenSize = () => {
      setIsWideScreen(window.innerWidth >= 1400);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 필터링된 고객 데이터
  let filteredCustomers = parsingFilters.length > 0
    ? customers.filter(customer => customer.source_filter && parsingFilters.includes(customer.source_filter))
    : customers;
  
  if (showFavoritesOnly) {
    filteredCustomers = filteredCustomers.filter(c => c.contacts?.some(ct => ct.favorite));
  }
  if (excludeBlacklist) {
    filteredCustomers = filteredCustomers.filter(c => c.contacts?.every(ct => !ct.blacklist));
  }

  // 플랫된 행 데이터 생성
  const flattenedRows = useMemo(() => {
    const rows: FlattenedRow[] = [];
    
    filteredCustomers.forEach((customer, customerIndex) => {
      const contacts = customer.contacts || [];
      
      if (contacts.length > 0) {
        contacts.forEach((contact, contactIndex) => {
          rows.push({
            type: 'contact',
            customerId: customer.id,
            customer,
            contact,
            contactIndex,
            totalContacts: contacts.length,
            rowIndex: customerIndex
          });
        });
      } else {
        rows.push({
          type: 'customer',
          customerId: customer.id,
          customer,
          rowIndex: customerIndex
        });
      }
    });
    
    return rows;
  }, [filteredCustomers]);

  // 고객 선택 토글
  const toggleSelectCustomer = (customer: ICustomerInfo) => {
    if (selectedCustomers.some(c => c.id === customer.id)) {
      setSelectedCustomers(selectedCustomers.filter(c => c.id !== customer.id));
    } else {
      setSelectedCustomers([...selectedCustomers, customer]);
    }
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers([...filteredCustomers]);
    }
  };

  // 즐겨찾기 토글
  const handleToggleFavorite = async (contactId: number, current: boolean): Promise<void> => {
    try {
      await apiClient.patch(`/api/customer/contacts/${contactId}/favorite`, { favorite: !current });
      toast.success('즐겨찾기 상태가 변경되었습니다.');
      onRefresh();
    } catch {
      toast.error('즐겨찾기 업데이트 실패.');
    }
  };

  // 블랙리스트 토글
  const handleToggleBlacklist = async (contactId: number, current: boolean): Promise<void> => {
    try {
      await apiClient.patch(`/api/customer/contacts/${contactId}/blacklist`, { blacklist: !current });
      toast.success('블랙리스트 상태가 변경되었습니다.');
      onRefresh();
    } catch {
      toast.error('블랙리스트 업데이트 실패.');
    }
  };

  // 친구추가
  const handleAddFriend = async (companyName: string, contact: IContactInfo): Promise<void> => {
    try {
      await apiClient.post('/api/kakao/add-friends', { 
        friends: [{ 
          company_name: companyName, 
          contact_person: contact.contact_person || '', 
          phone: contact.phone_number || '' 
        }] 
      });
      toast.success('친구 추가 요청이 완료되었습니다.');
      onRefresh();
    } catch {
      toast.error('친구 추가 실패.');
    }
  };

  // 고객 삭제
  const handleDeleteCustomer = (customer: ICustomerInfo) => {
    toast(
      `${customer.company_name}를 삭제하시겠습니까?`,
      {
        action: {
          label: "삭제",
          onClick: async () => {
            try {
              await apiClient.delete(`/api/customer/delete/${customer.id}`);
              toast.success("삭제 완료", { description: `${customer.company_name}가 삭제되었습니다.` });
              onRefresh();
            } catch (error) {
              toast.error("삭제 실패", { description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." });
            }
          }
        }
      }
    );
  };

  // 클립보드 복사
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('주소가 복사되었습니다!');
    } catch {
      toast.error('복사 실패');
    }
  };

  // 영업하기 핸들러
  const handleSendMarketingData = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('체크된 고객이 없습니다. 체크를 해주세요.');
      return;
    }

    if (!templates) {
      toast.error('템플릿 목록을 불러올 수 없습니다.');
      return;
    }
    
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    if (!selectedTemplate) {
      toast.error('발송할 템플릿을 선택해주세요.');
      return;
    }

    let templateWithItems = selectedTemplate;
    if (!Array.isArray(selectedTemplate.items) || selectedTemplate.items.length === 0) {
      try {
        const res = await apiClient.get(`/api/templates/${selectedTemplate.id}`);
        templateWithItems = res.data;
      } catch {
        toast.error('템플릿 메시지 정보를 불러오지 못했습니다.');
        return;
      }
    }
    
    const items = templateWithItems.items || [];
    if (items.length === 0) {
      toast.error('선택한 템플릿에 내용이 없습니다. 템플릿 내용을 입력해주세요.');
      return;
    }

    try {
      const allContactsWithCompany: ContactWithCompany[] = selectedCustomers.flatMap(c =>
        (c.contacts || []).map((ct): ContactWithCompany => ({
          ...ct,
          company_name: c.company_name
        }))
      );

      const contactsToProcess = allContactsWithCompany.filter(ct => ct.friend_add_status !== 'fail');
      
      const message_groups = contactsToProcess.map(ct => ({
        username: makeKakaoFriendName(ct.company_name, ct.contact_person ?? undefined),
        messages: items.map((item: TemplateItem) => {
          const raw = item.content;
          const txt = item.type === 'image'
            ? raw
            : typeof raw === 'string'
              ? raw.replace(/\{name\}/g, ct.contact_person || '')
              : '';
          return { type: item.type, content: txt };
        })
      }));

      await apiClient.post('/api/kakao/send', { message_groups });
      toast.success('영업 메시지 전송이 완료되었습니다.');
      setIsSelectionMode(false);
      setSelectedCustomers([]);
      onRefresh();
    } catch {
      toast.error('영업 요청 중 오류가 발생했습니다.');
    }
  };

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedCustomers([]);
  };

  return (
    <div>
      <div className="space-y-4">
        {/* 선택 모드 토글 및 배치 액션 */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex space-x-2">
            {!isSelectionMode ? (
              <Button variant="outline" size="sm" onClick={() => setIsSelectionMode(true)}>
                선택하기
              </Button>
            ) : (
              <>
                <Button size="sm" onClick={handleSendMarketingData} className="bg-green-500 text-white">
                  영업하기
                </Button>
                <Button variant="outline" size="sm" onClick={cancelSelectionMode}>
                  취소
                </Button>
              </>
            )}
          </div>

          {isSelectionMode && (
            <div className="flex items-center gap-2">
              <span className="text-sm">선택됨: {selectedCustomers.length}</span>
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {selectedCustomers.length === filteredCustomers.length ? "전체 해제" : "전체 선택"}
              </Button>
            </div>
          )}
        </div>

        {/* 테이블 정보 */}
        <div className="text-sm text-gray-500">
          총 {filteredCustomers.length}개의 고객 정보
        </div>

        {/* 가상화된 테이블 */}
        <div className={isWideScreen ? "w-full" : "overflow-x-auto"}>
          {/* 헤더 */}
          <div className={`bg-gray-100 text-gray-600 uppercase text-[0.65rem] h-10 flex items-center border-b ${!isWideScreen ? 'min-w-[1200px]' : ''}`}>
            {isSelectionMode && (
              <div className="px-2 py-2 text-center w-12 flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={selectedCustomers.length === filteredCustomers.length}
                  onChange={toggleSelectAll}
                  className="h-3 w-3"
                />
              </div>
            )}
            <div className="px-2 py-2 w-16 text-center">No.</div>
            <div className="px-3 py-2 w-32">업체명</div>
            <div className="px-3 py-2 w-24 text-center">담당자명</div>
            <div className="px-3 py-2 w-28 text-center">번호</div>
            <div className={`px-3 py-2 ${isWideScreen ? 'w-36' : 'w-36'}`}>주소</div>
            <div className="px-3 py-2 w-24">필터설정</div>
            <div className="px-3 py-2 w-20">액션</div>
          </div>

          {/* 가상화된 리스트 */}
          {flattenedRows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              데이터가 없습니다.
            </div>
          ) : (
            <List
              height={600}
              width="100%"
              itemCount={flattenedRows.length}
              itemSize={50}
              itemData={{
                rows: flattenedRows,
                isSelectionMode,
                selectedCustomers,
                onToggleCustomer: toggleSelectCustomer,
                onToggleFavorite: handleToggleFavorite,
                onToggleBlacklist: handleToggleBlacklist,
                onAddFriend: handleAddFriend,
                onDeleteCustomer: handleDeleteCustomer,
                copyToClipboard,
                currentPage,
                pageSize,
                isWideScreen
              }}
            >
              {RowRenderer}
            </List>
          )}
        </div>
      </div>
    </div>
  );
}
