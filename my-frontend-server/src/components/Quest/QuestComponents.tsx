import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Quest } from '@/types/quest';
import { QuestManager } from '@/lib/questManager';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, PlayCircle, Star } from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  onStart?: (questId: string) => void;
}

export function QuestCard({ quest, onStart }: QuestCardProps) {
  const router = useRouter();
  const progress = QuestManager.calculateProgress(quest);
  const isExpired = QuestManager.isQuestExpired(quest);

  const handleActionClick = () => {
    if (quest.actionUrl) {
      router.push(quest.actionUrl);
    }
    if (quest.status === 'incomplete' && onStart) {
      onStart(quest.id);
    }
  };

  const getDifficultyColor = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (quest.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      quest.status === 'completed' ? 'bg-green-50 border-green-200' : 
      isExpired ? 'bg-red-50 border-red-200' : 'bg-white'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{quest.icon}</div>
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {quest.title}
                {getStatusIcon()}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={getDifficultyColor(quest.difficulty)}>
                  {quest.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {quest.type}
                </Badge>
                <div className="flex items-center gap-1 text-orange-600">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-medium">{quest.points}p</span>
                </div>
              </div>
            </div>
          </div>
          {quest.dueDate && (
            <div className={`text-xs flex items-center gap-1 ${
              isExpired ? 'text-red-600' : 'text-gray-500'
            }`}>
              <Clock className="h-3 w-3" />
              {isExpired ? '만료됨' : '마감'}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{quest.description}</p>
        
        {quest.requirements && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700">완료 조건:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {quest.requirements.map((req, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {quest.status !== 'completed' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">진행률</span>
              <span className="text-xs font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2">
          {quest.status === 'completed' ? (
            <Badge className="bg-green-600 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              완료됨
            </Badge>
          ) : (
            <Button 
              size="sm" 
              onClick={handleActionClick}
              disabled={isExpired}
              className="w-full"
            >
              {quest.actionText || '시작하기'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface QuestListProps {
  quests: Quest[];
  categoryFilter?: string;
  onQuestStart?: (questId: string) => void;
}

export function QuestList({ quests, categoryFilter, onQuestStart }: QuestListProps) {
  const filteredQuests = categoryFilter 
    ? quests.filter(quest => quest.category === categoryFilter)
    : quests;

  const sortedQuests = filteredQuests.sort((a, b) => {
    // 완료되지 않은 퀘스트를 먼저 표시
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    // 우선순위에 따라 정렬
    return QuestManager.getQuestPriority(b) - QuestManager.getQuestPriority(a);
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedQuests.map((quest) => (
        <QuestCard
          key={quest.id}
          quest={quest}
          onStart={onQuestStart}
        />
      ))}
    </div>
  );
}

interface QuestStatsProps {
  totalCompleted: number;
  totalPoints: number;
  currentStreak: number;
  weeklyProgress: {
    completed: number;
    total: number;
  };
}

export function QuestStats({ totalCompleted, totalPoints, currentStreak, weeklyProgress }: QuestStatsProps) {
  const weeklyProgressPercent = weeklyProgress.total > 0 
    ? Math.round((weeklyProgress.completed / weeklyProgress.total) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalCompleted}</div>
            <div className="text-sm text-gray-600">완료된 퀘스트</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalPoints}</div>
            <div className="text-sm text-gray-600">획득한 포인트</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{currentStreak}</div>
            <div className="text-sm text-gray-600">연속 완료일</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{weeklyProgressPercent}%</div>
            <div className="text-sm text-gray-600">주간 진행률</div>
            <Progress value={weeklyProgressPercent} className="h-1 mt-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
