'use client';

import { Button } from '@/components/ui/button';
import { ICustomerInfo, IContactInfo } from '@/types/index';
import { Trash2, Copy, Star, Ban, UserPlus, UserCheck, UserX } from 'lucide-react';
import { toast } from "sonner";
import { useState, useEffect, useRef } from 'react';
import apiClient from '@/lib/apiClient'; // apiClient 추가

// 연락처에 회사명을 포함한 타입
type ContactWithCompany = IContactInfo & { company_name: string };

// TemplateItem 타입 정의 (TemplateModal과 일치시키거나 import 필요)
interface TemplateItem {
  id: number;
  order: number;
  type: 'text' | 'image';
  content: string | string[];
}

// Template 타입 정의 (필요한 부분만)
interface Template {
  id?: number;
  name: string;
  description?: string;
  items: TemplateItem[]; // items always defined for easier handling
}

interface CustomerTableProps {
  customers: ICustomerInfo[];
  currentPage: number;
  pageSize: number;
  onPageSizeChange: (newSize: number) => void;
  onRefresh: () => void;
  parsingFilters: string[];
  showFavoritesOnly: boolean;
  excludeBlacklist: boolean;
  selectedTemplateId?: number;
  templates?: Template[]; // any[] -> Template[]
}

// 친구명 생성 함수: 업체명-담당자명, 20글자 제한, 담당자명 반드시 포함
function makeKakaoFriendName(company: string | undefined, person: string | undefined): string {
  if (!company && person) return person;
  if (!company) return '';
  if (!person) return company;
  const combined = `${company}-${person}`;
  const maxLen = 20;
  if (combined.length <= maxLen) return combined;
  // 업체명 잘라서 담당자명 반드시 포함
  const cutLen = maxLen - (person.length + 1); // 1은 '-' 문자
  return `${company.slice(0, cutLen)}-${person}`;
}

// 주소 요약 함수 추가
function shortenAddress(address: string, maxLength = 40): string {
  if (!address) return '-';
  if (address.length <= maxLength) return address;
  
  // 주소에서 더 많은 부분까지 표시하고 뒤는 생략
  const parts = address.split(' ');
  if (parts.length <= 4) return address.substring(0, maxLength) + '...';
  
  // 주소의 앞부분 최대 4개 요소까지 표시 - 더 많은 정보 포함
  return parts.slice(0, 4).join(' ') + '...';
}

