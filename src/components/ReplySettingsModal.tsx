"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Settings, Bot } from "lucide-react";
import { useReplySettings, useSaveReplySettings, useGenerateReplies, ReplySettings } from "@/hooks/useReviews";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReplySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeId: string;
  businessName: string;
}

export default function ReplySettingsModal({ 
  isOpen, 
  onClose, 
  placeId, 
  businessName 
}: ReplySettingsModalProps) {
  const [formData, setFormData] = useState<ReplySettings>({
    tone: 'friendly',
    template_style: 'standard',
    keywords: [],
    auto_generate: false,
    is_active: true
  });
  
  const [newKeyword, setNewKeyword] = useState('');
  
  const { data: settings, isLoading, error, refetch } = useReplySettings(placeId);
  const saveSettings = useSaveReplySettings();
  const generateReplies = useGenerateReplies();

  // 설정 로드 시 폼 데이터 업데이트
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await saveSettings.mutateAsync({
        placeId,
        settings: formData,
        businessName
      });
      onClose();
    } catch (error) {
      console.error('설정 저장 실패:', error);
    }
  };

  const handleGenerateReplies = async () => {
    try {
      // 먼저 설정 저장
      await saveSettings.mutateAsync({
        placeId,
        settings: formData,
        businessName
      });
      
      // 답변 생성 실행
      const result = await generateReplies.mutateAsync({
        placeId,
        useSettings: true
      });
      
      if (result?.summary) {
        alert(`답변 생성 완료!\n성공: ${result.summary.success}개\n실패: ${result.summary.failure}개`);
      } else {
        alert('답변 생성이 완료되었습니다.');
      }
      onClose();
      
    } catch (error) {
      console.error('답변 생성 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '답변 생성 중 오류가 발생했습니다.';
      alert(`답변 생성 실패: ${errorMessage}`);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const toneOptions = [
    { value: 'friendly', label: '친근하고 따뜻한', description: '고객과 가까운 거리감으로 소통' },
    { value: 'professional', label: '전문적이고 정중한', description: '격식 있고 신뢰감 있는 톤' },
    { value: 'warm', label: '따뜻하고 정감 있는', description: '인간적이고 따뜻한 감성' },
    { value: 'casual', label: '편안하고 자연스러운', description: '부담 없고 편안한 대화체' }
  ];

  const styleOptions = [
    { value: 'standard', label: '표준형', description: '적당한 길이의 균형 잡힌 답변' },
    { value: 'detailed', label: '상세형', description: '구체적이고 자세한 설명' },
    { value: 'brief', label: '간결형', description: '핵심만 담은 짧은 답변' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI 답변 설정
          </DialogTitle>
          <DialogDescription>
            ChatGPT가 영수증 리뷰에 대한 답변을 자동으로 생성할 때 사용할 설정을 관리합니다.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">설정을 불러오는 중...</div>
        ) : error ? (
          <div className="py-8 text-center">
            <div className="text-red-500 mb-4">설정을 불러오는데 실패했습니다.</div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              다시 시도
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 답변 톤 설정 */}
            <div className="space-y-3">
              <Label className="text-base font-medium">답변 톤</Label>
              <Select
                value={formData.tone}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value as ReplySettings['tone'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 답변 스타일 설정 */}
            <div className="space-y-3">
              <Label className="text-base font-medium">답변 스타일</Label>
              <Select
                value={formData.template_style}
                onValueChange={(value) => setFormData(prev => ({ ...prev, template_style: value as ReplySettings['template_style'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 강조 키워드 설정 */}
            <div className="space-y-3">
              <Label className="text-base font-medium">강조 키워드</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="강조할 키워드를 입력하세요 (예: 청결, 친절, 맛있는)"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button onClick={addKeyword} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  키워드는 랜덤으로 선택되어 답변에 자연스럽게 포함됩니다. (최대 2개씩 사용)
                </p>
              </div>
            </div>

            {/* 자동 생성 설정 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">자동 답변 생성</Label>
                  <p className="text-sm text-gray-500">
                    새로운 리뷰가 수집될 때 자동으로 답변을 생성합니다
                  </p>
                </div>
                <Switch
                  checked={formData.auto_generate}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, auto_generate: checked }))
                  }
                />
              </div>
            </div>

            {formData.auto_generate && (
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  자동 답변 생성이 활성화되면 새로 수집된 영수증 리뷰에 대해 
                  설정된 톤과 키워드를 바탕으로 답변이 자동 생성됩니다.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saveSettings.isPending}
            variant="secondary"
          >
            {saveSettings.isPending ? '저장 중...' : '설정만 저장'}
          </Button>
          <Button 
            onClick={handleGenerateReplies} 
            disabled={saveSettings.isPending || generateReplies.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Bot className="h-4 w-4 mr-2" />
            {(saveSettings.isPending || generateReplies.isPending) ? '처리 중...' : '저장 후 답변 생성'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
