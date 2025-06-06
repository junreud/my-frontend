"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner";
import { io } from 'socket.io-client';
import apiClient from '@/lib/apiClient';

interface Notification {
  id: number;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export function NotificationsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  // Backend base URL for API and Socket.IO
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:4000';
  // Get accessToken for socket auth
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  React.useEffect(() => {
    if (!open) return;
    apiClient.get('/api/notifications')
      .then(res => setNotifications(res.data as Notification[]))
      .catch(err => {
        if (err.response?.status === 401) window.location.href = '/login';
        else console.error('Load notifications failed:', err);
      });
  }, [open]);

  // 실시간 알림 수신
  React.useEffect(() => {
    // connect to backend Socket.IO server with token auth
    const socket = io(API_BASE, {
      path: '/socket.io',
      auth: { token },
      withCredentials: true,
    });
    socket.on('notification', (n: Notification) => {
      setNotifications(prev => [n, ...prev]);
      toast.success(n.message);
    });
    return () => { socket.disconnect(); };
  }, [API_BASE, token]);

  const markAllRead = async () => {
    await Promise.all(
      notifications.filter(n => !n.isRead).map(n =>
        apiClient.patch(`/api/notifications/${n.id}/read`)
          .catch(error => console.error('Mark read error:', error))
      )
    );
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  // 개별 알림 삭제
  const deleteOne = async (id: number) => {
    try {
      await apiClient.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error(`Delete notification ${id} failed`, error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle>알림</DialogTitle>
          <DialogDescription className="sr-only">알림 목록을 표시합니다.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(n => (
              <div key={n.id} className={`p-2 rounded ${n.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}>  
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-800">{n.message}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <button onClick={() => deleteOne(n.id)} className="text-xs text-red-500 ml-2">삭제</button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">새로운 알림이 없습니다.</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={markAllRead}>모두 읽음</Button>
          <DialogClose asChild>
            <Button>닫기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