export default function CustomerTable({
  customers,
  currentPage,
  pageSize,
  onRefresh,
  parsingFilters,
  showFavoritesOnly,
  excludeBlacklist,
  selectedTemplateId,
  templates
}: CustomerTableProps) {
  // 화면 크기 감지를 위한 상태 추가
  const [isWideScreen, setIsWideScreen] = useState(false);
  
  // 화면 크기 변경 감지 hook
  useEffect(() => {
    const checkScreenSize = () => {
      setIsWideScreen(window.innerWidth >= 1400); // 1400px 이상인 경우 넓은 화면으로 간주
    };
    
    // 초기 로드 시 화면 크기 확인
    checkScreenSize();
    
    // 창 크기 변경 시 이벤트 리스너 등록
    window.addEventListener('resize', checkScreenSize);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('주소가 복사되었습니다!');
    } catch {
      toast.error('복사 실패');
    }
  };

  // selection mode state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<ICustomerInfo[]>([]);

  // 선택된 고객 정보 토글 함수
  const toggleSelectCustomer = (customer: ICustomerInfo) => {
    if (selectedCustomers.some(c => c.id === customer.id)) {
      setSelectedCustomers(selectedCustomers.filter(c => c.id !== customer.id));
    } else {
      setSelectedCustomers([...selectedCustomers, customer]);
    }
  };

  // 모든 고객 정보 선택/해제 함수
  const toggleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers([...customers]);
    }
  };

  // 즐겨찾기 상태 토글 API 호출
  const handleToggleFavorite = async (contactId: number, current: boolean): Promise<void> => {
    try {
      await apiClient.patch(`/api/customer/contacts/${contactId}/favorite`, { favorite: !current });
      toast.success('즐겨찾기 상태가 변경되었습니다.');
      onRefresh();
    } catch {
      toast.error('즐겨찾기 업데이트 실패.');
    }
  };
  // 블랙리스트 상태 토글 API 호출
  const handleToggleBlacklist = async (contactId: number, current: boolean): Promise<void> => {
    try {
      await apiClient.patch(`/api/customer/contacts/${contactId}/blacklist`, { blacklist: !current });
      toast.success('블랙리스트 상태가 변경되었습니다.');
      onRefresh();
    } catch {
      toast.error('블랙리스트 업데이트 실패.');
    }
  };
  // 친구추가 API 호출 (회사명 전달)
  const handleAddFriend = async (companyName: string, contact: IContactInfo): Promise<void> => {
    try {
      await apiClient.post('/api/kakao/add-friends', { friends: [{ company_name: companyName, contact_person: contact.contact_person || '', phone: contact.phone_number || '' }] });
      toast.success('친구 추가 요청이 완료되었습니다.');
      onRefresh();
    } catch {
      toast.error('친구 추가 실패.');
    }
  };

  // apply filters from props
  let filteredCustomers = parsingFilters.length > 0
    ? customers.filter(customer => customer.source_filter && parsingFilters.includes(customer.source_filter))
    : customers;
  if (showFavoritesOnly) {
    filteredCustomers = filteredCustomers.filter(c => c.contacts?.some(ct => ct.favorite));
  }
  if (excludeBlacklist) {
    filteredCustomers = filteredCustomers.filter(c => c.contacts?.every(ct => !ct.blacklist));
  }

  // 영업하기 버튼 클릭 시: 친구추가 상태 확인 후 일괄 메시지 전송
  const handleSendMarketingData = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('체크된 고객이 없습니다. 체크를 해주세요.');
      return;
    }
    // 템플릿 유효성 검사
    if (!templates) { // templates undefined 체크 추가
      toast.error('템플릿 목록을 불러올 수 없습니다.');
      return;
    }
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    if (!selectedTemplate) {
      toast.error('발송할 템플릿을 선택해주세요.');
      return;
    }
    // 만약 items가 undefined이고 id만 있는 경우, 상세 조회
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
    const firstContent = items[0].content;
    const templateContent = Array.isArray(firstContent) ? firstContent.join(' ') : firstContent || '';
    if (!templateContent.trim()) {
      toast.error('템플릿 메시지 내용이 비어 있습니다. 내용을 입력해주세요.');
      return;
    }
    try {
      // 1. 선택된 고객의 모든 연락처 추출 및 회사명 매핑
      const allContactsWithCompany: ContactWithCompany[] = selectedCustomers.flatMap(c =>
        (c.contacts || []).map((ct): ContactWithCompany => ({
          ...ct,
          company_name: c.company_name
        }))
      );
      // 친구추가 실패 연락처는 제외하고 진행
      const failedContacts = allContactsWithCompany.filter(ct => ct.friend_add_status === 'fail');
      let contactsToProcess = allContactsWithCompany;
      if (failedContacts.length > 0) {
        toast.warning(`${failedContacts.length}개의 친구추가 실패 연락처를 제외하고 영업을 진행합니다.`);
        contactsToProcess = allContactsWithCompany.filter(ct => ct.friend_add_status !== 'fail');
      }
      // 2. 남은 연락처에 대해 친구추가가 필요한 경우 일괄 친구추가
      const notFriendContacts = contactsToProcess.filter(ct =>
        ct.friend_add_status !== 'success' && ct.friend_add_status !== 'already_registered'
      );
      if (notFriendContacts.length > 0) {
        const friendsToAdd = notFriendContacts.map(ct => ({
          company_name: ct.company_name || '', // 매핑된 company_name 사용
          contact_person: ct.contact_person || '', // null 처리
          phone: ct.phone_number || ''
        }));
        // 자동으로 친구추가 후 잠시 대기
        await apiClient.post('/api/kakao/add-friends', { friends: friendsToAdd });
        toast.success('자동으로 친구추가 완료. 메시지 전송을 시작합니다.');
        await new Promise(res => setTimeout(res, 2500));
      }
      // 3. 모든 선택된 연락처에 대해 템플릿 순서대로 메시지 그룹 생성 및 전송
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
      // 4. 메시지 전송
      await apiClient.post('/api/kakao/send', { message_groups });
      toast.success('영업 메시지 전송이 완료되었습니다.');
      cancelSelectionMode();
      onRefresh();
    } catch {
      toast.error('영업 요청 중 오류가 발생했습니다.');
    }
  };

  const handleBatchBlacklist = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('체크된 고객이 없습니다. 체크를 해주세요.');
      return;
    }
    try {
      const contactIds = selectedCustomers.flatMap(c => c.contacts?.map(ct => ct.id) || []);
      await Promise.all(
        contactIds.map(id => apiClient.patch(`/api/customer/contacts/${id}/blacklist`, { blacklist: true }))
      );
      toast.success('블랙리스트 추가가 완료되었습니다.');
      cancelSelectionMode();
      onRefresh();
    } catch {
      toast.error('블랙리스트 추가 중 오류가 발생했습니다.');
    }
  };

  const handleBatchFavorite = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('체크된 고객이 없습니다. 체크를 해주세요.');
      return;
    }
    try {
      const contactIds = selectedCustomers.flatMap(c => c.contacts?.map(ct => ct.id) || []);
      await Promise.all(
        contactIds.map(id => apiClient.patch(`/api/customer/contacts/${id}/favorite`, { favorite: true }))
      );
      toast.success('즐겨찾기 추가가 완료되었습니다.');
      cancelSelectionMode();
      onRefresh();
    } catch {
      toast.error('즐겨찾기 추가 중 오류가 발생했습니다.');
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
                <Button size="sm" onClick={() => {
                  if (selectedCustomers.length === 0) {
                    toast.error('체크된 고객이 없습니다. 체크를 해주세요.');
                    return;
                  }
                  const toAdd = selectedCustomers.flatMap(c =>
                    (c.contacts || []).map(ct => ({
                      company_name: c.company_name,
                      contact_person: ct.contact_person || '',
                      phone: ct.phone_number || ''
                    }))
                  );
                  apiClient.post('/api/kakao/add-friends', { friends: toAdd }).then(() => {
                    toast.success('친구추가 요청 완료');
                    cancelSelectionMode();
                    onRefresh();
                  });
                }} className="bg-blue-500 text-white">
                  친구추가하기
                </Button>
                <Button size="sm" onClick={handleBatchBlacklist} className="bg-red-500 text-white">
                  블랙리스트 추가
                </Button>
                <Button size="sm" onClick={handleBatchFavorite} className="bg-yellow-500 text-white">
                  즐겨찾기 추가
                </Button>

                <Button variant="outline" size="sm" onClick={cancelSelectionMode}>
                  취소
                </Button>
              </>
            )}
          </div>

        </div>
        {/* 테이블 및 페이지네이션 */}
        <div className="text-sm text-gray-500">
          총 {filteredCustomers.length}개의 고객 정보
        </div>
        <div className={isWideScreen ? "w-full" : "overflow-x-auto"}>
          <table className={`w-full table-auto bg-white text-xs ${!isWideScreen ? 'min-w-[1200px]' : ''}`}>
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-[0.65rem] h-10">
                {isSelectionMode && (
                  <th className="px-2 py-2 text-center border-b">
                    <input 
                      type="checkbox" 
                      checked={selectedCustomers.length === customers.length}
                      onChange={toggleSelectAll}
                      className="h-3 w-3"
                    />
                  </th>
                )}
                <th className="px-2 py-2 border-b w-10 text-center">No.</th>
                <th className="px-3 py-2 border-b w-32">업체명</th>
                <th className="px-3 py-2 border-b w-16 text-center">담당자명</th>
                <th className="px-3 py-2 border-b w-24 text-center">번호</th>
                <th className={`px-3 py-2 border-b ${isWideScreen ? 'w-36' : 'w-36'}`}>주소</th>
                <th className="px-3 py-2 border-b w-24">필터설정</th>
                <th className="px-3 py-2 border-b w-20">액션</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-[0.65rem]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={isSelectionMode ? 8 : 7} className="px-3 text-center border-b py-2">
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => {
                  const contacts = customer.contacts || [];
                  
                  return contacts.length > 0 ? (
                    contacts.map((contact, contactIndex) => {
                      return (
                      <tr
                        key={`${customer.id}-${contact.id}`}
                        className={contactIndex % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                      >
                        {isSelectionMode && contactIndex === 0 && (
                          <td className="px-2 text-center border-b py-2" rowSpan={contacts.length}>
                            <input 
                              type="checkbox"
                              checked={selectedCustomers.some(c => c.id === customer.id)}
                              onChange={() => toggleSelectCustomer(customer)}
                              className="h-3 w-3"
                            />
                          </td>
                        )}
                        {contactIndex === 0 && (
                          <>
                            <td className="px-2 border-b py-2 text-center" rowSpan={contacts.length}>
                              {(currentPage - 1) * pageSize + index + 1}
                            </td>
                            <td className="px-3 border-b py-2" rowSpan={contacts.length}>
                              {customer.company_name}
                            </td>
                          </>
                        )}
                        <td className="px-3 border-b py-2 text-center">
                          {contact.contact_person ? (
                            <div className="relative group w-max mx-auto">
                              <span className="cursor-pointer underline text-black">
                                {contact.contact_person}
                              </span>
                              {/* 호버 시에만 업체명-담당자명 조합 툴팁 표시 (주소 툴팁과 동일한 디자인) */}
                              <div className="absolute bottom-full left-0 mb-0 hidden group-hover:block hover:block bg-white border rounded shadow-lg p-2 min-w-[200px] max-w-xs whitespace-nowrap z-10 flex items-center justify-between gap-2">
                                <span className="break-all text-gray-800">{makeKakaoFriendName(customer.company_name, contact.contact_person ?? undefined)}</span>
                                <button
                                  className="ml-2 p-1 hover:bg-gray-100 rounded"
                                  onClick={() => copyToClipboard(makeKakaoFriendName(customer.company_name, contact.contact_person ?? undefined))}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2z" /></svg>
                                </button>
                              </div>
                            </div>
                          ) : ('-')}
                        </td>
                        <td className="px-3 border-b py-2 text-center">
                          <span className="inline-block w-full">{contact.phone_number || '-'}</span>
                        </td>
                        {contactIndex === 0 && (
                          <>
                            <td className="px-3 border-b py-2" rowSpan={contacts.length}>
                              <div className="relative group">
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
                                  className="text-blue-500 hover:underline block text-[0.6rem]"
                                >
                                  네이버 플레이스
                                </a>
                              )}
                            </td>
                            <td className="px-3 border-b py-2 truncate" rowSpan={contacts.length}>
                              <span className="inline-block w-full truncate">{customer.source_filter || '-'}</span>
                            </td>
                            <td className="px-3 border-b py-2 text-center" rowSpan={contacts.length}>
                              <div className="flex flex-row items-center gap-1 justify-center">
                                <button
                                  className="p-1 h-5 w-5 flex items-center justify-center"
                                  onClick={() => handleDeleteCustomer(customer)}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </button>
                                <div className="relative inline-flex flex-col-reverse items-center group">
                                  <button
                                    className={`p-1 h-5 w-5 flex items-center justify-center rounded-full transition-colors
                                      ${contact.favorite ? 'bg-yellow-100' : ''}`}
                                    onClick={() => handleToggleFavorite(contact.id, contact.favorite ?? false)}
                                  >
                                    <Star className={`${contact.favorite ? 'fill-current text-yellow-400' : 'text-gray-400'} h-3 w-3`} />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-xs text-gray-800 border rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
                                    {contact.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                                  </div>
                                </div>
                                <div className="relative inline-flex flex-col-reverse items-center group">
                                  <button
                                    className={`p-1 h-5 w-5 flex items-center justify-center rounded-full transition-colors
                                      ${contact.blacklist ? 'bg-red-100' : ''}`}
                                  onClick={() => handleToggleBlacklist(contact.id, contact.blacklist ?? false)}
                                  >
                                    <Ban className={`${contact.blacklist ? 'text-red-500' : 'text-gray-400'} h-3 w-3`} />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-xs text-gray-800 border rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
                                    {contact.blacklist ? '블랙리스트 해제' : '블랙리스트 추가'}
                                  </div>
                                </div>
                                <div className="relative inline-flex flex-col-reverse items-center group">
                                  <button
                                    className={`p-1 h-5 w-5 flex items-center justify-center rounded-full transition-colors
                                      ${contact.friend_add_status === 'success' || contact.friend_add_status === 'already_registered' ? 'bg-green-100'
                                      : contact.friend_add_status === 'fail' ? 'bg-red-100'
                                      : ''}`}
                                    onClick={() => contact.friend_add_status === 'pending' && handleAddFriend(customer.company_name, contact)}
                                  >
                                    {contact.friend_add_status === 'success' || contact.friend_add_status === 'already_registered' ? (
                                      <UserCheck className="text-green-500 h-3 w-3" />
                                    ) : contact.friend_add_status === 'fail' ? (
                                      <UserX className="text-red-500 h-3 w-3" />
                                    ) : (
                                      <UserPlus className="text-gray-400 h-3 w-3" />
                                    )}
                                  </button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-xs text-gray-800 border rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
                                    {contact.friend_add_status === 'success' ? '친구입니다!'
                                      : contact.friend_add_status === 'already_registered' ? '친구입니다!'
                                      : contact.friend_add_status === 'fail' ? '친구추가가 거부되었습니다!'
                                      : '친구추가하기'}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                      );
                    })
                  ) : (
                    <tr key={customer.id} className="bg-white hover:bg-gray-100">
                      {isSelectionMode && (
                        <td className="px-2 text-center border-b py-2">
                          <input 
                            type="checkbox"
                            checked={selectedCustomers.some(c => c.id === customer.id)}
                            onChange={() => toggleSelectCustomer(customer)}
                            className="h-3 w-3"
                          />
                        </td>
                      )}
                      <td className="px-2 border-b py-2 text-center">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-3 border-b py-2">{customer.company_name}</td>
                      <td className="px-3 border-b py-2 text-center">-</td>
                      <td className="px-3 border-b py-2 text-center">-</td>
                      <td className="px-3 border-b py-2">
                        <div className="relative group">
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
                            className="text-blue-500 hover:underline block text-[0.6rem]"
                          >
                            네이버 플레이스
                          </a>
                        )}
                      </td>
                      <td className="px-3 border-b py-2 truncate">
                        <span className="inline-block w-full truncate">{customer.source_filter || '-'}</span>
                      </td>
                      <td className="px-3 border-b py-2 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleDeleteCustomer(customer)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* 하단 페이지네이션 제거: infinite scroll 사용 */}
    </div>
  );
}