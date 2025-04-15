'use client';

import { Button } from '@/components/ui/button';
import { ICustomerInfo } from '@/types/index';
import { Edit, RefreshCw, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from "sonner";

interface CustomerTableProps {
  customers: ICustomerInfo[];
  totalCustomers: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onRefresh: () => void;
}

export default function CustomerTable({
  customers,
  totalCustomers,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRefresh
}: CustomerTableProps) {
  // 고객 정보 편집 핸들러
  const handleEditCustomer = (customer: ICustomerInfo) => {
    toast("편집 모드", {
      description: `${customer.company_name} 정보 편집을 시작합니다.`,
    });
  };

  // 고객 정보 삭제 핸들러
  const handleDeleteCustomer = (customer: ICustomerInfo) => {
    toast.error("삭제 확인", {
      description: `${customer.company_name}를 삭제하시겠습니까?`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          총 {totalCustomers}개의 고객 정보 ({currentPage} / {totalPages} 페이지)
        </div>
        
        <div className="flex items-center space-x-2">
          <select 
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="10">10개씩 보기</option>
            <option value="25">25개씩 보기</option>
            <option value="50">50개씩 보기</option>
            <option value="100">100개씩 보기</option>
          </select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            새로고침
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th colSpan={4} className="py-3 px-6 text-left border-b">고객 정보</th>
              <th colSpan={2} className="py-3 px-6 text-left border-b">연락처 정보</th>
              <th className="py-3 px-6 text-center border-b">관리</th>
            </tr>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="py-3 px-6 text-left border-b">공고 ID</th>
              <th className="py-3 px-6 text-left border-b">제목</th>
              <th className="py-3 px-6 text-left border-b">업체명</th>
              <th className="py-3 px-6 text-left border-b">주소</th>
              <th className="py-3 px-6 text-left border-b">전화번호</th>
              <th className="py-3 px-6 text-left border-b">담당자명</th>
              <th className="py-3 px-6 text-center border-b">액션</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-3 px-6 text-center border-b">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const contacts = customer.contacts || [];
                return contacts.length > 0 ? (
                  contacts.map((contact, contactIndex) => (
                    <tr
                      key={`${customer.id}-${contact.id}`}
                      className={contactIndex % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                    >
                      {contactIndex === 0 && (
                        <>
                          <td className="py-3 px-6 border-b" rowSpan={contacts.length}>
                            {customer.posting_id}
                          </td>
                          <td className="py-3 px-6 border-b" rowSpan={contacts.length}>
                            {customer.title}
                          </td>
                          <td className="py-3 px-6 border-b" rowSpan={contacts.length}>
                            {customer.company_name}
                          </td>
                          <td className="py-3 px-6 border-b" rowSpan={contacts.length}>
                            <div>{customer.address || '-'}</div>
                            {customer.naverplace_url && (
                              <a
                                href={customer.naverplace_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                네이버 플레이스
                              </a>
                            )}
                          </td>
                        </>
                      )}
                      <td className="py-3 px-6 border-b">{contact.phone_number || '-'}</td>
                      <td className="py-3 px-6 border-b">{contact.contact_person || '-'}</td>
                      {contactIndex === 0 && (
                        <td className="py-3 px-6 border-b text-center" rowSpan={contacts.length}>
                          <div className="flex justify-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteCustomer(customer)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr key={customer.id} className="bg-white hover:bg-gray-100">
                    <td className="py-3 px-6 border-b">{customer.posting_id}</td>
                    <td className="py-3 px-6 border-b">{customer.title}</td>
                    <td className="py-3 px-6 border-b">{customer.company_name}</td>
                    <td className="py-3 px-6 border-b">
                      <div>{customer.address || '-'}</div>
                      {customer.naverplace_url && (
                        <a
                          href={customer.naverplace_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          네이버 플레이스
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-6 border-b">-</td>
                    <td className="py-3 px-6 border-b">-</td>
                    <td className="py-3 px-6 border-b text-center">
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteCustomer(customer)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          페이지당 {pageSize}개, 총 {totalCustomers}개
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNumber;
              
              // 페이지 번호 계산 로직
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={i}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  className="min-w-[2rem]"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
