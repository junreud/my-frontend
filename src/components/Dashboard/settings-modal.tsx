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

// Import additional UI components for Notification Settings
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner"; // For toast notifications

// Import additional UI components for Team Settings
import { Input } from "@/components/ui/input"; 
import { cn } from "@/lib/utils"; 

// Mock data for businesses - replace with your actual data source
const mockBusinesses = [
  { id: "1", name: "플레이스 A", type: "음식점", reviews: 125 },
  { id: "2", name: "플레이스 B", type: "카페", reviews: 88 },
  { id: "3", name: "플레이스 C", type: "미용실", reviews: 210 },
];

// Define Roles
const ROLES = {
  OWNER: "소유자 (Owner)",
  ADMIN: "관리자 (Admin)",
  EDITOR: "편집자 (Editor)",
  VIEWER: "뷰어 (Viewer)",
};

// Mock data for team members - replace with your actual data source
const mockTeamMembers = [
  { id: "user1", email: "owner@example.com", name: "김소유", role: ROLES.OWNER },
  { id: "user2", email: "admin@example.com", name: "박관리", role: ROLES.ADMIN },
  { id: "user3", email: "editor@example.com", name: "이편집", role: ROLES.EDITOR },
  { id: "user4", email: "viewer@example.com", name: "최조회", role: ROLES.VIEWER },
];

// Removed Pricing Plans as it's now in a separate modal


