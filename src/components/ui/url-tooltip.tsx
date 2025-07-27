import React, { useState } from "react";

interface UrlTooltipProps {
  children: React.ReactNode;
  url: string;
}

export const UrlTooltip: React.FC<UrlTooltipProps> = ({ children, url }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-black text-white text-xs rounded shadow-lg z-50 whitespace-normal max-w-xs break-words">
          URL: {url}
        </div>
      )}
    </div>
  );
};
