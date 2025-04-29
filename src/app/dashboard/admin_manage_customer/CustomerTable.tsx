'use client';

import { Button } from '@/components/ui/button';
import { ICustomerInfo, IContactInfo } from '@/types/index';
import { Trash2, Copy, Star, Ban, UserPlus, UserCheck, UserX } from 'lucide-react';
import { toast } from "sonner";
import { useState, useEffect, useRef } from 'react';
import apiClient from '@/lib/apiClient'; // apiClient 추가

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
  items?: TemplateItem[];
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
  // infinite scroll 관련 ref
  const containerRef = useRef<HTMLDivElement>(null);
  // displayCount state 이미 선언됨

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
  // 필터링된 데이터가 바뀔 때 displayCount 초기화
  useEffect(() => {
    setDisplayCount(50);
  }, [filteredCustomers]);
  // infinite scroll: displayCount 증가 useEffect, filteredCustomers 이후에 위치
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      if (container.scrollHeight - container.scrollTop <= container.clientHeight + 50) {
        setDisplayCount(prev => Math.min(prev + 50, filteredCustomers.length));
      }
    };
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [filteredCustomers]);

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
    if (!templateWithItems.items || templateWithItems.items.length === 0) {
      toast.error('선택한 템플릿에 내용이 없습니다. 템플릿 내용을 입력해주세요.');
      return;
    }
    // 템플릿 메시지 내용 추출 (여기서는 첫 번째 아이템만 사용, 필요시 반복문/다중메시지로 확장)
    const templateContent = templateWithItems.items[0]?.content || '';
    if (!templateContent.trim()) {
      toast.error('템플릿 메시지 내용이 비어 있습니다. 내용을 입력해주세요.');
      return;
    }
    try {
      // 1. 선택된 고객의 모든 연락처 추출 및 회사명 매핑
      const allContactsWithCompany = selectedCustomers.flatMap(c =>
        (c.contacts || []).map(ct => ({ ...ct, company_name: c.company_name })) // 각 연락처에 회사명 추가
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
        username: makeKakaoFriendName(ct.company_name, ct.contact_person ?? undefined), // 매핑된 company_name, null 처리
        messages: templateWithItems.items.map((item: TemplateItem) => ({ // item 타입 명시
          type: item.type,
          content: item.type === 'image'
            ? item.content // TemplateModal에서 저장된 상대 경로 배열/문자열 그대로 사용
            : typeof item.content === 'string' ? item.content.replace(/\{name\}/g, ct.contact_person || '') : '' // 텍스트일 때만 치환, 문자열 아니면 빈 문자열
        }))
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

  // infinite scroll 상태: 처음 표시할 개수
  const [displayCount, setDisplayCount] = useState(50);

  // 필터된 고객 중 스크롤에 따라 보여줄 목록
  const rows = filteredCustomers.slice(0, displayCount);

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
                  const toAdd = selectedCustomers.flatMap(c => c.contacts ?? []).map(ct => ({ company_name: ct.company_name || '', contact_person: ct.contact_person || '', phone: ct.phone_number || '' }));
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
        <div
          className="overflow-y-auto overflow-x-auto shadow-md rounded-lg text-xs"
          style={{ maxHeight: '75vh' }}
          ref={containerRef}
        >
          <table className="w-full table-auto bg-white text-xs min-w-[1200px]">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-[0.65rem] h-12">
                {isSelectionMode && (
                  <th className="px-3 py-3 text-center border-b">
                    <input 
                      type="checkbox" 
                      checked={selectedCustomers.length === customers.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4"
                    />
                  </th>
                )}
                <th className="px-4 py-3 border-b">No.</th>
                <th className="px-6 py-3 border-b">업체명</th>
                <th className="px-6 py-3 border-b">담당자명</th>
                <th className="px-6 py-3 border-b">번호</th>
                <th className="px-6 py-3 border-b w-36">주소</th>
                <th className="px-6 py-3 border-b w-48">필터설정</th>
                <th className="px-6 py-3 border-b">&nbsp;</th>
                {/* 액션 버튼 컬럼: 삭제, 즐겨찾기, 블랙리스트, 친구추가 버튼 */}
              </tr>
            </thead>
            <tbody className="text-gray-600 text-[0.65rem]">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={isSelectionMode ? 11 : 10} className="px-6 text-center border-b">
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((customer, index) => {
                  const contacts = customer.contacts || [];
                  
                  return contacts.length > 0 ? (
                    contacts.map((contact, contactIndex) => {
                      return (
                      <tr
                        key={`${customer.id}-${contact.id}`}
                        className={contactIndex % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                      >
                        {isSelectionMode && contactIndex === 0 && (
                          <td className="px-3 text-center border-b" rowSpan={contacts.length}>
                            <input 
                              type="checkbox"
                              checked={selectedCustomers.some(c => c.id === customer.id)}
                              onChange={() => toggleSelectCustomer(customer)}
                              className="h-4 w-4"
                            />
                          </td>
                        )}
                        {contactIndex === 0 && (
                          <>
                            <td className="px-4 border-b" rowSpan={contacts.length}>
                              {(currentPage - 1) * pageSize + index + 1}
                            </td>
                            <td className="px-6 border-b" rowSpan={contacts.length}>
                              {customer.company_name}
                            </td>
                          </>
                        )}
                        <td className="px-6 border-b">
                          {contact.contact_person ? (
                            <div className="relative group w-max">
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
                        <td className="px-6 border-b">{contact.phone_number || '-'}</td>
                        {contactIndex === 0 && (
                          <>
                            <td className="px-6 border-b" rowSpan={contacts.length}>
                              <div className="relative group">
                                <span className="block overflow-hidden whitespace-nowrap text-ellipsis w-full">{customer.address || '-'}</span>
                                {customer.address && (
                                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-white text-xs text-gray-800 border rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
                                    <span className="break-all">{customer.address}</span>
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
                                  className="text-blue-500 hover:underline block mt-1"
                                >
                                  네이버 플레이스
                                </a>
                              )}
                            </td>
                            <td className="px-6 border-b" rowSpan={contacts.length}>
                              {/* 필터설정 값 - source_filter 컬럼 사용 */}
                              {customer.source_filter || '-'}
                            </td>
                            <td className="px-6 border-b text-center" rowSpan={contacts.length}>
                              <div className="flex flex-row items-center gap-1">
                                <button
                                  className="p-1 h-6 w-6 flex items-center justify-center"
                                  onClick={() => handleDeleteCustomer(customer)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                                <div className="relative inline-flex flex-col-reverse items-center group">
                                  <button
                                    className={`p-1 h-6 w-6 flex items-center justify-center rounded-full transition-colors
                                      ${contact.favorite ? 'bg-yellow-100' : ''}`}
                                    onClick={() => handleToggleFavorite(contact.id, contact.favorite ?? false)}
                                  >
                                    <Star className={`${contact.favorite ? 'fill-current text-yellow-400' : 'text-gray-400'} h-4 w-4`} />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-xs text-gray-800 border rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
                                    {contact.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                                  </div>
                                </div>
                                <div className="relative inline-flex flex-col-reverse items-center group">
                                  <button
                                    className={`p-1 h-6 w-6 flex items-center justify-center rounded-full transition-colors
                                      ${contact.blacklist ? 'bg-red-100' : ''}`}
                                    onClick={() => handleToggleBlacklist(contact.id, contact.blacklist ?? false)}
                                  >
                                    <Ban className={`${contact.blacklist ? 'text-red-500' : 'text-gray-400'} h-4 w-4`} />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-xs text-gray-800 border rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
                                    {contact.blacklist ? '블랙리스트 해제' : '블랙리스트 추가'}
                                  </div>
                                </div>
                                <div className="relative inline-flex flex-col-reverse items-center group">
                                  <button
                                    className={`p-1 h-6 w-6 flex items-center justify-center rounded-full transition-colors
                                      ${contact.friend_add_status === 'success' || contact.friend_add_status === 'already_registered' ? 'bg-green-100'
                                      : contact.friend_add_status === 'fail' ? 'bg-red-100'
                                      : ''}`}
                                    onClick={() => contact.friend_add_status === 'pending' && handleAddFriend(customer.company_name, contact)}
                                  >
                                    {contact.friend_add_status === 'success' || contact.friend_add_status === 'already_registered' ? (
                                      <UserCheck className="text-green-500 h-4 w-4" />
                                    ) : contact.friend_add_status === 'fail' ? (
                                      <UserX className="text-red-500 h-4 w-4" />
                                    ) : (
                                      <UserPlus className="text-gray-400 h-4 w-4" />
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
                        <td className="px-3 text-center border-b">
                          <input 
                            type="checkbox"
                            checked={selectedCustomers.some(c => c.id === customer.id)}
                            onChange={() => toggleSelectCustomer(customer)}
                            className="h-4 w-4"
                          />
                        </td>
                      )}
                      <td className="px-4 border-b">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-6 border-b">{customer.company_name}</td>
                      <td className="px-6 border-b">-</td>
                      <td className="px-6 border-b">-</td>
                      <td className="px-6 border-b">
                        <div className="relative group">
                          <span className="block overflow-hidden whitespace-nowrap text-ellipsis w-full">{customer.address || '-'}</span>
                          {customer.address && (
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-white text-xs text-gray-800 border rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
                              <span className="break-all">{customer.address}</span>
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
                            className="text-blue-500 hover:underline block mt-1"
                          >
                            네이버 플레이스
                          </a>
                        )}
                      </td>
                      <td className="px-6 border-b">
                        {/* 필터설정 값 - source_filter 컬럼 사용 */}
                        {customer.source_filter || '-'}
                      </td>
                      <td className="px-6 border-b text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteCustomer(customer)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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