export function SettingsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [businesses, setBusinesses] = React.useState(mockBusinesses);
  const [activeTab, setActiveTab] = React.useState("basic");
  const [animatedMaxHeight, setAnimatedMaxHeight] = React.useState<number | undefined>(undefined);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null); 
  const [showContentAfterResize, setShowContentAfterResize] = React.useState(false);

  // Handle modal open: measure and show immediately
  React.useEffect(() => {
    if (open) {
      window.requestAnimationFrame(() => {
        const contentEl = scrollContainerRef.current?.querySelector<HTMLElement>(`:scope > div[data-tab-value="${activeTab}"]`);
        const height = contentEl?.offsetHeight ?? 0;
        setAnimatedMaxHeight(height);
        setShowContentAfterResize(true);
      });
    } else {
      // collapse on close
      setAnimatedMaxHeight(0);
      setShowContentAfterResize(false);
      scrollContainerRef.current?.scrollTo(0, 0);
    }
  }, [open]);

  // Handle tab switch: fade-out, resize height, then fade-in
  React.useEffect(() => {
    let resizeTimeout: number;
    let fadeTimeout: number;
    // hide content
    setShowContentAfterResize(false);
    if (!open) {
      // collapse on close
      setAnimatedMaxHeight(0);
      scrollContainerRef.current?.scrollTo(0, 0);
    } else {
      // on open or tab change, measure new panel height
      window.requestAnimationFrame(() => {
        const panel = scrollContainerRef.current?.querySelector<HTMLElement>(`:scope > div[data-tab-value="${activeTab}"]`);
        const newHeight = panel?.offsetHeight ?? 0;
        // schedule height update one tick later for transition
        resizeTimeout = window.setTimeout(() => {
          setAnimatedMaxHeight(newHeight);
          // after transition, fade content in
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

  const handleAddPlace = () => {
    // Add a new dummy place for demo
    setBusinesses(prev => [...prev, { id: String(prev.length + 1), name: `새 플레이스 ${prev.length + 1}`, type: "기타", reviews: 0 }]);
    alert("업체 추가 기능이 여기에 연결됩니다.");
  };

  const tabTriggerClassName = "px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold text-slate-600 data-[state=inactive]:hover:bg-slate-200/70 data-[state=inactive]:hover:text-slate-800";

  // State for Notification Settings
  const [notificationPreferences, setNotificationPreferences] = React.useState({
    review: true,
    trafficDrop: true,
    automationDone: false,
  });
  const [notificationChannels, setNotificationChannels] = React.useState({
    email: true,
    sms: false,
    push: true,
  });
  const [notifyTimeRange, setNotifyTimeRange] = React.useState("all");
  const [notifyFrequency, setNotifyFrequency] = React.useState("instant");
  const [isSavingNotifications, setIsSavingNotifications] = React.useState(false);

  // State for Team Settings
  const [teamMembers, setTeamMembers] = React.useState(mockTeamMembers);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [selectedRoleForInvite, setSelectedRoleForInvite] = React.useState(ROLES.VIEWER); // Default to Viewer
  const [isInvitingMember, setIsInvitingMember] = React.useState(false);

  const updateNotificationPreference = (key: keyof typeof notificationPreferences, value: boolean) => {
    setNotificationPreferences(prev => ({ ...prev, [key]: value }));
  };

  const updateNotificationChannel = (key: keyof typeof notificationChannels, value: boolean) => {
    // Basic validation example: SMS might require phone verification
    if (key === 'sms' && value && !confirm("문자 메시지 수신을 위해서는 휴대폰 번호 인증이 필요할 수 있습니다. 계속하시겠습니까? (데모)")) {
      return;
    }
    setNotificationChannels(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSaveNotificationSettings = async () => {
    setIsSavingNotifications(true);
    console.log("Saving notification settings:", {
      preferences: notificationPreferences,
      channels: notificationChannels,
      timeRange: notifyTimeRange,
      frequency: notifyFrequency,
    });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSavingNotifications(false);
    toast.success("알림 설정이 저장되었습니다.");
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error("유효한 이메일을 입력해주세요.");
      return;
    }
    setIsInvitingMember(true);
    console.log(`Inviting ${inviteEmail} as ${selectedRoleForInvite}`);
    // Simulate API call for invitation
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Add to local state for demo purposes
    setTeamMembers(prev => [...prev, { 
      id: `user${prev.length + 1}`, 
      email: inviteEmail, 
      name: inviteEmail.split('@')[0], // Simple name generation
      role: selectedRoleForInvite 
    }]);
    setInviteEmail("");
    setSelectedRoleForInvite(ROLES.VIEWER); // Reset role
    setIsInvitingMember(false);
    toast.success(`${inviteEmail}님을 ${selectedRoleForInvite} 역할로 초대했습니다.`);
  };

  // Placeholder for future actions
  const handleChangeMemberRole = (memberId: string, newRole: string) => {
    console.log(`Change role for ${memberId} to ${newRole}`);
    // Here you would typically open a dialog or inline edit
    toast.info(`(데모) ${memberId}의 역할을 ${newRole}(으)로 변경하는 기능이 여기에 연결됩니다.`);
    // Update local state for demo
    setTeamMembers(prev => prev.map(member => member.id === memberId ? { ...member, role: newRole } : member));
  };

  const handleRemoveMember = (memberId: string, memberEmail: string) => {
    if (confirm(`${memberEmail}님을 팀에서 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      console.log(`Remove member ${memberId}`);
      toast.success(`${memberEmail}님을 팀에서 삭제했습니다.`);
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-white sm:max-w-3xl flex flex-col overflow-hidden"
        style={{
          position: 'fixed',
          left: '50%',
          top: '10vh',
          transform: 'translate(-50%, 0)',
          maxHeight: 'calc(100vh - 10vh - 2rem)',
        }}
      >
        {/* Ensure Title and Description are direct children for accessibility */}
        <DialogTitle className="flex-shrink-0 border-b pb-4">
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
            <TabsTrigger value="team" className={tabTriggerClassName}>팀 권한 설정</TabsTrigger>
            <TabsTrigger value="notifications" className={tabTriggerClassName}>알림 설정</TabsTrigger>
          </TabsList>

          <div 
            ref={scrollContainerRef} 
            className={cn(
              "transition-[max-height] duration-300 ease-in-out", // Adjusted duration
              showContentAfterResize ? "overflow-y-auto" : "overflow-y-hidden"
            )}
            style={{
              maxHeight: typeof animatedMaxHeight === 'number' ? `${animatedMaxHeight}px` : undefined,
            }}
          >
            <TabsContent 
              forceMount 
              value="basic" 
              data-tab-value="basic"
              className={cn(
                "rounded-lg border bg-background p-6", 
                "transition-opacity duration-200 ease-in-out", // Adjusted duration
                activeTab === "basic"
                  ? (showContentAfterResize ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none") 
                  : "hidden opacity-0 pointer-events-none" 
              )}
            >
              {/* 기본 설정 내용 */}
              <div>기본 설정을 구성하세요.</div>
            </TabsContent>
            <TabsContent 
              forceMount 
              value="shops" 
              data-tab-value="shops"
              className={cn(
                "rounded-lg border bg-background p-6", 
                "transition-opacity duration-200 ease-in-out", // Adjusted duration
                activeTab === "shops"
                  ? (showContentAfterResize ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none") 
                  : "hidden opacity-0 pointer-events-none" 
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businesses.map((business) => (
                  <div 
                    key={business.id} 
                    className="bg-white p-4 rounded-lg shadow-md border border-slate-200 flex flex-col justify-between min-h-[140px]"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">{business.name}</h3>
                      <p className="text-sm text-slate-600">업종: {business.type}</p>
                      <p className="text-sm text-slate-500">리뷰 수: {business.reviews}개</p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleAddPlace}
                  className="bg-slate-50 hover:bg-slate-100 p-4 rounded-lg shadow-md border-2 border-dashed border-slate-300 hover:border-slate-400 flex flex-col items-center justify-center text-slate-500 hover:text-slate-700 transition-all min-h-[140px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="font-medium text-sm">새 업체 추가</span>
                </button>
              </div>
            </TabsContent>
            <TabsContent 
              forceMount 
              value="marketing" 
              data-tab-value="marketing"
              className={cn(
                "rounded-lg border bg-background p-6", 
                "transition-opacity duration-200 ease-in-out", // Adjusted duration
                activeTab === "marketing"
                  ? (showContentAfterResize ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none") 
                  : "hidden opacity-0 pointer-events-none" 
              )}
            >
              {/* 마케팅 설정 내용 */}
              <div>마케팅 설정을 구성하세요.</div>
            </TabsContent>
            <TabsContent 
              forceMount 
              value="team" 
              data-tab-value="team"
              className={cn(
                "rounded-lg border bg-background p-6 flex flex-col", 
                "transition-opacity duration-200 ease-in-out", // Adjusted duration
                activeTab === "team"
                  ? (showContentAfterResize ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none") 
                  : "hidden opacity-0 pointer-events-none" 
              )}
            >
              <div className="flex-grow space-y-6">
                {/* 1. 새 멤버 초대 */}
                <div>
                  <Label className="text-base font-semibold text-slate-700">새 멤버 초대</Label>
                  <div className="mt-3 p-4 bg-slate-50 rounded-md border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                      <div className="flex-grow">
                        <Label htmlFor="invite-email" className="text-xs font-medium text-slate-600">이메일 주소</Label>
                        <Input 
                          id="invite-email"
                          type="email" 
                          placeholder="teammate@example.com" 
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div className="sm:w-48">
                        <Label htmlFor="invite-role" className="text-xs font-medium text-slate-600">역할</Label>
                        <Select value={selectedRoleForInvite} onValueChange={setSelectedRoleForInvite}>
                          <SelectTrigger id="invite-role" className="mt-1 bg-white">
                            <SelectValue placeholder="역할 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ROLES).map(role => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleInviteMember} 
                        disabled={isInvitingMember || !inviteEmail.trim()}
                        className="sm:w-auto w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isInvitingMember ? (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : null}
                        {isInvitingMember ? "초대 중..." : "초대 보내기"}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">초대된 사용자는 이메일 인증 후 팀에 합류할 수 있습니다.</p>
                  </div>
                </div>

                {/* 2. 현재 팀 멤버 */}
                <div>
                  <Label className="text-base font-semibold text-slate-700">현재 팀 멤버 ({teamMembers.length})</Label>
                  <div className="mt-3 space-y-2">
                    {teamMembers.length > 0 ? teamMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-slate-200 shadow-sm">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{member.name || member.email.split('@')[0]}</p>
                          <p className="text-xs text-slate-500">{member.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <Select 
                            value={member.role} 
                            onValueChange={(newRole) => handleChangeMemberRole(member.id, newRole)}
                          >
                            <SelectTrigger className="text-xs h-8 w-36 bg-slate-50 border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(ROLES).map(role => (
                                <SelectItem key={role} value={role} >
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                            onClick={() => handleRemoveMember(member.id, member.email)}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500 p-3 text-center">팀 멤버가 없습니다. 위에서 새 멤버를 초대하세요.</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent 
              forceMount 
              value="notifications" 
              data-tab-value="notifications"
              className={cn(
                "rounded-lg border bg-background p-6 flex flex-col", 
                "transition-opacity duration-200 ease-in-out", // Adjusted duration
                activeTab === "notifications"
                  ? (showContentAfterResize ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none") 
                  : "hidden opacity-0 pointer-events-none" 
              )}
            >
              <div className="flex-grow space-y-6">
                {/* 1. 알림 유형 선택 */}
                <div>
                  <Label className="text-base font-semibold text-slate-700">알림 받을 항목</Label>
                  <div className="space-y-3 mt-3 pl-1">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
                      <Label htmlFor="notify-review" className="text-sm font-medium text-slate-600">리뷰 알림</Label>
                      <Switch 
                        id="notify-review"
                        checked={notificationPreferences.review} 
                        onCheckedChange={(val) => updateNotificationPreference('review', val)} 
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
                      <Label htmlFor="notify-trafficDrop" className="text-sm font-medium text-slate-600">방문자 수 급감 알림</Label>
                      <Switch 
                        id="notify-trafficDrop"
                        checked={notificationPreferences.trafficDrop} 
                        onCheckedChange={(val) => updateNotificationPreference('trafficDrop', val)} 
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
                      <Label htmlFor="notify-automationDone" className="text-sm font-medium text-slate-600">자동화 작업 완료</Label>
                      <Switch 
                        id="notify-automationDone"
                        checked={notificationPreferences.automationDone} 
                        onCheckedChange={(val) => updateNotificationPreference('automationDone', val)} 
                      />
                    </div>
                  </div>
                </div>

                {/* 2. 알림 수단 선택 */}
                <div>
                  <Label className="text-base font-semibold text-slate-700">알림 받을 채널</Label>
                  <div className="space-y-3 mt-3 pl-1">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                      <Checkbox 
                        id="channel-email"
                        checked={notificationChannels.email} 
                        onCheckedChange={(val) => updateNotificationChannel('email', val as boolean)}
                      />
                      <Label htmlFor="channel-email" className="text-sm font-medium text-slate-600 cursor-pointer">이메일</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                      <Checkbox 
                        id="channel-sms"
                        checked={notificationChannels.sms} 
                        onCheckedChange={(val) => updateNotificationChannel('sms', val as boolean)}
                      />
                      <Label htmlFor="channel-sms" className="text-sm font-medium text-slate-600 cursor-pointer">문자 메시지 (SMS)</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                      <Checkbox 
                        id="channel-push"
                        checked={notificationChannels.push} 
                        onCheckedChange={(val) => updateNotificationChannel('push', val as boolean)}
                      />
                      <Label htmlFor="channel-push" className="text-sm font-medium text-slate-600 cursor-pointer">웹 푸시 알림</Label>
                    </div>
                  </div>
                </div>

                {/* 3. 시간대 및 빈도 설정 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="notify-time-range" className="text-base font-semibold text-slate-700">알림 시간대</Label>
                    <Select value={notifyTimeRange} onValueChange={setNotifyTimeRange}>
                      <SelectTrigger id="notify-time-range" className="mt-3 bg-white">
                        <SelectValue placeholder="시간대 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">항상</SelectItem>
                        <SelectItem value="working">업무 시간 (오전 9시 ~ 오후 6시)</SelectItem>
                        <SelectItem value="non_working_hours_excluded">업무 시간 외 제외 (오전 9시 ~ 오후 6시 외 받지 않음)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-slate-700">알림 빈도</Label>
                    <RadioGroup value={notifyFrequency} onValueChange={setNotifyFrequency} className="mt-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="instant" id="freq-instant" />
                        <Label htmlFor="freq-instant" className="font-normal text-slate-600">실시간</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="freq-daily" />
                        <Label htmlFor="freq-daily" className="font-normal text-slate-600">하루 1회 요약 (자정 기준)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="freq-none" />
                        <Label htmlFor="freq-none" className="font-normal text-slate-600">받지 않음 (모든 알림 비활성화)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                <Button 
                  onClick={handleSaveNotificationSettings} 
                  disabled={isSavingNotifications}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSavingNotifications ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {isSavingNotifications ? "저장 중..." : "알림 설정 저장"}
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-auto"> 
          <DialogClose asChild>
            <Button variant="outline" className="bg-slate-100 hover:bg-slate-200 text-slate-700">닫기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
