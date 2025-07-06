"use client"

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
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
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, Loader2 } from "lucide-react";
import { useReplySettings, useSaveReplySettings, useGenerateReplies } from "@/hooks/useReviews";
import { useQueryClient } from "@tanstack/react-query";
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
  const [tone, setTone] = useState<string>('friendly');
  const [keyMessages, setKeyMessages] = useState<string[]>([]);
  const [avoidWords, setAvoidWords] = useState<string[]>([]);
  const [templateContent, setTemplateContent] = useState<string>('');
  const [newKeyMessage, setNewKeyMessage] = useState<string>('');
  const [newAvoidWord, setNewAvoidWord] = useState<string>('');

  // 훅들
  const queryClient = useQueryClient();
  const { data: settings, isLoading: settingsLoading } = useReplySettings(placeId);
  const saveSettings = useSaveReplySettings();
  const generateReplies = useGenerateReplies();

  // 설정 로드
  useEffect(() => {
    if (settings) {
      setTone(settings.tone || 'friendly');
      setKeyMessages(settings.key_messages || []);
      setAvoidWords(settings.avoid_words || []);
      setTemplateContent(settings.template_content || '');
    }
  }, [settings]);

  // 핵심 메시지 추가
  const addKeyMessage = () => {
    if (newKeyMessage.trim() && !keyMessages.includes(newKeyMessage.trim())) {
      setKeyMessages([...keyMessages, newKeyMessage.trim()]);
      setNewKeyMessage('');
    }
  };

  // 핵심 메시지 제거
  const removeKeyMessage = (index: number) => {
    setKeyMessages(keyMessages.filter((_, i) => i !== index));
  };

  // 피해야 할 단어 추가
  const addAvoidWord = () => {
    if (newAvoidWord.trim() && !avoidWords.includes(newAvoidWord.trim())) {
      setAvoidWords([...avoidWords, newAvoidWord.trim()]);
      setNewAvoidWord('');
    }
  };

  // 피해야 할 단어 제거
  const removeAvoidWord = (index: number) => {
    setAvoidWords(avoidWords.filter((_, i) => i !== index));
  };

  // 설정 저장
  const handleSaveSettings = async () => {
    try {
      await saveSettings.mutateAsync({
        placeId,
        settings: {
          tone,
          key_messages: keyMessages,
          avoid_words: avoidWords,
          template_content: templateContent
        }
      });
    } catch (error) {
      console.error('설정 저장 실패:', error);
    }
  };

  // 답변 생성 및 저장
  const handleGenerateAndSave = async () => {
    try {
      // 먼저 설정 저장
      await saveSettings.mutateAsync({
        placeId,
        settings: {
          tone,
          key_messages: keyMessages,
          avoid_words: avoidWords,
          template_content: templateContent
        }
      });

      // 그 다음 답변 생성
      const result = await generateReplies.mutateAsync({
        placeId,
        useSettings: true,
        reviewType: 'receipt'
      });

      // 성공 메시지 표시
      alert(`답변 생성 완료!\n성공: ${result.summary.success}개\n실패: ${result.summary.failure}개`);
      
      // 리뷰 데이터 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ['receipt-reviews', placeId] });
      
      // 모달 닫기
      onClose();

    } catch (error) {
      console.error('답변 생성 실패:', error);
      alert('답변 생성 중 오류가 발생했습니다.');
    }
  };

  const isLoading = settingsLoading || saveSettings.isPending || generateReplies.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            AI 답변 설정
            <Badge variant="outline" className="text-xs">
              {businessName}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              {settingsLoading && '설정을 불러오는 중...'}
              {saveSettings.isPending && '설정을 저장하는 중...'}
              {generateReplies.isPending && '답변을 생성하는 중...'}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* 답변 톤 앤 매너 */}
          <div className="space-y-2">
            <Label htmlFor="tone">답변 톤 앤 매너</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="답변 스타일을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">친근한</SelectItem>
                <SelectItem value="formal">정중한</SelectItem>
                <SelectItem value="casual">캐주얼한</SelectItem>
                <SelectItem value="professional">전문적인</SelectItem>
                <SelectItem value="warm">따뜻한</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 핵심 메시지 */}
          <div className="space-y-2">
            <Label>포함해야 할 핵심 메시지</Label>
            <div className="flex gap-2">
              <Input
                value={newKeyMessage}
                onChange={(e) => setNewKeyMessage(e.target.value)}
                placeholder="예: 최고급 재료 사용, 신선한 식재료"
                onKeyPress={(e) => e.key === 'Enter' && addKeyMessage()}
              />
              <Button onClick={addKeyMessage} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {keyMessages.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {keyMessages.map((message, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {message}
                    <button
                      onClick={() => removeKeyMessage(index)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 피해야 할 단어/표현 */}
          <div className="space-y-2">
            <Label>사용하지 말아야 할 단어/표현</Label>
            <div className="flex gap-2">
              <Input
                value={newAvoidWord}
                onChange={(e) => setNewAvoidWord(e.target.value)}
                placeholder="예: 최고, 대박, 완전"
                onKeyPress={(e) => e.key === 'Enter' && addAvoidWord()}
              />
              <Button onClick={addAvoidWord} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {avoidWords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {avoidWords.map((word, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {word}
                    <button
                      onClick={() => removeAvoidWord(index)}
                      className="ml-1 text-white hover:text-gray-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 기본 템플릿 */}
          <div className="space-y-2">
            <Label htmlFor="template">기본 답변 템플릿 (선택사항)</Label>
            <textarea
              id="template"
              value={templateContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTemplateContent(e.target.value)}
              placeholder="예: 안녕하세요! [업체명]입니다. 소중한 리뷰 감사합니다..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500">
              템플릿을 설정하지 않으면 AI가 자동으로 적절한 답변을 생성합니다.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleSaveSettings}
            disabled={isLoading}
          >
            {saveSettings.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            설정만 저장
          </Button>
          <Button 
            onClick={handleGenerateAndSave}
            disabled={isLoading}
          >
            {generateReplies.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            저장 후 답변 생성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
