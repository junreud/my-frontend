import React, { useState, useEffect, useContext } from 'react';
import { useBusinessSwitcher } from '@/hooks/useBusinessSwitcher'; 
import './TableComponent.css';

// 키워드 데이터 조회 함수 - 백엔드 keyword_crawl_results 테이블에서 데이터 가져옴
export const fetchKeywordData = async ({ placeId, keyword, filter = null, recordId = null }) => {
  try {
    // 1. 먼저 키워드 ID 얻기
    const keywordResponse = await fetch(`${API_BASE_URL}/keywords?name=${encodeURIComponent(keyword)}`);
    if (!keywordResponse.ok) {
      throw new Error(`키워드 검색 실패: ${keywordResponse.status}`);
    }
    
    const keywordData = await keywordResponse.json();
    if (!keywordData.id) {
      throw new Error('키워드 정보를 찾을 수 없습니다.');
    }
    
    const keywordId = keywordData.id;
    
    // 2. 키워드 크롤 결과 가져오기
    let url = `${API_BASE_URL}/keyword-results?placeId=${placeId}&keywordId=${keywordId}`;
    
    if (filter) {
      url += `&category=${encodeURIComponent(filter)}`;
    }
    
    if (recordId) {
      url += `&recordId=${recordId}`;
    }
    
    const resultResponse = await fetch(url);
    if (!resultResponse.ok) {
      throw new Error(`결과 가져오기 실패: ${resultResponse.status}`);
    }
    
    return await resultResponse.json();
  } catch (error) {
    console.error("키워드 데이터 조회 중 오류:", error);
    throw error;
  }
};

const TableComponent = ({ title, selectedKeyword }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState(100);
  const [hasMore, setHasMore] = useState(true);
  
  // 비즈니스 스위처에서 선택된 업체 정보 가져오기
  let activeBusiness = null;
  try {
    const { activeBusiness: business } = useBusinessSwitcher();
    activeBusiness = business;
  } catch (error) {
    console.log("BusinessSwitcher context not available:", error);
  }

  useEffect(() => {
    loadData();
  }, [selectedKeyword, activeBusiness]);

  const loadData = async () => {
    if (!selectedKeyword || !activeBusiness?.place_id) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 백엔드에서 데이터 가져오기
      const results = await fetchKeywordData({
        placeId: activeBusiness.place_id,
        keyword: selectedKeyword
      });
      
      setData(results);
      setHasMore(results.length > visibleItems);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setVisibleItems(prev => prev + 100);
    if (visibleItems + 100 >= data.length) {
      setHasMore(false);
    }
  };

  return (
    <div className="table-component">
      {!selectedKeyword || !activeBusiness ? (
        <div className="select-message">업체와 키워드를 모두 선택해주세요.</div>
      ) : loading ? (
        <div className="loading">데이터를 불러오는 중...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>업체명</th>
                  <th>업종</th>
                  <th>영수증리뷰</th>
                  <th>블로그리뷰</th>
                  <th>저장수</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.slice(0, visibleItems).map((item) => (
                    <tr key={item.placeid || item.id} className="hover:bg-base-300">
                      <th>{item.ranking}</th>
                      <td>{item.place_name || item.name}</td>
                      <td>{item.category || item.businessType || item.framework}</td>
                      <td>{item.receipt_review_count || item.receiptReviews}</td>
                      <td>{item.blog_review_count || item.blogReviews}</td>
                      <td>{item.savedCount || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">데이터가 없습니다</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {hasMore && (
            <div className="load-more-container">
              <button 
                className="load-more-button"
                onClick={loadMore}
              >
                더 보기 (+100)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TableComponent;
