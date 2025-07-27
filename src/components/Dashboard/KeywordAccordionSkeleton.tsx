// filepath: /Users/junseok/Projects/my-frontend/src/components/Dashboard/KeywordAccordionSkeleton.tsx
"use client";

import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useBusinessSwitcher } from "@/hooks/useBusinessSwitcher";
import { KeywordAccordionContent } from "./KeywordAccordionContent";

const KeywordAccordionSkeleton: React.FC = () => {
  // We only need business data, not actual keyword data for the skeleton
  const { activeBusiness } = useBusinessSwitcher();
  const placeholderId = activeBusiness?.place_id || 'placeholder';
  
  // Create 3 placeholder accordion items - these will be visible immediately
  const placeholderItems = [
    { id: 1, keyword: "신림헬스장", rank: "?" },
    { id: 2, keyword: "신림PT", rank: "?" },
    { id: 3, keyword: "신림피트니스", rank: "?" },
  ];

  return (
    <Accordion type="single" collapsible className="border rounded">
      {placeholderItems.map((item, index) => (
        <AccordionItem key={`skeleton-${item.id}`} value={`item-${index}`}>
          <AccordionTrigger className="px-4">
            <div className="grid grid-cols-3 items-center gap-4 w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{index + 1}.</span>
                <span>{item.keyword}</span>
              </div>

              <div className="text-right mr-2">
                <KeywordRankSkeleton placeholderId={placeholderId} keyword={item.keyword} />
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <KeywordAccordionContent keyword={item.keyword} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

// Client component that fetches the actual rank data
const KeywordRankSkeleton: React.FC<{ placeholderId: string | number, keyword: string }> = ({ 
  placeholderId, 
  keyword 
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [rank, setRank] = React.useState<string | number>("?");

  React.useEffect(() => {
    // Simulate data loading with a random delay
    const timeout = setTimeout(() => {
      // This would be replaced with actual API call
      setRank(Math.floor(Math.random() * 20) + 1); // Random rank for demo
      setIsLoading(false);
    }, Math.random() * 2000 + 1000); // Random delay between 1-3 seconds
    
    return () => clearTimeout(timeout);
  }, [placeholderId, keyword]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        <span>현재 순위:</span>
        <div className="h-5 w-8 bg-gray-200 animate-pulse rounded"></div>
        <span>위</span>
      </div>
    );
  }

  return <span>현재 순위: {rank}위</span>;
};

export default KeywordAccordionSkeleton;