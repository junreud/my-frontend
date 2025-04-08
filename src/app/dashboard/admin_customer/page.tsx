"use client";

import React, { useState } from "react";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { Button } from "@/components/ui/button";
import { areaOptions } from "./areaData";
import { UrlTooltip } from "@/components/ui/url-tooltip";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import ProgressComponent from "./progressbar"; // Import ProgressComponent

// Define a type for the added filter
interface AddedFilter {
  id: string;
  searchType: 'area' | 'total';
  areas: string[];
  includeKeyword: string;
  excludeKeyword: string;
  url: string;
  searchKeyword?: string; // Add searchKeyword for total search
}

interface AlbamonJobResponse {
  jobId?: string;
  companyName?: string;
  address?: string;
  jobTitle?: string;
}

export default function AlbamonFilter() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUser(); // Use the hook instead of direct API call
  const [searchType, setSearchType] = useState<'area' | 'total'>('area');
  const [selectedMajorRegion, setSelectedMajorRegion] = useState<string>("");
  const [selectedSubRegions, setSelectedSubRegions] = useState<string[]>([]);
  const [includeKeyword, setIncludeKeyword] = useState<string>("");
  const [excludeKeyword, setExcludeKeyword] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState<string>(""); // New state for total search keyword
  const [addedFilters, setAddedFilters] = useState<AddedFilter[]>([]);
  
  // New states for handling crawled data
  const [crawledBusinesses, setCrawledBusinesses] = useState<ParsedBusiness[]>([]);
  const [showParsingTable, setShowParsingTable] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);

  // Check if user is not admin, redirect to dashboard
  if (!isLoading && user && user.role !== 'admin') {
    alert('관리자만 접근할 수 있는 페이지입니다.');
    router.push('/dashboard');
  }

  // Handle error or no user data
  if (isError || (!isLoading && !user)) {
    router.push('/login');
  }

  // Get list of major regions (parent level regions)
  const majorRegions = areaOptions.map(option => ({
    label: option.label,
    value: option.value
  }));

  // Get list of sub-regions based on selected major region
  const getSubRegions = () => {
    if (!selectedMajorRegion) return [];
    const majorRegion = areaOptions.find(region => region.value === selectedMajorRegion);
    return majorRegion?.children || [];
  };

  // Handle major region selection change
  const handleMajorRegionChange = (value: string) => {
    setSelectedMajorRegion(value);
    setSelectedSubRegions([]); // Reset sub-regions when major region changes
  };

  // Handle sub-region selection change
  const handleSubRegionChange = (selected: string[]) => {
    setSelectedSubRegions(selected);
  };

  // Check if at least one major region is selected
  const hasMajorRegionSelected = () => {
    return !!selectedMajorRegion;
  };

  // Generate the Albamon URL based on current selections
  const generateAlbamonUrl = () => {
    // For 'area' search type, validate that a major region is selected
    if (searchType === 'area' && !hasMajorRegionSelected()) {
      alert('지역별 업종정보 검색 시 최소 하나의 대분류 지역을 선택해야 합니다.');
      return null;
    }
  
    let baseUrl = "";
    const params = new URLSearchParams();
    let allSelectedAreas = [];
  
    // Always include the major region if selected
    if (selectedMajorRegion) {
      allSelectedAreas.push(selectedMajorRegion);
    }
    
    // Add selected sub-regions if any
    if (selectedSubRegions.length > 0) {
      allSelectedAreas = [...allSelectedAreas, ...selectedSubRegions];
    }
  
    if (searchType === 'area') {
      baseUrl = "https://www.albamon.com/jobs/area";
      params.append("page", "1");
      params.append("size", "50");
      
      if (allSelectedAreas.length > 0) {
        params.append("areas", allSelectedAreas.join(","));
      }
      
      if (includeKeyword) {
        params.append("includeKeyword", includeKeyword);
      }
      
      if (excludeKeyword) {
        params.append("excludeKeywords", excludeKeyword);
      }
    } else if (searchType === 'total') {
      baseUrl = "https://www.albamon.com/total-search";
      params.append("page", "1");
      params.append("size", "50");
      
      // For total search, use the searchKeyword parameter
      params.append("keyword", searchKeyword || "");
      
      if (allSelectedAreas.length > 0) {
        params.append("areas", allSelectedAreas.join(","));
      }
      
      if (excludeKeyword) {
        params.append("excludeKeywords", excludeKeyword);
      }
    }
  
    const fullUrl = `${baseUrl}?${params.toString()}`;
    console.log("Generated URL:", fullUrl);
    return fullUrl;
  };

  // Add the current filter to the list
  const handleAddFilter = () => {
    // Validate search keyword for total search
    if (searchType === 'total' && !searchKeyword) {
      alert("통합검색 시에는 검색어를 입력해야 합니다.");
      return;
    }

    const url = generateAlbamonUrl();
    if (!url) return;

    // Check for duplicate URL
    const isDuplicate = addedFilters.some(filter => filter.url === url);
    if (isDuplicate) {
      alert("이미 같은 URL의 필터가 추가되었습니다. 중복 필터는 추가할 수 없습니다.");
      return;
    }

    // Collect all selected areas
    let allSelectedAreas = [];
    if (selectedMajorRegion) {
      allSelectedAreas.push(selectedMajorRegion);
    }
    if (selectedSubRegions.length > 0) {
      allSelectedAreas = [...allSelectedAreas, ...selectedSubRegions];
    }

    const newFilter: AddedFilter = {
      id: Date.now().toString(),
      searchType,
      areas: allSelectedAreas,
      includeKeyword,
      excludeKeyword,
      searchKeyword: searchType === 'total' ? searchKeyword : undefined,
      url
    };

    setAddedFilters(prev => [...prev, newFilter]);
    
    // Reset the form
    resetForm();
  };

  // Remove a filter from the list
  const handleRemoveFilter = (id: string) => {
    setAddedFilters(prev => prev.filter(filter => filter.id !== id));
  };

  // Reset the form fields
  const resetForm = () => {
    setSelectedMajorRegion("");
    setSelectedSubRegions([]);
    setIncludeKeyword("");
    setExcludeKeyword("");
    setSearchKeyword(""); // Reset search keyword as well
  };

  // Start crawling with the added filters
  const handleStartCrawling = async () => {
    if (addedFilters.length === 0) return;
  
    try {
      setIsCrawling(true);
      console.log("크롤링 요청 보내는 URLs:", addedFilters.map(filter => filter.url));
      
      const response = await apiClient.post('/api/customer/crawl-search', {
        urls: addedFilters.map(filter => filter.url)
      });
      
      console.log("크롤링 API 응답:", response.data);
      
      if (response.data.success && response.data.data?.length > 0) {
        // Transform API response data to match our ParsedBusiness interface
        const transformedData: ParsedBusiness[] = response.data.data.map((item: AlbamonJobResponse) => ({
          id: item.jobId || String(Math.random()),
          businessName: item.companyName || "",
          address: item.address || "",
          postTitle: item.jobTitle || ""
        }));
        
        setCrawledBusinesses(transformedData);
        setShowParsingTable(true);
        
        // Clear filters after successful crawling
        setAddedFilters([]);
      } else {
        alert('크롤링된 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('크롤링 요청 중 오류가 발생했습니다:', error);
      alert('크롤링 요청 중 오류가 발생했습니다.');
    } finally {
      setIsCrawling(false);
    }
  };

  // Handler for when user starts parsing the selected businesses
  const handleParseStart = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    
    try {
      setIsCrawling(true); // Reuse existing loading state
      
      // Filter the crawledBusinesses to only include selected ones
      const selectedBusinesses = crawledBusinesses.filter(business => 
        selectedIds.includes(business.id)
      );
      
      console.log("파싱할 업체 정보:", selectedBusinesses);
      
      // Make API call to the contact endpoint
      const response = await apiClient.post('/api/customer/contact', {
        businesses: selectedBusinesses
      });
      
      console.log("파싱 결과:", response.data);
      
      if (response.data.success) {
        alert(`${selectedIds.length}개 업체의 상세 정보 파싱이 완료되었습니다.`);
        // Clear the table and filters after successful parsing
        setShowParsingTable(false);
        setCrawledBusinesses([]);
        setAddedFilters([]); // Clear filters after parsing
      } else {
        alert('업체 정보 파싱 중 오류가 발생했습니다: ' + (response.data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('업체 정보 파싱 중 오류가 발생했습니다:', error);
      alert('업체 정보 파싱 중 오류가 발생했습니다.');
    } finally {
      setIsCrawling(false);
    }
  };

  // Handler for when user cancels the parsing
  const handleCancelParsing = () => {
    setShowParsingTable(false);
    // Don't clear addedFilters here so the user can modify and try again
  };

  // Get the name of a region by its value
  const getRegionNameByValue = (value: string) => {
    // Check if it's a major region
    const majorRegion = areaOptions.find(region => region.value === value);
    if (majorRegion) return majorRegion.label;
    
    // Check if it's a sub-region
    for (const major of areaOptions) {
      if (!major.children) continue;
      
      const subRegion = major.children.find(sub => sub.value === value);
      if (subRegion) return subRegion.label;
    }
    
    return value; // Return the value if no name is found
  };

  // Show loading state while checking authorization
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">권한을 확인하는 중입니다...</span>
      </div>
    );
  }

  // Show access denied if not admin (this is a fallback, as we should redirect above)
  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">접근 권한이 없습니다</h2>
        <p className="text-gray-600 mb-4">이 페이지는 관리자만 접근할 수 있습니다.</p>
        <Button onClick={() => router.push('/dashboard')}>
          대시보드로 돌아가기
        </Button>
      </div>
    );
  }

  // Render the actual component content only for admin users
  return (
    <div className="p-6 space-y-4">
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <label className="text-xs font-medium mb-1 block">파싱 종류 선택</label>
          <div className="flex space-x-4 items-center">
            <select
              className="border p-2 w-64"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'area' | 'total')}
            >
              <option value="area">지역별 업종정보</option>
              <option value="total">통합검색</option>
            </select>
            
            {/* Add search keyword input when total search is selected */}
            {searchType === 'total' && (
              <div className="flex-1">
                <input
                  type="text"
                  className="border p-2 w-full"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="검색어 입력 (필수)"
                />
              </div>
            )}
          </div>
          {searchType === 'total' && (
            <p className="text-xs text-gray-500 mt-1">
              통합검색 시 검색어는 필수 입력 항목입니다.
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="text-xs font-medium mb-1 block">
            지역 선택 {searchType === 'area' && <span className="text-red-500">*</span>}
          </label>
          
          <div className="flex space-x-4">
            {/* Major Region Selection */}
            <div className="w-64">
              <select
                className="border p-2 w-full"
                value={selectedMajorRegion}
                onChange={(e) => handleMajorRegionChange(e.target.value)}
              >
                <option value="">대분류 지역 선택</option>
                {majorRegions.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sub-Region Selection - only shown if major region is selected */}
            {selectedMajorRegion && (
              <div className="w-64">
                <MultiSelectCombobox
                  options={getSubRegions()}
                  selected={selectedSubRegions}
                  onChange={handleSubRegionChange}
                  placeholder="소분류 지역 선택 (선택사항)"
                  multiSelect
                />
              </div>
            )}
          </div>
          
          {searchType === 'area' && (
            <p className="text-xs text-gray-500 mt-1">
              대분류 지역은 필수 선택 항목이며, 소분류 지역은 선택사항입니다.
            </p>
          )}
        </div>

        {/* 지역별 업종정보일 때만 포함 키워드 입력칸 표시 */}
        {searchType === 'area' && (
          <div className="mb-4">
            <label className="text-xs font-medium mb-1 block">포함 키워드</label>
            <input
              type="text"
              className="border p-2 w-64"
              value={includeKeyword}
              onChange={(e) => setIncludeKeyword(e.target.value)}
              placeholder="포함할 키워드 입력"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="text-xs font-medium mb-1 block">제외 키워드</label>
          <input
            type="text"
            className="border p-2 w-64"
            value={excludeKeyword}
            onChange={(e) => setExcludeKeyword(e.target.value)}
            placeholder="제외할 키워드 입력"
          />
            <p className="text-xs text-gray-500 mt-1">
            주소, 업체명, 공고제목 중 해당 키워드가 온전히 들어있다면 삭제합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={resetForm}
          >
            초기화
          </Button>

          <Button
            variant="default"
            onClick={handleAddFilter}
          >
            추가하기
          </Button>
          
          {addedFilters.length > 0 && (
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleStartCrawling}
              disabled={isCrawling}
            >
              {isCrawling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin " />
                  크롤링 중...
                </>
              ) : (
                `크롤링 하기`
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Added Filters List */}
      {addedFilters.length > 0 && (
        <div className="mt-8">
          <h3 className="font-medium mb-2">추가된 필터</h3>
          <div className="flex flex-wrap gap-2">
            {addedFilters.map(filter => {
              // Generate filter information text
              const filterInfo = [
                `${filter.searchType === 'area' ? '지역별' : '통합검색'}`,
              ];

              // Add search keyword for total search
              if (filter.searchType === 'total' && filter.searchKeyword) {
                filterInfo.push(`검색어:${filter.searchKeyword}`);
              }

              // Add region information
              if (filter.areas.length > 0) {
                const majorRegion = filter.areas[0];
                const majorRegionName = getRegionNameByValue(majorRegion);

                if (filter.areas.length === 1) {
                  filterInfo.push(`지역:${majorRegionName}`);
                } else {
                  const subRegions = filter.areas.slice(1);
                  const subRegionsText = subRegions.map(area => getRegionNameByValue(area)).join(', ');
                  filterInfo.push(`지역:${majorRegionName} -> ${subRegionsText}`);
                }
              }

              // Add include and exclude keywords
              if (filter.includeKeyword) {
                filterInfo.push(`포함키워드:${filter.includeKeyword}`);
              }
              if (filter.excludeKeyword) {
                filterInfo.push(`제외키워드:${filter.excludeKeyword}`);
              }

              return (
                <UrlTooltip key={filter.id} url={filter.url}>
                  <div className="flex items-center gap-1">
                    <Badge 
                      className="px-3 py-1 cursor-pointer hover:bg-gray-300 transition-colors" 
                      onClick={() => window.open(filter.url, '_blank')}
                    >
                      {filterInfo.join(' | ')}
                    </Badge>
                    <button 
                      className="text-red-500 hover:text-red-700 rounded-full p-1" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFilter(filter.id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </UrlTooltip>
              );
            })}
          </div>
        </div>
      )}

      {/* Parsing Table for crawled data */}
      {showParsingTable && crawledBusinesses.length > 0 && (
        <div className="mt-8">
          <h3 className="font-medium mb-2">크롤링 결과 ({crawledBusinesses.length}개)</h3>
          <ParsingTable 
            businesses={crawledBusinesses}
            onParseStart={handleParseStart}
            onCancel={handleCancelParsing}
            isLoading={isCrawling} // Pass the loading state
          />
        </div>
      )}
    </div>
  );
}

// Changed from default export to named export to fix the multiple default exports error
export interface ParsedBusiness {
  id: string;
  businessName: string;
  address: string;
  postTitle: string;
}
 
interface ParsingTableProps {
  businesses: ParsedBusiness[];
  onParseStart: (selectedIds: string[]) => void;
  onCancel: () => void;
  isLoading?: boolean; // Add loading state prop
}
 
// Changed from default export to named export
export const ParsingTable: React.FC<ParsingTableProps> = ({ 
  businesses,
  onParseStart,
  onCancel,
  isLoading = false
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
 
  const toggleSelectAll = () => {
    if (selectedRows.length === businesses.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(businesses.map(b => b.id));
    }
  };
 
  const handleCheckboxChange = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };
 
  // If in loading state, show the progress component instead of table
  if (isLoading) {
    return (
      <div className="mt-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">파싱 진행 상황</h3>
          <ProgressComponent />
          <div className="mt-4 flex justify-end">
            <Button variant="destructive" onClick={onCancel} disabled={isLoading}>
              취소
            </Button>
          </div>
        </div>
      </div>
    );
  }
 
  // Show table when not loading
  return (
    <div className="overflow-x-auto mt-4 relative">
      <table className="table table-xs w-full table-fixed">
        <thead className="sticky top-0 bg-white z-10">
          <tr>
            <th className="w-[5%]">
              <input 
                type="checkbox" 
                checked={selectedRows.length === businesses.length} 
                onChange={toggleSelectAll}
                className="cursor-pointer"
              />
            </th>
            <th className="w-[25%]">업체명</th>
            <th className="w-[35%]">주소</th>
            <th className="w-[35%]">공고제목</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map(business => (
            <tr key={business.id} className="hover:bg-gray-100">
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(business.id)}
                  onChange={() => handleCheckboxChange(business.id)}
                  className="cursor-pointer"
                />
              </td>
              <td>{business.businessName}</td>
              <td>{business.address}</td>
              <td>{business.postTitle}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-2">
        <Button variant="outline" onClick={toggleSelectAll}>
          {selectedRows.length === businesses.length ? "전체 선택해제" : "전체 선택"}
        </Button>
        <div className="space-x-2">
          <Button 
            variant="default" 
            onClick={() => onParseStart(selectedRows)} 
            disabled={selectedRows.length === 0}
          >
            파싱시작
          </Button>
          <Button variant="destructive" onClick={onCancel}>
            취소
          </Button>
        </div>
      </div>
    </div>
  );
};