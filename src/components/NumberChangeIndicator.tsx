import React from 'react';

interface NumberChangeIndicatorProps {
  current: number | null | undefined;
  past?: number | null | undefined;
  reverse?: boolean;
  formatter?: (val: number | null | undefined) => string;
  showChange?: boolean; // 변화량 표시 여부 옵션
}

export const NumberChangeIndicator: React.FC<NumberChangeIndicatorProps> = ({ 
  current, 
  past, 
  reverse = false,
  formatter = (val: number | null | undefined) => val != null ? val.toString() : '-',
  showChange = true
}) => {
  // null 및 undefined 값 처리
  if (current == null) return <span>-</span>;
  if (past == null) return <span>{formatter(current)}</span>;
    
  const diff = current - past;
  // 개선 여부 (순위는 낮을수록(reverse=true), 다른 지표는 높을수록 좋음)
  const isImproved = reverse ? diff < 0 : diff > 0;
  
  // 변화량 절대값
  const absDiff = Math.abs(diff);
  
  return (
    <div className="flex items-center gap-1">
      <span className="font-medium">{formatter(current)}</span>
      
      {showChange && diff !== 0 && (
        <span 
          className={`text-xs font-medium ${isImproved 
            ? 'text-green-600' // 개선됨
            : 'text-red-600'   // 악화됨
          }`}
        >
          ({isImproved ? '+' : '-'}{absDiff})
        </span>
      )}
    </div>
  );
};