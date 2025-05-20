"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import { useUserBusinesses } from '@/hooks/useUserBusinesses';
import { useQueries } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { ApiKeywordResponse, Business } from '@/types';

interface MyShopsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MyShopsModal({ open, onClose }: MyShopsModalProps) {
  const { data: user } = useUser();
  const { businesses = [], isLoading: loadingBusinesses } = useUserBusinesses(String(user?.id));
  const [isDirty, setIsDirty] = useState(false);
  const [localKeywords, setLocalKeywords] = useState<Record<string, string[]>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // fetch keywords for each business in parallel
  const keywordQueries = useQueries({
    queries: businesses.map((b: Business) => ({
      queryKey: ['userKeywords', String(user?.id), String(b.place_id)],
      queryFn: async () => {
        const res = await apiClient.get<ApiKeywordResponse[]>(
          `/api/user-keywords?userId=${user?.id}&placeId=${b.place_id}`
        );
        return res.data.map((item) => item.keyword);
      },
      enabled: !!user?.id,
    })),
  });

  // initialize local keywords once keyword queries are loaded
  useEffect(() => {
    if (Object.keys(localKeywords).length > 0) return;
    if (
      businesses.length > 0 &&
      keywordQueries.length === businesses.length &&
      keywordQueries.every((q) => !q.isLoading && q.data !== undefined)
    ) {
      const init: Record<string, string[]> = {};
      businesses.forEach((b: Business, idx: number) => {
        const data = keywordQueries[idx].data as string[] | undefined;
        init[String(b.place_id)] = data || [];
      });
      setLocalKeywords(init);
    }
  }, [businesses, keywordQueries, localKeywords]);

  // handle close with unsaved warning
  const handleClose = () => {
    if (isDirty && !confirm('변경사항이 저장되지 않았습니다. 정말 닫으시겠습니까?')) {
      return;
    }
    onClose();
  };

  // save all changes
  const handleSave = async () => {
    try {
      for (const placeId of Object.keys(localKeywords)) {
        await apiClient.post('/keyword/save-selected', {
          placeId,
          keywords: localKeywords[placeId],
        });
      }
      setIsDirty(false);
      alert('변경사항이 저장되었습니다.');
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // State for expanded business cards
  const [expandedBusinessId, setExpandedBusinessId] = useState<string | null>(null);
  const toggleExpand = (businessId: string) => {
    setExpandedBusinessId(expandedBusinessId === businessId ? null : businessId);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ 
      zIndex: 999,
      backgroundColor: 'rgba(0, 0, 0, 0)',
      backdropFilter: 'none',
    }}>
      <div className="fixed inset-0 bg-black bg-opacity-50" style={{
        zIndex: -1,
      }}></div>
      <div className="bg-white w-full max-w-4xl rounded shadow-lg mx-auto my-10">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">내 업체 관리</h2>
          <button onClick={handleClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-6">
          {loadingBusinesses ? (
            <p>업체를 불러오는 중...</p>
          ) : businesses.length === 0 ? (
            <p>등록된 업체가 없습니다.</p>
          ) : (
            businesses.map((b: Business, idx: number) => {
              const businessId = String(b.place_id) || idx.toString();
              const isExpanded = expandedBusinessId === businessId;
              return (
                <div key={businessId} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold mb-0">{b.place_name}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">{b.category || '-'}</p>
                      <div className="mt-1 text-sm text-gray-600 flex gap-4">
                        <p>블로그: {b.blog_review_count ?? '0'}</p>
                        <p>영수증: {b.receipt_review_count ?? '0'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(businessId)}
                      >
                        {isExpanded ? '접기' : '더보기'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (confirm('이 업체를 정말 삭제하시겠습니까?')) {
                            await apiClient.delete('/api/place', { data: { userId: user?.id, placeId: b.place_id } });
                            window.location.reload();
                          }
                        }}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                  {/* expand/collapse animation */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="mt-3 pt-3 border-t">
                      <div className="font-medium mb-1">연결된 키워드:</div>
                      <ul className="space-y-1 mb-3">
                        {(localKeywords[String(b.place_id)] || []).map((kw, i) => (
                          <li key={i} className="flex items-center justify-between">
                            <span>{kw}</span>
                            <div className="space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const arr = [...(localKeywords[String(b.place_id)] || [])];
                                  arr.splice(i, 1);
                                  setLocalKeywords({ ...localKeywords, [String(b.place_id)]: arr });
                                  setIsDirty(true);
                                }}
                              >삭제</Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newKw = prompt('새 키워드를 입력하세요', kw);
                                  if (newKw && newKw.trim()) {
                                    const arr = [...(localKeywords[String(b.place_id)] || [])];
                                    arr[i] = newKw.trim();
                                    setLocalKeywords({ ...localKeywords, [String(b.place_id)]: arr });
                                    setIsDirty(true);
                                  }
                                }}
                              >변경</Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-end space-x-2 mt-2">
                        <Input
                          placeholder="키워드 추가"
                          className="w-[200px]"
                          ref={el => { if (el) inputRefs.current[String(b.place_id)] = el; }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                const arr = [...(localKeywords[String(b.place_id)] || [])];
                                arr.push(val);
                                setLocalKeywords({ ...localKeywords, [String(b.place_id)]: arr });
                                e.currentTarget.value = '';
                                setIsDirty(true);
                              }
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const inp = inputRefs.current[String(b.place_id)];
                            if (inp?.value.trim()) {
                              const arr = [...(localKeywords[String(b.place_id)] || [])];
                              arr.push(inp.value.trim());
                              setLocalKeywords({ ...localKeywords, [String(b.place_id)]: arr });
                              inp.value = '';
                              setIsDirty(true);
                            }
                          }}
                        >추가</Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="border-t px-6 py-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>취소</Button>
          <Button onClick={handleSave} disabled={!isDirty}>저장</Button>
        </div>
      </div>
    </div>
  );
}
