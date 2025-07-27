"use client"

import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Heart, 
  ExternalLink, 
  Activity
} from 'lucide-react'
import { useUser } from '@/hooks/useUser'

export function DashboardFooter() {
  const { data: user } = useUser()
  const currentYear = new Date().getFullYear()
  const buildVersion = process.env.NEXT_PUBLIC_APP_VERSION || 'v1.0.0'

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="px-6 py-3">
        {/* 간단한 한 줄 푸터 */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          {/* 왼쪽: 저작권 */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>© {currentYear} 마케팅 키워드 시스템.</span>
            <span className="hidden sm:inline">Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-current hidden sm:block" />
            <span className="hidden sm:inline">in Seoul</span>
          </div>
          
          {/* 가운데: 빠른 링크 (모바일에서는 숨김) */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700">
              <ExternalLink className="h-3 w-3 mr-1" />
              지원센터
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700">
              개인정보처리방침
            </Button>
          </div>
          
          {/* 오른쪽: 상태 및 버전 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Activity className="h-3 w-3 text-green-500" />
              <span className="hidden sm:inline">서비스 정상</span>
            </div>
            <Badge variant="outline" className="h-5 px-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
              {buildVersion}
            </Badge>
          </div>
        </div>

        {/* 개발 환경에서만 표시되는 미니 디버그 바 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded text-center">
            개발 모드 | API: {process.env.NEXT_PUBLIC_API_URL || 'localhost'} | 로그인: {user?.email || '없음'}
          </div>
        )}
      </div>
    </footer>
  )
}
