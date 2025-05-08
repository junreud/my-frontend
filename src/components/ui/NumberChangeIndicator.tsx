import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface NumberChangeIndicatorProps {
  current: number | null | undefined;
  past: number | null | undefined;
  formatter?: (value: number | null | undefined) => string;
  invert?: boolean; // Added property for ranking (lower is better)
  hideWhenNoChange?: boolean; // 변화가 없을 때 표시 여부
}

export const NumberChangeIndicator: React.FC<NumberChangeIndicatorProps> = ({ 
  current, 
  past, 
  formatter = (val) => (val !== null && val !== undefined) ? val.toString() : '',
  invert = false,
  hideWhenNoChange = false
}) => {
  // 두 값이 없으면 변화 표시 안함
  if (current === null || current === undefined || past === null || past === undefined) {
    return null;
  }

  const diff = current - past;
  
  // 변화가 없으면 숨기거나 가로줄 표시
  if (diff === 0) {
    return hideWhenNoChange ? null : <span className="text-gray-400 ml-1 inline">-</span>;
  }

  // 순위의 경우 (invert=true): 낮아지는 것이 좋음 (음수가 좋음)
  // 일반 수치 (invert=false): 높아지는 것이 좋음 (양수가 좋음)
  const isPositive = invert ? diff < 0 : diff > 0;
  
  // 색상 및 아이콘 결정
  const iconClass = isPositive ? "text-green-500" : "text-red-500";
  const Icon = isPositive ? FaArrowUp : FaArrowDown;
  
  // 순위의 경우 변화량의 절대값 표시
  const displayValue = formatter(Math.abs(diff));

  return (
    <span className={`ml-1 flex items-center ${iconClass}`}>
      <Icon className="inline mr-1" />
      {displayValue && <span className="text-xs">{displayValue}</span>}
    </span>
  );
};