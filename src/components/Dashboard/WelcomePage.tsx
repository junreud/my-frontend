"use client";

import React, { useEffect, useState } from "react";

interface KeywordData {
  keyword: string;
  searchVolume: number;
}

const WelcomePage: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [platform, setPlatform] = useState("");
  const [businessLink, setBusinessLink] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  // 로딩 관련
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "키워드 분석중...",
    "준비하는중...",
    "간판다는중...",
    "연동하는중...",
  ];

  // ➊ 키워드 배열 저장용
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  // ➋ 모든 로딩이 끝났는지 여부
  const [isLoaded, setIsLoaded] = useState(false);

  // 1) 처음 렌더링 시 일정 시간 후 Welcome 문구 사라지고 폼 노출
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      setTimeout(() => {
        setShowBusinessForm(true);
      }, 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // 2) 플랫폼 선택 시 링크입력창 노출
  const handlePlatformChange = (selected: string) => {
    setPlatform(selected);
    setShowLinkInput(true);
  };

  // 3) OK 버튼 → 로딩 & 백엔드로부터 키워드 받기
  const handleSubmit = async () => {
    if (!platform || !businessLink) return;

    setIsLoading(true);
    let step = 0;

    // (1) 로딩 단계 진행
    const interval = setInterval(() => {
      step++;
      setLoadingStep(step);

      // 로딩 단계가 전부 끝났다면
      if (step >= loadingMessages.length) {
        clearInterval(interval);
        setIsLoading(false);
        setIsLoaded(true); // ➌ “로딩이 전부 끝났다”는 상태
      }
    }, 1000);

    // (2) 플랫폼이 'Naver'라면 → 백엔드로 fetch
    if (platform === "Naver") {
      try {
        // 예시 URL: 실제 서버 주소/엔드포인트에 맞게 수정
        const response = await fetch(
          `http://localhost:4000/keyword/analysis?url=${encodeURIComponent(
            businessLink
          )}`
        );
        const data: KeywordData[] = await response.json();

        // ➍ 키워드 state에 저장
        setKeywords(data);
      } catch (err) {
        console.error(err);
      }
    } else {
      // 'Naver'가 아닐 때의 분기
      // 예) 바로 /dashboard 이동
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="mt-20 md:mt-30 bg-white flex flex-col items-center justify-center">
      {/* 1) Welcome 애니메이션 섹션 */}
      <div
        className={`
          transition-opacity duration-500
          ${showWelcome ? "opacity-100" : "opacity-0"}
          text-2xl font-bold text-gray-800
        `}
      >
        반갑습니다.
      </div>

      {/* 2) 업체 정보 입력 폼 섹션 */}
      {showBusinessForm && (
        <div
          className={`
            transition-opacity duration-500 mt-8
            ${showWelcome ? "opacity-0" : "opacity-100"}
          `}
        >
          <div className="bg-white shadow-md p-6 rounded-md">
            <h2 className="text-xl font-semibold mb-4">업체 정보 입력</h2>

            {/* 플랫폼 선택 */}
            <label className="block mb-2 font-medium">플랫폼 선택</label>
            <select
              className="border border-gray-300 rounded px-3 py-2 mb-4 w-full"
              onChange={(e) => handlePlatformChange(e.target.value)}
              value={platform}
            >
              <option value="">플랫폼을 선택하세요</option>
              <option value="Naver">네이버</option>
              <option value="Youtube">유튜브</option>
              <option value="Instagram">인스타그램</option>
              <option value="Google">구글</option>
            </select>

            {/* 링크 입력 (선택된 경우만 노출) */}
            {showLinkInput && (
              <div className="mb-4">
                <label className="block mb-2 font-medium">업체 링크</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="https://example.com"
                  value={businessLink}
                  onChange={(e) => setBusinessLink(e.target.value)}
                />
              </div>
            )}

            {/* 확인(OK) 버튼 */}
            {showLinkInput && (
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleSubmit}
              >
                OK
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3) 로딩 애니메이션 (OK 버튼 이후) */}
      {isLoading && (
        <div className="mt-8">
          <div className="bg-white shadow-md p-6 rounded-md">
            <div className="flex flex-col items-center">
              <span className="text-xl font-semibold mb-2">
                {loadingStep < loadingMessages.length
                  ? loadingMessages[loadingStep]
                  : "완료!"}
              </span>
              {/* Tailwind 간단한 스피너 예시 */}
              <div className="border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12 animate-spin" />
            </div>
          </div>
        </div>
      )}

      {/* ➎ 로딩이 전부 끝난 후, 키워드 노출 */}
      {isLoaded && keywords.length > 0 && (
        <div className="mt-8 p-6 shadow-md rounded-md bg-white w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">분석 결과 키워드</h3>
          <ul className="space-y-2">
            {keywords.map((item, index) => (
              <li key={index} className="border-b pb-2">
                <span className="font-medium">{index + 1}위. </span>
                <span>{item.keyword}</span>
                <span className="text-gray-500 ml-2">
                  (검색량: {item.searchVolume.toLocaleString()})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 키워드가 없는 경우 처리(옵션) */}
      {isLoaded && keywords.length === 0 && (
        <div className="mt-8 p-6 shadow-md rounded-md bg-white w-full max-w-md">
          키워드가 없습니다.
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
