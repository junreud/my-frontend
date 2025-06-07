"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useUserBusinesses } from '@/hooks/useUserBusinesses';
import { useQueries } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { ApiKeywordResponse, Business } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface MyShopsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MyShopsModal({ open, onClose }: MyShopsModalProps) {
  const { data: user } = useUser();
  const { businesses = [] } = useUserBusinesses(String(user?.id));
  const [localKeywords, setLocalKeywords] = useState<Record<string, string[]>>({});

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

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="bg-white sm:max-w-md" // Adjust styling as needed
        aria-describedby="my-shops-modal-description"
      >
        <DialogHeader>
          <DialogTitle>내 업체 목록</DialogTitle>
          <DialogDescription id="my-shops-modal-description" className="sr-only">
            등록된 내 업체 목록을 확인하고 관리합니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {businesses.length > 0 ? (
            <ul className="space-y-2">
              {businesses.map(b => (
                <li key={b.place_id} className="p-2 border rounded">
                  {b.place_name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">등록된 업체가 없습니다.</p>
          )}
          {/* Add more shop management UI here */}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">닫기</Button>
          </DialogClose>
          {/* You might want an "Add Shop" button or similar here */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
