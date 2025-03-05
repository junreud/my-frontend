"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface KeywordData {
  keyword: string;
  searchVolume: number;
}

const WelcomePage: React.FC = () => {
  const router = useRouter();

  const [showWelcome, setShowWelcome] = useState(true);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [platform, setPlatform] = useState("");
  const [businessLink, setBusinessLink] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  // 로딩 여부 & 스텝 메시지
  const [isLoading, setIsLoading] = useState(false);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [finalKeywords, setFinalKeywords] = useState<KeywordData[]>([]);
  const [analysisDone, setAnalysisDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      setTimeout(() => {
        setShowBusinessForm(true);
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handlePlatformChange = (selected: string) => {
    setPlatform(selected);
    setShowLinkInput(true);
  };

  const handleSubmit = async () => {
    if (!platform || !businessLink) return;
    setIsLoading(true);
    setProgressMessages(["업체 분석 시작..."]);

    try {
      // 1) URL 정규화
      setProgressMessages((prev) => [...prev, "URL 정규화 진행중..."]);
      const normalizeRes = await fetch(
        `http://localhost:4000/keyword/analysis/normalize?url=${encodeURIComponent(businessLink)}`
      );
      const normalizeData = await normalizeRes.json();
      if (!normalizeData.success) {
        throw new Error(normalizeData.message || "정규화 실패");
      }

      setProgressMessages((prev) => [...prev, "정규화 완료! 업체 정보 분석중..."]);

      // 2) 크롤링 + ChatGPT + 검색량 조회
      const crawlRes = await fetch(`http://localhost:4000/keyword/analysis/crawl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          normalizedUrl: normalizeData.normalizedUrl,
        }),
      });
      const crawlData = await crawlRes.json();
      if (!crawlData.success) {
        throw new Error(crawlData.message || "크롤링/분석 실패");
      }

      setProgressMessages((prev) => [...prev, "타겟 키워드 분석중..."]);

      // 3) 키워드 그룹핑
      const groupRes = await fetch(`http://localhost:4000/keyword/analysis/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalDataList: crawlData.externalDataList,
        }),
      });
      const groupData = await groupRes.json();
      if (!groupData.success) {
        throw new Error(groupData.message || "키워드 그룹핑 실패");
      }

      if (Array.isArray(groupData.finalKeywords)) {
        setFinalKeywords(groupData.finalKeywords);
      }
      setAnalysisDone(true);

      setProgressMessages((prev) => [...prev, "모든 작업이 완료되었습니다!"]);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        setProgressMessages((prev) => [
          ...prev,
          `에러 발생: ${error.message || "알 수 없는 에러"}`
        ]);
      } else {
        setProgressMessages((prev) => [
          ...prev,
          `에러 발생: ${"알 수 없는 에러"}`
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ─────────────────────────────────────────────
    //  상하좌우 정중앙 정렬을 위해 min-h-screen + flex + items-center + justify-center
    //  기존 mt-20 제거
    // ─────────────────────────────────────────────
    <div
      className="
        min-h-screen
        bg-white
        flex flex-col
        items-center
        justify-center
        w-full
        max-w-[1200px]
        mx-auto
        px-4
      "
    >
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
          <div className="bg-white shadow-md p-6 rounded-md w-[400px]">
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

      {/* 3) 진행상황 출력 */}
      <div className="mt-8 w-full max-w-md">
        {progressMessages.map((msg, idx) => (
          <div key={idx} className="text-sm text-gray-700 mb-1">
            {`> ${msg}`}
          </div>
        ))}
      </div>

      {/* 4) 로딩 스피너 */}
      {isLoading && (
        <div className="mt-4">
          <div className="border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12 animate-spin" />
        </div>
      )}

      {/* 5) 최종 키워드 */}
      {analysisDone && finalKeywords.length > 0 && (
        <div className="mt-8 p-6 shadow-md rounded-md bg-white w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">최종 키워드</h3>
          <ul className="space-y-2">
            {finalKeywords.map((item, index) => (
              <li key={index} className="border-b pb-2">
                <span className="font-medium">{index + 1}위. </span>
                <span>{item.keyword}</span>
                <span className="text-gray-500 ml-2">
                  (검색량: {item.searchVolume?.toLocaleString()})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
