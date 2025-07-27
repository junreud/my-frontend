"use client";

import React, { useState, ChangeEvent } from "react";
import { API_BASE_URL } from '@/lib/config';
import { toast } from "@/components/ui/sonner";

interface BugReportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BugReportModal({ open, onClose }: BugReportModalProps) {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  if (!open) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setScreenshot(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("category", category);
    formData.append("title", title);
    formData.append("description", description);
    if (screenshot) formData.append("screenshot", screenshot);
    formData.append("contactPhone", contactPhone);
    formData.append("contactEmail", contactEmail);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bug-report`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        toast.success('버그 신고가 접수되었습니다.');
        onClose();
      } else {
        toast.error('전송 실패. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error(err);
      toast.error('오류 발생. 다시 시도해주세요.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-4">버그 신고</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">버그 유형</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
              className="w-full border rounded px-2 py-1"
            >
              <option value="">선택해주세요</option>
              <option value="UI 버그">UI 버그</option>
              <option value="기능 버그">기능 버그</option>
              <option value="성능 문제">성능 문제</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">내용</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">스크린샷</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">연락처 (전화번호)</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">취소</button>
            <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">제출</button>
          </div>
        </form>
      </div>
    </div>
  );
}
