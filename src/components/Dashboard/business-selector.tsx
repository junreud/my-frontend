"use client"

import React, { useState, useEffect } from 'react';
import { Bell, Cog } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { NotificationsModal } from "@/components/Dashboard/notifications-modal";
import { SettingsModal } from "@/components/Dashboard/settings-modal";
import { useUser } from "@/hooks/useUser";
import apiClient from '@/lib/apiClient';

export function BusinessSelector() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: user } = useUser();

  // 마운트 및 user 변경 시 unreadCount 조회
  useEffect(() => {
    if (!user) return;
    apiClient.get('/api/notifications', { params: { unread: true } })
      .then(res => {
        if (Array.isArray(res.data)) {
          setUnreadCount(res.data.length);
        }
      })
      .catch(error => console.error('Unread notifications fetch failed:', error));
  }, [user]);

  return (
    <div className="flex justify-between items-center p-2.5">
      <div className="text-sm font-medium">대시보드</div>
      <div className="flex gap-1.5">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            setIsNotificationsOpen(true);
            setUnreadCount(0);
          }}
          title="알림"
          className="h-7 w-7 rounded-full hover:bg-gray-200 relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-red-500 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSettingsOpen(true)}
          title="설정"
          className="h-7 w-7 rounded-full hover:bg-gray-200"
        >
          <Cog className="h-4 w-4" />
        </Button>
      </div>

      <NotificationsModal open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} />
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
