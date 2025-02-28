"use client"

import React, { useEffect, useState } from 'react';

const WelcomePage: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [platform, setPlatform] = useState('');
  const [businessLink, setBusinessLink] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // 로딩 단계별 메시지
  const loadingMessages = [
    '키워드 분석중...',
    '준비하는중...',
    '간판다는중...',
    '연동하는중...',
  ];

  // 1) 처음 렌더링 시 일정 시간 후 Welcome 문구 사라지고 다음 단계로
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      // 사라지는 애니메이션 시간이 끝난 뒤 폼 보여주기
      setTimeout(() => {
        setShowBusinessForm(true);
      }, 500);
    }, 2000); // 2초 후 사라진다고 가정

    return () => clearTimeout(timer);
  }, []);

  // 2) 플랫폼을 선택하면 링크 입력창 노출
  const handlePlatformChange = (selected: string) => {
    setPlatform(selected);
    setShowLinkInput(true);
  };

  // 3) OK 버튼 누르면 로딩 애니메이션 시작
  const handleSubmit = () => {
    if (!platform || !businessLink) return;

    setIsLoading(true);
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setLoadingStep(step);

      if (step >= loadingMessages.length) {
        clearInterval(interval);

        // 플랫폼이 'Naver'이면 해당 링크를 /keyword/final 로 전달
        if (platform === 'Naver') {
          // 쿼리파라미터로 전달 예시 (?link=)
          window.location.href = `/keyword/final?link=${encodeURIComponent(businessLink)}`;
        } else {
          // 나머지는 /dashboard 이동
          window.location.href = '/dashboard';
        }
      }
    }, 1000); // 1초 간격으로 로딩 단계를 업데이트
  };

  return (
    <div className="mt-20 md:mt-30 bg-white  flex flex-col items-center justify-center">
    
      {/* 1) Welcome 애니메이션 섹션 */}
      <div
        className={`
          transition-opacity duration-500
          ${showWelcome ? 'opacity-100' : 'opacity-0'}
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
            ${showWelcome ? 'opacity-0' : 'opacity-100'}
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
                  : '완료!'}
              </span>
              {/* Tailwind 간단한 스피너 예시 */}
              <div className="border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12 animate-spin" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
