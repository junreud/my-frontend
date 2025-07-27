"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner";
import { io } from 'socket.io-client';
import apiClient from '@/lib/apiClient';
import { API_BASE_URL } from '@/lib/config';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export default function NotificationsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  // Backend base URL for API and Socket.IO
  const API_BASE = API_BASE_URL;
  // Get accessToken for socket auth
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  React.useEffect(() => {
    if (!open) return;
    apiClient.get('/api/notifications')
      .then(res => setNotifications(res.data as Notification[]))
      .catch(err => {
        console.error('Failed to fetch notifications:', err);
        toast.error('알림을 불러오는데 실패했습니다.');
      });
  }, [open]);

  React.useEffect(() => {
    if (!open || !token) return;

    const socket = io(API_BASE, {
      auth: { token },
      transports: ['websocket'],
      rejectUnauthorized: false
    });

    socket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      // 알림 표시
      console.log('새 알림:', notification.title);
    });

    return () => {
      socket.disconnect();
    };
  }, [open, token, API_BASE]);

  const markAsRead = (id: number) => {
    apiClient.patch(`/api/notifications/${id}/read`)
      .then(() => {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
      })
      .catch(error => console.error('Mark read error:', error))
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-blue-600'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>알림</DialogTitle>
          <DialogDescription>
            최근 알림을 확인하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              새로운 알림이 없습니다.
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${getTypeColor(notification.type)}`}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs"
                    >
                      읽음
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">닫기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
