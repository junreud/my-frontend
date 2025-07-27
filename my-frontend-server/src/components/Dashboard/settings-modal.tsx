"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils"; 
import { toast } from "sonner";

// Import hooks for real data
import { useUserSettings } from "@/hooks/useUserSettings";
import { useBusinessManagement } from "@/hooks/useBusinessManagement";
import { useUser } from "@/hooks/useUser";

// Icons
import { Settings, Trash2, Globe, Monitor, Clock, Plus, Store, Bell } from "lucide-react";

export function SettingsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: user } = useUser();
  const { 
    settings, 
    isLoading: isLoadingSettings, 
    updateBasicSettings, 
    updateNotificationSettings, 
    updateMarketingSettings, 
    updateProfile, 
    isUpdating 
  } = useUserSettings();
  
  const { 
    businesses, 
    isLoading: isLoadingBusinesses, 
    addBusiness, 
    isAddingBusiness, 
    deleteBusiness, 
    isDeletingBusiness
  } = useBusinessManagement(user?.id);
  
  const [activeTab, setActiveTab] = React.useState("basic");
  const [animatedMaxHeight, setAnimatedMaxHeight] = React.useState<number | undefined>(undefined);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null); 
  const [showContentAfterResize, setShowContentAfterResize] = React.useState(false);

  // Local states for form inputs
  const [profileForm, setProfileForm] = React.useState({
    name: settings?.profile?.name || '',
    email: settings?.profile?.email || '',
    phone: settings?.profile?.phone || '',
    company: settings?.profile?.company || '',
  });

  const [newBusinessForm, setNewBusinessForm] = React.useState({
    place_name: '',
    place_id: '',
    category: '',
    address: '',
  });

  // Update form when settings change
  React.useEffect(() => {
    if (settings?.profile) {
      setProfileForm({
        name: settings.profile.name || '',
        email: settings.profile.email || '',
        phone: settings.profile.phone || '',
        company: settings.profile.company || '',
      });
    }
  }, [settings]);

  // Handle modal animations
  React.useEffect(() => {
    if (open) {
      window.requestAnimationFrame(() => {
        const contentEl = scrollContainerRef.current?.querySelector<HTMLElement>(`:scope > div[data-tab-value="${activeTab}"]`);
        const height = contentEl?.offsetHeight ?? 0;
        setAnimatedMaxHeight(height);
        setShowContentAfterResize(true);
      });
    } else {
      setAnimatedMaxHeight(0);
      setShowContentAfterResize(false);
      scrollContainerRef.current?.scrollTo(0, 0);
    }
  }, [open, activeTab]);

  React.useEffect(() => {
    let resizeTimeout: number;
    let fadeTimeout: number;
    setShowContentAfterResize(false);
    if (!open) {
      setAnimatedMaxHeight(0);
      scrollContainerRef.current?.scrollTo(0, 0);
    } else {
      window.requestAnimationFrame(() => {
        const panel = scrollContainerRef.current?.querySelector<HTMLElement>(`:scope > div[data-tab-value="${activeTab}"]`);
        const newHeight = panel?.offsetHeight ?? 0;
        resizeTimeout = window.setTimeout(() => {
          setAnimatedMaxHeight(newHeight);
          fadeTimeout = window.setTimeout(() => {
            setShowContentAfterResize(true);
          }, 200);
        }, 0);
      });
    }
    return () => {
      clearTimeout(resizeTimeout);
      clearTimeout(fadeTimeout);
    };
  }, [open, activeTab]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileForm);
      toast.success("프로필이 저장되었습니다.");
    } catch (error) {
      console.error("프로필 저장 오류:", error);
      toast.error("프로필 저장에 실패했습니다.");
    }
  };

  const handleAddBusiness = async () => {
    if (!newBusinessForm.place_name || !newBusinessForm.place_id) {
      toast.error("업체명과 플레이스 ID는 필수입니다.");
      return;
    }

    try {
      await addBusiness(newBusinessForm);
      setNewBusinessForm({ place_name: '', place_id: '', category: '', address: '' });
      toast.success("업체가 추가되었습니다.");
    } catch (error) {
      console.error("업체 추가 오류:", error);
      toast.error("업체 추가에 실패했습니다.");
    }
  };

  const handleDeleteBusiness = async (businessId: number, businessName: string) => {
    if (window.confirm(`"${businessName}" 업체를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      try {
        await deleteBusiness(businessId);
        toast.success("업체가 삭제되었습니다.");
      } catch (error) {
        console.error("업체 삭제 오류:", error);
        toast.error("업체 삭제에 실패했습니다.");
      }
    }
  };

  const tabTriggerClassName = "px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold text-slate-600 data-[state=inactive]:hover:bg-slate-200/70 data-[state=inactive]:hover:text-slate-800";

  if (isLoadingSettings) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white sm:max-w-3xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">설정을 불러오는 중...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-white sm:max-w-4xl flex flex-col overflow-hidden"
        style={{
          position: 'fixed',
          left: '50%',
          top: '10vh',
          transform: 'translate(-50%, 0)',
          maxHeight: 'calc(100vh - 10vh - 2rem)',
        }}
      >
        <DialogTitle className="flex-shrink-0 border-b pb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          설정
        </DialogTitle>
        <DialogDescription className="sr-only">
          계정 및 애플리케이션 설정을 관리합니다.
        </DialogDescription>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="flex flex-col pt-4 overflow-hidden" 
        >
          <TabsList className="flex-shrink-0 flex space-x-1 bg-slate-100 p-1 rounded-lg mb-4 overflow-x-auto">
            <TabsTrigger value="basic" className={tabTriggerClassName}>기본 설정</TabsTrigger>
            <TabsTrigger value="shops" className={tabTriggerClassName}>내 업체 관리</TabsTrigger>
            <TabsTrigger value="marketing" className={tabTriggerClassName}>마케팅 설정</TabsTrigger>
            <TabsTrigger value="notifications" className={tabTriggerClassName}>알림 설정</TabsTrigger>
          </TabsList>

          <div 
            ref={scrollContainerRef} 
            className={cn(
              "transition-[max-height] duration-300 ease-in-out",
              showContentAfterResize ? "overflow-y-auto" : "overflow-y-hidden"
            )}
            style={{
              maxHeight: typeof animatedMaxHeight === 'number' ? `${animatedMaxHeight}px` : undefined,
            }}
          >
            {/* 기본 설정 탭 */}
            <TabsContent 
              forceMount 
              value="basic" 
              data-tab-value="basic"
              className={cn(
                "rounded-lg border bg-background p-6 space-y-6", 
                "transition-opacity duration-200 ease-in-out",
                activeTab === "basic"
                  ? (showContentAfterResize ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none") 
                  : "hidden opacity-0 pointer-events-none" 
              )}
            >
              {/* 사용자 프로필 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  사용자 프로필
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">이름</Label>
                    <Input 
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">이메일</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="이메일을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">전화번호</Label>
                    <Input 
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="전화번호를 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">회사명</Label>
                    <Input 
                      id="company"
                      value={profileForm.company}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="회사명을 입력하세요"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={isUpdating} className="w-full md:w-auto">
                  {isUpdating ? "저장 중..." : "프로필 저장"}
                </Button>
              </div>

              {/* 언어 및 지역 설정 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  언어 및 지역 설정
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">언어</Label>
                    <Select 
                      value={settings?.language || 'ko'} 
                      onValueChange={(value) => updateBasicSettings({ language: value as 'ko' | 'en' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">시간대</Label>
                    <Select 
                      value={settings?.timezone || 'Asia/Seoul'} 
                      onValueChange={(value) => updateBasicSettings({ timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Seoul">서울 (UTC+9)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">뉴욕 (UTC-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 테마 설정 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  화면 설정
                </h3>
                <div>
                  <Label htmlFor="theme">테마</Label>
                  <Select 
                    value={settings?.theme || 'light'} 
                    onValueChange={(value) => updateBasicSettings({ theme: value as 'light' | 'dark' | 'auto' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">라이트 모드</SelectItem>
                      <SelectItem value="dark">다크 모드</SelectItem>
                      <SelectItem value="auto">시스템 설정 따르기</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* 내 업체 관리 탭 */}
            <TabsContent 
              forceMount 
              value="shops" 
              data-tab-value="shops"
              className={cn(
                "rounded-lg border bg-background p-6", 
                "transition-opacity duration-200 ease-in-out",
                activeTab === "shops"
                  ? (showContentAfterResize ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none") 
                  : "hidden opacity-0 pointer-events-none" 
              )}
            >
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  등록된 업체 ({businesses.length})
                </h3>

                {/* 업체 추가 폼 */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h4 className="font-medium text-slate-700 mb-3">새 업체 추가</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="업체명"
                      value={newBusinessForm.place_name}
                      onChange={(e) => setNewBusinessForm(prev => ({ ...prev, place_name: e.target.value }))}
                    />
                    <Input
                      placeholder="네이버 플레이스 ID"
                      value={newBusinessForm.place_id}
                      onChange={(e) => setNewBusinessForm(prev => ({ ...prev, place_id: e.target.value }))}
                    />
                    <Input
                      placeholder="업종 (선택사항)"
                      value={newBusinessForm.category}
                      onChange={(e) => setNewBusinessForm(prev => ({ ...prev, category: e.target.value }))}
                    />
                    <Input
                      placeholder="주소 (선택사항)"
                      value={newBusinessForm.address}
                      onChange={(e) => setNewBusinessForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <Button 
                    onClick={handleAddBusiness} 
                    disabled={isAddingBusiness || !newBusinessForm.place_name || !newBusinessForm.place_id}
                    className="mt-3 w-full md:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isAddingBusiness ? "추가 중..." : "업체 추가"}
                  </Button>
                </div>

                {/* 업체 목록 */}
                {isLoadingBusinesses ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">업체 목록을 불러오는 중...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {businesses.map((business) => (
                      <div 
                        key={business.id} 
                        className="bg-white p-4 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-slate-800 mb-1">
                              {business.place_name}
                            </h4>
                            <p className="text-sm text-slate-600">
                              {business.category || '업종 미등록'}
                            </p>
                            {business.address && (
                              <p className="text-xs text-slate-500 mt-1">{business.address}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBusiness(business.id, business.place_name)}
                              disabled={isDeletingBusiness}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <div className="space-y-1">
                            {business.reviewCount !== undefined && (
                              <p className="text-slate-500">리뷰: {business.reviewCount}개</p>
                            )}
                            {business.keywordCount !== undefined && (
                              <p className="text-slate-500">키워드: {business.keywordCount}개</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              business.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {business.status === 'active' ? '활성' : '비활성'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {businesses.length === 0 && (
                      <div className="col-span-full text-center py-8 text-slate-500">
                        <Store className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>등록된 업체가 없습니다.</p>
                        <p className="text-sm">위의 폼을 사용해서 업체를 추가해보세요.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 마케팅 설정 탭 */}
            <TabsContent 
              forceMount 
              value="marketing" 
              data-tab-value="marketing"
              className={cn(
                "rounded-lg border bg-background p-6 space-y-6", 
                "transition-opacity duration-200 ease-in-out",
                activeTab === "marketing"
                  ? (showContentAfterResize ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none") 
                  : "hidden opacity-0 pointer-events-none" 
              )}
            >
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                마케팅 자동화 설정
              </h3>

              {/* 자동 응답 설정 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                  <div>
                    <Label className="text-base font-medium">자동 응답 활성화</Label>
                    <p className="text-sm text-slate-600">새로운 리뷰에 자동으로 응답합니다</p>
                  </div>
                  <Switch 
                    checked={settings?.marketing?.autoReply || false}
                    onCheckedChange={(checked) => updateMarketingSettings({ autoReply: checked })}
                  />
                </div>

                {settings?.marketing?.autoReply && (
                  <div className="ml-4 space-y-3">
                    <div>
                      <Label htmlFor="reply-delay">응답 지연 시간 (분)</Label>
                      <Input
                        id="reply-delay"
                        type="number"
                        min="1"
                        max="1440"
                        value={settings?.marketing?.replyDelay || 30}
                        onChange={(e) => updateMarketingSettings({ replyDelay: parseInt(e.target.value) })}
                        className="w-32"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        자연스럽게 보이기 위해 지연 시간을 두고 응답합니다
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 운영 시간 설정 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                  <div>
                    <Label className="text-base font-medium">운영 시간 제한</Label>
                    <p className="text-sm text-slate-600">설정된 시간에만 자동 응답합니다</p>
                  </div>
                  <Switch 
                    checked={settings?.marketing?.businessHours?.enabled || false}
                    onCheckedChange={(checked) => updateMarketingSettings({ 
                      businessHours: { 
                        ...settings?.marketing?.businessHours, 
                        enabled: checked 
                      } 
                    })}
                  />
                </div>

                {settings?.marketing?.businessHours?.enabled && (
                  <div className="ml-4 grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-time">시작 시간</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={settings?.marketing?.businessHours?.start || '09:00'}
                        onChange={(e) => updateMarketingSettings({ 
                          businessHours: { 
                            ...settings?.marketing?.businessHours, 
                            start: e.target.value 
                          } 
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-time">종료 시간</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={settings?.marketing?.businessHours?.end || '18:00'}
                        onChange={(e) => updateMarketingSettings({ 
                          businessHours: { 
                            ...settings?.marketing?.businessHours, 
                            end: e.target.value 
                          } 
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 알림 설정 탭 */}
            <TabsContent 
              forceMount 
              value="notifications" 
              data-tab-value="notifications"
              className={cn(
                "rounded-lg border bg-background p-6 space-y-6", 
                "transition-opacity duration-200 ease-in-out",
                activeTab === "notifications"
                  ? (showContentAfterResize ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none") 
                  : "hidden opacity-0 pointer-events-none" 
              )}
            >
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                알림 설정
              </h3>

              {/* 알림 유형 */}
              <div className="space-y-3">
                <Label className="text-base font-medium">알림 받을 항목</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div>
                      <Label>이메일 알림</Label>
                      <p className="text-sm text-slate-600">중요한 알림을 이메일로 받습니다</p>
                    </div>
                    <Switch 
                      checked={settings?.notifications?.email || false}
                      onCheckedChange={(checked) => updateNotificationSettings({ email: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div>
                      <Label>리뷰 알림</Label>
                      <p className="text-sm text-slate-600">새로운 리뷰가 등록되면 알림을 받습니다</p>
                    </div>
                    <Switch 
                      checked={settings?.notifications?.reviewAlerts || false}
                      onCheckedChange={(checked) => updateNotificationSettings({ reviewAlerts: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div>
                      <Label>순위 변동 알림</Label>
                      <p className="text-sm text-slate-600">키워드 순위가 크게 변동되면 알림을 받습니다</p>
                    </div>
                    <Switch 
                      checked={settings?.notifications?.rankingChanges || false}
                      onCheckedChange={(checked) => updateNotificationSettings({ rankingChanges: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div>
                      <Label>주간 보고서</Label>
                      <p className="text-sm text-slate-600">매주 성과 요약 보고서를 받습니다</p>
                    </div>
                    <Switch 
                      checked={settings?.notifications?.weeklyReports || false}
                      onCheckedChange={(checked) => updateNotificationSettings({ weeklyReports: checked })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-auto"> 
          <DialogClose asChild>
            <Button variant="outline" className="bg-slate-100 hover:bg-slate-200 text-slate-700">
              닫기
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
